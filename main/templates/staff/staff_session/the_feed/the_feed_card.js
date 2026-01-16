/**
 * process incoming message for the feed
 */
process_the_feed: function process_the_feed(message_type, message_data)
{
    if(message_data.value != "success") return;

    if(message_type == "update_target_location_update") return;
    
    let html_text = "";
    let sender_label = "";
    let receiver_label = "";
    let group_label = "";

    let parameter_set_player = app.get_parameter_set_player_from_player_id(message_data.session_player_id);
    let session_player = app.session.world_state.session_players[message_data.session_player_id];

    if(!session_player) return;

    let player_label = "Wholesaler";
    let group_id = parameter_set_player.parameter_set_group;

    if(parameter_set_player.id_label == "R")
    {
        player_label = "Retailer";  
    }

    switch(message_type) {                
        
        case "update_chat":

            html_text = player_label + ": " +  message_data.text;
            break;
        case "update_harvest_fruit":
            if(message_data.fruit_type == "apple") {
                html_text = "The " + player_label + " harvested an apple <img src='/static/apple.png' width='20'> ";
            }
            else if(message_data.fruit_type == "orange") {
                html_text = "The " + player_label + " harvested an orange <img src='/static/orange.png' width='20'> ";
            }
            break;
        case "update_tray_fruit":
            if(message_data.show_end_game_choice_steal || message_data.show_end_game_choice_no_price) return;

            if(player_label == "Wholesaler") {
                if(message_data.fruit_type == "apple") {
                    html_text = "The " + player_label + " placed an apple <img src='/static/apple.png' width='20'> on the tray.";
                }
                else if(message_data.fruit_type == "orange") {
                    html_text = "The " + player_label + " placed an orange <img src='/static/orange.png' width='20'> on the tray.";
                }
            }
            else if(player_label == "Retailer") {
                if(message_data.fruit_type == "apple") {
                    html_text = "The " + player_label + " took an apple <img src='/static/apple.png' width='20'> from the tray.";
                }
                else if(message_data.fruit_type == "orange") {
                    html_text = "The " + player_label + " took an orange <img src='/static/orange.png' width='20'> from the tray.";
                }
            }
            break;
        case "update_reset_reseller_inventory":
            html_text = "The " + player_label + " returned " + message_data.starting_apples + " apples(s) <img src='/static/apple.png' width='20'> and " 
                                                             + message_data.starting_oranges + " orange(s) <img src='/static/orange.png' width='20'> to the tray.";
            break;
        case "update_checkout":
            html_text = "The " + player_label + " purchased " + message_data.apples + " apples(s) <img src='/static/apple.png' width='20'> and " 
                                                              + message_data.oranges + " orange(s) <img src='/static/orange.png' width='20'> for " 
                                                              + message_data.wholesaler_earnings + "¢.";
            break;
        case "update_sell_to_buyer":
            html_text = "The " + player_label + " sold " + message_data.apples_sold + " apples(s) <img src='/static/apple.png' width='20'> and " 
                                              + message_data.oranges_sold + " orange(s) <img src='/static/orange.png' width='20'> to a customer for " 
                                              + message_data.period_earnings + "¢.";
            break;
        case "update_end_game_choice":
            if(app.session.parameter_set.end_game_choice == "Steal")
            {
                if(message_data.end_game_choice_part_1 == true)
                {
                    html_text = "The " + player_label + " chose <i>to</i> learn about stealing.<br>";
                }
                else
                {
                    html_text = "The " + player_label + " chose <i>not to</i> learn about not stealing.<br>";
                }

                if(message_data.end_game_choice_part_2 == true)
                {
                    html_text += "The " + player_label + " chose <i>to</i> steal fruit.";
                }
                else
                {
                    html_text += "The " + player_label + " chose <i>not to</i> steal fruit.";
                }
            }
            else if(app.session.parameter_set.end_game_choice == "No Price")
            {
                if(message_data.end_game_choice_part_1 == true)
                {
                    html_text = "The " + player_label + " chose <i>to</i> reveal the prices.";
                }
                else
                {
                    html_text = "The " + player_label + " chose <i>not to</i> reveal the prices.";
                }
            }
    }

    if(html_text != "") {
        if(!app.the_feed[group_id]) app.the_feed[group_id] = [];
        if(app.the_feed[group_id].length > 100) app.the_feed[group_id].pop();
        app.the_feed[group_id].unshift(html_text);
    }

},