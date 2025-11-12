import logging
import math
import json

from datetime import datetime
from decimal import Decimal

from main.models import Session
from main.models import SessionEvent

from main.globals import ExperimentPhase
from main.globals import round_up

class TimerMixin():
    '''
    timer mixin for staff session consumer
    '''

    async def start_timer(self, event):
        '''
        start or stop timer 
        '''
        logger = logging.getLogger(__name__)
        # logger.info(f"start_timer {event}")

        if self.controlling_channel != self.channel_name:
            logger.warning(f"start_timer: not controlling channel")
            return

        if event["message_text"]["action"] == "start":            
            self.world_state_local["timer_running"] = True

            self.world_state_local["timer_history"].append({"time": datetime.now().strftime("%Y-%m-%dT%H:%M:%S.%f"),
                                                        "count": 0})
        else:
            self.world_state_local["timer_running"] = False

        
        await self.store_world_state(force_store=True)

        # if self.world_state_local["timer_running"]:
        #     result = {"timer_running" : True}
        #     await self.send_message(message_to_self=result, message_to_group=None,
        #                             message_type=event['type'], send_to_client=True, send_to_group=False)
        
        #     #start continue timer
        #     # await self.channel_layer.send(
        #     #     self.channel_name,
        #     #     {
        #     #         'type': "continue_timer",
        #     #         'message_text': {},
        #     #     }
        #     # )
        # else:
            #stop timer
        result = {"timer_running" : self.world_state_local["timer_running"]}
        await self.send_message(message_to_self=result, message_to_group=None,
                                message_type=event['type'], send_to_client=True, send_to_group=False)
        
        # logger.info(f"start_timer complete {event}")

    async def continue_timer(self, event):
        '''
        continue to next second of the experiment
        '''

        if self.controlling_channel != self.channel_name:
            return
        
        world_state = self.world_state_local

        logger = logging.getLogger(__name__)
        #logger.info(f"continue_timer: start")

        if not self.world_state_local["timer_running"]:
            # logger.info(f"continue_timer timer off")
            await self.send_message(message_to_self=True, message_to_group=None,
                                    message_type="stop_timer_pulse", send_to_client=True, send_to_group=False)
            return

        stop_timer = False
        send_update = True
        # period_is_over = False

        result = {"earnings":{}}

        #check if experment is over
        experiment_complete = True
        for g in world_state["groups"]:
            group = world_state["groups"][g]
            if not group["complete"]:
                experiment_complete = False
                break
        
        if experiment_complete:
            stop_timer = True
            self.world_state_local["current_experiment_phase"] = ExperimentPhase.NAMES
            
        if world_state["current_experiment_phase"] != ExperimentPhase.NAMES:

            ts = datetime.now() - datetime.strptime(world_state["timer_history"][-1]["time"],"%Y-%m-%dT%H:%M:%S.%f")

            #check if a full second has passed
            if world_state["timer_history"][-1]["count"] == math.floor(ts.seconds):
                send_update = False

            if send_update:
                ts = datetime.now() - datetime.strptime(world_state["timer_history"][-1]["time"],"%Y-%m-%dT%H:%M:%S.%f")

                world_state["timer_history"][-1]["count"] = math.floor(ts.seconds)

                for g in world_state["groups"]:
                    group = world_state["groups"][g]
                    group["time_remaining"] += 1

        if send_update:
            #session status
            result["value"] = "success"
            result["stop_timer"] = stop_timer
            # result["time_remaining"] = world_state["time_remaining"]
            # result["current_period"] = world_state["current_period"]
            result["groups"] = world_state["groups"]
            result["timer_running"] = world_state["timer_running"]
            result["started"] = world_state["started"]
            result["finished"] = world_state["finished"]
            result["current_experiment_phase"] = world_state["current_experiment_phase"]
            # result["period_is_over"] = period_is_over

            #locations
            result["current_locations"] = {}
            result["target_locations"] = {}
            result["earnings"] = {}
            for i in world_state["session_players"]:
                result["current_locations"][i] = world_state["session_players"][i]["current_location"]
                result["target_locations"][i] = world_state["session_players"][i]["target_location"]
                result["earnings"][i] = world_state["session_players"][i]["earnings"]

            session_player_status = {}                
            
            result["session_player_status"] = session_player_status

            for g in world_state["groups"]:
                group = world_state["groups"][g]
                
                self.session_events.append(SessionEvent(session_id=self.session_id, 
                                                        type="time",
                                                        period_number=group["current_period"],
                                                        time_remaining=group["time_remaining"],
                                                        data=result))
            
            await SessionEvent.objects.abulk_create(self.session_events, ignore_conflicts=True)

            self.session_events = []

            if stop_timer:
                self.world_state_local["timer_running"] = False

            await self.store_world_state(force_store=True)
            
            await self.send_message(message_to_self=False, message_to_group=result,
                                    message_type="time", send_to_client=False, send_to_group=True)

    async def update_time(self, event):
        '''
        update time phase
        '''

        event_data = json.loads(event["group_data"])

        await self.send_message(message_to_self=event_data, message_to_group=None,
                                message_type=event['type'], send_to_client=True, send_to_group=False)
        
    #async helpers
    