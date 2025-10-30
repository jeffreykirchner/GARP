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

    let label = new PIXI.Text({text:"Total: NNN¢", style:style});
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
    double_click_graphic.position.set(-graphic.width/2+30, -graphic.height/2);

    consumer_container.eventMode = 'static';
    consumer_container.on("pointertap", app.consumer_double_click);

    
    //build pixi json
    pixi_consumer = {consumer_container:null,                    
                     label:null,
                     last_click:null,
                     rect:null,
    }

    pixi_consumer.consumer_container = consumer_container;
    pixi_consumer.rect = new PIXI.Rectangle(0, 0, consumer_container.width, consumer_container.height);
    pixi_consumer.label = label;
    
    pixi_container_main.addChild(pixi_consumer.consumer_container);
},

consumer_double_click: function consumer_double_click()
{
    if(app.pixi_mode != "subject") return;
    if(app.working) return;
    if(!app.session.started) return;

    let now = Date.now();

    if(pixi_consumer.last_click && (now - pixi_consumer.last_click) < 400)
    {
        pixi_consumer.last_click = null;

        let wholesaler_position = null;
        let retailer_position = null;
        let world_state = app.session.world_state;
        if(world_state.session_players_order.length > 0)
        {
            wholesaler_position = world_state.session_players[world_state.session_players_order[0]].current_location;
            if(world_state.session_players_order[0] == app.session_player.id)
            {
                app.add_text_emitters("Error: The retailer must checkout.",
                    world_state.session_players[app.session_player.id].current_location.x,
                    world_state.session_players[app.session_player.id].current_location.y,
                    world_state.session_players[app.session_player.id].current_location.x,
                    world_state.session_players[app.session_player.id].current_location.y-100,
                    0xFFFFFF,
                    28,
                    null);
                return;
            }
        }

        if(world_state.session_players_order.length > 1)
        {
            retailer_position = world_state.session_players[world_state.session_players_order[1]].current_location;
        }

        if(!wholesaler_position || !retailer_position)
        {
            return;
        }

        if(!app.is_in_wholesaler_pad(wholesaler_position))
        {
            app.add_text_emitters("Error: Wholesaler not on pad", 
                    world_state.session_players[app.session_player.id].current_location.x, 
                    world_state.session_players[app.session_player.id].current_location.y,
                    world_state.session_players[app.session_player.id].current_location.x,
                    world_state.session_players[app.session_player.id].current_location.y-100,
                    0xFFFFFF,
                    28,
                    null)
            return;
        }
        if(!app.is_in_retailer_pad(retailer_position))
        {
            app.add_text_emitters("Error: You are not on the pad", 
                    world_state.session_players[app.session_player.id].current_location.x, 
                    world_state.session_players[app.session_player.id].current_location.y,
                    world_state.session_players[app.session_player.id].current_location.x,
                    world_state.session_players[app.session_player.id].current_location.y-100,
                    0xFFFFFF,
                    28,
                    null)
            return;
        }

        app.working = true;
        app.send_message("checkout",
                        {},
                        "group");
        
    }
    else
    {
        pixi_consumer.last_click = now;
    }
},

take_update_checkout: function take_update_checkout(data)
{
    let session_player_id = data.session_player_id;
    let session_player = app.session.world_state.session_players[session_player_id];
    let world_state = app.session.world_state;

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

    let payment = data.payment;
    let wholesaler_player_id = world_state.session_players_order[0];
    let wholesaler_player = world_state.session_players[wholesaler_player_id];
    let retailer_player_id = world_state.session_players_order[1];
    let retailer_player = world_state.session_players[retailer_player_id];

    let elements = [];
    let element = {source_change: "-" + payment,
                   target_change: "+" + payment, 
                   texture:app.pixi_textures['cents_symbol_tex'],
                }
    elements.push(element);
    app.add_transfer_beam(retailer_player.current_location, 
                          wholesaler_player.current_location,
                          elements,
                          true,
                          true);

    
},