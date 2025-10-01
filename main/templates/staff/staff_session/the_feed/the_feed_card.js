/**
 * process incoming message for the feed
 */
process_the_feed: function process_the_feed(message_type, message_data)
{
    if(message_data.status != "success") return;
    
    let html_text = "";
    let sender_label = "";
    let receiver_label = "";
    let group_label = "";

    switch(message_type) {                
        
        case "update_chat":

            sender_label = app.get_parameter_set_player_from_player_id(message_data.sender_id).id_label;
            let source_player_group_label = app.get_parameter_set_group_from_player_id(message_data.sender_id).name;
            receiver_label = "";

            for(let i in message_data.nearby_players) {
                if(receiver_label != "") receiver_label += ", ";
                group_label = app.get_parameter_set_group_from_player_id(message_data.nearby_players[i]).name;
                receiver_label += "<b>" + app.get_parameter_set_player_from_player_id(message_data.nearby_players[i]).id_label + "</b>(" + group_label + ")";
            }

            html_text = "<b>" + sender_label + "</b>(" + source_player_group_label + ") @ " + receiver_label + ": " +  message_data.text;

            break;
    }

    if(html_text != "") {
        if(app.the_feed.length > 100) app.the_feed.pop();
        app.the_feed.unshift(html_text);
    }

},