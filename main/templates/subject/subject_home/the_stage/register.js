/**
 * setup register apple objects
 */
setup_pixi_register: function setup_pixi_register()
{
    let parameter_set = app.session.parameter_set;
    let register_container = new PIXI.Container();
    register_container.zIndex = 1;

    let location = parameter_set.register_location.split(",");

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

    //add double click graphic bottom left corner of container
    // let double_click_graphic = new PIXI.Sprite(app.pixi_textures['double_click_tex']);
    // double_click_graphic.anchor.set(0.5);
   
    register_container.addChild(graphic);
    register_container.addChild(label);
    // register_container.addChild(double_click_graphic);

    label.position.set(0, register_container.height/2 + label.height/2 + 5);
    // double_click_graphic.position.set(label.x + label.width/2 + double_click_graphic.width/2 + 10, label.y- double_click_graphic.height/2+10);

    //add apples in random positions on the tree

    register_container.zIndex = 1;
    register_container.eventMode = 'static';
    register_container.on("pointertap", app.register_double_click);

    pixi_register = {container:null,
                     label:null,
                     last_click:null,
                     rect:null};

    pixi_register.container = register_container;
    pixi_register.label = label;
    pixi_register.rect = {x:location[0], y:location[1], width:app.pixi_textures['cash_register_tex'].width, height:app.pixi_textures['cash_register_tex'].height};

    pixi_container_main.addChild(pixi_register.container);

},

/**
 * update register labels with the prices from the parameter set
 */
update_register_labels: function update_register_labels()
{
    let parameter_set_period = app.get_current_parameter_set_period();
    let world_state = app.session.world_state;

    if(!parameter_set_period) return;

    pixi_register.label.text = "Buy: " + parameter_set_period.register_price + "¢ / Apple";
    pixi_register_orange.label.text = "Buy: " + parameter_set_period.register_orange_price + "¢ / Orange";

    //hide fruit if it has been harvested
    for(let i=0; i<pixi_register.apples.length; i++)
    {
        if(i < world_state.apple_register_inventory)
        {
            pixi_register.apples[i].visible = true;
        }
        else
        {
            pixi_register.apples[i].visible = false;
        }
    }

    for(let i=0; i<pixi_register_orange.oranges.length; i++)
    {
        if(i < world_state.orange_register_inventory)
        {
            pixi_register_orange.oranges[i].visible = true;
        }
        else
        {
            pixi_register_orange.oranges[i].visible = false;
        }
    }
},

register_double_click: function register_double_click()
{
    if(app.pixi_mode != "subject") return;
    if(app.working) return;

    let now = Date.now();

    if(pixi_register.last_click && (now - pixi_register.last_click) < 400)
    {
        app.working = true;
        app.send_message("harvest_fruit",
                        {"fruit_type" : "apple", },
                        "group");

        pixi_register.last_click = null;
    }
    else
    {
        pixi_register.last_click = now;
    }
},

take_update_register: function take_update_register(data)
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

