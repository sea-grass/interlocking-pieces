(function () {
    "use strict";
    /*global console, alert */
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
        var player, goal, scoreboard;
        player = new GameEngine.Player({
            "img": game.assets.hook
        });
        goal = new GameEngine.Sprite({
            "img" : game.assets.loop
        });
        player.rightAbove = function (object) {
            if (this.x === object.x) {
                if (this.y + 1 === object.y) {
                    return true;
                }
            }
            return false;
        };
        scoreboard = document.createElement("div");
        document.body.appendChild(scoreboard);
        scene.addWorld(new GameEngine.World(8, 12, [player, goal]));
        game.init = function () {
            var ctx, world;
            
            world = this.getScenes()[0].getWorlds()[0];
            
            ctx = this.ctx;
            ctx.fillStyle = "#aaa";
            world.draw();
            return this;
        };
        game.init().startUpdateLoop();
        //Make player fall down every second
        window.setInterval(function (e) {
            player.move("down");
        }, 1000);
        
        game.addEventListener("keydown", function (e) {
            var Keys, hooked;
            Keys = GameEngine.Game.Keys;
            switch (e.keyCode) {
            case Keys.UP:
                //player.move("up");
                break;
            case Keys.RIGHT:
                player.move("right");
                break;
            case Keys.DOWN:
                player.move("down");
                break;
            case Keys.LEFT:
                player.move("left");
                break;
            case Keys.SPACE:
                //Check if the hook is hooking the loop
                //In other words, check if the hook is directly over the loop
                //If it is, congratulate the player and move onto next level
                //Otherwise, display error message and move player to 0,0
                hooked = player.rightAbove(goal);
                if (hooked) {
                    scoreboard.innerHTML += "<br/>Hooked!";
                } else {
                    scoreboard.innerHTML += "<br/>Try again";
                }
                break;
            }
        });
    });
}());