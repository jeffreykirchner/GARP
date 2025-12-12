
/**
 * Given the page number return the requested instruction text
 * @param pageNumber : int
 */
get_instruction_page: function get_instruction_page(pageNumber){

    for(let i=0;i<app.instructions.instruction_pages.length;i++)
    {
        if(app.instructions.instruction_pages[i].page_number==pageNumber)
        {
            return app.instructions.instruction_pages[i].text_html;
        }
    }

    return "Text not found";
},

/**
 * advance to next instruction page
 */
send_next_instruction: function send_next_instruction(direction){

    if(app.working) return;
    
    app.working = true;
    app.send_message("next_instruction", {"direction" : direction});
},

/**
 * advance to next instruction page
 */
take_next_instruction: function take_next_instruction(message_data){
    if(message_data.value == "success")
    {
        let result = message_data.result;       
        
        app.session_player.current_instruction = result.current_instruction;
        app.session_player.current_instruction_complete = result.current_instruction_complete;

        app.process_instruction_page();
        app.instruction_display_scroll();

        app.working = false;
    } 
    else
    {
        
    }
    
},

/**
 * finish instructions
 */
send_finish_instructions: function send_finish_instructions(){

    if(app.working) return;
    
    app.working = true;
    app.send_message("finish_instructions", {});
},

/**
 * finish instructions
 */
take_finish_instructions: function take_finish_instructions(message_data){
    app.working = false;
    
    if(message_data.value == "success")
    {
        let result = message_data.result;       
        
        app.session_player.instructions_finished = result.instructions_finished;
        app.session_player.current_instruction_complete = result.current_instruction_complete;
    } 
    else
    {
        
    }
},

/**
 * send_current_instruction_complete
 */
send_current_instruction_complete: function current_instruction_complete()
{
    app.send_message("current_instruction_complete", {"page_number" : app.session_player.current_instruction_complete});
},

/**
 * process instruction page
 */
process_instruction_page: function process_instruction_page(){
    
    //update view when instructions changes
    let session_player = app.session.world_state.session_players[app.session_player.id];
    let world_state = app.session.world_state;
    let group = world_state.groups[app.current_group];
    let parameter_set = app.session.parameter_set;
    let parameter_set_period = app.get_current_parameter_set_period();

    switch(app.session_player.current_instruction){
        case app.instructions.action_page_1:    
            return;      
            break; 
        case app.instructions.action_page_2:
            return;
            break;
        case app.instructions.action_page_3:
            if(app.session_player.current_instruction_complete <= app.instructions.action_page_3)
            {
                //wholesaler tray fruit
                session_player.apples = parameter_set.apple_tray_capacity - parameter_set.apple_tray_starting_inventory;
                session_player.oranges = parameter_set.orange_tray_capacity - parameter_set.orange_tray_starting_inventory;
                group.apple_orchard_inventory = 0;
                group.orange_orchard_inventory = 0;

                app.update_player_inventory();
                app.update_orchard_labels();
            }
            return;
            break;
        case app.instructions.action_page_4:
            if(app.session_player.current_instruction_complete <= app.instructions.action_page_4)
            {
                //reseller tray fruit
                let current_instruction = JSON.parse(JSON.stringify(app.session_player.current_instruction));
                let current_instruction_complete = JSON.parse(JSON.stringify(app.session_player.current_instruction_complete));

                let session_player_r = app.get_player_by_type("R");
                app.session_player = app.session.session_players[session_player_r.id];
                app.session_player.current_instruction = current_instruction;
                app.session_player.current_instruction_complete = current_instruction_complete;

                group.apple_orchard_inventory = 0;
                group.orange_orchard_inventory = 0;

                group.apple_tray_inventory = parameter_set.apple_tray_capacity;
                group.orange_tray_inventory = parameter_set.orange_tray_capacity;

                group.barriers[group.reseller_barrier].enabled = false;
                app.update_barriers();
                app.update_player_inventory();
                app.update_orchard_labels();
                app.update_register_labels();
            }
            return;
            break;
        case app.instructions.action_page_5:
            if(app.session_player.current_instruction_complete <= app.instructions.action_page_5)
            {
                let current_instruction = JSON.parse(JSON.stringify(app.session_player.current_instruction));
                let current_instruction_complete = JSON.parse(JSON.stringify(app.session_player.current_instruction_complete));

                let session_player_w = app.get_player_by_type("W");
                session_player_w.target_location = {"x":pixi_register.wholesaler_pad_container.x + pixi_register.wholesaler_pad_container.width/2,
                                                    "y":pixi_register.wholesaler_pad_container.y + pixi_register.wholesaler_pad_container.height/2 + 50};

                let session_player_r = app.get_player_by_type("R");
                app.session_player = app.session.session_players[session_player_r.id];
                app.session_player.current_instruction = current_instruction;
                app.session_player.current_instruction_complete = current_instruction_complete;
                // session_player_r.current_location = {"x":pixi_tray_apple.container.x,
                //                                      "y":pixi_tray_apple.container.y+100};
                // session_player_r.target_location =  {"x":pixi_tray_apple.container.x,
                //                                      "y":pixi_tray_apple.container.y+99};

                group.apple_orchard_inventory = 0;
                group.orange_orchard_inventory = 0;
                session_player_r.apples = 1;
                session_player_r.oranges = 1;
                session_player_r.budget = session_player_r.budget - (parameter_set_period.wholesale_apple_price + parameter_set_period.wholesale_orange_price);

                group.apple_tray_inventory = parameter_set.apple_tray_capacity-1;
                group.orange_tray_inventory = parameter_set.orange_tray_capacity-1;

                group.barriers[group.checkout_barrier].enabled = false;
                group.barriers[group.reseller_barrier].enabled = false;

                app.update_barriers();
                app.update_player_inventory();
                app.update_orchard_labels();
                app.update_register_labels();
            }
            return;
            break;
        case app.instructions.action_page_6:
            return;
            break;
    }

    if(app.session_player.current_instruction_complete < app.session_player.current_instruction)
    {
        app.session_player.current_instruction_complete = app.session_player.current_instruction;
    }

},

