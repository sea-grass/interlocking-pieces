import { createCanvas, Game, Player, Scene, Sprite, World } from './game-engine.js';
import { h, patch, text } from 'https://unpkg.com/superfine';
main();

async function main() {
    const
        width = 320,
        height = 480,
        canvas = createCanvas({ width, height }),
        game = new Game({ canvas, container: document.getElementById("game") }),
        scene = new Scene();

    game.addScene(scene);

    game.addAssets({
        "hook": {
            "type": "image",
            "src": "assets/hook.png"
        },
        "loop": {
            "type": "image",
            "src": "assets/loop.png"
        }
    }, function () {
        const
            player = new Player({
                img: game.assets.hook
            }),
            goal = new Sprite({
                img: game.assets.loop
            });

        player.rightAbove = function (object) {
            if (this.x === object.x)
                if (this.y + 1 === object.y)
                    return true;
            return false;
        };

        scene.addWorld(new World(8, 12, [player, goal]));
        game.init = function () {
            const world = this.getScenes()[0].getWorlds()[0];

            const ctx = this.ctx;
            ctx.fillStyle = "#aaa";
            world.draw();
            return this;
        }

        game.init().startUpdateLoop();

        window.setInterval(e => {
            player.move("down");
        }, 1000);

        game.addEventListener("keydown", e => {
            const Keys = Game.Keys;

            switch (e.keyCode) {
                case Keys.UP:
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
                    const hooked = player.rightAbove(goal);
                    setScoreboardState({ hooked })
            }
        })
    });
}

function setScoreboardState(state) {
    let msg = text("");
    if (state.hooked != undefined)
        if (state.hooked)
            msg = text("Hooked!")
        else
            msg = text("Try again")
    return patch(
        document.getElementById("scoreboard"),
        h("div", { id: "scoreboard" }, [
            msg
        ])
    )
}