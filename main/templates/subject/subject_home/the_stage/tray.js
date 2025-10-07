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
    let start_x = tray.x + spacer;
    let total_width = tray.width - spacer*2;
    let spacing = total_width / app.session.parameter_set.apple_tray_capacity;
    for (let i = 0; i < app.session.parameter_set.apple_tray_capacity; i++) {
        let apple = new PIXI.Sprite(app.pixi_textures['apple_tex']);
        apple.scale.set(0.5);
        apple.anchor.set(0.5);
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

    pixi_tray_apple.container = tray_apple_container;
    pixi_tray_apple.label_price = label_price;
    pixi_tray_apple.rect = {x:location[0], y:location[1], width:app.pixi_textures['tray_tex'].width, height:app.pixi_textures['tray_tex'].height};

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
    let start_x = tray.x + spacer;
    let total_width = tray.width - spacer*2;
    let spacing = total_width / app.session.parameter_set.orange_tray_capacity;
    for (let i = 0; i < app.session.parameter_set.orange_tray_capacity; i++) {
        let orange = new PIXI.Sprite(app.pixi_textures['orange_tex']);
        orange.scale.set(0.5);
        orange.anchor.set(0.5);
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

    pixi_tray_orange.container = tray_orange_container;
    pixi_tray_orange.label_price = label_price;
    pixi_tray_orange.rect = {x:location[0], y:location[1], width:app.pixi_textures['tray_tex'].width, height:app.pixi_textures['tray_tex'].height};

    pixi_container_main.addChild(pixi_tray_orange.container);
},

/**
 * update tray labels with the prices from the parameter set
 */
update_tray_labels: function update_tray_labels()
{
    let parameter_set_period = app.get_current_parameter_set_period();
    let buy_sell_text = "";

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

    pixi_tray_apple.label_price.text = buy_sell_text + parameter_set_period.wholesale_apple_price + "¢ / Apple";
    pixi_tray_orange.label_price.text = buy_sell_text + parameter_set_period.wholesale_orange_price + "¢ / Orange";
},

tray_apple_double_click: function tray_apple_double_click()
{
    if(app.pixi_mode != "subject") return;
    if(app.working) return;

    let now = Date.now();

    if(pixi_tray_apple.last_click && (now - pixi_tray_apple.last_click) < 400)
    {
        // console.log("double click apple tray");
        app.working = true;
        app.send_message("tray_fruit",
                        {"fruit_type" : "apple", },
                        "group");

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

    let now = Date.now();

    if(pixi_tray_orange.last_click && (now - pixi_tray_orange.last_click) < 400)
    {        
        app.working = true;
        app.send_message("tray_fruit", 
                        {"fruit_type" : "orange", },
                        "group");

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


    if(app.is_subject && session_player_id == app.session_player.id)
    {
        app.working = false;
    }

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
    }
    else
    {
        //retailer move fruit from tray
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
    

    session_player.apples = data.session_player_apples;
    session_player.oranges = data.session_player_oranges;

    world_state.apple_tray_inventory = data.apple_tray_inventory;
    world_state.orange_tray_inventory = data.orange_tray_inventory;
    
    app.update_orchard_labels();    
    app.update_player_inventory();
},

