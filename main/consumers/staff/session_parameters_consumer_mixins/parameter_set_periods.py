import logging

from asgiref.sync import sync_to_async

from django.core.exceptions import ObjectDoesNotExist

from main.models import Session
from main.models import ParameterSetPeriod

from main.forms import ParameterSetPeriodForm

from ..session_parameters_consumer_mixins.get_parameter_set import take_get_parameter_set

class ParameterSetPeriodsMixin():
    '''
    parameter set plaeyer mixin
    '''

    async def update_parameter_set_period(self, event):
        '''
        update a parameterset period
        '''

        message_data = {}
        message_data["status"] = await take_update_parameter_set_period(event["message_text"])
        message_data["parameter_set"] = await take_get_parameter_set(event["message_text"]["session_id"])

        await self.send_message(message_to_self=message_data, message_to_group=None,
                                message_type="update_parameter_set", send_to_client=True, send_to_group=False)

    async def remove_parameterset_period(self, event):
        '''
        remove a parameterset period
        '''

        message_data = {}
        message_data["status"] = await take_remove_parameterset_period(event["message_text"])
        message_data["parameter_set"] = await take_get_parameter_set(event["message_text"]["session_id"])

        await self.send_message(message_to_self=message_data, message_to_group=None,
                                message_type="update_parameter_set", send_to_client=True, send_to_group=False)
    
    async def add_parameterset_period(self, event):
        '''
        add a parameterset period
        '''

        message_data = {}
        message_data["status"] = await take_add_parameterset_period(event["message_text"])
        message_data["parameter_set"] = await take_get_parameter_set(event["message_text"]["session_id"])

        await self.send_message(message_to_self=message_data, message_to_group=None,
                                message_type="update_parameter_set", send_to_client=True, send_to_group=False)

def re_number_parameterset_periods(session_id):
    '''
    re-number the parameterset periods
    '''

    try:        
        session = Session.objects.get(id=session_id)
        parameter_set_periods = session.parameter_set.parameter_set_periods.all().order_by('period_number')
    except ObjectDoesNotExist:
        logger = logging.getLogger(__name__) 
        logger.warning(f"re_number_parameterset_periods session, not found ID: {session_id}")
    
    for idx, psp in enumerate(parameter_set_periods):
        psp.period_number = idx + 1
        psp.save()

@sync_to_async
def take_update_parameter_set_period(data):
    '''
    update parameterset period
    '''   
    logger = logging.getLogger(__name__) 
    # logger.info(f"Update parameterset period: {data}")

    session_id = data["session_id"]
    parameterset_period_id = data["parameterset_period_id"]
    form_data = data["form_data"]

    try:        
        parameter_set_period = ParameterSetPeriod.objects.get(id=parameterset_period_id)
    except ObjectDoesNotExist:
        logger.warning(f"take_update_parameter_set_period parameterset_period, not found ID: {parameterset_period_id}")
        return
    
    form_data_dict = form_data

    # logger.info(f'form_data_dict : {form_data_dict}')

    form = ParameterSetPeriodForm(form_data_dict, instance=parameter_set_period)

    if form.is_valid():         
        form.save()              
        parameter_set_period.parameter_set.update_json_fk(update_periods=True)

        return {"value" : "success"}                      
                                
    logger.warning("Invalid parameterset period form")
    return {"value" : "fail", "errors" : dict(form.errors.items())}

@sync_to_async
def take_remove_parameterset_period(data):
    '''
    remove the specifed parmeterset period
    '''
    logger = logging.getLogger(__name__) 
    # logger.info(f"Remove parameterset period: {data}")

    session_id = data["session_id"]
    parameterset_period_id = data["parameterset_period_id"]

    try:        
        session = Session.objects.get(id=session_id)
        parameter_set_period = ParameterSetPeriod.objects.get(id=parameterset_period_id)
        
    except ObjectDoesNotExist:
        logger.warning(f"take_remove_parameterset_period, not found ID: {parameterset_period_id}")
        return
    
    parameter_set_period.delete()
    re_number_parameterset_periods(session_id)
    session.parameter_set.update_json_fk(update_periods=True)
    
    return {"value" : "success"}

@sync_to_async
def take_add_parameterset_period(data):
    '''
    add a new parameter period to the parameter set
    '''
    logger = logging.getLogger(__name__) 
    # logger.info(f"Add parameterset period: {data}")

    session_id = data["session_id"]

    try:        
        session = Session.objects.get(id=session_id)
    except ObjectDoesNotExist:
        logger.warning(f"take_add_parameterset_period session, not found ID: {session_id}")
        return {"value" : "fail"}

    parameter_set_period = ParameterSetPeriod.objects.create(parameter_set=session.parameter_set)
    re_number_parameterset_periods(session_id)
    session.parameter_set.update_json_fk(update_periods=True)

    return {"value" : "success"}
    
