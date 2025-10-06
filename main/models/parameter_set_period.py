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

    orchard_apple_price = models.IntegerField(verbose_name='Factory Apple Price (¢)', default=50)
    wholesale_apple_price = models.IntegerField(verbose_name='Wholesale Apple Price (¢)', default=100)

    orchard_orange_price = models.IntegerField(verbose_name='Factory Orange Price (¢)', default=30)
    wholesale_orange_price = models.IntegerField(verbose_name='Wholesale Orange Price (¢)', default=80)

    wholesaler_budget = models.IntegerField(verbose_name='Wholesaler Budget (¢)', default=1000)
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

        self.orchard_apple_price = new_ps.get("orchard_apple_price")
        self.wholesale_apple_price = new_ps.get("wholesale_apple_price")

        self.orchard_orange_price = new_ps.get("orchard_orange_price")
        self.wholesale_orange_price = new_ps.get("wholesale_orange_price")

        self.wholesaler_budget = new_ps.get("wholesaler_budget")
        self.retailer_budget = new_ps.get("retailer_budget")

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
        self.parameter_set.json_for_session["parameter_set_periods"][self.id] = self.json()

        self.parameter_set.save()

        self.save()

    def json(self):
        '''
        return json object of model
        '''
        
        return{

            "id" : self.id,
            "period_number" : self.period_number,

            "orchard_apple_price" : self.orchard_apple_price,
            "wholesale_apple_price" : self.wholesale_apple_price,

            "orchard_orange_price" : self.orchard_orange_price,
            "wholesale_orange_price" : self.wholesale_orange_price,

            "wholesaler_budget" : self.wholesaler_budget,
            "retailer_budget" : self.retailer_budget,
        }
    
    def get_json_for_subject(self, update_required=False):
        '''
        return json object for subject screen, return cached version if unchanged
        '''

        return self.json()


