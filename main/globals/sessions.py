'''
gloabal functions related to parameter sets
'''

from django.db import models
from django.utils.translation import gettext_lazy as _

import main

class ChatTypes(models.TextChoices):
    '''
    chat types
    '''
    ALL = 'All', _('All')
    INDIVIDUAL = 'Individual', _('Individual')

class ExperimentPhase(models.TextChoices):
    '''
    experiment phases
    '''
    INSTRUCTIONS = 'Instructions', _('Instructions')
    RUN = 'Run', _('Run')
    NAMES = 'Names', _('Names')
    DONE = 'Done', _('Done')

class ChatGPTMode(models.TextChoices):
    '''
    chat gpt modes
    '''
    OFF = 'Off', _('Off')
    WITH_CONTEXT = 'With Context', _('With Context')
    WITHOUT_CONTEXT = 'Without Context', _('Without Context')

class EndGameChoices(models.TextChoices):
    '''
    end game choices
    '''
    OFF = 'Off', _('Off')
    STEAL = 'Steal', _('Steal')
    NO_PRICE = 'No Price', _('No Price')
