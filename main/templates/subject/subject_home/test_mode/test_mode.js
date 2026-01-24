{%if session.parameter_set.test_mode%}
/**
 * return random number between min and max inclusive
 */
random_number: function random_number(min, max){
    //return a random number between min and max
    min = Math.ceil(min);
    max = Math.floor(max+1);
    return Math.floor(Math.random() * (max - min) + min);
},

do_test_mode: function do_test_mode(){

    if(worker) worker.terminate();

    {%if DEBUG%}
    console.log("Do Test Mode");
    {%endif%}

    if(app.end_game_modal_visible && app.test_mode)
    {
        if(app.session_player.name == "")
        {
            Vue.nextTick(() => {
                app.session_player.name = app.random_string(5, 20);
                app.session_player.student_id =  app.random_number(1000, 10000);

                app.send_name();
            })
        }

        return;
    }

    if(app.session.started && app.test_mode && app.working == false)
    {
        let parameter_set_player = app.get_parameter_set_player_from_player_id(app.session_player.id);

        switch (app.session.world_state.current_experiment_phase)
        {
            case "Instructions":
                app.do_test_mode_instructions();
                break;
            case "Run":
                if(parameter_set_player.id_label == "W")
                    app.do_test_mode_run_w();
                else if(parameter_set_player.id_label == "R")
                    app.do_test_mode_run_r();
                break;
            
        }        
       
    }

    // setTimeout(app.do_test_mode, app.random_number(1000 , 1500));
    worker = new Worker("/static/js/worker_test_mode.js");

    worker.onmessage = function (evt) {   
        app.do_test_mode();
    };

    worker.postMessage(0);
},

/**
 * test during instruction phase
 */
do_test_mode_instructions: function do_test_mode_instructions()
 {
    if(app.session_player.instructions_finished) return;
    if(app.working) return;
    
   
    if(app.session_player.current_instruction == app.session_player.current_instruction_complete)
    {

        if(app.session_player.current_instruction == app.instructions.instruction_pages.length)
            document.getElementById("instructions_start_id").click();
        else
            document.getElementById("instructions_next_id").click();

    }else
    {
        //take action if needed to complete page
        switch (app.session_player.current_instruction)
        {
            case app.instructions.action_page_1:
                app.do_test_mode_instructions_1();
                break;
            case app.instructions.action_page_2:        
                app.do_test_mode_instructions_2();        
                break;
            case app.instructions.action_page_3:
                app.do_test_mode_instructions_3();
                break;
            case app.instructions.action_page_4:
                app.do_test_mode_instructions_4();
                break;
            case app.instructions.action_page_5:

                break;
            case app.instructions.action_page_6:

                break;
        }   
    }

    
 },

 /**
  * test mode page 1 of instructions
  * move to the top of the screen
  */
 do_test_mode_instructions_1: function do_test_mode_instructions_1()
 {
    let local_player = app.session.world_state.session_players[app.session_player.id];

    local_player.target_location = {"x":parseInt(local_player.current_location.x), 
                                    "y":parseInt(local_player.current_location.y)-50};
    app.target_location_update();    
 },

 /**
  * test mode page 2 of instructions
  * harvest all apples and oranges from the orchards
  */
do_test_mode_instructions_2: function do_test_mode_instructions_2()
{
    let local_player = app.session.world_state.session_players[app.session_player.id];
    let group = app.session.world_state.groups[app.current_group];

    // harvest apples
    if(group.apple_orchard_inventory > 0)
    {
        if (!pixi_orchard_apple || !pixi_orchard_apple.container) {
            return;
        }

        //move to apple orchard
        local_player.target_location = {"x":parseInt(pixi_orchard_apple.container.x), 
                                        "y":parseInt(pixi_orchard_apple.container.y)-50};
        app.target_location_update();

        app.orchard_apple_double_click();
        app.orchard_apple_double_click();
        return;
    }

    //harvest oranges
    if(group.orange_orchard_inventory > 0)
    {
        if (!pixi_orchard_orange || !pixi_orchard_orange.container) {
            return;
        }

        //move to orange orchard
        local_player.target_location = {"x":parseInt(pixi_orchard_orange.container.x), 
                                        "y":parseInt(pixi_orchard_orange.container.y)-50};
        app.target_location_update();

        app.orchard_orange_double_click();
        app.orchard_orange_double_click();
        return;
    }
},

/**
 * test mode page 3 of instructions
 * place all apples and oranges on the trays
 */
