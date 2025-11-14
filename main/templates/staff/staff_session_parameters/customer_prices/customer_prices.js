/**show edit parameter set customer_price
 */
show_edit_parameter_set_customer_price: function show_edit_parameter_set_customer_price(orange, apple){
    
    if(app.session.started) return;
    if(app.working) return;

    app.clear_main_form_errors();
    app.current_parameter_set_customer_price = {orange: orange, apple: apple, customer_price: app.get_customer_price(orange, apple)};
    
    app.edit_parameterset_customer_price_modal.toggle();
},

/** update parameterset customer_price
*/
send_update_parameter_set_customer_price: function send_update_parameter_set_customer_price(){
    
    app.working = true;

    app.send_message("update_parameter_set_customer_price", {"session_id" : app.session.id,
                                                             "form_data" : app.current_parameter_set_customer_price});
},

/**
 * get customer price
 */
get_customer_price: function get_customer_price(orange, apple){
    if (typeof app === "undefined" || app === null) return null;

    let key = "o" + orange + "a" + apple;
    if (!Object.prototype.hasOwnProperty.call(app.parameter_set.customer_prices, key)) return null;
    return app.parameter_set.customer_prices[key];
},