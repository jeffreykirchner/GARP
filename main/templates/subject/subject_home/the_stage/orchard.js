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
    let graphic = new PIXI.Graphics();

    graphic.rect(0, 0, app.pixi_textures['orchard_apple_tex'].width, app.pixi_textures['orchard_apple_tex'].height);
    graphic.fill({texture: app.pixi_textures['orchard_apple_tex']});

    //add label that says double click to harvest
    let style = new PIXI.TextStyle({
        fontFamily: "Arial",
        fontSize: 22,
        fill: "white",
        stroke: {color:'#000000', width:3},
        align: 'center',
    });

    let label = new PIXI.Text({text:"$N.NN / Apple", style:style});
    label.anchor.set(0.5);

    //add double click graphic bottom left corner of container
    let double_click_graphic = new PIXI.Graphics();
    double_click_graphic.rect(0, 0, app.pixi_textures['double_click_tex'].width, app.pixi_textures['double_click_tex'].height);
    double_click_graphic.fill({texture: app.pixi_textures['double_click_tex']});
   
    orchard_apple_container.addChild(double_click_graphic);
    orchard_apple_container.addChild(graphic);
    orchard_apple_container.addChild(label);

    label.position.set(app.pixi_textures['orchard_apple_tex'].width/2, app.pixi_textures['orchard_apple_tex'].height + label.height/2 + 5);
    double_click_graphic.position.set(5, orchard_apple_container.height - app.pixi_textures['double_click_tex'].height - 5);

    orchard_apple_container.zIndex = 1;
    orchard_apple_container.eventMode = 'static';
    orchard_apple_container.on("pointertap", app.setup_pixi_orchard_apple_double_click);

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
    let graphic = new PIXI.Graphics();

    graphic.rect(0, 0, app.pixi_textures['orchard_orange_tex'].width, app.pixi_textures['orchard_orange_tex'].height);
    graphic.fill({texture: app.pixi_textures['orchard_orange_tex']});

    //add label that says double click to harvest
    let style = new PIXI.TextStyle({
        fontFamily: "Arial",
        fontSize: 22,
        fill: "white",
        stroke: {color:'#000000', width:3},
        align: 'center',
    });

    let label = new PIXI.Text({text:"$N.NN / Orange", style:style});
    label.anchor.set(0.5);

    //add double click graphic to top bottom right of container
    let double_click_graphic = new PIXI.Graphics();
    double_click_graphic.rect(0, 0, app.pixi_textures['double_click_tex'].width, app.pixi_textures['double_click_tex'].height);
    double_click_graphic.fill({texture: app.pixi_textures['double_click_tex']});

    orchard_orange_container.addChild(double_click_graphic);
    orchard_orange_container.addChild(graphic);
    orchard_orange_container.addChild(label);

    label.position.set(app.pixi_textures['orchard_orange_tex'].width/2, app.pixi_textures['orchard_orange_tex'].height + label.height/2 + 5);
    double_click_graphic.position.set(orchard_orange_container.width - app.pixi_textures['double_click_tex'].width - 5, orchard_orange_container.height - app.pixi_textures['double_click_tex'].height - 5);

    orchard_orange_container.zIndex = 1;
    orchard_orange_container.eventMode = 'static';
    orchard_orange_container.on("pointertap", app.setup_pixi_orchard_orange_double_click);

    pixi_orchard_orange = {container:null,
                          label:null,
                          last_click:null,
                          rect:null};

    pixi_orchard_orange.container = orchard_orange_container;
    pixi_orchard_orange.label = label;
    pixi_orchard_orange.rect = {x:location[0], y:location[1], width:app.pixi_textures['orchard_orange_tex'].width, height:app.pixi_textures['orchard_orange_tex'].height};

    pixi_container_main.addChild(pixi_orchard_orange.container);

},

setup_pixi_orchard_apple_double_click: function setup_pixi_orchard_apple_double_click()
{
    if(app.pixi_mode != "subject") return;

    let now = Date.now();

    if(pixi_orchard_apple.last_click && (now - pixi_orchard_apple.last_click) < 400)
    {        
            console.log("harvest apple");

        pixi_orchard_apple.last_click = null;
    }
    else
    {
        pixi_orchard_apple.last_click = now;
    }
},

setup_pixi_orchard_orange_double_click: function setup_pixi_orchard_orange_double_click()
{
    if(app.pixi_mode != "subject") return;

    let now = Date.now();

    if(pixi_orchard_orange.last_click && (now - pixi_orchard_orange.last_click) < 400)
    {        
            console.log("harvest orange");

        pixi_orchard_orange.last_click = null;
    }
    else
    {
        pixi_orchard_orange.last_click = now;
    }
},

