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