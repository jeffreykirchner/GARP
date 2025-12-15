/**
 * setup tray apple objects
 */
setup_pixi_tray_apple: function setup_pixi_tray_apple()
{

    let tray_apple_container = new PIXI.Container();
    tray_apple_container.zIndex = 1;

    let location = app.session.parameter_set.apple_tray_location.split(",");

    tray_apple_container.position.set(location[0], location[1]);

    //add graphic
    let tray = new PIXI.Sprite(app.pixi_textures['tray_tex']);
    tray.scale.set(0.75);

    //add label that says double click to harvest
    let style = new PIXI.TextStyle({
        fontFamily: "Arial",
        fontSize: 22,
        fill: "white",
        stroke: {color:'#000000', width:3},
        align: 'center',
    });

    let label_price = new PIXI.Text({text:"Sell: NNN¢ / Apple", style:style});
    label_price.anchor.set(0.5);

    //add double click graphic bottom right corner of container
    let double_click_graphic = new PIXI.Sprite(app.pixi_textures['double_click_tex']);
    double_click_graphic.anchor.set(0.5);
    
    tray_apple_container.addChild(double_click_graphic);
    tray_apple_container.addChild(tray);
    tray_apple_container.addChild(label_price);

    label_price.position.set(tray.width/2, tray.height + label_price.height/2 + 5);
    double_click_graphic.position.set(label_price.x + label_price.width/2 + double_click_graphic.width/2 +10,
                                      label_price.y-5);

    //add apples tray based on parameter_set apple_tray_capacity
    let apples = [];
    let spacer = 35;
    let z_index = app.session.parameter_set.apple_tray_capacity;
    let start_x = tray.x + spacer;
    let total_width = tray.width - spacer*2;
    let spacing = total_width / app.session.parameter_set.apple_tray_capacity;
    for (let i = 0; i < app.session.parameter_set.apple_tray_capacity; i++) {
        let apple = new PIXI.Sprite(app.pixi_textures['apple_tex']);
        apple.scale.set(0.5);
        apple.anchor.set(0.5);
        apple.zIndex = z_index--;
        apple.position.set(i * spacing + start_x+5, app.pixi_textures['tray_tex'].height/2-30);
        tray_apple_container.addChild(apple);
        apples.push(apple);
    }

    //interaction
    tray_apple_container.zIndex = 1;
    tray_apple_container.eventMode = 'static';
    tray_apple_container.on("pointertap", app.tray_apple_double_click);

    pixi_tray_apple = {container:null,
                       label_price:null,
                       last_click:null,
                       rect:null,
                       apples:apples};

    const absolute_position = tray_apple_container.toGlobal(new PIXI.Point(0, 0));

    pixi_tray_apple.container = tray_apple_container;
    pixi_tray_apple.label_price = label_price;
    pixi_tray_apple.rect = {x:absolute_position.x, 
                            y:absolute_position.y, 
                            width:tray_apple_container.width, 
                            height:tray_apple_container.height};

    pixi_container_main.addChild(pixi_tray_apple.container);

},

/**
 * setup tray orange objects
 */
