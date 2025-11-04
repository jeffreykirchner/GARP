'''
parameterset consumer price form
'''

from django import forms

from main.models import ParameterSetPeriod

class ParameterSetConsumerPriceForm(forms.Form):
    '''
    parameterset consumer price edit form
    '''

    consumer_price =  forms.IntegerField(label='Consumer price (¢)',
                                              min_value=1,
                                              widget=forms.NumberInput(attrs={"v-model":"current_parameter_set_consumer_price.consumer_price",
                                                                              "step":"1",
                                                                              "min":"1"}))
    
    
    
