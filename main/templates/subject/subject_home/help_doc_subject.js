/**
 * send request for help doc
 * @param title : string
 */
send_load_help_doc_subject: function send_load_help_doc_subject(title){
   
    app.help_text = "Loading ...";

    app.help_modal.show();

    let parameter_set_group = app.get_parameter_set_group_from_player_id(app.session_player.id);
    let group = app.session.world_state.groups[parameter_set_group.id];

    app.send_message("help_doc_subject", {title : title,
                                          current_period : group.current_period,
                                          time_remaining : group.time_remaining  
    });
},

/**
 * take help text load request
 * @param message_data : json
 */
take_load_help_doc_subject: function take_load_help_doc_subject(message_data){

    if(message_data.value == "success")
    {
        app.help_text = message_data.result.text;
    }
    else
    {
        app.help_text = message_data.message;
    }

    app.working = false;
},