setup_pixi_tray_orange: function setup_pixi_tray_orange()
{
    let tray_orange_container = new PIXI.Container();
    tray_orange_container.zIndex = 1;

    let location = app.session.parameter_set.orange_tray_location.split(",");

    tray_orange_container.position.set(location[0], location[1]);

    //add graphic
    let tray_scale = 0.75;
    let tray = new PIXI.Sprite(app.pixi_textures['tray_tex']);
    tray.scale.set(tray_scale);

    //add label that says double click to harvest
    let style = new PIXI.TextStyle({
        fontFamily: "Arial",
        fontSize: 22,
        fill: "white",
        stroke: {color:'#000000', width:3},
        align: 'center',
    });

    let label_price = new PIXI.Text({text:"Sell: NNN¢ / Orange", style:style});
    label_price.anchor.set(0.5);

    //add double click graphic bottom right corner of container
    let double_click_graphic = new PIXI.Sprite(app.pixi_textures['double_click_tex']);
    double_click_graphic.anchor.set(0.5);
    
    tray_orange_container.addChild(double_click_graphic);
    tray_orange_container.addChild(tray);
    tray_orange_container.addChild(label_price);

    label_price.position.set(tray.width/2, tray.height + label_price.height/2 + 5);
    double_click_graphic.position.set(label_price.x + label_price.width/2 + double_click_graphic.width/2 +10,
                                      label_price.y-5);

    //add oranges tray based on parameter_set orange_tray_capacity
    let oranges = [];
    let spacer = 35;
    let z_index = app.session.parameter_set.orange_tray_capacity;
    let start_x = tray.x + spacer;
    let total_width = tray.width - spacer*2;
    let spacing = total_width / app.session.parameter_set.orange_tray_capacity;
    for (let i = 0; i < app.session.parameter_set.orange_tray_capacity; i++) {
        let orange = new PIXI.Sprite(app.pixi_textures['orange_tex']);
        orange.scale.set(0.5);
        orange.anchor.set(0.5);
        orange.zIndex = z_index--;
        orange.position.set(i * spacing + start_x+5, app.pixi_textures['tray_tex'].height/2-30);
        tray_orange_container.addChild(orange);
        oranges.push(orange);
    }

    //interaction
    tray_orange_container.zIndex = 1;
    tray_orange_container.eventMode = 'static';
    tray_orange_container.on("pointertap", app.tray_orange_double_click);

    pixi_tray_orange = {container:null,
                        label_price:null,
                        last_click:null,
                        rect:null,
                        oranges:oranges};

    // let bounding_box = new PIXI.Graphics();

    // bounding_box.rect(0, 0, tray_orange_container.width, 
    //                   tray_orange_container.height );
    // bounding_box.stroke(2, "orchid");
    // // bounding_box.pivot.set(bounding_box.width/2, bounding_box.height/2);
    // bounding_box.position.set(0, 0);
    // bounding_box.visible = false;

    // tray_orange_container.addChild(bounding_box);

    const absolute_position = tray_orange_container.toGlobal(new PIXI.Point(0, 0));

    pixi_tray_orange.container = tray_orange_container;
    pixi_tray_orange.label_price = label_price;
    pixi_tray_orange.rect = {x:absolute_position.x, 
                             y:absolute_position.y, 
                             width:tray_orange_container.width, 
                             height:tray_orange_container.height};

    pixi_container_main.addChild(pixi_tray_orange.container);
},

/**
 * update tray labels with the prices from the parameter set
 */
update_tray_labels: function update_tray_labels()
{
    let parameter_set_period = app.get_current_parameter_set_period();
    let buy_sell_text = "";

    if(!parameter_set_period) return;

    if(app.is_subject)
    {
        let parameter_set_player = app.get_parameter_set_player_from_player_id(app.session_player.id);
        if(parameter_set_player.id_label == "W")
        {
            buy_sell_text = "Sell: ";
        }
        else
        {
            buy_sell_text = "Buy: ";
        }
    }

    if(app.get_end_game_mode() === "No Price")
    {
        pixi_tray_apple.label_price.text = buy_sell_text + "??? / Apple";
        pixi_tray_orange.label_price.text = buy_sell_text + "??? / Orange";
    }
    else
    {
        pixi_tray_apple.label_price.text = buy_sell_text + parameter_set_period.wholesale_apple_price + "¢ / Apple";
        pixi_tray_orange.label_price.text = buy_sell_text + parameter_set_period.wholesale_orange_price + "¢ / Orange";
    }

    //set alpha of of apple not in tray to 50%
    let world_state = app.session.world_state;
    let group = world_state.groups[app.current_group];
    for(let i=0; i<pixi_tray_apple.apples.length; i++)
    {
        if(i < group.apple_tray_inventory)
        {
            pixi_tray_apple.apples[i].alpha = 1.0;
        }
        else
        {
            pixi_tray_apple.apples[i].alpha = 0.25;
        }
    }

    //set alpha of of orange not in tray to 50%
    for(let i=0; i<pixi_tray_orange.oranges.length; i++)
    {
        if(i < group.orange_tray_inventory)
        {
            pixi_tray_orange.oranges[i].alpha = 1.0;
        }
        else
        {
            pixi_tray_orange.oranges[i].alpha = 0.25;
        }
    }

},

