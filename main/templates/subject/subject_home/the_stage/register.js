/**
 * setup register apple objects
 */
setup_pixi_register: function setup_pixi_register()
{
    let parameter_set = app.session.parameter_set;
    let register_container = new PIXI.Container();
    let wholesaler_pad_container = new PIXI.Container();
    let retailer_pad_container = new PIXI.Container();
    let world_state = app.session.world_state;

    register_container.zIndex = 1;
    wholesaler_pad_container.zIndex = 1;
    retailer_pad_container.zIndex = 1;

    let location = parameter_set.register_location.split(",");

    //register container
    register_container.position.set(location[0], location[1]);

    //add graphic
    let graphic = new PIXI.Sprite(app.pixi_textures['cash_register_tex']);
    graphic.anchor.set(0.5);
    graphic.scale.set(0.7);
    
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
   
    register_container.addChild(graphic);
    register_container.addChild(label);
    // register_container.addChild(label2);
    register_container.addChild(double_click_graphic);

    label.position.set(0, register_container.height/2 + label.height/2 + 5);
    label2.position.set(0, -register_container.height/2 - label2.height/2 +10);
    double_click_graphic.position.set(-graphic.width/2+30, -graphic.height/2);

    register_container.eventMode = 'static';
    register_container.on("pointertap", app.register_double_click);

    //add wholesaler pad
    let wholesaler_outline_dash = new PIXI.Graphics();
    let check_mark_wholesaler_sprite = new PIXI.Sprite(app.pixi_textures['check_mark_tex']);
    let x_mark_wholesaler_sprite = new PIXI.Sprite(app.pixi_textures['x_mark_tex']);

    let wholesaler_outline_fill_color = 0xFFFFFF;
    if(world_state.session_players_order && world_state.session_players_order.length > 0)
    {
        wholesaler_outline_fill_color = app.get_parameter_set_player_from_player_id(world_state.session_players_order[0]).hex_color;
    }
    wholesaler_outline_dash.rect(0, 0, 400, 300);
    wholesaler_outline_dash.fill({color:wholesaler_outline_fill_color, alpha:0.25});

    let matrix_2 = new PIXI.Matrix(1,0,0,1,0,0);
    matrix_2.rotate(1.5708);
    wholesaler_outline_dash.stroke({width:10,
                            texture:app.pixi_textures['dash_tex'],
                            alpha:0.5,
                            alignment:1,
                            color:0x000000,
                            matrix:matrix_2});


    x_mark_wholesaler_sprite.position.set(parseInt(wholesaler_outline_dash.width) - parseInt(x_mark_wholesaler_sprite.width) - 10, 10);
    check_mark_wholesaler_sprite.position.set(parseInt(wholesaler_outline_dash.width) - parseInt(check_mark_wholesaler_sprite.width) - 10, 10);

    wholesaler_pad_container.addChild(wholesaler_outline_dash);
    wholesaler_pad_container.addChild(check_mark_wholesaler_sprite);
    wholesaler_pad_container.addChild(x_mark_wholesaler_sprite);

    wholesaler_pad_container.position.set(register_container.x - wholesaler_pad_container.width - register_container.width/2 - 30,
                                          register_container.y - wholesaler_pad_container.height/2);

    //add retailer pad
    let retailer_outline_dash = new PIXI.Graphics();
    let check_mark_retailer_sprite = new PIXI.Sprite(app.pixi_textures['check_mark_tex']);
    let x_mark_retailer_sprite = new PIXI.Sprite(app.pixi_textures['x_mark_tex']);

    retailer_outline_dash.rect(0, 0, 400, 300);
    let retailer_outline_fill_color = 0xFFFFFF;
    if(world_state.session_players_order && world_state.session_players_order.length > 1)
    {
        retailer_outline_fill_color = app.get_parameter_set_player_from_player_id(world_state.session_players_order[1]).hex_color;
    }
    retailer_outline_dash.fill({color:retailer_outline_fill_color, alpha:0.5});
    retailer_outline_dash.anchor = 0.5;

    let matrix_3 = new PIXI.Matrix(1,0,0,1,0,0);
    matrix_3.rotate(1.5708);
    retailer_outline_dash.stroke({width:10,
                            texture:app.pixi_textures['dash_tex'],
                            alpha:0.5,
                            alignment:1,
                            color:0x000000,
                            matrix:matrix_3});

    retailer_pad_container.addChild(retailer_outline_dash);
    retailer_pad_container.addChild(check_mark_retailer_sprite);
    retailer_pad_container.addChild(x_mark_retailer_sprite);

    x_mark_retailer_sprite.position.set(10,10);
    check_mark_retailer_sprite.position.set(10,10);
    retailer_pad_container.position.set(parseInt(register_container.x) + parseInt(register_container.width)/2 + 30,
                                        register_container.y - retailer_pad_container.height/2);

    

    //build pixi json
    pixi_register = {register_container:null,
                     wholesaler_pad_container:null,
                     retailer_pad_container:null,
                     label:null,
                     check_mark_wholesaler_sprite:null,
                     x_mark_wholesaler_sprite:null,
                     check_mark_retailer_sprite:null,
                     x_mark_retailer_sprite:null,
                     last_click:null,
    }

    pixi_register.register_container = register_container;
    pixi_register.wholesaler_pad_container = wholesaler_pad_container;
    pixi_register.retailer_pad_container = retailer_pad_container;
    pixi_register.check_mark_wholesaler_sprite = check_mark_wholesaler_sprite;
    pixi_register.x_mark_wholesaler_sprite = x_mark_wholesaler_sprite;
    pixi_register.check_mark_retailer_sprite = check_mark_retailer_sprite;
    pixi_register.x_mark_retailer_sprite = x_mark_retailer_sprite;
    pixi_register.label = label;

    pixi_container_main.addChild(pixi_register.register_container);
    pixi_container_main.addChild(pixi_register.wholesaler_pad_container);
    pixi_container_main.addChild(pixi_register.retailer_pad_container);

},