/**
 * scroll instruction into view
 */
instruction_display_scroll: function instruction_display_scroll(){
    
    if(document.getElementById("instructions_frame"))
        document.getElementById("instructions_frame").scrollIntoView();
    
    Vue.nextTick(() => {
        app.scroll_update();
    });
},

scroll_update: function scroll_update()
{
    let scroll_top = document.getElementById('instructions_frame_a').scrollTop;
    let scroll_height = document.getElementById('instructions_frame_a').scrollHeight; // added
    let offset_height = document.getElementById('instructions_frame_a').offsetHeight;

    let content_height = scroll_height - offset_height; // added
    if (content_height <= scroll_top) // modified
    {
        // Now this is called when scroll end!
        app.instruction_pages_show_scroll = false;
    }
    else
    {
        app.instruction_pages_show_scroll = true;
    }
},

/**
 * harvest fruit instructions
 */
send_harvest_fruit_instructions: function send_harvest_fruit_instructions(fruit_type)
{
    if(app.session_player.current_instruction != app.instructions.action_page_2) return;

    let group = app.session.world_state.groups[app.current_group];
    let session_player = app.session.world_state.session_players[app.session_player.id];
    let parameter_set_period = app.get_current_parameter_set_period();

    if(fruit_type == "apple")
    {
        if(group.apple_orchard_inventory == 0)
        {
           return
        }
    }
    else if(fruit_type == "orange")
    {
        if(group.orange_orchard_inventory == 0)
        {
           return
        }
    }

    let message_data = {
        "value": "success",
        "error_message": "",
        "apples": fruit_type == "apple" ? session_player.apples+1 : session_player.apples,
        "oranges": fruit_type == "orange" ? session_player.oranges+1 : session_player.oranges,
        "apple_orchard_inventory": fruit_type == "apple" ? group.apple_orchard_inventory-1 : group.apple_orchard_inventory,
        "orange_orchard_inventory": fruit_type == "orange" ? group.orange_orchard_inventory-1 : group.orange_orchard_inventory,
        "fruit_type": fruit_type,
        "earnings": fruit_type == "apple" ? session_player.earnings - parameter_set_period.orchard_apple_price : session_player.earnings - parameter_set_period.orchard_orange_price,
        "fruit_cost": fruit_type == "apple" ? parameter_set_period.orchard_apple_price : parameter_set_period.orchard_orange_price,
        "session_player_id": app.session_player.id       
    };

    app.take_update_harvest_fruit(message_data);
},

/**
 * tray fruit instructions
 */
