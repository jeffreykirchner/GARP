/**show edit parameter set buyer_price
 */
show_edit_parameter_set_buyer_price: function show_edit_parameter_set_buyer_price(orange, apple){
    
    if(app.session.started) return;
    if(app.working) return;

    app.clear_main_form_errors();
    app.current_parameter_set_buyer_price = {orange: orange, apple: apple, buyer_price: app.get_buyer_price(orange, apple)};
    
    app.edit_parameterset_buyer_price_modal.toggle();
},

/** update parameterset buyer_price
*/
send_update_parameter_set_buyer_price: function send_update_parameter_set_buyer_price(){
    
    app.working = true;

    app.send_message("update_parameter_set_buyer_price", {"session_id" : app.session.id,
                                                             "form_data" : app.current_parameter_set_buyer_price});
},

/**
 * get buyer price
 */
get_buyer_price: function get_buyer_price(orange, apple){
    if (typeof app === "undefined" || app === null) return null;

    let key = "o" + orange + "a" + apple;
    if (!Object.prototype.hasOwnProperty.call(app.parameter_set.buyer_prices, key)) return null;
    return app.parameter_set.buyer_prices[key];
},