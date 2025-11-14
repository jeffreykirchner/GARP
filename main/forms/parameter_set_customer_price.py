'''
parameterset customer price form
'''

from django import forms

from main.models import ParameterSetPeriod

class ParameterSetCustomerPriceForm(forms.Form):
    '''
    parameterset Customer price edit form
    '''

    customer_price =  forms.IntegerField(label='Customer price (¢)',
                                              min_value=1,
                                              widget=forms.NumberInput(attrs={"v-model":"current_parameter_set_customer_price.customer_price",
                                                                              "step":"1",
                                                                              "min":"1"}))
    
    
    
