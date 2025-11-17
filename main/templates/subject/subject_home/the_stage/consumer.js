/**
 * setup consumer objects
 */
setup_pixi_consumer: function setup_pixi_consumer()
{
    let parameter_set = app.session.parameter_set;
    let consumer_container = new PIXI.Container();
    
    let world_state = app.session.world_state;

    consumer_container.zIndex = 1;

    let location = parameter_set.consumer_location.split(",");

    //consumer container
    consumer_container.position.set(location[0], location[1]);

    //add graphic
    let graphic = new PIXI.Sprite(app.pixi_textures['consumer_tex']);
    graphic.anchor.set(0.5);   
    
    //add label that says double click to harvest
    let style = new PIXI.TextStyle({
        fontFamily: "Arial",
        fontSize: 22,
        fill: "white",
        stroke: {color:'#000000', width:3},
        align: 'center',
    });

    let label = new PIXI.Text({text:"Sale Price: ---", style:style});
    label.anchor.set(0.5);
    let label2 = new PIXI.Text({text:"Checkout", style:style});
    label2.anchor.set(0.5);

    let double_click_graphic = new PIXI.Sprite(app.pixi_textures['double_click_tex']);
    double_click_graphic.anchor.set(0.5);
   
    consumer_container.addChild(graphic);
    consumer_container.addChild(label);
    // consumer_container.addChild(label2);
    consumer_container.addChild(double_click_graphic);

    label.position.set(0, consumer_container.height/2 + label.height/2 + 5);
    label2.position.set(0, -consumer_container.height/2 - label2.height/2 +10);
    double_click_graphic.position.set(graphic.width/2+10, -graphic.height/2);

    consumer_container.eventMode = 'static';
    consumer_container.on("pointertap", app.consumer_double_click);

    
    //build pixi json
    pixi_consumer = {consumer_container:null,                    
                     label:null,
                     last_click:null,
                     rect:null,
    }

    const absolute_position = consumer_container.toGlobal(new PIXI.Point(0, 0));

    pixi_consumer.consumer_container = consumer_container;
    pixi_consumer.rect = new PIXI.Rectangle(absolute_position.x, 
                                            absolute_position.y, 
                                            consumer_container.width, 
                                            consumer_container.height);
    pixi_consumer.label = label;
    
    pixi_container_main.addChild(pixi_consumer.consumer_container);

    app.update_consumer_label();
},

update_consumer_label: function update_consumer_label()
{
    if(!app.session.started) return;

    let world_state = app.session.world_state;
    let retailer_player_id = null;

    let retail_player = app.get_player_by_type("R");
    let parameter_set_player = app.get_parameter_set_player_from_player_id(retail_player.id);
    let oranges = retail_player.oranges;
    let apples = retail_player.apples;

    pixi_consumer.label.text = "Sale Price: " + app.get_customer_price(oranges, apples) + "¢";
},

/**
 * consumer double click
 */
consumer_double_click: function consumer_double_click()
{
    if(app.pixi_mode != "subject") return;
    if(app.working) return;
    if(!app.session.started) return;

    let group = app.session.world_state.groups[app.current_group];
    if(group.complete) return;

    let local_player = app.session.world_state.session_players[app.session_player.id];
    let rect = pixi_consumer.rect;

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

    if(pixi_consumer.last_click && (now - pixi_consumer.last_click) < 400)
    {
        pixi_consumer.last_click = null;

        app.working = true;
        app.send_message("sell_to_consumer",
                        {},
                        "group");
        
    }
    else
    {
        pixi_consumer.last_click = now;
    }
},

/**
 * take result of consumer double click
 */
take_update_sell_to_consumer: function take_update_sell_to_consumer(data)
{
    let session_player_id = data.session_player_id;
    let session_player = app.session.world_state.session_players[session_player_id];
    let world_state = app.session.world_state;
    let parameter_set = app.session.parameter_set;
    let parameter_set_player = app.get_parameter_set_player_from_player_id(session_player_id);
    let group = world_state.groups[app.current_group];

    let parameter_set_player_local = null;
    if(app.is_subject)
    {
        parameter_set_player_local = app.get_parameter_set_player_from_player_id(app.session_player.id);
    }

    let apples_sold = data.apples_sold;
    let oranges_sold = data.oranges_sold;
    let period_earnings = data.period_earnings;

    if(app.is_subject && session_player_id == app.session_player.id)
    {
        app.working = false;
        if(data.value == "fail")
        {
            let current_location = session_player.current_location;

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
        else
        {
           
        }
    }

    group.apple_orchard_inventory = data.apple_orchard_inventory;
    group.orange_orchard_inventory = data.orange_orchard_inventory;
    group.current_period = data.current_period;
    group.barriers = data.barriers;
    group.complete = data.complete;

    for(let i in world_state.session_players)
    {
        world_state.session_players[i].apples = data.session_players[i].apples;
        world_state.session_players[i].oranges = data.session_players[i].oranges;
        world_state.session_players[i].earnings = data.session_players[i].earnings;
        world_state.session_players[i].checkout = data.session_players[i].checkout;
        world_state.session_players[i].consumer = data.session_players[i].consumer;
        world_state.session_players[i].budget = data.session_players[i].budget;
    }

    //show notices
    if(app.is_subject)
    {
        app.remove_all_notices();

        if(group.complete)
        {
            //the experiment is complete
            app.add_notice("The experiment is complete, please wait.", world_state.current_period+1, 1)
        }
        else
        {
            if(parameter_set_player_local.id_label == "R")
            { 
                app.add_notice("Please wait.", world_state.current_period+1, 1)
            }
            else if(parameter_set_player_local.id_label == "W")
            {
                app.add_notice("Harvest all of the fruit and place it on the trays.", world_state.current_period+1, 1)
            }
        }
    }

    app.update_subject_status_overlay();

    let consumer_location = parameter_set.consumer_location.split(",");
    consumer_location = {x:parseInt(consumer_location[0]), y:parseInt(consumer_location[1])};

    //transfer beam to retailer
    let elements = [];
    let element = {source_change: "-" + period_earnings,
                   target_change: "+" + period_earnings, 
                   texture:app.pixi_textures['cents_symbol_tex'],
                }
    elements.push(element);
    app.add_transfer_beam(consumer_location, 
                          session_player.current_location,
                          elements,
                          false,
                          true);

    //transfer to consumer
    let elements2 = [];
    if(apples_sold > 0)
    {
        let element2 = {source_change: "-" + apples_sold,
                        target_change: "+" + apples_sold, 
                        texture:app.pixi_textures['apple_tex'],
                    }
        elements2.push(element2);
    }
    if(oranges_sold > 0)
    {
        let element3 = {source_change: "-" + oranges_sold,
                        target_change: "+" + oranges_sold, 
                        texture:app.pixi_textures['orange_tex'],
                    }
        elements2.push(element3);
    }

    if(elements2.length > 0)
    {
        app.add_transfer_beam(session_player.current_location, 
                              consumer_location,
                              elements2,
                              false,
                              true);
    }

    app.update_player_inventory();
    app.update_barriers();
    app.update_orchard_labels();
    app.update_register_labels();
},