tray_apple_double_click: function tray_apple_double_click()
{
    if(app.pixi_mode != "subject") return;
    if(app.working) return;

    //check if end game overlay is showing
    if(app.showing_end_game_steal_overlay) return;
    if(app.showing_end_game_no_price_overlay) return;

    let local_player = app.session.world_state.session_players[app.session_player.id];
    let rect = pixi_tray_apple.rect;

    if(!app.check_for_circle_rect_intersection({x:local_player.current_location.x, 
                                                y:local_player.current_location.y, 
                                                radius:app.session.parameter_set.interaction_range},
                                                rect))
    {
        app.add_text_emitters("Error: Not in range, move closer.", 
                                local_player.current_location.x, 
                                local_player.current_location.y,
                                local_player.current_location.x,
                                local_player.current_location.y-100,
                                0xFFFFFF,
                                28,
                                null);
        return;
    }

    let now = Date.now();

    if(pixi_tray_apple.last_click && (now - pixi_tray_apple.last_click) < 400)
    {
        if(app.session.world_state.current_experiment_phase == 'Instructions')
        {
            app.send_tray_fruit_instructions("apple");
        }
        else
        {
            app.working = true;
            app.send_message("tray_fruit",
                            {"fruit_type" : "apple", },
                            "group");
        }

        pixi_tray_apple.last_click = null;
    }
    else
    {
        pixi_tray_apple.last_click = now;
    }
},

tray_orange_double_click: function tray_orange_double_click()
{
    if(app.pixi_mode != "subject") return;
    if(app.working) return;

    //check if end game overlay is showing
    if(app.show_end_game_steal_overlay()) return;
    if(app.show_end_game_no_price_overlay()) return;

    let local_player = app.session.world_state.session_players[app.session_player.id];
    let rect = pixi_tray_orange.rect;

    if(!app.check_for_circle_rect_intersection({x:local_player.current_location.x, 
                                                y:local_player.current_location.y, 
                                                radius:app.session.parameter_set.interaction_range},
                                                rect))
    {
        app.add_text_emitters("Error: Not in range, move closer.", 
                                local_player.current_location.x, 
                                local_player.current_location.y,
                                local_player.current_location.x,
                                local_player.current_location.y-100,
                                0xFFFFFF,
                                28,
                                null);
        return;
    }

    let now = Date.now();

    if(pixi_tray_orange.last_click && (now - pixi_tray_orange.last_click) < 400)
    {        
        if(app.session.world_state.current_experiment_phase == 'Instructions')
        {
            app.send_tray_fruit_instructions("orange");
        }
        else
        {
            app.working = true;
            app.send_message("tray_fruit", 
                            {"fruit_type" : "orange", },
                            "group");
        }

        pixi_tray_orange.last_click = null;
    }
    else
    {
        pixi_tray_orange.last_click = now;
    }
},

