/**show edit parameter set consumer_price
 */
show_edit_parameter_set_consumer_price: function show_edit_parameter_set_consumer_price(orange, apple){
    
    if(app.session.started) return;
    if(app.working) return;

    app.clear_main_form_errors();
    app.current_parameter_set_consumer_price = {orange: orange, apple: apple, consumer_price: app.get_consumer_price(orange, apple)};
    
    app.edit_parameterset_consumer_price_modal.toggle();
},

/** update parameterset consumer_price
*/
send_update_parameter_set_consumer_price: function send_update_parameter_set_consumer_price(){
    
    app.working = true;

    app.send_message("update_parameter_set_consumer_price", {"session_id" : app.session.id,
                                                             "form_data" : app.current_parameter_set_consumer_price});
},

/**
 * get consumer price
 */
get_consumer_price: function get_consumer_price(orange, apple){
    if (typeof app === "undefined" || app === null) return null;

    let key = "o" + orange + "a" + apple;
    if (!Object.prototype.hasOwnProperty.call(app.parameter_set.consumer_prices, key)) return null;

    return app.parameter_set.consumer_prices[key];
},