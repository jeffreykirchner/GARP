import logging

from asgiref.sync import sync_to_async

from django.core.exceptions import ObjectDoesNotExist

from main.models import Session
from main.models import ParameterSetPeriod

from main.forms import ParameterSetPeriodForm

from ..session_parameters_consumer_mixins.get_parameter_set import take_get_parameter_set

class ParameterSetConsumerPricesMixin():
    '''
    parameter set plaeyer mixin
    '''

    async def update_parameter_set_consumer_price(self, event):
        '''
        update a parameterset consumer_price
        '''

        message_data = {}
        message_data["status"] = await take_update_parameter_set_consumer_price(event["message_text"])
        message_data["parameter_set"] = await take_get_parameter_set(event["message_text"]["session_id"])

        await self.send_message(message_to_self=message_data, message_to_group=None,
                                message_type="update_parameter_set", send_to_client=True, send_to_group=False)

@sync_to_async
def take_update_parameter_set_consumer_price(data):
    '''
    update parameterset consumer_price
    '''   
    logger = logging.getLogger(__name__) 
    # logger.info(f"Update parameterset consumer_price: {data}")

    session_id = data["session_id"]
    form_data_dict = data["form_data"]

    try:
        session = Session.objects.get(id=session_id)
        orange = form_data_dict.get("orange")
        apple = form_data_dict.get("apple")
        consumer_price = form_data_dict.get("consumer_price")

        session.parameter_set.consumer_prices["o" + str(orange) + "a" + str(apple)] = consumer_price
        session.parameter_set.save()
        session.parameter_set.update_json_local()

        return {"value" : "success"}

    except Exception as e:
        logger.warning(f"Invalid parameterset consumer_price data: {e}")
        return {"value" : "fail", "errors" : "Invalid data"}     

