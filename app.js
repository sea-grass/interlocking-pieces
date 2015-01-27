(function () {
    "use strict";
    /*global console*/
    /*global Cel*/
    /*global Game, Scene, Sprite*/
    
	var app = {
		about: (function (s) {
			var aboutText = [

			],
                i;
			for (i = 0; i < aboutText.length; i += 1) {
				s += aboutText[i];
			}
			return s;
		}("")),
		width: 16 * 200,
		height: 9 * 200,
		scale: 200
	};

	//Add stylesheet
	app.stylesheet = new Cel({
		type: "link",
		attrs: {
			"rel": "stylesheet",
			"href": "fullExhibit.css"
		}
	});
	document.head.appendChild(app.stylesheet);
	//Add exhibit
	app.exhibit = new Cel({
		type: "canvas",
		id: "exhibit",
		attrs: (function () {
			var override;
			override = { width: app.width, height: app.height };
			return override || {
				width: window.innerWidth + "px",
				height: window.innerHeight + "px"
			};
		}())
	});
	document.body.appendChild(app.exhibit);
	//Add description
	app.description = new Cel({
		type: "div",
		id: "description",
		innerHTML: app.about
	});
	document.body.appendChild(app.description);

    //Creation of the game
    //loadGame that will be called once the target canvas element is ready
    function loadGame(target, width, height) {
        if (!target) {
        //Missing target element
            throw {
                name: "NumArguments",
                message: "Error! Missing the target canvas element"
            };
        }
        //Variable declarations
        var game, scene, assets, loop, hook;
        //Greate a game
        game = new Game({
            canvas: target,
            dimensions: {
                "x": width,
                "y": height
            }
        });
        //Add a main scene
        game.addScene(new Scene());
        //Get the scene from the game
        scene = game.getScenes()[0];
        //Define game image assets
        assets = {
            "loop": "loop.png",
            "hook": "hook.png",
            "bartSkating": "bart-skater.png"
        };
        //Create the hook 'n' loop game
        //Create a loop
        loop = new Sprite(assets.loop);
        scene.addSprite(loop, scene.X / 2, scene.Y - loop.height);
        //Create a hook
        hook = new Sprite(assets.hook);
        hook.checkHook = function () {
            console.log("Checking if the hook has been hooked!");
        };
        hook.controllable = true;
        hook.controlUpdate = function () {
            var dd = 3;
            this.y += dd;
            while (this.keyEvents.length > 1) {
                var keyPressed = this.keyEvents.reverse().pop();
                this.keyEvents.reverse();   //Removed the first element
                if (keyPressed === Game.Keys.LEFT) {
                    this.x -= dd;
                }
                else if (keyPressed === Game.Keys.RIGHT) {
                    this.y += dd;
                }
                else if (keyPressed === Game.Keys.SPACE) {
                    this.hooked = true;
                    this.checkHook();
                }
            }
        };
        document.body.addEventListener("keydown", function(e) {
            hook.keyEvents.push(e.keyCode);
        });
        scene.addSprite(hook, scene.X / 2, 0);

        game.init().startUpdateLoop();
        console.log(scene);
    }
	loadGame(app.exhibit, app.width, app.height);
}());
