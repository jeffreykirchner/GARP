/**
 * if it the last period and the retailer is making their final choice and steal option is enabled
 */
show_end_game_steal_overlay: function show_end_game_steal_overlay()
{
    if(!app.session) return false;
    if(!app.session.started) return false;

    return true;
},