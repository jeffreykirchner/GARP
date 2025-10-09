
import logging
import math
import json

from datetime import datetime, timedelta

from django.utils.html import strip_tags

from main.models import SessionPlayer
from main.models import Session
from main.models import SessionEvent

from main.globals import ExperimentPhase

import main

class SubjectUpdatesMixin():
    '''
    subject updates mixin for staff session consumer
    '''

    async def chat(self, event):
        '''
        take chat from client
        '''    
        if self.controlling_channel != self.channel_name:
            return    
       
        logger = logging.getLogger(__name__) 
        # logger.info(f"take chat: Session ")
        
        status = "success"
        error_message = ""
        player_id = None

        if status == "success":
            try:
                player_id = self.session_players_local[event["player_key"]]["id"]
                event_data = event["message_text"]
                current_location = event_data["current_location"]
            except:
                logger.warning(f"chat: invalid data, {event['message_text']}")
                status = "fail"
                error_message = "Invalid data."
        
        target_list = [player_id]

        if status == "success":
            if not self.world_state_local["started"] or \
            self.world_state_local["finished"] or \
            self.world_state_local["current_experiment_phase"] != ExperimentPhase.RUN:
                logger.warning(f"take chat: failed, session not started, finished, or not in run phase")
                status = "fail"
                error_message = "Session not started."
        
        result = {"status": status, "error_message": error_message}
        result["sender_id"] = player_id

        if status == "success":
            session_player = self.world_state_local["session_players"][str(player_id)]
            session_player["current_location"] = current_location
            
            result["text"] = strip_tags(event_data["text"])
            result["nearby_players"] = []

            #format text for chat bubbles
            # wrapper = TextWrapper(width=13, max_lines=6)
            # result['text'] = wrapper.fill(text=result['text'])

            #find nearby players
            session_players = self.world_state_local["session_players"]
            for i in session_players:
                if i != str(result["sender_id"]):
                    source_pt = [session_players[str(result["sender_id"])]["current_location"]["x"], session_players[str(result["sender_id"])]["current_location"]["y"]]
                    target_pt = [session_players[i]["current_location"]["x"], session_players[i]["current_location"]["y"]]
                    
                    if math.dist(source_pt, target_pt) <= 1000:
                        result["nearby_players"].append(i)

            self.session_events.append(SessionEvent(session_id=self.session_id, 
                                                    session_player_id=result["sender_id"],
                                                    type="chat",
                                                    period_number=self.world_state_local["current_period"],
                                                    time_remaining=self.world_state_local["time_remaining"],
                                                    data=result))
            
            target_list = self.world_state_local["session_players_order"]

        await self.send_message(message_to_self=None, message_to_group=result,
                                message_type=event['type'], send_to_client=False, 
                                send_to_group=True, target_list=target_list)

    async def update_chat(self, event):
        '''
        send chat to clients, if clients can view it
        '''
        event_data = json.loads(event["group_data"])

        await self.send_message(message_to_self=event_data, message_to_group=None,
                                message_type=event['type'], send_to_client=True, send_to_group=False)

    async def update_connection_status(self, event):
        '''
        handle connection status update from group member
        '''
        logger = logging.getLogger(__name__) 
        event_data = event["data"]

        #update not from a client
        if event_data["value"] == "fail":
            if not self.session_id:
                self.session_id = event["session_id"]

            # logger.info(f"update_connection_status: event data {event}, channel name {self.channel_name}, group name {self.room_group_name}")

            if "session" in self.room_group_name:
                #connection from staff screen
                if event["connect_or_disconnect"] == "connect":
                    # session = await Session.objects.aget(id=self.session_id)
                    self.controlling_channel = event["sender_channel_name"]

                    if self.channel_name == self.controlling_channel:
                        # logger.info(f"update_connection_status: controller {self.channel_name}, session id {self.session_id}")
                        await Session.objects.filter(id=self.session_id).aupdate(controlling_channel=self.controlling_channel) 
                        await self.send_message(message_to_self=None, message_to_group={"controlling_channel" : self.controlling_channel},
                                                message_type="set_controlling_channel", send_to_client=False, send_to_group=True)
                else:
                    #disconnect from staff screen
                    pass                   
            return
        
        subject_id = event_data["result"]["id"]

        session_player = await SessionPlayer.objects.aget(id=subject_id)
        event_data["result"]["name"] = session_player.name
        event_data["result"]["student_id"] = session_player.student_id
        event_data["result"]["current_instruction"] = session_player.current_instruction
        event_data["result"]["survey_complete"] = session_player.survey_complete
        event_data["result"]["instructions_finished"] = session_player.instructions_finished

        await self.send_message(message_to_self=event_data, message_to_group=None,
                                message_type=event['type'], send_to_client=True, send_to_group=False)

    async def update_set_controlling_channel(self, event):
        '''
        only for subject screens
        '''
        pass

    async def update_name(self, event):
        '''
        send update name notice to staff screens
        '''

        event_data = event["staff_data"]

        await self.send_message(message_to_self=event_data, message_to_group=None,
                                message_type=event['type'], send_to_client=True, send_to_group=False)

    async def update_next_instruction(self, event):
        '''
        send instruction status to staff
        '''

        event_data = event["staff_data"]

        await self.send_message(message_to_self=event_data, message_to_group=None,
                                message_type=event['type'], send_to_client=True, send_to_group=False)
    
    async def update_finish_instructions(self, event):
        '''
        send instruction status to staff
        '''

        event_data = event["staff_data"]

        await self.send_message(message_to_self=event_data, message_to_group=None,
                                message_type=event['type'], send_to_client=True, send_to_group=False)
    
    async def update_survey_complete(self, event):
        '''
        send survey complete update
        '''
        event_data = event["data"]

        await self.send_message(message_to_self=event_data, message_to_group=None,
                                message_type=event['type'], send_to_client=True, send_to_group=False)

    async def target_location_update(self, event):
        '''
        update target location from subject screen
        '''
        if self.controlling_channel != self.channel_name:
            return
        
        # logger = logging.getLogger(__name__) 
        # logger.info(f"target_location_update: world state controller {self.controlling_channel} channel name {self.channel_name}")
        
        logger = logging.getLogger(__name__)
        
        event_data =  event["message_text"]

        if self.world_state_local["current_experiment_phase"] != ExperimentPhase.RUN:
            return

        try:
            target_location = event_data["target_location"]    
            current_location = event_data["current_location"]
        except KeyError:
            logger.warning(f"target_location_update: invalid location, {event['message_text']}")
            return
            # result = {"value" : "fail", "result" : {"message" : "Invalid location."}}
        
        player_id = self.session_players_local[event["player_key"]]["id"]
        session_player = self.world_state_local["session_players"][str(player_id)]

        session_player["target_location"] = target_location
        session_player["current_location"] = current_location

        last_update = datetime.strptime(self.world_state_local["last_update"], "%Y-%m-%d %H:%M:%S.%f")
        dt_now = datetime.now()

        if dt_now - last_update > timedelta(seconds=1):
            # logger.info("updating world state")
            self.world_state_local["last_update"] = str(dt_now)
            await self.store_world_state()

            target_locations = {}
            current_locations = {}
            for i in self.world_state_local["session_players"]:
                target_locations[i] = self.world_state_local["session_players"][i]["target_location"]
                current_locations[i] = self.world_state_local["session_players"][i]["current_location"]
            
            data = {"target_locations" : target_locations, "current_locations" : current_locations}

            self.session_events.append(SessionEvent(session_id=self.session_id, 
                                                    session_player_id=player_id,
                                                    type=event['type'],
                                                    period_number=self.world_state_local["current_period"],
                                                    time_remaining=self.world_state_local["time_remaining"],
                                                    data=data))
        
        result = {"value" : "success", 
                  "target_location" : target_location, 
                  "current_location" : current_location,
                  "session_player_id" : player_id}
        
        await self.send_message(message_to_self=None, message_to_group=result,
                                message_type=event['type'], send_to_client=False, 
                                send_to_group=True)

    async def update_target_location_update(self, event):
        '''
        update target location from subject screen
        '''

        event_data = json.loads(event["group_data"])

        await self.send_message(message_to_self=event_data, message_to_group=None,
                                message_type=event['type'], send_to_client=True, send_to_group=False)
    
    async def update_process_chat_gpt_prompt(self, event):
        '''
        process chat gpt prompt from subject consumer
        '''
        event_data = event["staff_data"]

        await self.send_message(message_to_self=event_data, message_to_group=None,
                                message_type=event['type'], send_to_client=True, send_to_group=False)

    async def update_clear_chat_gpt_history(self, event):
        '''
        clear chat gpt history from subject consumer
        '''
        event_data = event["staff_data"]

        player_id = event_data["session_player_id"]     
        session_player = self.world_state_local["session_players"][str(player_id)]
        parameter_set_player = self.parameter_set_local["parameter_set_players"][str(session_player["parameter_set_player_id"])]

        # store event
        self.session_events.append(SessionEvent(session_id=self.session_id, 
                                    session_player_id=player_id,
                                    type="clear_chat_gpt_history",
                                    period_number=self.world_state_local["current_period"],
                                    data=event_data,))
        
        await SessionEvent.objects.abulk_create(self.session_events, ignore_conflicts=True)
        self.session_events = []

    async def harvest_fruit(self, event):
        '''
        harvest fruit from subject screen
        '''
        if self.controlling_channel != self.channel_name:
            return
        
        # logger = logging.getLogger(__name__) 
        # logger.info(f"target_location_update: world state controller {self.controlling_channel} channel name {self.channel_name}")
        
        logger = logging.getLogger(__name__)
        
        event_data =  event["message_text"]
        player_id = self.session_players_local[event["player_key"]]["id"]
        session_player = self.world_state_local["session_players"][str(player_id)]
        world_state = self.world_state_local
        status = "success"
        error_message = ""

        if event_data["fruit_type"] == "apple":
            if world_state["apple_orchard_inventory"] <= 0:
                status = "fail"
                error_message = "No apples left to harvest"
            else:
                world_state["apple_orchard_inventory"] -= 1
                session_player["apples"] += 1
        elif event_data["fruit_type"] == "orange":
            if world_state["orange_orchard_inventory"] <= 0:
                status = "fail"
                error_message = "No oranges left to harvest"
            else:
                world_state["orange_orchard_inventory"] -= 1
                session_player["oranges"] += 1
        
        if status == "success":
            self.session_events.append(SessionEvent(session_id=self.session_id,
                                                    session_player_id=player_id,
                                                    type=event['type'],
                                                    period_number=self.world_state_local["current_period"],
                                                    time_remaining=self.world_state_local["time_remaining"],
                                                    data=event_data))
        
        result = {"value" : status,
                  "error_message" : error_message, 
                  "apples" : session_player["apples"], 
                  "oranges" : session_player["oranges"],
                  "apple_orchard_inventory" : world_state["apple_orchard_inventory"],
                  "orange_orchard_inventory" : world_state["orange_orchard_inventory"],
                  "fruit_type" : event_data["fruit_type"],
                  "session_player_id" : player_id}
        
        if status == "fail":
            await self.send_message(message_to_self=result, message_to_group=result,
                                    message_type=event['type'], send_to_client=False,
                                    send_to_group=True, target_list=[player_id])
        else:
            await self.send_message(message_to_self=None, message_to_group=result,
                                    message_type=event['type'], send_to_client=False, 
                                    send_to_group=True)

    async def update_harvest_fruit(self, event):
        '''
        update harvest fruit from subject screen
        '''

        event_data = json.loads(event["group_data"])

        await self.send_message(message_to_self=event_data, message_to_group=None,
                                message_type=event['type'], send_to_client=True, send_to_group=False)
    
    async def tray_fruit(self, event):
        '''
        move fruit to or from the tray from subject screen
        '''
        if self.controlling_channel != self.channel_name:
            return
        
        # logger = logging.getLogger(__name__) 
        # logger.info(f"target_location_update: world state controller {self.controlling_channel} channel name {self.channel_name}")
        
        logger = logging.getLogger(__name__)
        logger.info(f"tray_fruit: world state controller {self.controlling_channel} channel name {self.channel_name}")

        status = "success"
        error_message = ""

        event_data =  event["message_text"]
        player_id = self.session_players_local[event["player_key"]]["id"]
        session_player = self.world_state_local["session_players"][str(player_id)]
        parameter_set_player = self.parameter_set_local["parameter_set_players"][str(session_player["parameter_set_player_id"])]
        world_state = self.world_state_local
        parameter_set_period_id = self.parameter_set_local["parameter_set_periods_order"][world_state["current_period"]-1]
        parameter_set_period = self.parameter_set_local["parameter_set_periods"][str(parameter_set_period_id)]
        parameter_set = self.parameter_set_local

       
        if parameter_set_player["id_label"] == "W":
            #wholesaler move fruit to tray

            if event_data["fruit_type"] == "apple":
                if session_player["apples"] <= 0:
                    status = "fail"
                    error_message = "No apples to place on tray."
                elif world_state["apple_tray_inventory"] >= parameter_set["apple_tray_capacity"]:
                    status = "fail"
                    error_message = "Apple tray full."
                
                if status == "success":
                    session_player["apples"] -= 1
                    world_state["apple_tray_inventory"] += 1

            elif event_data["fruit_type"] == "orange":
                if session_player["oranges"] <= 0:
                    status = "fail"
                    error_message = "No oranges to place on tray."
                elif world_state["orange_tray_inventory"] >= parameter_set["orange_tray_capacity"]:
                    status = "fail"
                    error_message = "Orange tray full."

                if status == "success":
                    session_player["oranges"] -= 1
                    world_state["orange_tray_inventory"] += 1
        elif parameter_set_player["id_label"] == "R":
            #retailer move fruit from tray to inventory

            if event_data["fruit_type"] == "apple":
                if world_state["apple_tray_inventory"] <= 0:
                    status = "fail"
                    error_message = "No apples on tray."
                
                if status == "success":
                    session_player["apples"] += 1
                    world_state["apple_tray_inventory"] -= 1

            elif event_data["fruit_type"] == "orange":
                if world_state["orange_tray_inventory"] <= 0:
                    status = "fail"
                    error_message = "No oranges on tray."

                if status == "success":
                    session_player["oranges"] += 1
                    world_state["orange_tray_inventory"] -= 1

        if status == "success":
            self.session_events.append(SessionEvent(session_id=self.session_id,
                                                session_player_id=player_id,
                                                type=event['type'],
                                                period_number=self.world_state_local["current_period"],
                                                time_remaining=self.world_state_local["time_remaining"],
                                                data=event_data))

        result = {"value" : status,
                  "error_message" : error_message,
                  "session_player_apples" : session_player["apples"],
                  "session_player_oranges" : session_player["oranges"],
                  "apple_tray_inventory" : world_state["apple_tray_inventory"],
                  "orange_tray_inventory" : world_state["orange_tray_inventory"],
                  "fruit_type" : event_data["fruit_type"],
                  "session_player_id" : player_id}
        
        if status == "fail":
            await self.send_message(message_to_self=result, message_to_group=result,
                                    message_type=event['type'], send_to_client=False,
                                    send_to_group=True, target_list=[player_id])
        else:
            await self.send_message(message_to_self=None, message_to_group=result,
                                    message_type=event['type'], send_to_client=False, 
                                    send_to_group=True)

    async def update_tray_fruit(self, event):
        '''
        update tray fruit from subject screen
        '''

        event_data = json.loads(event["group_data"])

        await self.send_message(message_to_self=event_data, message_to_group=None,
                                message_type=event['type'], send_to_client=True, send_to_group=False)
                                      
    

                                
        