send_tray_fruit_instructions: function send_tray_fruit_instructions(fruit_type)
{
    let parameter_set_player = app.get_parameter_set_player_from_player_id(app.session_player.id);
    let group = app.session.world_state.groups[app.current_group];
    let session_player = app.session.world_state.session_players[app.session_player.id];
    let parameter_set_period = app.get_current_parameter_set_period();

    if(parameter_set_player.id_label == "W")
    {
        if(app.session_player.current_instruction != app.instructions.action_page_3) return;

        if(fruit_type == "apple")
        {
            if(session_player.apples == 0)
            {
                return
            }
        }
        else if(fruit_type == "orange")
        {
            if(session_player.oranges == 0)
            {
                return
            }
        }

        let message_data = {
            "value": "success",
            "error_message": "",
            "session_player_apples": fruit_type == "apple" ? session_player.apples-1 : session_player.apples,
            "session_player_oranges": fruit_type == "orange" ? session_player.oranges-1 : session_player.oranges,
            "session_player_budget": session_player.budget,
            "apple_tray_inventory": fruit_type == "apple" ? group.apple_tray_inventory+1 : group.apple_tray_inventory,
            "orange_tray_inventory": fruit_type == "orange" ? group.orange_tray_inventory+1 : group.orange_tray_inventory,
            "reseller_barrier_up": true,
            "checkout_barrier_up": false,
            "fruit_type": fruit_type,
            "show_end_game_choice_steal": false,
            "show_end_game_choice_no_price": false,
            "session_player_id": app.session_player.id
        };

        app.take_update_tray_fruit(message_data);

        if(app.session_player.current_instruction_complete < app.instructions.action_page_3)
        {
            if(session_player.apples == 0 && session_player.oranges == 0)
            {
                app.session_player.current_instruction_complete=app.instructions.action_page_3;
                app.send_current_instruction_complete();
            }
        }            
    }
    else
    {
        if(app.session_player.current_instruction != app.instructions.action_page_4) return;

        if(fruit_type == "apple")
        {
            if(session_player.apples == 1)
            {
                let message_data = {
                    "value": "fail",
                    "error_message": "Pick up only one apple during the instructions.",
                    "session_player_id": app.session_player.id
                }
                app.take_update_tray_fruit(message_data);
                return;
            }
        }
        else if(fruit_type == "orange")
        {
            if(session_player.oranges == 1)
            {
                let message_data = {
                    "value": "fail",
                    "error_message": "Pick up only one orange during the instructions.",
                    "session_player_id": app.session_player.id
                }
                app.take_update_tray_fruit(message_data);
                return;
            }
        }

        let message_data = {
                "value": "success",
                "error_message": "",
                "session_player_apples": fruit_type == "apple" ? session_player.apples+1 : session_player.apples,
                "session_player_oranges": fruit_type == "orange" ? session_player.oranges+1 : session_player.oranges,
                "session_player_budget": fruit_type == "apple" ? session_player.budget-parameter_set_period.wholesale_apple_price :  session_player.budget-parameter_set_period.wholesale_orange_price,
                "apple_tray_inventory": fruit_type == "apple" ? group.apple_tray_inventory-1 : group.apple_tray_inventory,
                "orange_tray_inventory": fruit_type == "orange" ? group.orange_tray_inventory-1 : group.orange_tray_inventory,
                "reseller_barrier_up": false,
                "checkout_barrier_up": true,
                "fruit_type": fruit_type,
                "show_end_game_choice_steal": false,
                "show_end_game_choice_no_price": false,
                "session_player_id": app.session_player.id
            }

        app.take_update_tray_fruit(message_data);

        if(app.session_player.current_instruction_complete < app.instructions.action_page_4)
        {
            if(session_player.apples == 1 && session_player.oranges == 1)
            {
                app.session_player.current_instruction_complete=app.instructions.action_page_4;
                app.send_current_instruction_complete();
            }
        }
    }
},

/**
 * checkout instructions
 */
send_checkout_instructions: function send_checkout_instructions()
{
    if(app.session_player.current_instruction != app.instructions.action_page_5) return;

    let parameter_set_player = app.get_parameter_set_player_from_player_id(app.session_player.id);
    let group = app.session.world_state.groups[app.current_group];
    let session_player = app.session.world_state.session_players[app.session_player.id];
    let session_player_w = app.get_player_by_type("W");
    let parameter_set_period = app.get_current_parameter_set_period();

    let payment = parameter_set_period.wholesale_apple_price * session_player.apples + 
                  parameter_set_period.wholesale_orange_price * session_player.oranges;

    if(session_player.checkout)
    {
        let message_data = {
        "value": "fail",
        "error_message": "You have already checked out.",
        "session_player_id": app.session_player.id
        };
        app.take_update_checkout(message_data);
        return;
    }

    let message_data = {
        "value": "success",
        "error_message": "",
        "payment": payment,
        "reseller_budget": session_player.budget,
        "reseller_checkout": true,
        "wholesaler_earnings": session_player_w.earnings + payment,
        "checkout_barrier": false,
        "session_player_id": app.session_player.id
    };

    app.take_update_checkout(message_data);

    if(app.session_player.current_instruction_complete < app.instructions.action_page_5)
    {
        app.session_player.current_instruction_complete=app.instructions.action_page_5;
        app.send_current_instruction_complete();
    }
},