take_update_tray_fruit: function take_update_tray_fruit(data)
{
    let session_player_id = data.session_player_id;
    let session_player = app.session.world_state.session_players[session_player_id];
    let parameter_set_player = app.get_parameter_set_player_from_player_id(session_player_id);
   
    let world_state = app.session.world_state;
    let group_id = app.get_players_group_id(session_player_id);
    let group = world_state.groups[group_id];

    let parameter_set_player_local = null;
    if(app.is_subject)
    {
        parameter_set_player_local = app.get_parameter_set_player_from_player_id(app.session_player.id);
    }

    if(app.is_subject && session_player_id == app.session_player.id)
    {
        app.working = false;
        if(data.value == "fail")
        {
            let current_location = app.session.world_state.session_players[app.session_player.id].current_location;

            app.add_text_emitters("Error: " + data.error_message, 
                    current_location.x, 
                    current_location.y,
                    current_location.x,
                    current_location.y-100,
                    0xFFFFFF,
                    28,
                    null)
            return;
        }
    }

    group["show_end_game_choice_steal"] = data.show_end_game_choice_steal;
    group["show_end_game_choice_no_price"] = data.show_end_game_choice_no_price;

    if(!group["show_end_game_choice_steal"] &&
       !group["show_end_game_choice_no_price"])
    {
       
        //show notices
        if(app.is_subject && 
            parameter_set_player.id_label == "R" && 
            parameter_set_player_local.id_label == "W")
        {
            app.remove_all_notices();
            app.add_notice("Move to the register for checkout.", world_state.current_period+1, 1)
        }

        session_player.apples = data.session_player_apples;
        session_player.oranges = data.session_player_oranges;
        session_player.budget = data.session_player_budget;

        let source_location={x:0, y:0};
        let target_location={x:0, y:0};
        let source_tex = null;

        if(parameter_set_player.id_label == "W")
        {
            //wholesaler move fruit to tray
            if(data.fruit_type == "apple")
            {
                let location = app.session.parameter_set.apple_tray_location.split(",");
                target_location.x = parseInt(location[0]) + pixi_tray_apple['container'].width/2;
                target_location.y = parseInt(location[1]) + pixi_tray_apple['container'].height/2;
                source_tex = app.pixi_textures['apple_tex'];
            }
            else if(data.fruit_type == "orange")
            {
                let location = app.session.parameter_set.orange_tray_location.split(",");
                target_location.x = parseInt(location[0]) + pixi_tray_orange['container'].width/2;
                target_location.y = parseInt(location[1]) + pixi_tray_orange['container'].height/2;
                source_tex = app.pixi_textures['orange_tex'];
            }

            source_location = session_player.current_location;

        
            if(app.is_subject &&
               session_player.apples == 0 && 
               session_player.oranges == 0)
            {
                app.remove_all_notices();
                if(parameter_set_player_local.id_label == "W")
                {
                    app.add_notice("Please wait.", world_state.current_period+1, 1)
                }
                else
                {
                    app.add_notice("Collect fruit from the trays.", world_state.current_period+1, 1)
                }            
            }
        }
        else
        {
            //reseller move fruit from tray
            if(data.fruit_type == "apple")
            {
                let location = app.session.parameter_set.apple_tray_location.split(",");
                source_location.x = parseInt(location[0]) + pixi_tray_apple['container'].width/2;
                source_location.y = parseInt(location[1]) + pixi_tray_apple['container'].height/2;
                source_tex = app.pixi_textures['apple_tex'];
            }
            else if(data.fruit_type == "orange")
            {
                let location = app.session.parameter_set.orange_tray_location.split(",");
                source_location.x = parseInt(location[0]) + pixi_tray_orange['container'].width/2;
                source_location.y = parseInt(location[1]) + pixi_tray_orange['container'].height/2;
                source_tex = app.pixi_textures['orange_tex'];
            }

            target_location = session_player.current_location;
        }

        if(app.is_player_in_group(session_player_id))
        {
            let elements = [];
            let element = {source_change: "-",
                        target_change: "+", 
                        texture:source_tex,
                        }
            elements.push(element);
            app.add_transfer_beam(source_location, 
                                target_location,
                                elements,
                                false,
                                true);
        }
        
        group.apple_tray_inventory = data.apple_tray_inventory;
        group.orange_tray_inventory = data.orange_tray_inventory;

        group["barriers"][group["reseller_barrier"]]["enabled"] = data.reseller_barrier_up;
        group["barriers"][group["checkout_barrier"]]["enabled"] = data.checkout_barrier_up;
    }
    else if(parameter_set_player_local.id_label == "W" && 
            app.is_player_in_group(session_player_id))
    {
        //show end game notice to wholesaler
        if(group["show_end_game_choice_steal"])
        {
            app.end_game_notice_visible = true;
            app.end_game_notice_message = "The Reseller is deciding whether to take fruit without paying you for them <u>or</u> to pick up fruit and pay you for them.<br><br>Please wait for them to make their choice.";
        }
        else if(group["show_end_game_choice_no_price"])
        {
            app.end_game_notice_visible = true;
            app.end_game_notice_message = "The Reseller is deciding whether or not to see the prices before paying you for the bundle.<br><br>Please wait for them to make their choice.";
        }   
    }

    if(app.is_player_in_group(session_player_id))
    {
        app.update_orchard_labels();
        app.update_player_inventory();
        app.update_tray_labels();
        app.update_register_labels();
        app.update_barriers();
    }
},

