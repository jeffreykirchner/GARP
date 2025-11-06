/**
 * setup the pixi components for each subject
 */
setup_pixi_subjects: function setup_pixi_subjects(){

    if(!app.session) return;
    if(!app.session.started) return;
    
    let current_z_index = 1000;
    let current_period_id = app.session.session_periods_order[app.session.world_state.current_period-1];
    for(const i in app.session.world_state.session_players)
    {      
        let subject = app.session.world_state.session_players[i];
        let parameter_set_player = app.session.parameter_set.parameter_set_players[app.session.session_players[i].parameter_set_player];
        pixi_avatars[i] = {};

        //avatar
        let avatar_container = new PIXI.Container();
        avatar_container.position.set(subject.current_location.x, subject.current_location.y);
        avatar_container.height = 250;
        avatar_container.width = 250;
        avatar_container.label = {player_id : i};
        avatar_container.zIndex=200;
        // avatar_container.on("pointerup", app.subject_avatar_click);

        let gear_sprite = new PIXI.AnimatedSprite(app.pixi_textures.sprite_sheet.animations['walk']);
        gear_sprite.animationSpeed = app.session.parameter_set.avatar_animation_speed;
        gear_sprite.anchor.set(0.5)
        gear_sprite.tint = parameter_set_player.hex_color;  

        let face_sprite = PIXI.Sprite.from(app.pixi_textures.sprite_sheet_2.textures["face_1.png"]);
        face_sprite.anchor.set(0.5);

        let text_style = {
            fontFamily: 'Arial',
            fontSize: 40,
            fill: {color:'white'},
            align: 'left',
            stroke: {color:'black', width: 3},
        };

        let text_style_2 = {
            fontFamily: 'Arial',
            fontSize: 46,
            fill: 'white',
            // align: 'left',
            stroke: {color:'black', width:3},
        };

        // let id_label = new PIXI.Text({text:parameter_set_player.id_label, 
        //                               style:text_style});
        // id_label.anchor.set(0.5);

        let status_label = new PIXI.Text({text:"Working ... 10", style:text_style});
        status_label.anchor.set(0.5);
        status_label.visible = false;

        //good one
        let good_one_container = new PIXI.Container();
        good_one_container.alpha = 0.75;

        let good_one_label = new PIXI.Text({text:"00", style:text_style_2});
        good_one_label.anchor.set(0, 0.5);

        let good_one_sprite = PIXI.Sprite.from(app.pixi_textures["apple_tex"]);
        good_one_sprite.anchor.set(1, 0.5);
        good_one_sprite.scale.set(0.5);

        good_one_container.addChild(good_one_label);
        good_one_container.addChild(good_one_sprite);
        good_one_label.position.set(+5,0);
        good_one_sprite.position.set(-5,0);

        //good two
        let good_two_container = new PIXI.Container();
        good_two_container.alpha = 0.75;
        let good_two_label = new PIXI.Text({text:"00", style:text_style_2});
        good_two_label.anchor.set(0, 0.5);

        let good_two_sprite = PIXI.Sprite.from(app.pixi_textures["orange_tex"]);
        good_two_sprite.anchor.set(1, 0.5);
        good_two_sprite.scale.set(0.5);

        good_two_container.addChild(good_two_label);
        good_two_container.addChild(good_two_sprite);
        good_two_label.position.set(+5,0);
        good_two_sprite.position.set(-5,0);

        avatar_container.addChild(gear_sprite);
        avatar_container.addChild(face_sprite);
        avatar_container.addChild(good_one_container);
        avatar_container.addChild(good_two_container);
        // avatar_container.addChild(id_label);
        avatar_container.addChild(status_label);
        
        face_sprite.position.set(0, -avatar_container.height * 0.03);
        // id_label.position.set(0, -avatar_container.height * 0.2);
        status_label.position.set(0, -avatar_container.height/2 + 30);
        good_one_container.position.set(-80, -gear_sprite.height/2 - 0);
        good_two_container.position.set(+80, -gear_sprite.height/2 - 0);

        pixi_avatars[i].status_label = status_label;
        pixi_avatars[i].gear_sprite = gear_sprite;

        avatar_container.scale.set(app.session.parameter_set.avatar_scale);

        //bounding box with avatar scaller        
        let bounding_box = new PIXI.Graphics();
    
        bounding_box.rect(0, 0, avatar_container.width * app.session.parameter_set.avatar_bound_box_percent * app.session.parameter_set.avatar_scale, 
                                avatar_container.height * app.session.parameter_set.avatar_bound_box_percent * app.session.parameter_set.avatar_scale);
        bounding_box.stroke(2, "orchid");
        bounding_box.pivot.set(bounding_box.width/2, bounding_box.height/2);
        bounding_box.position.set(0, 0);
        bounding_box.visible = false;

        avatar_container.addChild(bounding_box);
        pixi_avatars[i].bounding_box = bounding_box;

        //bound box view
        let bounding_box_view = new PIXI.Graphics();
    
       
        bounding_box_view.rect(0, 0, avatar_container.width * app.session.parameter_set.avatar_bound_box_percent, 
                                    avatar_container.height * app.session.parameter_set.avatar_bound_box_percent);
        bounding_box_view.stroke(2, "orchid");
        bounding_box_view.pivot.set(bounding_box_view.width/2, bounding_box_view.height/2);
        bounding_box_view.position.set(0, 0);

        avatar_container.addChild(bounding_box_view);
        
        if(!app.draw_bounding_boxes)
        {
            bounding_box_view.visible = false;
        }

        pixi_avatars[i].avatar = {};
        pixi_avatars[i].avatar_container = avatar_container;
        pixi_avatars[i].apples_label = good_one_label;
        pixi_avatars[i].oranges_label = good_two_label;

        pixi_container_main.addChild(pixi_avatars[i].avatar_container);

        //chat
        let chat_container = new PIXI.Container();
        chat_container.position.set(subject.current_location.x, subject.current_location.y);
        //chat_container.visible = true;
        
        let chat_bubble_sprite = PIXI.Sprite.from(app.pixi_textures.sprite_sheet_2.textures["chat_bubble.png"]);
        chat_bubble_sprite.anchor.set(0.5);

        let chat_bubble_text = new PIXI.Text({text:'',style: {
            fontFamily: 'Arial',
            fontSize: 18,
            fill: 0x000000,
            align: 'left',
        }}); 

        chat_container.addChild(chat_bubble_sprite);
        chat_container.addChild(chat_bubble_text);

        chat_bubble_text.position.set(app.session.parameter_set.avatar_scale, -chat_container.height*.085)
        chat_bubble_text.anchor.set(0.5);
        
        pixi_avatars[i].chat = {};
        pixi_avatars[i].chat.container = chat_container;
        pixi_avatars[i].chat.bubble_text = chat_bubble_text;
        pixi_avatars[i].chat.bubble_sprite = chat_bubble_sprite;
        pixi_avatars[i].chat.container.zIndex = current_z_index++;

        subject.show_chat = false;
        subject.chat_time = null;

        pixi_container_main.addChild(pixi_avatars[i].chat.container);

        //interaction range
        let interaction_container = new PIXI.Container();
        interaction_container.position.set(subject.current_location.x, subject.current_location.y);

        let interaction_range = new PIXI.Graphics();
        let interaction_range_radius = app.session.parameter_set.interaction_range;

        interaction_range.circle(0, 0, interaction_range_radius);
        interaction_range.stroke({width:1, color:parameter_set_player.hex_color, alignment:0})
        interaction_range.zIndex = 100;

        interaction_container.addChild(interaction_range);
        pixi_avatars[i].interaction_container = interaction_container;
        pixi_container_main.addChild(pixi_avatars[i].interaction_container);

        if(app.pixi_mode != "subject")
        {
            //view range for server
            let view_container = new PIXI.Container();
            view_container.position.set(subject.current_location.x, subject.current_location.y);

            let view_range = new PIXI.Graphics();
      
            view_range.rect(0, 0, 1850, 800);
            view_range.fill({color:parameter_set_player.hex_color, 
                             alpha:0.1}); 
            view_range.zIndex = 75;
            view_range.pivot.set(1850/2, 800/2);
            view_range.position.set(0, 0);

            view_container.addChild(view_range);
            pixi_avatars[i].view_container = view_container;
            pixi_container_main.addChild(pixi_avatars[i].view_container);
        }

    }

    //make local subject the top layer
    if(app.pixi_mode=="subject")
    {  
        pixi_avatars[app.session_player.id].avatar_container.zIndex = 999;
        pixi_avatars[app.session_player.id].chat.container.zIndex = current_z_index;
    }
},

