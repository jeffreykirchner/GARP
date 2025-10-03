'''
parameterset period 
'''

from email.policy import default
from django.db import models

from main.models import ParameterSet

class ParameterSetPeriod(models.Model):
    '''
    parameter set period
    '''

    parameter_set = models.ForeignKey(ParameterSet, on_delete=models.CASCADE, related_name="parameter_set_periods")

    period_number = models.IntegerField(verbose_name='Period Number', default=1)

    factory_apple_price = models.IntegerField(verbose_name='Factory Apple Price (¢)', default=50)
    wholesale_apple_price = models.IntegerField(verbose_name='Wholesale Apple Price (¢)', default=100)

    factory_orange_price = models.IntegerField(verbose_name='Factory Orange Price (¢)', default=30)
    wholesale_orange_price = models.IntegerField(verbose_name='Wholesale Orange Price (¢)', default=80)

    wholsaler_budget = models.IntegerField(verbose_name='Wholesaler Budget (¢)', default=1000)
    retailer_budget = models.IntegerField(verbose_name='Retailer Budget (¢)', default=1000)

    timestamp = models.DateTimeField(auto_now_add=True)
    updated= models.DateTimeField(auto_now=True)

    def __str__(self):
        return str(self.period_number)

    class Meta:
        verbose_name = 'Parameter Set Period'
        verbose_name_plural = 'Parameter Set Periods'
        ordering = ['period_number']

    def from_dict(self, new_ps):
        '''
        copy source values into this period
        source : dict object of parameterset player
        '''
        self.period_number = new_ps.get("period_number")

        self.save()
        
        message = "Parameters loaded successfully."

        return message
    
    def setup(self):
        '''
        default setup
        '''    
        self.save()
    
    def update_json_local(self):
        '''
        update parameter set json
        '''
        self.parameter_set.json_for_session["parameter_set_walls"][self.id] = self.json()

        self.parameter_set.save()

        self.save()

    def json(self):
        '''
        return json object of model
        '''
        
        return{

            "id" : self.id,
            "period_number" : self.period_number,
        }
    
    def get_json_for_subject(self, update_required=False):
        '''
        return json object for subject screen, return cached version if unchanged
        '''

        return self.json()