/**
 * reset reseller inventory to zero
 */
reset_reseller_inventory: function reset_reseller_inventory()
{
    if(app.session.world_state.current_experiment_phase == 'Instructions')
    {
        app.send_reset_reseller_inventory();
    }
    else
    {
        app.working = true;
        app.send_message("reset_reseller_inventory", 
                        {},
                        "group");
    }
},

/**
 * take reset reseller inventory
 */
take_update_reset_reseller_inventory: function take_update_reset_reseller_inventory(data)
{
    let session_player_id = data.session_player_id;
    let session_player = app.session.world_state.session_players[session_player_id];
    let world_state = app.session.world_state;
    let group_id = app.get_players_group_id(session_player_id);
    let group = world_state.groups[group_id];

    if(app.is_subject && session_player_id == app.session_player.id)
    {
        app.working = false;
        if(data.value == "fail")
        {
            let current_location = app.session.world_state.session_players[app.session_player.id].current_location;

            app.add_text_emitters("Error: " + data.error_message, 
                    current_location.x, 
                    current_location.y,
                    current_location.x,
                    current_location.y-100,
                    0xFFFFFF,
                    28,
                    null)
            return;
        }
    }

    session_player.apples = data.session_player_apples;
    session_player.oranges = data.session_player_oranges;
    session_player.budget = data.session_player_budget;

    group.apple_tray_inventory = data.apple_tray_inventory;
    group.orange_tray_inventory = data.orange_tray_inventory;

    let oranges = data.starting_oranges;
    let apples = data.starting_apples;

    //apples transfer beam
    if(app.is_player_in_group(session_player_id))
    {
        if(apples > 0)
        {

            let target_location={x:0, y:0};
            let source_tex = app.pixi_textures['apple_tex'];

            let location = app.session.parameter_set.apple_tray_location.split(",");
            target_location.x = parseInt(location[0]) + pixi_tray_apple['container'].width/2;
            target_location.y = parseInt(location[1]) + pixi_tray_apple['container'].height/2;

            let elements = [];
            let element = {source_change: "-" + apples,
                        target_change: "+" + apples, 
                        texture:source_tex,
                        }
            elements.push(element);
            app.add_transfer_beam(session_player.current_location, 
                                target_location,
                                elements,
                                true,
                                true);
        }

        //oranges transfer beam
        if(oranges > 0)
        {
            let target_location={x:0, y:0};
            let source_tex = app.pixi_textures['orange_tex'];

            let location = app.session.parameter_set.orange_tray_location.split(",");
            target_location.x = parseInt(location[0]) + pixi_tray_orange['container'].width/2;
            target_location.y = parseInt(location[1]) + pixi_tray_orange['container'].height/2;

            let elements = [];
            let element = {source_change: "-" + oranges,
                        target_change: "+" + oranges, 
                        texture:source_tex,
                        }
            elements.push(element);
            app.add_transfer_beam(session_player.current_location, 
                                target_location,
                                elements,
                                true,
                                true);
        }

        app.update_orchard_labels();
        app.update_player_inventory();
        app.update_tray_labels();
        app.update_register_labels();
    }


},

