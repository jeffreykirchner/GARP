import logging

from asgiref.sync import sync_to_async

from django.core.exceptions import ObjectDoesNotExist

from main.models import Session
from main.models import ParameterSetPeriod

from main.forms import ParameterSetPeriodForm

from .get_parameter_set import take_get_parameter_set

class ParameterSetBuyerPricesMixin():
    '''
    buyer prices mixin
    '''

    async def update_parameter_set_buyer_price(self, event):
        '''
        update a parameterset buyer_price
        '''

        message_data = {}
        message_data["status"] = await take_update_parameter_set_buyer_price(event["message_text"])
        message_data["parameter_set"] = await take_get_parameter_set(event["message_text"]["session_id"])

        await self.send_message(message_to_self=message_data, message_to_group=None,
                                message_type="update_parameter_set", send_to_client=True, send_to_group=False)

@sync_to_async
def take_update_parameter_set_buyer_price(data):
    '''
    update parameterset buyer_price
    '''   
    logger = logging.getLogger(__name__) 
    # logger.info(f"Update parameterset buyer_price: {data}")

    session_id = data["session_id"]
    form_data_dict = data["form_data"]

    try:
        session = Session.objects.get(id=session_id)
        orange = form_data_dict.get("orange")
        apple = form_data_dict.get("apple")
        buyer_price = form_data_dict.get("buyer_price")

        session.parameter_set.buyer_prices[f"o{orange}a{apple}"] = buyer_price
        session.parameter_set.save()
        session.parameter_set.update_json_local()

        return {"value" : "success"}

    except Exception as e:
        logger.warning(f"Invalid parameterset buyer_price data: {e}")
        return {"value" : "fail", "errors" : "Invalid data"}     

