'''
Parameterset edit form
'''

from django import forms

from main.models import ParameterSet

from main.globals import ChatGPTMode
from main.globals.sessions import EndGameChoices

import  main

class ParameterSetForm(forms.ModelForm):
    '''
    Parameterset edit form
    '''
    period_count = forms.IntegerField(label='Number of Periods',
                                      min_value=1,
                                      widget=forms.NumberInput(attrs={"v-model":"parameter_set.period_count",
                                                                      "step":"1",
                                                                      "min":"1"}))

    period_length = forms.IntegerField(label='Period Length (seconds)',
                                       min_value=1,
                                       widget=forms.NumberInput(attrs={"v-model":"parameter_set.period_length",
                                                                       "step":"1",
                                                                       "min":"1"}))
    
    break_frequency = forms.IntegerField(label='Break Frequency (periods)',
                                         min_value=1,
                                         widget=forms.NumberInput(attrs={"v-model":"parameter_set.break_frequency",
                                                                         "step":"1",
                                                                         "min":"1"}))
    
    break_length = forms.IntegerField(label='Break Length (seconds)',
                                      min_value=1,
                                      widget=forms.NumberInput(attrs={"v-model":"parameter_set.break_length",
                                                                      "step":"1",
                                                                      "min":"1"}))
    
    chat_gpt_mode = forms.ChoiceField(label='ChatGPT Mode',
                                      choices=ChatGPTMode.choices,
                                      widget=forms.Select(attrs={"v-model":"parameter_set.chat_gpt_mode",}))

    show_instructions = forms.ChoiceField(label='Show Instructions',
                                          choices=((1, 'Yes'), (0,'No' )),
                                          widget=forms.Select(attrs={"v-model":"parameter_set.show_instructions",}))

    survey_required = forms.ChoiceField(label='Show Survey',
                                        choices=((1, 'Yes'), (0,'No' )),
                                        widget=forms.Select(attrs={"v-model":"parameter_set.survey_required",}))

    survey_link =  forms.CharField(label='Survey Link',
                                   required=False,
                                   widget=forms.TextInput(attrs={"v-model":"parameter_set.survey_link",}))
    
    prolific_mode = forms.ChoiceField(label='Prolific Mode',
                                      choices=((1, 'Yes'), (0,'No' )),
                                      widget=forms.Select(attrs={"v-model":"parameter_set.prolific_mode",}))

    prolific_completion_link =  forms.CharField(label='After Session, Forward Subjects to URL',
                                                required=False,
                                                widget=forms.TextInput(attrs={"v-model":"parameter_set.prolific_completion_link",}))
    
    reconnection_limit = forms.IntegerField(label='Re-connection Limit',
                                            min_value=1,
                                            widget=forms.NumberInput(attrs={"v-model":"parameter_set.reconnection_limit",
                                                                            "step":"1",
                                                                            "min":"1"}))
    
    interaction_range = forms.IntegerField(label='Interaction Range (Pixels)',
                                           min_value=100,
                                           max_value=800,
                                           widget=forms.NumberInput(attrs={"v-model":"parameter_set.interaction_range",
                                                                           "step":"1",
                                                                           "max":"800",
                                                                           "min":"100"}))

    avatar_scale = forms.DecimalField(label='Avatar Scale',
                                      max_digits=3,
                                      decimal_places=2,
                                      min_value=0.01,
                                      widget=forms.NumberInput(attrs={"v-model":"parameter_set.avatar_scale",
                                                                      "step":"0.01",
                                                                      "min":"0.01"})) 
    
    avatar_bound_box_percent = forms.DecimalField(label='Avatar Bounding Box Percent',
                                                  max_digits=3,
                                                  decimal_places=2,
                                                  min_value=0.01,
                                                  widget=forms.NumberInput(attrs={"v-model":"parameter_set.avatar_bound_box_percent",
                                                                                  "step":"0.01",
                                                                                  "min":"0.01"}))
    
    avatar_move_speed = forms.DecimalField(label='Avatar Move Speed (pixels per second)',
                                           max_digits=3,
                                           decimal_places=2,
                                           min_value=0.01,
                                           widget=forms.NumberInput(attrs={"v-model":"parameter_set.avatar_move_speed",
                                                                           "step":"0.01",
                                                                           "min":"0.01"}))
    
    avatar_animation_speed = forms.DecimalField(label='Avatar Animation Speed',
                                                max_digits=3,
                                                decimal_places=2,
                                                min_value=0.01,
                                                widget=forms.NumberInput(attrs={"v-model":"parameter_set.avatar_animation_speed",
                                                                                "step":"0.01",
                                                                                "min":"0.01"}))

    world_width = forms.IntegerField(label='World Width (pixels)',
                                     min_value=1,
                                     widget=forms.NumberInput(attrs={"v-model":"parameter_set.world_width",
                                                                     "step":"1",
                                                                     "min":"1000"}))
    
    world_height = forms.IntegerField(label='World Height (pixels)',
                                      min_value=1,
                                      widget=forms.NumberInput(attrs={"v-model":"parameter_set.world_height",
                                                                      "step":"1",
                                                                      "min":"1000"}))

    orchard_apple_location = forms.CharField(label='Apple Orchard Location (x,y)',
                                              max_length=100,
                                              initial="100,150",
                                              widget=forms.TextInput(attrs={"v-model":"parameter_set.orchard_apple_location",}))

    orchard_orange_location = forms.CharField(label='Orange Orchard Location (x,y)',
                                               max_length=100,
                                               initial="300,150",
                                               widget=forms.TextInput(attrs={"v-model":"parameter_set.orchard_orange_location",}))

    register_location = forms.CharField(label='Register Location (x,y)',
                                        max_length=100,
                                        initial="200,250",
                                        widget=forms.TextInput(attrs={"v-model":"parameter_set.register_location",}))

    consumer_location = forms.CharField(label='Consumer Location (x,y)',
                                        max_length=100,
                                        initial="250,350",
                                        widget=forms.TextInput(attrs={"v-model":"parameter_set.consumer_location",}))

    orange_tray_location = forms.CharField(label='Orange Tray Location (x,y)',
                                           max_length=100,
                                           initial="500,150",
                                           widget=forms.TextInput(attrs={"v-model":"parameter_set.orange_tray_location",}))

    apple_tray_location = forms.CharField(label='Apple Tray Location (x,y)',
                                          max_length=100,
                                          initial="700,150",
                                          widget=forms.TextInput(attrs={"v-model":"parameter_set.apple_tray_location",}))
    
    orange_tray_capacity = forms.IntegerField(label='Orange Tray Capacity',
                                              min_value=0,
                                              widget=forms.NumberInput(attrs={"v-model":"parameter_set.orange_tray_capacity",
                                                                              "step":"1",
                                                                              "min":"0"}))
    
    apple_tray_capacity = forms.IntegerField(label='Apple Tray Capacity',
                                             min_value=0,
                                             widget=forms.NumberInput(attrs={"v-model":"parameter_set.apple_tray_capacity",
                                                                             "step":"1",
                                                                             "min":"0"}))
    
    orange_tray_starting_inventory = forms.IntegerField(label='Orange Tray Starting Inventory',
                                                        min_value=0,
                                                        widget=forms.NumberInput(attrs={"v-model":"parameter_set.orange_tray_starting_inventory",
                                                                                        "step":"1",
                                                                                        "min":"0"}))
    
    apple_tray_starting_inventory = forms.IntegerField(label='Apple Tray Starting Inventory',
                                                       min_value=0,
                                                       widget=forms.NumberInput(attrs={"v-model":"parameter_set.apple_tray_starting_inventory",
                                                                                       "step":"1",
                                                                                       "min":"0"}))
    
    end_game_choice = forms.ChoiceField(label='End Game Choice',
                                        choices=EndGameChoices.choices,
                                        widget=forms.Select(attrs={"v-model":"parameter_set.end_game_choice",}))
    
    enable_chat = forms.ChoiceField(label='Enable Chat',
                                    choices=((1, 'Yes'), (0, 'No')),
                                    widget=forms.Select(attrs={"v-model":"parameter_set.enable_chat",}))
    
    test_mode = forms.ChoiceField(label='Test Mode',
                                  choices=((1, 'Yes'), (0, 'No')),
                                  widget=forms.Select(attrs={"v-model":"parameter_set.test_mode",}))

    class Meta:
        model=ParameterSet
        fields =['period_count', 'period_length', 'break_frequency', 'break_length',
                 'chat_gpt_mode', 'show_instructions', 
                 'survey_required', 'survey_link', 'prolific_mode', 'prolific_completion_link', 'reconnection_limit',
                 'interaction_range',
                 'avatar_scale', 'avatar_bound_box_percent', 'avatar_move_speed', 'avatar_animation_speed',
                 'world_width', 'world_height','orchard_orange_location', 'orchard_apple_location', 'register_location', 'consumer_location',
                 'orange_tray_location', 'apple_tray_location',
                 'orange_tray_capacity', 'apple_tray_capacity', 'orange_tray_starting_inventory', 'apple_tray_starting_inventory',
                 'end_game_choice', 'enable_chat', 'test_mode']

    def clean_survey_link(self):
        
        try:
           survey_link = self.data.get('survey_link')
           survey_required = int(self.data.get('survey_required'))

           if survey_required and (not survey_link or not "http" in survey_link):
               raise forms.ValidationError('Invalid link')
            
        except ValueError:
            raise forms.ValidationError('Invalid Entry')

        return survey_link
    
    def clean_prolific_completion_link(self):
        
        try:
           prolific_completion_link = self.data.get('prolific_completion_link')
           prolific_mode = int(self.data.get('prolific_mode'))

           if prolific_mode and (not prolific_completion_link or not "http" in prolific_completion_link):
               raise forms.ValidationError('Enter Prolific completion URL')
            
        except ValueError:
            raise forms.ValidationError('Invalid Entry')

        return prolific_completion_link
