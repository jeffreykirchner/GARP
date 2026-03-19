/**
 * add container the opens when the Resller is given the final choice 
 */
setup_final_choice: function setup_final_choice()
{

    let location = app.session.parameter_set.orange_tray_location.split(",");
    let world_state = app.session.world_state;

    let final_choice_container = new PIXI.Container();
    let width = 600;
    let height = 250;

    final_choice_container.zIndex = 2;

    //background for the text
    let text_bg = new PIXI.Graphics();
    text_bg.roundRect(0, 0, width, height, 10);
    text_bg.fill({color: 0xFFFFFF});
    text_bg.stroke({width: 1, color: 0x000000});

    //question text
    let pixi_text = new PIXI.HTMLText({text: "",
                                    style: {fontFamily: 'Arial',
                                            fontSize: 20,
                                            align : 'justify',
                                            wordWrap: true,      // Enable word wrapping
                                            wordWrapWidth: width-20,  // Set the maximum width for the text
                            }});

    pixi_text.x = 10;
    pixi_text.y = 10;

    //yes button
    let yes_button = new PIXI.Container();
    let yes_button_bg = new PIXI.Graphics();
    yes_button_bg.roundRect(0, 0, 100, 50, 10);
    yes_button_bg.fill({color: 'LightGreen'});
    yes_button_bg.stroke({width: 1, color: 0x000000});

    let yes_button_text = new PIXI.Text({text:"Yes",
                                         style: {fontFamily: 'Arial', 
                                                 fontSize: 20}});
    yes_button_text.anchor.set(0.5);
    yes_button_text.x = 50;
    yes_button_text.y = 25;

    yes_button.alpha = 0.75;

    yes_button.addChild(yes_button_bg);
    yes_button.addChild(yes_button_text);

    yes_button.eventMode = 'static';
    yes_button.on("pointerover", app.final_choice_yes_over);
    yes_button.on("pointerout", app.final_choice_yes_out);
    yes_button.on("pointerdown", app.final_choice_yes_click);

    //no button
    let no_button = new PIXI.Container();
    let no_button_bg = new PIXI.Graphics();
    no_button_bg.roundRect(0, 0, 100, 50, 10);
    no_button_bg.fill({color: 'LightCoral'});
    no_button_bg.stroke({width: 1, color: 0x000000});

    let no_button_text = new PIXI.Text({text:"No",
                                        style: {fontFamily: 'Arial', 
                                                fontSize: 20}});
    no_button_text.anchor.set(0.5);
    no_button_text.x = 50;
    no_button_text.y = 25;

    no_button.alpha = 0.75;

    no_button.addChild(no_button_bg);
    no_button.addChild(no_button_text);

    no_button.eventMode = 'static';
    no_button.on("pointerover", app.final_choice_no_over);
    no_button.on("pointerdown", app.final_choice_no_click);
    no_button.on("pointerout", app.final_choice_no_out);

    final_choice_container.addChild(text_bg);
    final_choice_container.addChild(pixi_text);
    final_choice_container.addChild(yes_button);
    final_choice_container.addChild(no_button);

    yes_button.position.set(width/2 - yes_button.width - 10, height - 70);
    no_button.position.set(width/2 + 10, height - 70);

    final_choice_container.position.set(parseInt(app.session.parameter_set.world_width/2) - width/2, 
                                        location[1] - final_choice_container.height - 50);
    
    final_choice = {};

    final_choice.container = final_choice_container;
    final_choice.pixi_text = pixi_text;
    final_choice.yes_button = yes_button;
    final_choice.no_button = no_button;

    pixi_container_main.addChild(final_choice_container);

    app.update_final_choice();
},

/**
 * update the text in the final choice container
 */
update_final_choice: function update_final_choice()
{
    let html_text = "";

    if(app.show_end_game_steal_overlay())
    {
        if(app.show_end_game_steal_part_1())
        {
            html_text = "Reseller,<br>Do you want to know how many pieces of fruit you can take without paying the Wholesaler for them?";
        }
        else
        {
            html_text = "Reseller,<br>"

            if(app.show_end_game_steal_part_2_info())
            {
                html_text += "You can take up to " + app.get_max_fruit() + " pieces of fruit without paying the wholesaler and proceed directly to the buyer.";
                html_text += "<br><br>";
            }

            html_text += "Select which option you would like to do:";
        }
    }
    else if(app.show_end_game_no_price_overlay())
    {
        html_text = "Reseller,<br>Do you want to know what the prices are before paying the Wholesaler for your bundle?";
    }
    else
    {
        final_choice.container.visible = false;
        return;
    }
    
    final_choice.pixi_text.text = html_text;
    final_choice.container.visible = true;

    let reseller = app.get_player_by_type("R");
    if(app.session_player.id != reseller.id || !app.show_end_game_steal_part_1())
    {
        final_choice.yes_button.visible = false;
        final_choice.no_button.visible = false;
    }
    else
    {
        final_choice.yes_button.visible = true;
        final_choice.no_button.visible = true;
    }
},

/** click handler for the yes button in the final choice container
 */
final_choice_yes_click: function final_choice_yes_click()
{
    app.end_game_steal_yes();
    app.update_final_choice();
},

/**
 * pointerover handler for the yes and no buttons in the final choice container
 */
final_choice_yes_over: function final_choice_yes_over()
{
    final_choice.yes_button.alpha = 1;
    app.update_final_choice();
},

/** pointerover handler for the no button in the final choice container
 */
final_choice_no_over: function final_choice_no_over()
{
    final_choice.no_button.alpha = 1;
},

/** click handler for the no button in the final choice container
 */
final_choice_no_click: function final_choice_no_click()
{
    app.end_game_steal_no();
    app.update_final_choice();
},

/** pointerout handler for the yes and no buttons in the final choice container
 */
final_choice_yes_out: function final_choice_yes_out()
{
    final_choice.yes_button.alpha = 0.75;
},

/** pointerout handler for the no button in the final choice container
 */
final_choice_no_out: function final_choice_no_out()
{
    final_choice.no_button.alpha = 0.75;
},
