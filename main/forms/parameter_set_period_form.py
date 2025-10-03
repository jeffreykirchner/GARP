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

   

    class Meta:
        model=ParameterSetPeriod
        fields =[]
    
