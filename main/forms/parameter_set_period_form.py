'''
parameterset period edit form
'''

from django import forms
from django.db.models.query import RawQuerySet

from main.models import ParameterSetPeriod

class ParameterSetPeriodForm(forms.ModelForm):
    '''
    parameterset period edit form
    '''

    factory_apple_price =  forms.IntegerField(label='Factory Apple Price (¢)',
                                              min_value=1,
                                              widget=forms.NumberInput(attrs={"v-model":"current_parameter_set_period.factory_apple_price",
                                                                              "step":"1",
                                                                              "min":"1"}))
    
    wholesale_apple_price = forms.IntegerField(label='Wholesale Apple Price (¢)',
                                               min_value=1,
                                               widget=forms.NumberInput(attrs={"v-model":"current_parameter_set_period.wholesale_apple_price",
                                                                               "step":"1",
                                                                               "min":"1"}))
    
    factory_orange_price =  forms.IntegerField(label='Factory Orange Price (¢)',
                                               min_value=1,
                                               widget=forms.NumberInput(attrs={"v-model":"current_parameter_set_period.factory_orange_price",
                                                                               "step":"1",
                                                                               "min":"1"}))
    
    wholesale_orange_price = forms.IntegerField(label='Wholesale Orange Price (¢)',
                                                min_value=1,
                                                widget=forms.NumberInput(attrs={"v-model":"current_parameter_set_period.wholesale_orange_price",
                                                                                "step":"1",
                                                                                "min":"1"}))
    
    wholesaler_budget = forms.IntegerField(label='Wholesaler Budget (¢)',
                                           min_value=1,
                                           widget=forms.NumberInput(attrs={"v-model":"current_parameter_set_period.wholesaler_budget",
                                                                           "step":"1",
                                                                           "min":"1"}))
    
    retailer_budget = forms.IntegerField(label='Retailer Budget (¢)',
                                         min_value=1,
                                         widget=forms.NumberInput(attrs={"v-model":"current_parameter_set_period.retailer_budget",
                                                                         "step":"1",
                                                                         "min":"1"}))
    
    class Meta:
        model=ParameterSetPeriod
        fields =['factory_apple_price', 'wholesale_apple_price', 'factory_orange_price', 'wholesale_orange_price', 'wholesaler_budget', 'retailer_budget']
    
