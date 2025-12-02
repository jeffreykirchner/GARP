/**
 * if it the last period and the retailer is making their final choice and steal option is enabled
 */
show_end_game_steal_overlay: function show_end_game_steal_overlay()
{
    if(!app.session) return false;
    if(!app.session.started) return false;

    //check if local player is retailer
    let retailer = app.get_player_by_type("R");
    if(app.session_player.id != retailer.id) return false;

    let group = app.session.world_state.groups[app.current_group];

    return group["show_end_game_choice_steal"];
},

/**
 * show end game steal part 1 question
 */
show_end_game_steal_part_1: function show_end_game_steal_part_1()
{
    if(!app.session) return false;
    if(!app.session.started) return false;

    let group = app.session.world_state.groups[app.current_group];

    if(group.end_game_choice_part_1 === null)
        return true;

    return false;
},

/**
 * show end game steal part 2 information
 */
show_end_game_steal_part_2_info: function show_end_game_steal_part_2_info()
{
    if(!app.session) return false;
    if(!app.session.started) return false;

    let group = app.session.world_state.groups[app.current_group];

    if(group.end_game_choice_part_1)
        return true;

    return false;
},

/**
 * if it the last period and the retailer is making their final choice and no price option is enabled
 */
show_end_game_no_price_overlay: function show_end_game_no_price_overlay()
{
    if(!app.session) return false;
    if(!app.session.started) return false;

    //check if local player is retailer
    let retailer = app.get_player_by_type("R");
    if(app.session_player.id != retailer.id) return false;

    let group = app.session.world_state.groups[app.current_group];

    return group["show_end_game_choice_no_price"];
},

/**
 * end game steal yes
 */
end_game_steal_yes: function end_game_steal_yes()
{
    
    let group = app.session.world_state.groups[app.current_group];

    if(!group.end_game_choice_part_1)
    {
        group.end_game_choice_part_1 = true;
    }
    else
    {
        group.end_game_choice_part_2 = true;
        app.working = true;
        app.send_message("end_game_choice", 
                        {"end_game_choice_part_1" : group.end_game_choice_part_1, 
                         "end_game_choice_part_2" : group.end_game_choice_part_2
                        },
                        "group");
    }

},

/**
 * end game steal no
 */
end_game_steal_no: function end_game_steal_no()
{
    let group = app.session.world_state.groups[app.current_group];

    if(group.end_game_choice_part_1 === null)
    {
        group.end_game_choice_part_1 = false;
    }
    else
    {
        group.end_game_choice_part_2 = false;
    
        app.working = true;
        app.send_message("end_game_choice", 
                        {"end_game_choice_part_1" : group.end_game_choice_part_1, 
                         "end_game_choice_part_2" : group.end_game_choice_part_2
                        },
                        "group");
    }
},

/**
 * end game no price yes
 */
end_game_no_price_yes: function end_game_no_price_yes()
{

},

/**
 * end game no price no
 */
end_game_no_price_no: function end_game_no_price_no()
{

},

/**
 * take result of end game choice
 */
take_update_end_game_choice : function take_update_end_game_choice (data)
{
    let session_player_id = data.session_player_id;
    let group = app.session.world_state.groups[app.current_group];

    if(app.is_subject && session_player_id == app.session_player.id)
    {
        app.working = false;
        if(data.value == "fail")
        {
            let current_location = app.session.world_state.session_players[app.session_player.id].current_location;

            app.add_text_emitters("Error: " + data.error_message, 
                    current_location.x, 
                    current_location.y,
                    current_location.x,
                    current_location.y-100,
                    0xFFFFFF,
                    28,
                    null)
            return;
        }
    }

    group.end_game_choice_part_1 = data.end_game_choice_part_1;
    group.end_game_choice_part_2 = data.end_game_choice_part_2;

    group.show_end_game_choice_no_price = data.show_end_game_choice_no_price;
    group.show_end_game_choice_steal = data.show_end_game_choice_steal;

    group.end_game_mode = data.end_game_mode;
    group.barriers[group.exit_barrier].enabled = data.exit_barrier_enabled;

    if(app.is_player_in_group(session_player_id))
    {
        app.update_barriers();
    }
},