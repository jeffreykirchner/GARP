
import logging
import math
import json

from datetime import datetime, timedelta
from asgiref.sync import sync_to_async

from django.utils.html import strip_tags

from main.models import SessionPlayer, session
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
        parameter_set_player = self.parameter_set_local["parameter_set_players"][str(session_player["parameter_set_player_id"])]
        group = self.world_state_local["groups"][str(parameter_set_player["parameter_set_group"])]

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

            # self.session_events.append(SessionEvent(session_id=self.session_id, 
            #                                         session_player_id=player_id,
            #                                         type=event['type'],
            #                                         period_number=group["current_period"],
            #                                         time_remaining=group["time_remaining"],
            #                                         data=data))
        
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
        logger.info(f"harvest_fruit: world state controller {self.controlling_channel} channel name {self.channel_name}")

        event_data =  event["message_text"]
        player_id = self.session_players_local[event["player_key"]]["id"]
        session_player = self.world_state_local["session_players"][str(player_id)]
        parameter_set_player = self.parameter_set_local["parameter_set_players"][str(session_player["parameter_set_player_id"])]
        world_state = self.world_state_local
        group = world_state["groups"][str(parameter_set_player["parameter_set_group"])]
        parameter_set_period_id = self.parameter_set_local["parameter_set_periods_order"][group["current_period"]-1]
        parameter_set_period = self.parameter_set_local["parameter_set_periods"][str(parameter_set_period_id)]

        status = "success"
        error_message = ""
        fruit_cost = 0

        if event_data["fruit_type"] == "apple":
            if group["apple_orchard_inventory"] <= 0:
                status = "fail"
                error_message = "No apples left to harvest"
            else:
                group["apple_orchard_inventory"] -= 1
                session_player["apples"] += 1
                fruit_cost = parameter_set_period["orchard_apple_price"]
        elif event_data["fruit_type"] == "orange":
            if group["orange_orchard_inventory"] <= 0:
                status = "fail"
                error_message = "No oranges left to harvest"
            else:
                group["orange_orchard_inventory"] -= 1
                session_player["oranges"] += 1                
                fruit_cost = parameter_set_period["orchard_orange_price"]

        if status == "success":

            session_player["earnings"] -= fruit_cost
            group["results"]["wholesaler_earnings"] -= fruit_cost

            group["results"]["orange_harvested"] = session_player["oranges"]
            group["results"]["apple_harvested"] = session_player["apples"]

            self.session_events.append(SessionEvent(session_id=self.session_id,
                                                    session_player_id=player_id,
                                                    type=event['type'],
                                                    period_number=group["current_period"],
                                                    time_remaining=group["time_remaining"],
                                                    data=event_data))
        
        result = {"value" : status,
                  "error_message" : error_message, 
                  "apples" : session_player["apples"], 
                  "oranges" : session_player["oranges"],
                  "apple_orchard_inventory" : group["apple_orchard_inventory"],
                  "orange_orchard_inventory" : group["orange_orchard_inventory"],
                  "fruit_type" : event_data["fruit_type"],
                  "earnings" : session_player["earnings"],
                  "fruit_cost" : fruit_cost,
                  "session_player_id" : player_id}
        
        if status == "fail":
            await self.send_message(message_to_self=None, message_to_group=result,
                                    message_type=event['type'], send_to_client=False,
                                    send_to_group=True, target_list=[player_id])
        else:
            await self.send_message(message_to_self=None, message_to_group=result,
                                    message_type=event['type'], send_to_client=False, 
                                    send_to_group=True, target_list=group["members"])

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
        # logger.info(f"tray_fruit: world state controller {self.controlling_channel} channel name {self.channel_name}")

        status = "success"
        error_message = ""

        event_data =  event["message_text"]
        player_id = self.session_players_local[event["player_key"]]["id"]
        session_player = self.world_state_local["session_players"][str(player_id)]
        parameter_set_player = self.parameter_set_local["parameter_set_players"][str(session_player["parameter_set_player_id"])]
        world_state = self.world_state_local
        group = world_state["groups"][str(parameter_set_player["parameter_set_group"])]
        parameter_set_period_id = self.parameter_set_local["parameter_set_periods_order"][group["current_period"]-1]
        parameter_set_period = self.parameter_set_local["parameter_set_periods"][str(parameter_set_period_id)]
        parameter_set = self.parameter_set_local
       
        if parameter_set_player["id_label"] == "W":
            #check if all fruit is harvested from orchard
            if group["apple_orchard_inventory"] > 0 or \
               group["orange_orchard_inventory"] > 0:
                status = "fail"
                error_message = "All fruit must be harvested first."

            if status == "success":
                #wholesaler move fruit to tray
                if event_data["fruit_type"] == "apple":
                    if session_player["apples"] <= 0:
                        status = "fail"
                        error_message = "No apples to place on tray."
                    elif group["apple_tray_inventory"] >= parameter_set["apple_tray_capacity"]:
                        status = "fail"
                        error_message = "Apple tray full."
                    
                    if status == "success":
                        session_player["apples"] -= 1
                        group["apple_tray_inventory"] += 1

                elif event_data["fruit_type"] == "orange":
                    if session_player["oranges"] <= 0:
                        status = "fail"
                        error_message = "No oranges to place on tray."
                    elif group["orange_tray_inventory"] >= parameter_set["orange_tray_capacity"]:
                        status = "fail"
                        error_message = "Orange tray full."

                    if status == "success":
                        session_player["oranges"] -= 1
                        group["orange_tray_inventory"] += 1
                
            #check if retailer barrier should go down
            if group["apple_tray_inventory"] == parameter_set["apple_tray_capacity"] and \
                group["orange_tray_inventory"] == parameter_set["orange_tray_capacity"]:
                group["barriers"][str(group["retailer_barrier"])]["enabled"] = False

        elif parameter_set_player["id_label"] == "R":
            #retailer moved fruit from tray to inventory
            
            if session_player["checkout"]:
                status = "fail"
                error_message = "You have already checked out."

            if status == "success":    
                if event_data["fruit_type"] == "apple":
                    if group["apple_tray_inventory"] <= 0:
                        status = "fail"
                        error_message = "No apples on tray."
                    elif session_player["budget"] < parameter_set_period["wholesale_apple_price"]:
                        status = "fail"
                        error_message = "Insufficient budget."
                    
                    if status == "success":
                        session_player["apples"] += 1
                        session_player["budget"] -= parameter_set_period["wholesale_apple_price"]
                        group["apple_tray_inventory"] -= 1

                elif event_data["fruit_type"] == "orange":
                    if group["orange_tray_inventory"] <= 0:
                        status = "fail"
                        error_message = "No oranges on tray."
                    elif session_player["budget"] < parameter_set_period["wholesale_orange_price"]:
                        status = "fail"
                        error_message = "Insufficient budget."

                    if status == "success":
                        session_player["oranges"] += 1
                        session_player["budget"] -= parameter_set_period["wholesale_orange_price"]
                        group["orange_tray_inventory"] -= 1
                
                #raise checkout barrier when retailer takes fruit from tray
                group["barriers"][str(group["checkout_barrier"])]["enabled"] = True

        if status == "success":
            self.session_events.append(SessionEvent(session_id=self.session_id,
                                                session_player_id=player_id,
                                                type=event['type'],
                                                period_number=group["current_period"],
                                                time_remaining=group["time_remaining"],
                                                data=event_data))

        result = {"value" : status,
                  "error_message" : error_message,
                  "session_player_apples" : session_player["apples"],
                  "session_player_oranges" : session_player["oranges"],
                  "session_player_budget" : session_player["budget"],
                  "apple_tray_inventory" : group["apple_tray_inventory"],
                  "orange_tray_inventory" : group["orange_tray_inventory"],
                  "retailer_barrier_up" : group["barriers"][str(group["retailer_barrier"])]["enabled"],
                  "checkout_barrier_up" : group["barriers"][str(group["checkout_barrier"])]["enabled"],
                  "fruit_type" : event_data["fruit_type"],
                  "session_player_id" : player_id}
        
        if status == "fail":
            await self.send_message(message_to_self=None, message_to_group=result,
                                    message_type=event['type'], send_to_client=False,
                                    send_to_group=True, target_list=[player_id])
        else:
            await self.send_message(message_to_self=None, message_to_group=result,
                                    message_type=event['type'], send_to_client=False, 
                                    send_to_group=True, target_list=group["members"])

    async def update_tray_fruit(self, event):
        '''
        update tray fruit from subject screen
        '''

        event_data = json.loads(event["group_data"])

        await self.send_message(message_to_self=event_data, message_to_group=None,
                                message_type=event['type'], send_to_client=True, send_to_group=False)
        
    async def checkout(self, event):
        '''
        checkout fruit from subject screen
        '''
        if self.controlling_channel != self.channel_name:
            return
        
        logger = logging.getLogger(__name__) 
        # logger.info("checkout")
        
        status = "success"
        error_message = ""
        payment = 0

        event_data =  event["message_text"]
        player_id = self.session_players_local[event["player_key"]]["id"]
        session_player = self.world_state_local["session_players"][str(player_id)]
        parameter_set_player = self.parameter_set_local["parameter_set_players"][str(session_player["parameter_set_player_id"])]
        world_state = self.world_state_local
        group = world_state["groups"][str(parameter_set_player["parameter_set_group"])]
        parameter_set_period_id = self.parameter_set_local["parameter_set_periods_order"][group["current_period"]-1]
        parameter_set_period = self.parameter_set_local["parameter_set_periods"][str(parameter_set_period_id)]

        wholesaler = await get_player_by_type(world_state, self.parameter_set_local, "W", group)

        #check if retailer is checking out
        if parameter_set_player["id_label"] != "R":
            status = "fail"
            error_message = "Only retailers can checkout."
        
        #check if retailer has already checked out
        if status == "success":
            if session_player["checkout"]:
                status = "fail"
                error_message = "You have checked out."
        
        #check if retailer has fruit to checkout
        if status == "success":
            if session_player["apples"] == 0 and session_player["oranges"] == 0:
                status = "fail"
                error_message = "You have no fruit to checkout."

        if status == "success":
            apples = world_state["session_players"][str(player_id)]["apples"]
            oranges = world_state["session_players"][str(player_id)]["oranges"]

            payment = parameter_set_period["wholesale_apple_price"] * apples + \
                      parameter_set_period["wholesale_orange_price"] * oranges
            # session_player["budget"] -= payment
            session_player["checkout"] = True
           
            wholesaler["earnings"] += payment
            
            group["results"]["orange_sold"] += oranges
            group["results"]["apple_sold"] += apples
            group["results"]["wholesaler_earnings"] += payment

            group["barriers"][str(group["checkout_barrier"])]["enabled"] = False

            event_data["apples"] = apples
            event_data["oranges"] = oranges
            event_data["payment"] = payment

            self.session_events.append(SessionEvent(session_id=self.session_id,
                                                    session_player_id=player_id,
                                                    type=event['type'],
                                                    period_number=group["current_period"],
                                                    time_remaining=group["time_remaining"],
                                                    data=event_data))
            
        result = {"value" : status,
                  "error_message" : error_message,
                  "payment" : payment,
                  "retailer_budget" : session_player["budget"],
                  "retailer_checkout" : session_player["checkout"],
                  "wholesaler_earnings" : wholesaler["earnings"],
                  "checkout_barrier" : group["barriers"][str(group["checkout_barrier"])]["enabled"],
                  "session_player_id" : player_id}
        
        if status == "fail":
            await self.send_message(message_to_self=None, message_to_group=result,
                                    message_type=event['type'], send_to_client=False,
                                    send_to_group=True, target_list=[player_id])
        else:
            await self.send_message(message_to_self=None, message_to_group=result,
                                    message_type=event['type'], send_to_client=False, 
                                    send_to_group=True, target_list=group["members"])

    async def update_checkout(self, event):
        '''
        update checkout from subject screen
        '''

        event_data = json.loads(event["group_data"])

        await self.send_message(message_to_self=event_data, message_to_group=None,
                                message_type=event['type'], send_to_client=True, send_to_group=False)
        
    async def reset_retailer_inventory(self, event):
        '''
        reset retailer inventory from subject screen
        '''
        if self.controlling_channel != self.channel_name:
            return
        
        logger = logging.getLogger(__name__) 
        # logger.info("reset_retailer_inventory")

        status = "success"
        error_message = ""
        
        event_data =  event["message_text"]
        player_id = self.session_players_local[event["player_key"]]["id"]
        session_player = self.world_state_local["session_players"][str(player_id)]
        world_state = self.world_state_local
        parameter_set_player = self.parameter_set_local["parameter_set_players"][str(session_player["parameter_set_player_id"])]
        group = world_state["groups"][str(parameter_set_player["parameter_set_group"])]
        parameter_set_period_id = self.parameter_set_local["parameter_set_periods_order"][group["current_period"]-1]
        parameter_set_period = self.parameter_set_local["parameter_set_periods"][str(parameter_set_period_id)]
        

        #check if retailer is resetting inventory
        if parameter_set_player["id_label"] != "R":
            status = "fail"
            error_message = "Only retailers can reset inventory."
        
        if session_player["checkout"]:
            status = "fail"
            error_message = "You have already checked out."
        
        apples = session_player["apples"]
        oranges = session_player["oranges"]
        
        if status == "success":    
            #reset retailer inventory
            group["apple_tray_inventory"] += apples
            group["orange_tray_inventory"] += oranges

            session_player["apples"] = 0
            session_player["oranges"] = 0
            session_player["budget"] = parameter_set_period["retailer_budget"]

            self.session_events.append(SessionEvent(session_id=self.session_id,
                                                    session_player_id=player_id,
                                                    type=event['type'],
                                                    period_number=group["current_period"],
                                                    time_remaining=group["time_remaining"],
                                                    data=event_data))

        result = {"value" : status,
                  "error_message" : error_message,
                  "session_player_apples" : session_player["apples"],
                  "session_player_oranges" : session_player["oranges"],
                  "session_player_budget" : session_player["budget"],
                  "apple_tray_inventory" : group["apple_tray_inventory"],
                  "orange_tray_inventory" : group["orange_tray_inventory"],
                  "starting_apples" : apples,
                  "starting_oranges" : oranges,
                  "session_player_id" : player_id}
        
        if status == "fail":
            await self.send_message(message_to_self=None, message_to_group=result,
                                    message_type=event['type'], send_to_client=False,
                                    send_to_group=True, target_list=[player_id])
        else:
            await self.send_message(message_to_self=None, message_to_group=result,
                                    message_type=event['type'], send_to_client=False,
                                    send_to_group=True, target_list=group["members"])

    async def update_reset_retailer_inventory(self, event):
        '''
        update reset retailer inventory from subject screen
        '''

        event_data = json.loads(event["group_data"])

        await self.send_message(message_to_self=event_data, message_to_group=None,
                                message_type=event['type'], send_to_client=True, send_to_group=False)
    
    async def sell_to_consumer(self, event):
        '''
        sell to consumer from subject screen
        '''

        if self.controlling_channel != self.channel_name:
            return
        
        logger = logging.getLogger(__name__) 
        # logger.info("reset_retailer_inventory")

        status = "success"
        error_message = ""

        session = await Session.objects.aget(id=self.session_id)

        event_data =  event["message_text"]
        player_id = self.session_players_local[event["player_key"]]["id"]
        session_player = self.world_state_local["session_players"][str(player_id)]
        parameter_set = self.parameter_set_local
        parameter_set_player = parameter_set["parameter_set_players"][str(session_player["parameter_set_player_id"])]

        world_state = self.world_state_local
        group = world_state["groups"][str(parameter_set_player["parameter_set_group"])]

        parameter_set_period_id = parameter_set["parameter_set_periods_order"][group["current_period"]-1]
        parameter_set_period = parameter_set["parameter_set_periods"][str(parameter_set_period_id)]
        

        #check if subject is a retailer
        if parameter_set_player["id_label"] != "R":
            status = "fail"
            error_message = "Only retailers can sell to consumers."

        #check if subject has has already sold to consumer
        if status == "success":
            if session_player["consumer"]:
                status = "fail"
                error_message = "You have already sold to a consumer."

        #check that subject has fruit to sell
        if status == "success":
            if session_player["apples"] == 0 and session_player["oranges"] == 0:
                status = "fail"
                error_message = "You have no fruit to sell."

        apples_sold = 0
        oranges_sold = 0
        period_earnings = 0
        if status == "success":
            apples_sold = session_player["apples"]
            oranges_sold = session_player["oranges"]
            period_earnings = parameter_set["customer_prices"][f"o{oranges_sold}a{apples_sold}"]

            session_player["earnings"] += period_earnings
            session_player["earnings"] += session_player["budget"]

            group["results"]["retailer_earnings"] += period_earnings +  session_player["budget"]

            session_player["consumer"] = True
            
            session_period = await session.session_periods.aget(period_number=group["current_period"])
            period_summary_data = session_period.summary_data

            #store session players in summary data
            for player_id in group["members"]:
                period_summary_data["session_players"][str(player_id)] = world_state["session_players"][str(player_id)]

            #store group data in summary data
            period_summary_data["groups"][str(parameter_set_player["parameter_set_group"])] = group

            await session_period.asave(update_fields=["summary_data"])

            event_data["apples"] = apples_sold
            event_data["oranges"] = oranges_sold
            event_data["payment"] = period_earnings

            self.session_events.append(SessionEvent(session_id=self.session_id,
                                                    session_player_id=player_id,
                                                    type=event['type'],
                                                    period_number=group["current_period"],
                                                    time_remaining=group["time_remaining"],
                                                    data=event_data))

            #reset for next period
            session_player["apples"] = 0
            session_player["oranges"] = 0

            if group["current_period"] < len(self.parameter_set_local["parameter_set_periods_order"]):
                #setup next period
                group["current_period"] += 1
                group["time_remaining"] = 0
                
                world_state = await sync_to_async(session.setup_next_period)(world_state, parameter_set, parameter_set_player["parameter_set_group"])
            else:
                #group complete 
                group["complete"] = True
            
        result = {"value" : status,
                "error_message" : error_message,
                "apples_sold" : apples_sold,
                "oranges_sold" : oranges_sold,
                "period_earnings" : period_earnings,
                "session_player_id" : player_id,
                "apple_orchard_inventory" : group["apple_orchard_inventory"],
                "orange_orchard_inventory" : group["orange_orchard_inventory"],
                "session_players" : world_state["session_players"],
                "barriers" : group["barriers"],
                "complete" : group["complete"],
                "current_period" : group["current_period"]}
    
        if status == "fail":
            await self.send_message(message_to_self=None, message_to_group=result,
                                    message_type=event['type'], send_to_client=False,
                                    send_to_group=True, target_list=[player_id])
        else:
            await self.send_message(message_to_self=None, message_to_group=result,
                                    message_type=event['type'], send_to_client=False,
                                    send_to_group=True, target_list=group["members"])
        
        # if experiment_complete:
        #     experiment_complete_result = {"current_experiment_phase" :  world_state["current_experiment_phase"]}

        #     await self.send_message(message_to_self=None, message_to_group=experiment_complete_result,
        #                             message_type=, send_to_client=False,
        #                             send_to_group=True)

    async def update_sell_to_consumer(self, event):
        '''
        sell to consumer from subject screen
        '''

        event_data = json.loads(event["group_data"])

        await self.send_message(message_to_self=event_data, message_to_group=None,
                                message_type=event['type'], send_to_client=True, send_to_group=False)

async def get_player_by_type(world_state, parameter_set, player_type, group):
    '''
    get player by type
    '''
    for player_id in group['members']:
        player = world_state["session_players"][str(player_id)]
        parameter_set_player = parameter_set["parameter_set_players"][str(player["parameter_set_player_id"])]

        if player_type == parameter_set_player["id_label"]:
            return player
    return None