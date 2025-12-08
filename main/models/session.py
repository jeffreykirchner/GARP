'''
session model
'''

from datetime import datetime
from tinymce.models import HTMLField
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from decimal import Decimal

import logging
import uuid
import csv
import io
import json
import random
import re
import string

from django.conf import settings
from django.utils.html import strip_tags

from django.dispatch import receiver
from django.db import models
from django.db.models.signals import post_delete
from django.db.models.signals import post_save
from django.utils.timezone import now
from django.core.exceptions import ObjectDoesNotExist
from django.core.serializers.json import DjangoJSONEncoder

import main

from main.models import ParameterSet

from main.globals import ExperimentPhase
from main.globals import round_up
from main.globals import EndGameChoices

#experiment sessoin
class Session(models.Model):
    '''
    session model
    '''
    parameter_set = models.OneToOneField(ParameterSet, on_delete=models.CASCADE)
    creator = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="sessions_a")
    collaborators = models.ManyToManyField(settings.AUTH_USER_MODEL, related_name="sessions_b")

    title = models.CharField(max_length=300, default="*** New Session ***")    #title of session
    start_date = models.DateField(default=now)                                 #date of session start

    channel_key = models.UUIDField(default=uuid.uuid4, editable=False, verbose_name = 'Channel Key')     #unique channel to communicate on
    session_key = models.UUIDField(default=uuid.uuid4, editable=False, verbose_name = 'Session Key')     #unique key for session to auto login subjects by id

    id_string = models.CharField(max_length=6, unique=True, null=True, blank=True)                       #unique string for session to auto login subjects by id

    controlling_channel = models.CharField(max_length = 300, default="")         #channel controlling session

    started =  models.BooleanField(default=False)                                #starts session and filll in session
   
    shared = models.BooleanField(default=False)                                  #shared session parameter sets can be imported by other users
    locked = models.BooleanField(default=False)                                  #locked models cannot be deleted

    invitation_text = HTMLField(default="", verbose_name="Invitation Text")       #inviataion email subject and text
    invitation_subject = HTMLField(default="", verbose_name="Invitation Subject")

    world_state = models.JSONField(encoder=DjangoJSONEncoder, null=True, blank=True, verbose_name="Current Session State")       #world state at this point in session

    replay_data = models.JSONField(encoder=DjangoJSONEncoder, null=True, blank=True, verbose_name="Replay Data")   

    website_instance_id = models.CharField(max_length=300, default="", verbose_name="Website Instance ID", null=True, blank=True)           #website instance from azure

    soft_delete =  models.BooleanField(default=False)                             #hide session if true

    timestamp = models.DateTimeField(auto_now_add=True)
    updated= models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title

    def creator_string(self):
        return self.creator.email
    creator_string.short_description = 'Creator'

    class Meta:
        verbose_name = 'Session'
        verbose_name_plural = 'Sessions'
        ordering = ['-start_date']
        

    def get_start_date_string(self):
        '''
        get a formatted string of start date
        '''
        return  self.start_date.strftime("%#m/%#d/%Y")

    def get_group_channel_name(self):
        '''
        return channel name for group
        '''
        page_key = f"session-{self.id}"
        room_name = f"{self.channel_key}"
        return  f'{page_key}-{room_name}'
    
    def send_message_to_group(self, message_type, message_data):
        '''
        send socket message to group
        '''
        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(self.get_group_channel_name(),
                                                {"type" : message_type,
                                                 "data" : message_data})

    def start_experiment(self):
        '''
        setup and start experiment
        '''

        self.started = True
        self.start_date = datetime.now()
        
        session_periods = []

        for i in range(self.parameter_set.parameter_set_periods.count()):
            session_periods.append(main.models.SessionPeriod(session=self, period_number=i+1))
        
        main.models.SessionPeriod.objects.bulk_create(session_periods)

        self.save()

        for i in self.session_players.all():
            i.start()

        self.setup_world_state()
        self.setup_summary_data()

        #setup first period by group
        for g in self.parameter_set.parameter_set_groups.all():
            self.setup_next_period(self.world_state, self.parameter_set.json(), g.id)

    def setup_next_period(self, world_state, parameter_set, group_id):
        '''
        setup next period
        '''

        group = world_state["groups"][str(group_id)]

        current_period = group["current_period"]
        parameter_set_period_id = parameter_set["parameter_set_periods_order"][current_period-1]  #current period is 1 based, list is 0 based
        parameter_set_period = parameter_set["parameter_set_periods"][str(parameter_set_period_id)]
        session_players = world_state["session_players"]

        #session players
        for i in group["members"]:
            session_player = session_players[str(i)]
            parameter_set_player = parameter_set["parameter_set_players"][str(session_player["parameter_set_player_id"])]
            session_player["apples"] = 0
            session_player["oranges"] = 0
            session_player["checkout"] = False
            session_player["consumer"] = False

            if parameter_set_player["id_label"] == "W":
                session_player["earnings"] += parameter_set_period["wholesaler_budget"]
            elif parameter_set_player["id_label"] == "R":
                session_player["budget"] = parameter_set_period["reseller_budget"]
        
        #barriers
        if group["wholesaler_barrier"]:
            group["barriers"][str(group["wholesaler_barrier"])]["enabled"] = True
        
        if group["reseller_barrier"]:
            group["barriers"][str(group["reseller_barrier"])]["enabled"] = True

        if group["checkout_barrier"]:
            group["barriers"][str(group["checkout_barrier"])]["enabled"] = False

        #setup orchard inventory
        group["orange_orchard_inventory"] = parameter_set["orange_tray_capacity"] - group["orange_tray_inventory"]
        group["apple_orchard_inventory"] = parameter_set["apple_tray_capacity"] - group["apple_tray_inventory"]

        group["complete"] = False

        #reset results
        group["results"] = {"orange_harvested":0,
                            "apple_harvested":0,
                            "orange_sold":0,
                            "apple_sold":0,
                            "wholesaler_earnings":parameter_set_period["wholesaler_budget"],
                            "reseller_earnings":0,}

        self.world_state = world_state
        self.save()

        return world_state
        
    def setup_summary_data(self):
        '''
        setup summary data
        '''

        parameter_set = self.parameter_set.json()

        session_players_order = parameter_set["parameter_set_players_order"]
        parameter_set_groups_order = parameter_set["parameter_set_groups_order"]

        summary_data = {"session_players":{str(i):{} for i in session_players_order},
                        "groups":{str(i):{} for i in parameter_set_groups_order}}
                
        self.session_periods.all().update(summary_data=summary_data)

    def setup_world_state(self):
        '''
        setup world state
        '''
        self.world_state = {"last_update":str(datetime.now()), 
                            "last_store":str(datetime.now()),
                            "session_players":{},
                            "session_players_order":[],
                            "current_experiment_phase":ExperimentPhase.INSTRUCTIONS if self.parameter_set.show_instructions else ExperimentPhase.RUN,
                            "timer_running":False,
                            "timer_history":[],
                            "started":True,
                            "finished":False,                                                     
                            "session_periods":{str(i.id) : i.json() for i in self.session_periods.all()},
                            "session_periods_order" : list(self.session_periods.all().values_list('id', flat=True)),
                            "groups":{}
                            }
        
        #groups
        for i in self.parameter_set.parameter_set_groups.all():
            self.world_state["groups"][str(i.id)] = {}
            group = self.world_state["groups"][str(i.id)]
            group["members"] = []
            group["orange_orchard_inventory"] = 0
            group["apple_orchard_inventory"] = 0
            group["orange_tray_inventory"] = self.parameter_set.orange_tray_starting_inventory
            group["apple_tray_inventory"] = self.parameter_set.apple_tray_starting_inventory
            group["reseller_barrier"] = None
            group["wholesaler_barrier"] = None
            group["checkout_barrier"] = None
            group["time_remaining"] = 0
            group["current_period"] = 1
            group["barriers"] = {}
            group["show_end_game_choice_steal"] = False
            group["end_game_choice_part_1"] = None
            group["end_game_choice_part_2"] = None
            group["show_end_game_choice_no_price"] = False

            if self.parameter_set.end_game_choice == EndGameChoices.NO_PRICE and \
               self.parameter_set.parameter_set_periods.count() == 1:
                group["end_game_mode"] = EndGameChoices.NO_PRICE
            else:
                group["end_game_mode"] = EndGameChoices.OFF

            group["results"] = {}

        #session players
        for i in self.session_players.prefetch_related('parameter_set_player').all().values('id', 
                                                                                            'parameter_set_player__start_x',
                                                                                            'parameter_set_player__start_y',
                                                                                            'parameter_set_player__parameter_set_group__id',
                                                                                            'parameter_set_player__id' ):
            v = {}

            v['current_location'] = {'x':i['parameter_set_player__start_x'], 'y':i['parameter_set_player__start_y']}
            v['target_location'] = v['current_location']
            v['earnings'] = 0
            v['apples'] = 0
            v['oranges'] = 0
            v['checkout'] = False
            v['consumer'] = False
            v['budget'] = 0
            v['parameter_set_player_id'] = i['parameter_set_player__id']
            v['id'] = i['id']
            
            self.world_state["session_players"][str(i['id'])] = v
            self.world_state["session_players_order"].append(i['id'])

            #add to group
            if i['parameter_set_player__parameter_set_group__id']:
                group_id_s = str(i['parameter_set_player__parameter_set_group__id'])
                self.world_state["groups"][group_id_s]["members"].append(i['id'])

        #barriers enabled
        for g in self.parameter_set.parameter_set_groups.all():
            group = self.world_state["groups"][str(g.id)]

            for i in self.parameter_set.parameter_set_barriers_a.all():  
            
                if i.info == 'Wholesaler':
                    group["wholesaler_barrier"] = i.id
                    group["barriers"][str(i.id)] = {"enabled":True}
                elif i.info == 'Reseller':
                    group["barriers"][str(i.id)] = {"enabled":True}
                    group["reseller_barrier"] = i.id
                elif i.info == 'Checkout':
                    group["checkout_barrier"] = i.id
                    group["barriers"][str(i.id)] = {"enabled":False}
                elif i.info == 'Exit':
                    group["exit_barrier"] = i.id
                    group["barriers"][str(i.id)] = {"enabled":False}

        parameter_set  = self.parameter_set.json_for_session

        self.save()

    def reset_experiment(self):
        '''
        reset the experiment
        '''
        self.started = False

        #self.time_remaining = self.parameter_set.period_length
        #self.timer_running = False
        self.world_state ={}
        self.save()

        for p in self.session_players.all():
            p.reset()

        self.session_periods.all().delete()
        self.session_events.all().delete()

        # self.parameter_set.setup()
    
    def reset_connection_counts(self):
        '''
        reset connection counts
        '''
        self.session_players.all().update(connecting=False, connected_count=0)
    
    def get_current_session_period(self):
        '''
        return the current session period
        '''
        if not self.started:
            return None

        return self.session_periods.get(period_number=self.world_state["current_period"])

    async def aget_current_session_period(self):
        '''
        return the current session period
        '''
        if not self.started:
            return None

        return await self.session_periods.aget(period_number=self.world_state["current_period"])
    
    def update_player_count(self):
        '''
        update the number of session players based on the number defined in the parameterset
        '''

        self.session_players.all().delete()
    
        for count, i in enumerate(self.parameter_set.parameter_set_players.all()):
            new_session_player = main.models.SessionPlayer()

            new_session_player.session = self
            new_session_player.parameter_set_player = i
            new_session_player.player_number = i.player_number

            new_session_player.save()

    def user_is_owner(self, user):
        '''
        return true if user is owner or an admin
        '''

        if user.is_staff:
            return True

        if user==self.creator:
            return True
        
        return False

    def get_chat_display_history(self):
        '''
        return chat gpt history for display
        '''

        chat_history = []

        #return last 10 session events
        for i in self.session_events.filter(type="chat_gpt_prompt").order_by('-timestamp').all()[:10]:

            #add i to front of list 
            chat_history.append(i.data)


        return chat_history

    def get_download_summary_csv(self):
        '''
        return data summary in csv format
        '''
        logger = logging.getLogger(__name__)
        
        
        with io.StringIO() as output:

            writer = csv.writer(output, quoting=csv.QUOTE_NONNUMERIC)

            top_row = ["Session ID", "Period", "Group", "Wholesaler ID", "Reseller ID", 
                       "Orange Harvested", "Apples Harvested", "Oranges Sold", "Apples Sold", 
                       "Wholesaler Earnings", "Reseller Earnings"]
            
            writer.writerow(top_row)

            world_state = self.world_state
            parameter_set = self.parameter_set.json()
            
            for p in self.session_periods.all().order_by('period_number'):
                summary_data = p.summary_data

                for g_id in summary_data["groups"]:
                    g = summary_data["groups"][g_id]
                    wholesaler_id = ""
                    reseller_id = ""

                    if not g.get("members", None):
                        continue

                    for m_id in g["members"]:
                        session_player = world_state["session_players"][str(m_id)]
                        parameter_set_player = parameter_set["parameter_set_players"][str(session_player["parameter_set_player_id"])]
                        
                        if parameter_set_player["id_label"] == "W":
                            wholesaler_id = parameter_set_player["player_number"]
                        elif parameter_set_player["id_label"] == "R":
                            reseller_id = parameter_set_player["player_number"]

                    writer.writerow([self.id,
                                     p.period_number,
                                     parameter_set["parameter_set_groups"][str(g_id)]["name"],
                                     wholesaler_id,
                                     reseller_id,
                                     g["results"]["orange_harvested"],
                                     g["results"]["apple_harvested"],
                                     g["results"]["orange_sold"],
                                     g["results"]["apple_sold"],
                                     g["results"]["wholesaler_earnings"],
                                     g["results"]["reseller_earnings"]])

                    
            v = output.getvalue()
            output.close()

        return v
    
    def get_download_action_csv(self):
        '''
        return data actions in csv format
        '''
        with io.StringIO() as output:

            writer = csv.writer(output, quoting=csv.QUOTE_NONNUMERIC)

            writer.writerow(["Session ID", "Period", "Time", "Client #", "Role", "Action","Info (Plain)", "Info (JSON)", "Timestamp"])

            # session_events =  main.models.SessionEvent.objects.filter(session__id=self.id).prefetch_related('period_number', 'time_remaining', 'type', 'data', 'timestamp')
            # session_events = session_events.select_related('session_player')

            world_state = self.world_state
            parameter_set_players = {}
            for i in self.session_players.all().values('id','player_number','parameter_set_player__id_label'):
                parameter_set_players[str(i['id'])] = i

            session_players = {}
            for i in self.session_players.all().values('id','player_number','parameter_set_player__id_label'):
                session_players[str(i['id'])] = i

            for p in self.session_events.exclude(type="time").exclude(type="world_state").exclude(type='target_location_update'):
                writer.writerow([self.id,
                                p.period_number, 
                                p.time_remaining, 
                                parameter_set_players[str(p.session_player_id)]["player_number"], 
                                "Wholesaler" if parameter_set_players[str(p.session_player_id)]["parameter_set_player__id_label"] == "W" else "Reseller",
                                p.type, 
                                self.action_data_parse(p.type, p.data, session_players),
                                p.data, 
                                p.timestamp])
            
            v = output.getvalue()
            output.close()

        return v

    def action_data_parse(self, type, data, session_players):
        '''
        return plain text version of action
        '''

        if type == "chat":
            nearby_text = ""
            for i in data["nearby_players"]:
                if nearby_text != "":
                    nearby_text += ", "
                nearby_text += f'{session_players[str(i)]["parameter_set_player__id_label"]}'

            temp_s = re.sub("\n", " ", data["text"])
            return f'{temp_s} @  {nearby_text}'
        elif type == "chat_gpt_prompt":
            return f'{data["prompt"]} | {strip_tags(data["response"])}'
        elif type == "harvest_fruit" or type == "tray_fruit":
            return data["fruit_type"]
        elif type == "checkout" or type == "sell_to_consumer":
            return f'Apples: {data["apples"]}, Oranges: {data["oranges"]}, Payment: {data["payment"]}'
        elif type == "help_doc":
            return data

        return ""
    
    def get_download_recruiter_csv(self):
        '''
        return data recruiter in csv format
        '''
        with io.StringIO() as output:

            writer = csv.writer(output)

            parameter_set_players = {}
            for i in self.session_players.all().values('id','student_id'):
                parameter_set_players[str(i['id'])] = i

            for p in self.world_state["session_players"]:
                writer.writerow([parameter_set_players[p]["student_id"],
                                 round_up(Decimal(self.world_state["session_players"][p]["earnings"])/100,2)])

            v = output.getvalue()
            output.close()

        return v
    
    def get_download_payment_csv(self):
        '''
        return data payments in csv format
        '''
        with io.StringIO() as output:

            writer = csv.writer(output)

            writer.writerow(['Session', 'Date', 'Player', 'Name', 'Student ID', 'Earnings', 'Endgame Choice Part 1', 'Endgame Choice Part 2'])

            # session_players = self.session_players.all()

            # for p in session_players:
            #     writer.writerow([self.id, self.get_start_date_string(), p.player_number,p.name, p.student_id, p.earnings/100])

            world_state = self.world_state

            parameter_set_players = {}
            for i in self.session_players.all().values('id', 
                                                       'player_number', 
                                                       'name', 
                                                       'student_id', 
                                                       'parameter_set_player__parameter_set_group__id',
                                                       'parameter_set_player__id_label' ):
                parameter_set_players[str(i['id'])] = i

            for p in world_state["session_players"]:
                group = world_state["groups"][str(parameter_set_players[p]["parameter_set_player__parameter_set_group__id"])]
                writer.writerow([self.id,
                                 self.get_start_date_string(),
                                 parameter_set_players[p]["player_number"],
                                 parameter_set_players[p]["name"],
                                 parameter_set_players[p]["student_id"],
                                 self.world_state["session_players"][p]["earnings"],
                                 group["end_game_choice_part_1"] if parameter_set_players[p]["parameter_set_player__id_label"] == "R" else "",
                                 group["end_game_choice_part_2"] if parameter_set_players[p]["parameter_set_player__id_label"] == "R" else ""] )

            v = output.getvalue()
            output.close()

        return v
    
    def json(self):
        '''
        return json object of model
        '''
                                                                      
        return{
            "id":self.id,
            "title":self.title,
            "locked":self.locked,
            "start_date":self.get_start_date_string(),
            "started":self.started,
            "id_string":self.id_string,
            "parameter_set":self.parameter_set.json(),
            "session_periods":{i.id : i.json() for i in self.session_periods.all()},
            "session_periods_order" : list(self.session_periods.all().values_list('id', flat=True)),
            "session_players":{i.id : i.json(False) for i in self.session_players.all()},
            "session_players_order" : list(self.session_players.all().values_list('id', flat=True)),
            "invitation_text" : self.invitation_text,
            "invitation_subject" : self.invitation_subject,
            "world_state" : self.world_state,
            "collaborators" : {str(i.id):i.email for i in self.collaborators.all()},
            "collaborators_order" : list(self.collaborators.all().values_list('id', flat=True)),
            "creator" : self.creator.id,
            "chat_gpt_history" : self.get_chat_display_history(),
        }
    
    def json_for_subject(self, session_player):
        '''
        json object for subject screen
        session_player : SessionPlayer() : session player requesting session object
        '''
        
        return{
            "started":self.started,
            "parameter_set":self.parameter_set.get_json_for_subject(),

            "session_players":{i.id : i.json_for_subject(session_player) for i in self.session_players.all()},
            "session_players_order" : list(self.session_players.all().values_list('id', flat=True)),

            "session_periods":{i.id : i.json() for i in self.session_periods.all()},
            "session_periods_order" : list(self.session_periods.all().values_list('id', flat=True)),

            "world_state" : self.world_state,
        }
    
    def json_for_timer(self):
        '''
        return json object for timer update
        '''

        session_players = []

        return{
            "started":self.started,
            "session_players":session_players,
            "session_player_earnings": [i.json_earning() for i in self.session_players.all()]
        }
    
    def json_for_parameter_set(self):
        '''
        return json for parameter set setup.
        '''
        message = {
            "id" : self.id,
            "started": self.started,
        }
    
        return message
        
@receiver(post_delete, sender=Session)
def post_delete_parameterset(sender, instance, *args, **kwargs):
    '''
    use signal to delete associated parameter set
    '''
    if instance.parameter_set:
        instance.parameter_set.delete()

@receiver(post_save, sender=Session)
def post_save_session(sender, instance, created, *args, **kwargs):
    '''
    after session is initialized
    '''
    if created:
        id_string = ''.join(random.choices(string.ascii_lowercase, k=6))

        while Session.objects.filter(id_string=id_string).exists():
            id_string = ''.join(random.choices(string.ascii_lowercase, k=6))

        instance.id_string = id_string
