'''
parameterset buyer price form
'''

from django import forms

from main.models import ParameterSetPeriod

class ParameterSetBuyerPriceForm(forms.Form):
    '''
    parameterset Buyer price edit form
    '''

    buyer_price =  forms.IntegerField(label='Buyer price (¢)',
                                              min_value=1,
                                              widget=forms.NumberInput(attrs={"v-model":"current_parameter_set_buyer_price.buyer_price",
                                                                              "step":"1",
                                                                              "min":"1"}))
    
    
    