do_test_mode_instructions_3: function do_test_mode_instructions_3()
{
    let local_player = app.session.world_state.session_players[app.session_player.id];

    // go to apple tray
    if(local_player.apples > 0)
    {
        if (!pixi_tray_apple || !pixi_tray_apple.container) {
            return;
        }

        //move to register
        local_player.target_location = {"x":parseInt(pixi_tray_apple.container.x-50), 
                                        "y":parseInt(pixi_tray_apple.container.y)};
        app.target_location_update();

        app.tray_apple_double_click();
        app.tray_apple_double_click();

        return;
    }

    // go to orange tray
    if(local_player.oranges > 0)
    {
        if (!pixi_tray_orange || !pixi_tray_orange.container) {
            return;
        }

        //move to register
        local_player.target_location = {"x":parseInt(pixi_tray_orange.container.x-50), 
                                        "y":parseInt(pixi_tray_orange.container.y)};
        app.target_location_update();

        app.tray_orange_double_click();
        app.tray_orange_double_click();

        return;
    }
},

/**
 * test mode page 4 of instructions
 * move to trays and pick up one apple and one orange
 */
do_test_mode_instructions_4: function do_test_mode_instructions_4()
{
    let local_player = app.session.world_state.session_players[app.session_player.id];

    // go to apple tray
    if(local_player.apples < 1)
    {
        if (!pixi_tray_apple || !pixi_tray_apple.container) {
            return;
        }

        //move to register
        local_player.target_location = {"x":parseInt(pixi_tray_apple.container.x) + 50, 
                                        "y":parseInt(pixi_tray_apple.container.y)};
        app.target_location_update();

        app.tray_apple_double_click();
        app.tray_apple_double_click();

        return;
    }

    // go to orange tray
    if(local_player.oranges < 1)
    {
        if (!pixi_tray_orange || !pixi_tray_orange.container) {
            return;
        }

        //move to register
        local_player.target_location = {"x":parseInt(pixi_tray_orange.container.x) + 50, 
                                        "y":parseInt(pixi_tray_orange.container.y)};
        app.target_location_update();

        app.tray_orange_double_click();
        app.tray_orange_double_click();

        return;
    }
},

/**
 * test during run phase for wholesaler
 */
do_test_mode_run_w: function do_test_mode_run_w()
{
    let group = app.session.world_state.groups[app.current_group];
    let local_player = app.session.world_state.session_players[app.session_player.id];
    let parameter_set = app.session.parameter_set;
    let parameter_set_player = app.get_parameter_set_player_from_player_id(app.session_player.id);

    if(group.complete) return;

    // harvest apples
    if(group.apple_orchard_inventory > 0)
    {
        if (!pixi_orchard_apple || !pixi_orchard_apple.container) {
            return;
        }

        //move to apple orchard
        local_player.target_location = {"x":parseInt(pixi_orchard_apple.container.x), 
                                        "y":parseInt(pixi_orchard_apple.container.y)-50};
        app.target_location_update();

        app.orchard_apple_double_click();
        app.orchard_apple_double_click();
        
        return;
    }

    //harvest oranges
    if(group.orange_orchard_inventory > 0)
    {
        if (!pixi_orchard_orange || !pixi_orchard_orange.container) {
            return;
        }

        //move to orange orchard
        local_player.target_location = {"x":parseInt(pixi_orchard_orange.container.x), 
                                        "y":parseInt(pixi_orchard_orange.container.y)-50};
        app.target_location_update();

        app.orchard_orange_double_click();
        app.orchard_orange_double_click();
        
        return;
    }

    // go to apple tray
    if(local_player.apples > 0)
    {
        if (!pixi_tray_apple || !pixi_tray_apple.container) {
            return;
        }

        //move to register
        local_player.target_location = {"x":parseInt(pixi_tray_apple.container.x-50), 
                                        "y":parseInt(pixi_tray_apple.container.y)};
        app.target_location_update();

        app.tray_apple_double_click();
        app.tray_apple_double_click();

        return;
    }

    // go to orange tray
    if(local_player.oranges > 0)
    {
        if (!pixi_tray_orange || !pixi_tray_orange.container) {
            return;
        }

        //move to register
        local_player.target_location = {"x":parseInt(pixi_tray_orange.container.x-50), 
                                        "y":parseInt(pixi_tray_orange.container.y)};
        app.target_location_update();

        app.tray_orange_double_click();
        app.tray_orange_double_click();

        return;
    }

    // go to the register
    if (!pixi_register || !pixi_register.wholesaler_pad_container) {
        return;
    }

    //move to register
    local_player.target_location = {"x":parseInt(pixi_register.wholesaler_pad_container.x + 
                                        parseInt(pixi_register.wholesaler_pad_container.width)/2), 
                                    "y":parseInt(pixi_register.wholesaler_pad_container.y + 
                                        parseInt(pixi_register.wholesaler_pad_container.height)/2)};
    app.target_location_update();
    
},