/**
 * update register labels with the prices from the parameter set
 */
update_register_labels: function update_register_labels()
{
    let parameter_set_period = app.get_current_parameter_set_period();
    let world_state = app.session.world_state;

    if(world_state.session_players_order && world_state.session_players_order.length > 1)
    {
        let retailer_player_id = world_state.session_players_order[1];
        let retailer_player = world_state.session_players[retailer_player_id];
        let total_apples = retailer_player.apples;
        let total_oranges = retailer_player.oranges;
        
        let total_cost = parameter_set_period.wholesale_apple_price * total_apples + parameter_set_period.wholesale_orange_price * total_oranges;
        pixi_register.label.text = "Total: " + total_cost + "¢";
    }
},

register_double_click: function register_double_click()
{
    if(app.pixi_mode != "subject") return;
    if(app.working) return;
    if(!app.session.started) return;

    let now = Date.now();

    if(pixi_register.last_click && (now - pixi_register.last_click) < 400)
    {
        pixi_register.last_click = null;

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
            app.add_text_emitters("Error: Wholesaler not in pad", 
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
            app.add_text_emitters("Error: Retailer not in pad", 
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
        pixi_register.last_click = now;
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

    let source_location={x:0, y:0};
    let source_tex = null;

    if(data.fruit_type == "apple")
    {
        let location = app.session.parameter_set.register_location.split(",");
        source_location.x = parseInt(location[0]);
        source_location.y = parseInt(location[1]);
        source_tex = app.pixi_textures['apple_tex'];
    }
    else if(data.fruit_type == "orange")
    {
        let location = app.session.parameter_set.register_orange_location.split(",");
        source_location.x = parseInt(location[0]);
        source_location.y = parseInt(location[1]);
        source_tex = app.pixi_textures['orange_tex'];
    }
    
    let elements = [];
    let element = {source_change: "",
                   target_change: "+", 
                   texture:source_tex,
                }
    elements.push(element);
    app.add_transfer_beam(source_location, 
                          session_player.current_location,
                          elements,
                          false,
                          true);

    session_player.apples = data.apples;
    session_player.oranges = data.oranges;
    world_state.apple_register_inventory = data.apple_register_inventory;
    world_state.orange_register_inventory = data.orange_register_inventory;
    
    app.update_player_inventory();
    app.update_register_labels();
},

/**
 * check if point is in wholesaler pad
 */
is_in_wholesaler_pad: function is_in_wholesaler_pad(point)
{
    return app.check_point_in_rectagle(point, 
                {x:pixi_register.wholesaler_pad_container.x,
                 y:pixi_register.wholesaler_pad_container.y,
                 width:pixi_register.wholesaler_pad_container.width,
                 height:pixi_register.wholesaler_pad_container.height});
},

/**
 *  check if point is in retailer pad
 */
is_in_retailer_pad: function is_in_retailer_pad(point)
{
    return app.check_point_in_rectagle(point, 
                {x:pixi_register.retailer_pad_container.x,
                 y:pixi_register.retailer_pad_container.y,
                 width:pixi_register.retailer_pad_container.width,
                 height:pixi_register.retailer_pad_container.height});
},

/**
 * update check and x marks on wholesaler and retailer pads if player is in them
 */
update_check_marks: function update_check_marks()
{
    if(!app.session.started) return;

    let wholesaler_position = {x:0, y:0};
    let retailer_position = {x:0, y:0};
    let world_state = app.session.world_state;

    if(world_state.session_players_order.length > 0)
    {
        wholesaler_position = world_state.session_players[world_state.session_players_order[0]].current_location;
    }

    if(world_state.session_players_order.length > 1)
    {
        retailer_position = world_state.session_players[world_state.session_players_order[1]].current_location;
    }

    if(app.is_in_wholesaler_pad(wholesaler_position))
    {
        pixi_register.check_mark_wholesaler_sprite.visible = true;
        pixi_register.x_mark_wholesaler_sprite.visible = false;
    }
    else
    {
        pixi_register.check_mark_wholesaler_sprite.visible = false;
        pixi_register.x_mark_wholesaler_sprite.visible = true;
    }

    if(app.is_in_retailer_pad(retailer_position))
    {
        pixi_register.check_mark_retailer_sprite.visible = true;
        pixi_register.x_mark_retailer_sprite.visible = false;
    }
    else
    {
        pixi_register.check_mark_retailer_sprite.visible = false;
        pixi_register.x_mark_retailer_sprite.visible = true;
    }
},