/**
 * destory pixi subject objects in world state
 */
destroy_setup_pixi_subjects: function destroy_setup_pixi_subjects()
{
    if(!app.session) return;

    for(const i in app.session.world_state.session_players){

        let pixi_objects = pixi_avatars[i];

        if(pixi_objects)
        {
            pixi_container_main.removeChild(pixi_objects.avatar_container);
            pixi_container_main.removeChild(pixi_objects.chat.container);
            pixi_container_main.removeChild(pixi_objects.interaction_container);

            pixi_objects.avatar_container.destroy({children:true, baseTexture:true});
            pixi_objects.chat.container.destroy({children:true, baseTexture:true});
            pixi_objects.interaction_container.destroy({children:true, baseTexture:true});

            if(app.pixi_mode != "subject")
            {
                pixi_container_main.removeChild(pixi_objects.view_container);
                pixi_objects.view_container.destroy({children:true, baseTexture:true});
            }

            if(app.pixi_mode != "subject")
            {
                pixi_objects.view_container.destroy({children:true, baseTexture:true});
            }
        }
    }
},

/**
 * update the inventory of the player
 */
update_player_inventory: function update_player_inventory()
{

    // let period_id = app.session.session_periods_order[app.session.world_state.current_period-1];

    for(const i in app.session.world_state.session_players)
    {
        let session_player = app.session.world_state.session_players[i];
        pixi_avatars[i].apples_label.text = session_player.apples < 10 ? `0${session_player.apples}` : session_player.apples;
        pixi_avatars[i].oranges_label.text = session_player.oranges < 10 ? `0${session_player.oranges}` : session_player.oranges;

    }
},