/**
 *  test during run phase for retailer
 */
do_test_mode_run_r: function do_test_mode_run_r()
{
    let group = app.session.world_state.groups[app.current_group];
    let local_player = app.session.world_state.session_players[app.session_player.id];
    let parameter_set = app.session.parameter_set;
    let parameter_set_period = app.get_current_parameter_set_period();

    if(group.complete) return;

    //end game choice steal
    if(group.show_end_game_choice_steal)
    {
        if(app.random_number(1,2) == 1)
            app.end_game_steal_yes();
        else
            app.end_game_steal_no();

        if(app.random_number(1,2) == 1)
            app.end_game_steal_yes();
        else
            app.end_game_steal_no();

        return;
    }


    if(group.show_end_game_choice_no_price)
    {
        if(app.random_number(1,2) == 1)
            app.end_game_no_price_yes();
        else
            app.end_game_no_price_no();
        return;
    }

    if(group.barriers[group.reseller_barrier].enabled) return;

    //move to buyer
    if(local_player.checkout || (group.end_game_mode == "Steal" && local_player.apples > 0 && local_player.oranges > 0))
    {
        if (!pixi_buyer || !pixi_buyer.buyer_container) {
            return;
        }

        //move to buyer
        local_player.target_location = {"x":parseInt(pixi_buyer.buyer_container.x), 
                                        "y":parseInt(pixi_buyer.buyer_container.y)+50};
        app.target_location_update();

        app.buyer_double_click();
        app.buyer_double_click();

        return;
    }

    //check if going to register
    if (pixi_register && pixi_register.reseller_pad_container && group.end_game_mode != "Steal")
    {
        if((local_player.budget<parameter_set_period.wholesale_apple_price &&
           local_player.budget<parameter_set_period.wholesale_orange_price) ||
           local_player.apples + local_player.oranges >= parameter_set_period.max_fruit)
        {
            local_player.target_location = {"x":parseInt(pixi_register.reseller_pad_container.x) + 
                                                parseInt(pixi_register.reseller_pad_container.width)/2, 
                                            "y":parseInt(pixi_register.reseller_pad_container.y) +
                                                parseInt(pixi_register.reseller_pad_container.height)/2};
            app.target_location_update();

            app.register_double_click();
            app.register_double_click();
            
            return;
        }
    }

    // pick up fruit from trays
    if(app.random_number(1,2) == 1)
    {
        if (!pixi_tray_apple || !pixi_tray_apple.container) {
            return;
        }

        //move to apple tray
        local_player.target_location = {"x":parseInt(pixi_tray_apple.container.x) + 50, 
                                        "y":parseInt(pixi_tray_apple.container.y)};
        app.target_location_update();

        app.tray_apple_double_click();
        app.tray_apple_double_click();

    }

    if(app.random_number(1,2) == 1)
    {
        if (!pixi_tray_orange || !pixi_tray_orange.container) {
            return;
        }

        //move to orange tray
        local_player.target_location = {"x":parseInt(pixi_tray_orange.container.x) + 50, 
                                        "y":parseInt(pixi_tray_orange.container.y)};
        app.target_location_update();

        app.tray_orange_double_click();
        app.tray_orange_double_click();
    }

    // if((local_player.apples > 2 || local_player.oranges > 2) && app.random_number(1,3) == 1)
    // {
    //     // go to the register
    //     if (!pixi_register || !pixi_register.reseller_pad_container) {
    //         return;
    //     }

    //     //move to register
    //     local_player.target_location = {"x":parseInt(pixi_register.reseller_pad_container.x) + 
    //                                         parseInt(pixi_register.reseller_pad_container.width)/2, 
    //                                     "y":parseInt(pixi_register.reseller_pad_container.y) +
    //                                         parseInt(pixi_register.reseller_pad_container.height)/2};
    //     app.target_location_update();
    // }
},

// /**
//  * test mode chat
//  */
// do_test_mode_chat: function do_test_mode_chat(){

//     app.chat_text = app.random_string(5, 20);
// },


{%endif%}