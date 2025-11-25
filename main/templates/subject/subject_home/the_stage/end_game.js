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

    if(group["end_game_choice_part_1"] === null)
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

    if(!group.end_game_choice_steal_part_1)
    {
        group.end_game_choice_steal_part_1 = true;
    }
    else
    {
        group.end_game_choice_steal_part_2 = true;

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
    if(!group.end_game_choice_steal_part_1)
    {
        group.end_game_choice_steal_part_1 = false;
    }
    else
    {
        group.end_game_choice_steal_part_2 = false;
    }

    app.working = true;
    app.send_message("end_game_choice", 
                    {"end_game_choice_part_1" : group.end_game_choice_part_1, 
                     "end_game_choice_part_2" : group.end_game_choice_part_2
                    },
                    "group");
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