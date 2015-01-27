(function () {
    "use strict";
    /*global console */
    /*global GameEngine */
    var canvas, width, height,
        game, scene,
        hook, loop;
    width = 320;
    height = 480;
    canvas = new GameEngine.Canvas({ "width": width, "height": height});
    game = new GameEngine.Game({ "canvas": canvas });
    scene = new GameEngine.Scene();
    game.addScene(scene);
    //Define game assets, and add a callback to run when they are loaded
    game.addAssets({
        "hook": {
            "type": "image",
            "src": "hook.png"
        },
        "loop": {
            "type": "image",
            "src": "loop.png"
        }
    }, function () {
        //Create players
        hook = new GameEngine.Sprite({"name": "hook", "img": game.assets.hook});
        loop = new GameEngine.Sprite({"name": "loop", "img": game.assets.loop});
        scene.addSprite(hook);
        scene.addSprite(loop);
        console.log("hey");
        game.init().startUpdateLoop();
    });
}());