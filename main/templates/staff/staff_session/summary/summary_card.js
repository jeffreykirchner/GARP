/**
 * get the time that has passed for the current group
 */
get_time : function get_time() {

    if(!app.session.started) return "---";

    return app.session.world_state.groups[app.current_group].time_remaining;
},

/**
 * get the current period for the current group
 */
get_current_period : function get_current_period() {

    if(!app.session.started) return "---";

    return app.session.world_state.groups[app.current_group].current_period;
},

/**
 * update current group
 */
update_current_group : function update_current_group() {
    app.set_avatar_visibility();
    app.update_barriers();
    app.update_consumer_label();
    app.update_orchard_labels();
    app.update_register_labels();
    app.update_check_marks();
    app.update_tray_labels();
},