/**
 * send movement update to server
 */
target_location_update: function target_location_update()
{
    if(app.session.world_state.current_experiment_phase == 'Instructions')
    {
        if(app.session_player.current_instruction == app.instructions.action_page_1)
        {
            if(app.session_player.current_instruction_complete < app.instructions.action_page_1)
            {
                app.session_player.current_instruction_complete=app.instructions.action_page_1;
                app.send_current_instruction_complete();
            }
        }
    }

    app.last_location_update = Date.now();

    let session_player = app.session.world_state.session_players[app.session_player.id];

    app.send_message("target_location_update", 
                    {"target_location" : session_player.target_location, 
                     "current_location" : session_player.current_location},
                     "group");                   
},

/**
 * take update from server about new location target for a player
 */
take_target_location_update: function take_target_location_update(message_data)
{
    if(message_data.value == "success")
    {
        app.session.world_state.session_players[message_data.session_player_id].target_location = message_data.target_location;                 
    } 
    else
    {
        
    }
},

/**
 * move players if target does not equal current location
 */
move_player: function move_player(delta)
{
    if(!app.session.started) return;

    //move players
    for(let i in app.session.world_state.session_players){

        let obj = app.session.world_state.session_players[i];

        let avatar_container = pixi_avatars[i].avatar_container;
        let gear_sprite = pixi_avatars[i].gear_sprite;
        let status_label = pixi_avatars[i].status_label;

        if(obj.target_location.x !=  obj.current_location.x ||
            obj.target_location.y !=  obj.current_location.y )
        {           
            //move player towards target
            if(!obj.frozen)
            {
                app.move_avatar(delta,i);
            }

            //update the sprite locations
            gear_sprite.play();
            avatar_container.position.set(obj.current_location.x, obj.current_location.y);
            if (obj.current_location.x < obj.target_location.x )
            {
                gear_sprite.animationSpeed =  app.session.parameter_set.avatar_animation_speed;
            }
            else
            {
                gear_sprite.animationSpeed = -app.session.parameter_set.avatar_animation_speed;
            }

            //hide chat if longer than 10 seconds and moving
            if(obj.chat_time)
            {
                if(Date.now() - obj.chat_time >= 10000)
                {
                    obj.show_chat = false;
                }
            }
        }
        else
        {
            gear_sprite.stop();
        }


        status_label.visible = false;
        
    }

    //find nearest players
    for(let i in app.session.world_state.session_players)
    {
        let obj1 = app.session.world_state.session_players[i];
        obj1.nearest_player = null;
        obj1.nearest_player_distance = null;

        for(let j in app.session.world_state.session_players)
        {
            let obj2 = app.session.world_state.session_players[j];

            if(i != j)
            {
                let temp_distance = app.get_distance(obj1.current_location, obj2.current_location);

                if(!obj1.nearest_player)
                {
                    obj1.nearest_player = j;
                    obj1.nearest_player_distance = temp_distance;
                }
                else
                {
                   if(temp_distance < obj1.nearest_player_distance)
                   {
                        obj1.nearest_player = j;
                        obj1.nearest_player_distance = temp_distance;
                   }
                }
            }
        }
    }

    //update chat boxes
    for(let i in app.session.world_state.session_players)
    {
        let obj = app.session.world_state.session_players[i];
        let chat_container = pixi_avatars[i].chat.container;
        let chat_bubble_sprite = pixi_avatars[i].chat.bubble_sprite;
        // let avatar_container = obj.pixi.chat_container;
        let offset = {x:chat_container.width*.5, y:chat_container.height*.45};

        if(obj.nearest_player && 
           app.session.world_state.session_players[obj.nearest_player].current_location.x < obj.current_location.x)
        {
            chat_container.position.set(obj.current_location.x + offset.x,
                                        obj.current_location.y - offset.y);
            
            chat_bubble_sprite.scale.x = 1;
        }
        else
        {
            chat_container.position.set(obj.current_location.x - offset.x,
                                        obj.current_location.y - offset.y);

            chat_bubble_sprite.scale.x = -1;
        }

        chat_container.visible = obj.show_chat;
    }   

    for(let i in app.session.world_state.session_players)
    {
        let obj = app.session.world_state.session_players[i];

        //update interaction ranges
        let interaction_container = pixi_avatars[i].interaction_container;
        interaction_container.position.set(obj.current_location.x, obj.current_location.y);

        //update view ranges on staff screen
        if(app.pixi_mode != "subject")
        {
            let view_container = pixi_avatars[i].view_container;
            view_container.position.set(obj.current_location.x, obj.current_location.y);
        }
    }
    
},

set_avatar_visibility: function set_avatar_visibility()
{
    for(const i in app.session.world_state.session_players)
    {
        let session_player = app.session.world_state.session_players[i];
        let parameter_set_player = app.get_parameter_set_player_from_player_id(i);
        let pixi_avatar = pixi_avatars[i];

        let temp_visible = true;

        if(app.current_group != parameter_set_player.parameter_set_group)
        {
            temp_visible = false;
        }

        pixi_avatar.avatar_container.visible = temp_visible;
        pixi_avatar.chat.container.visible = temp_visible;
    }
},
