/**
 * setup orchard apple objects
 */
setup_pixi_orchard_apple: function setup_pixi_orchard_apple()
{

    let orchard_apple_container = new PIXI.Container();
    orchard_apple_container.zIndex = 1;

    let location = app.session.parameter_set.orchard_apple_location.split(",");

    orchard_apple_container.position.set(location[0], location[1]);

    //add graphic
    let graphic = new PIXI.Sprite(app.pixi_textures['tree_tex']);
    graphic.anchor.set(0.5);
    graphic.scale.set(0.35);
    
    //add label that says double click to harvest
    let style = new PIXI.TextStyle({
        fontFamily: "Arial",
        fontSize: 22,
        fill: "white",
        stroke: {color:'#000000', width:3},
        align: 'center',
    });

    let label = new PIXI.Text({text:"NNN¢ / Apple", style:style});
    label.anchor.set(0.5);

    //add double click graphic bottom left corner of container
    let double_click_graphic = new PIXI.Sprite(app.pixi_textures['double_click_tex']);
    double_click_graphic.anchor.set(0.5);
   
    
    orchard_apple_container.addChild(graphic);
    orchard_apple_container.addChild(label);
    orchard_apple_container.addChild(double_click_graphic);

    label.position.set(0, orchard_apple_container.height/2 + label.height/2 + 5);
    double_click_graphic.position.set(label.x + label.width/2 + double_click_graphic.width/2 + 10, label.y- double_click_graphic.height/2+10);

    orchard_apple_container.zIndex = 1;
    orchard_apple_container.eventMode = 'static';
    orchard_apple_container.on("pointertap", app.orchard_apple_double_click);

    pixi_orchard_apple = {container:null,
                          label:null,
                          last_click:null,
                          rect:null};

    pixi_orchard_apple.container = orchard_apple_container;
    pixi_orchard_apple.label = label;
    pixi_orchard_apple.rect = {x:location[0], y:location[1], width:app.pixi_textures['orchard_apple_tex'].width, height:app.pixi_textures['orchard_apple_tex'].height};

    pixi_container_main.addChild(pixi_orchard_apple.container);

},

/**
 * setup orchard orange objects
 */
setup_pixi_orchard_orange: function setup_pixi_orchard_orange()
{

    let orchard_orange_container = new PIXI.Container();
    orchard_orange_container.zIndex = 1;

    let location = app.session.parameter_set.orchard_orange_location.split(",");

    orchard_orange_container.position.set(location[0], location[1]);

    //add graphic
    let graphic = new PIXI.Sprite(app.pixi_textures['tree_tex']);
    graphic.anchor.set(0.5);
    graphic.scale.set(0.35);

    //add label that says double click to harvest
    let style = new PIXI.TextStyle({
        fontFamily: "Arial",
        fontSize: 22,
        fill: "white",
        stroke: {color:'#000000', width:3},
        align: 'center',
    });

    let label = new PIXI.Text({text:"NNN¢ / Orange", style:style});
    label.anchor.set(0.5);

    //add double click graphic bottom left corner of container
    let double_click_graphic = new PIXI.Sprite(app.pixi_textures['double_click_tex']);
    double_click_graphic.anchor.set(0.5);

    orchard_orange_container.addChild(graphic);
    orchard_orange_container.addChild(label);
    orchard_orange_container.addChild(double_click_graphic);

    label.position.set(0, orchard_orange_container.height/2 + label.height/2 + 5);
    double_click_graphic.position.set(label.x + label.width/2 + double_click_graphic.width/2 + 10, label.y- double_click_graphic.height/2+10);

    orchard_orange_container.zIndex = 1;
    orchard_orange_container.eventMode = 'static';
    orchard_orange_container.on("pointertap", app.orchard_orange_double_click);

    pixi_orchard_orange = {container:null,
                          label:null,
                          last_click:null,
                          rect:null};

    pixi_orchard_orange.container = orchard_orange_container;
    pixi_orchard_orange.label = label;
    pixi_orchard_orange.rect = {x:location[0], y:location[1], width:app.pixi_textures['orchard_orange_tex'].width, height:app.pixi_textures['orchard_orange_tex'].height};

    pixi_container_main.addChild(pixi_orchard_orange.container);

},

/**
 * update orchard labels with the prices from the parameter set
 */
update_orchard_labels: function update_orchard_labels()
{
    let parameter_set_period = app.get_current_parameter_set_period();

    if(!parameter_set_period) return;

    pixi_orchard_apple.label.text = "Buy: " + parameter_set_period.orchard_apple_price + "¢ / Apple";
    pixi_orchard_orange.label.text = "Buy: " + parameter_set_period.orchard_orange_price + "¢ / Orange";
},

orchard_apple_double_click: function orchard_apple_double_click()
{
    if(app.pixi_mode != "subject") return;
    if(app.working) return;

    let now = Date.now();

    if(pixi_orchard_apple.last_click && (now - pixi_orchard_apple.last_click) < 400)
    {
        app.working = true;
        app.send_message("harvest_fruit",
                        {"fruit_type" : "apple", },
                        "group");

        pixi_orchard_apple.last_click = null;
    }
    else
    {
        pixi_orchard_apple.last_click = now;
    }
},

orchard_orange_double_click: function orchard_orange_double_click()
{
    if(app.pixi_mode != "subject") return;
    if(app.working) return;

    let now = Date.now();

    if(pixi_orchard_orange.last_click && (now - pixi_orchard_orange.last_click) < 400)
    {        
        app.working = true;
        app.send_message("harvest_fruit", 
                        {"fruit_type" : "orange", },
                        "group");

        pixi_orchard_orange.last_click = null;
    }
    else
    {
        pixi_orchard_orange.last_click = now;
    }
},

take_update_harvest_fruit: function take_update_harvest_fruit(data)
{
    let session_player_id = data.session_player_id;
    let session_player = app.session.world_state.session_players[session_player_id];


    if(app.is_subject && session_player_id == app.session_player.id)
    {
        app.working = false;
    }

    let source_location={x:0, y:0};
    let source_tex = null;

    if(data.fruit_type == "apple")
    {
        let location = app.session.parameter_set.orchard_apple_location.split(",");
        source_location.x = parseInt(location[0]);
        source_location.y = parseInt(location[1]);
        source_tex = app.pixi_textures['apple_tex'];
    }
    else if(data.fruit_type == "orange")
    {
        let location = app.session.parameter_set.orchard_orange_location.split(",");
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
    
    app.update_player_inventory();
},

