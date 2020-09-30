import { filterByType, contains } from './helpers.js';

/* game-engine.js */
class Member {
    constructor() {
        this.X = 0;
        this.Y = 0;
        this.parent = null;
        this.children = [];
        this.updateable = true; //aka visible or drawable (this doesn't affect updateability of children)
        this.controllable = false; //Will be checked in this.update
        this.FPS = 10;
        this.keyEvents = [];
    }
    updateAll() {
        var i,
            submember;
        //Default update method
        //If this is a Game, then clear the canvas before update
        if (this instanceof Game) {
            this.ctx.clearRect(0, 0, this.X, this.Y);
        }
        //Calls update on self and all updateable children
        this.update();

        for (i = 0; i < this.children.length; i += 1) {
            submember = this.children[i];
            if (submember.updateable) {
                submember.updateAll();
            }
        }
    }
    update() {
        if (this.controllable) {
            this.controlUpdate();
        }
        if (!this.initialized) {
            this.init();
        } else {
            this.draw();
        }
    }
    startUpdateLoop() {
        var that;
        this.updateAll();
        this.inLoop = true;
        that = this;
        this.intervalID = window.setInterval(function () {
            that.updateAll();
        }, 1000 / this.FPS);
    }
    init() {
        this.initialized = true;
        //Child classes will override this method
        return this;
    }
    draw() {
        //Child classes will override this method
    }

    //Descends into the children recursively, checking to see if the child is anywhere inside it
    hasChild(member) {
        var i,
            submember;
        //Search this member's children
        if (contains(this.children, member) !== -1) {
            return true;
        }
        //Then search this member's children's children (and their children, and their children, etc...)
        for (i = 0; i < this.children.length; i += 1) {
            submember = this.children[i];
            if (submember.hasChild(member)) {
                return true;
            }
        }
        //If this point is reached, no match has been found
        return false;
    }

    addChild(member) {
        if (typeof (member) !== typeof (new Member())) {
            throw 'Error here!';
        }
        //Only add child if it is not already a child of this member
        if (!this.hasChild(member)) {
            member.parent = this;
            this.children.push(member);
        }
    }
}

function createCanvas(options) {
    var thisCanvas, container;
    container = options.container || document.body;
    thisCanvas = document.createElement("canvas");
    thisCanvas.width = options.width || 320;
    thisCanvas.height = options.height || 480;

    container.appendChild(thisCanvas);

    return thisCanvas;
}

class Game extends Member {
    static Keys = {
        "LEFT": 37,
        "UP": 38,
        "RIGHT": 39,
        "DOWN": 40,
        "SPACE": 32

    };

    constructor(options) {
        super();

        var i;

        this.assets = {};
        this.element = document.createElement("div");
        this.element.style.width = "320px";
        this.element.style.height = "480px";
        this.element.id = options.id || "myGame";
        this.element.setAttribute("tabindex", 0);

        if (options) {
            if (!options.canvas) {
                //Create one
                this.canvas = createCanvas({ "width": 320, "height": 480 });
                this.X = 320;
                this.Y = 480;
            } else {
                this.X = options.canvas.width; //Big X is the width of the application
                this.Y = options.canvas.height; //Big Y is the height of the application

                this.canvas = options.canvas;
            }
            //Add the element to this game's container
            if (this.canvas.parentElement) {
                this.canvas.remove();
            }
            this.element.appendChild(this.canvas);

            this.canvas.game = this;

            this.ctx = this.canvas.getContext("2d");

            if (options.scenes) {
                for (i = 0; i < options.scenes.length; i += 1) {
                    this.children.push(options.scenes[i]);
                }
            }
            //Finally, add the game to the document
            if (options.container) {
                options.container.appendChild(this.element);
            } else {
                document.body.appendChild(this.element);
            }
        }
    }

    addScene(scene) {
        this.addChild(scene);
        if (this.hasChild(scene)) {
            scene.canvas = this.canvas;
            scene.ctx = this.ctx;
            scene.X = this.X;
            scene.Y = this.Y;
        }
        return this;
    }

    getScenes() {
        return filterByType(this.children, Scene);
    }

    getPlayers
        () {
        var scenes, players,
            i;
        //Start with empty array
        players = [];
        //Get all scenes
        scenes = this.getScenes();
        for (i = 0; i < scenes.length; i += 1) {
            players = joinArray(players, scenes[i].getPlayers());
        }
        return players;
    }

    addAssets
        (assets, callback) {
        var asset, name, image, assetLoaded;
        assetLoaded = (function (assets) {
            var name, assetsLoaded = {};
            for (name in assets) {
                if (assets.hasOwnProperty(name)) {
                    console.log("adding asset " + name);
                    assetsLoaded[name] = { "loaded": false };
                }
            }
            return function (assetName) {
                return function (e) {
                    var name;
                    assetsLoaded[assetName].loaded = true;
                    for (name in assetsLoaded) {
                        if (assetsLoaded.hasOwnProperty(name)) {
                            if (assetsLoaded[name].loaded === false) {
                                return;
                            }
                        }
                    }
                    console.log(assetsLoaded);
                    callback();
                };
            };
        }(assets));
        for (name in assets) {
            if (assets.hasOwnProperty(name)) {
                asset = assets[name];
                if (asset.type === "image") {
                    image = new Image();
                    image.src = asset.src;
                    image.onload = assetLoaded(name);
                    this.assets[name] = image;
                }
            }
        }
    }

    addEventListener
        (event, listener) {
        this.element.addEventListener(event, listener);
        return this;
    }
}

class Scene extends Member {
    constructor() {
        super();
    }

    addWorld
        (world) {
        this.addChild(world);
        if (this.hasChild(world)) {
            world.scene = this;
            world.ctx = this.ctx;
            world.unitX = this.canvas.width / world.width;
            world.unitY = this.canvas.height / world.height;
        }
        return this;
    }

    getWorlds
        () {
        return filterByType(this.children, World);
    }
    addSprite
        (sprite, x, y) {
        if (x === undefined) {
            console.log("no x supplied");
            x = this.X / 2;
        }
        if (y === undefined) {
            console.log("no y supplied");
            y = this.Y / 2;
        }
        this.addChild(sprite);
        if (this.hasChild(sprite)) {
            sprite.canvas = this.canvas;
            sprite.ctx = this.ctx;
            sprite.X = this.X;
            sprite.Y = this.Y;
            sprite.x = x;
            sprite.y = y;
        }
        return this;
    }
    getSprites
        () {
        return filterByType(this.children, Sprite);
    }
    getPlayers
        () {
        var i, players, worlds;
        players = [];
        worlds = this.getWorlds();
        for (i = 0; i < worlds.length; i += 1) {
            players = joinArray(players, worlds[i].getPlayers());
        }
        return players;
    }
}

class World extends Member {
    constructor(width, height, objects) {
        super();
        var row, col, name, i, object;
        //Create world array and initialize it to all zeroes
        this.array = [];
        this.width = width;
        this.height = height;
        //Initialize the world with all 0s
        for (row = 0; row < width; row += 1) {
            this.array[row] = [];
            for (col = 0; col < height; col += 1) {
                this.array[row][col] = 0;
            }
        }
        if (objects) {
            //Add each object to the world
            for (i = 0; i < objects.length; i += 1) {
                object = objects[i];
                if (object instanceof Player) {
                    this.addPlayer(object, object.x || 0, object.y || 0);
                } else if (object instanceof Sprite) {
                    this.addSprite(object, object.x || this.width / 2, object.y || this.height - 1);
                }
            }
        }
    }

    draw
        () {
        var ctx, world, x, y, row, col, cell, width, height, unitWidth, unitHeight;

        function drawBackground(ctx, x, y, w, h) {
            ctx.fillStyle = "#eee";
            //ctx.fillRect(x, y, w, h);
        }
        function drawPlayer(ctx, player, x, y, w, h) {
            if (player.img) {
                ctx.drawImage(player.img, x, y, w, h * 2);
            } else {
                ctx.fillStyle = "#4f7";
                ctx.fillRect(x, y, w, h);
            }
        }
        function drawSprite(ctx, sprite, x, y, w, h) {
            if (sprite.img) {
                ctx.drawImage(sprite.img, x, y, w, h);
            } else {
                ctx.fillStyle = "#4f7";
                ctx.fillRect(x, y, w, h);
            }
        }

        x = 0;
        y = 0;
        width = this.unitX;
        height = this.unitY;

        ctx = this.scene.ctx;
        if (ctx) {
            for (row = 0; row < this.width; row += 1) {
                for (col = 0; col < this.height; col += 1) {
                    cell = this.getValue(row, col);
                    ctx.save();
                    if (cell === 0) {
                        drawBackground(ctx, x, y, width, height);
                    } else if (cell === 1) {
                        drawPlayer(ctx, this.getPlayers()[0], x, y, width, height);
                    } else if (cell === 2) {
                        drawSprite(ctx, this.getSprites()[1], x, y, width, height);
                    }
                    ctx.restore();
                    y += height;
                }
                y = 0;
                x += width;
            }
        }
    }

    getWorld
        () {
        return this.array;
    }
    setWorld
        (world) {
        this.array = world;
    }
    getValue
        (x, y) {
        var world = this.getWorld();
        return world[x][y];
    }
    setValue
        (val, x, y) {
        var world = this.getWorld();
        world[x][y] = val;
        this.setWorld(world);
    }

    addPlayer
        (player) {
        this.addChild(player);
        if (this.hasChild(player)) {
            player.world = this;
            player.x = player.x || 0;
            player.y = player.y || 0;
            this.setValue(1, player.x, player.y);
        }
    }
    addSprite
        (sprite, x, y) {
        this.addChild(sprite);
        if (this.hasChild(sprite)) {
            sprite.world = this;
            sprite.x = x;
            sprite.y = y;
            this.setValue(2, sprite.x, sprite.y);
        }
    }
    getSprites
        () {
        return filterByType(this.children, Sprite);
    }
    getPlayers
        () {
        return filterByType(this.children, Player);
    }
}

class Sprite extends Member {
    constructor(options) {
        super();

        if (options) {
            var that;
            this.img = options.img;
            this.name = options.name || "";
            that = this;
            this.img.onload = function (e) {
                that.width = that.img.width;
                that.height = that.img.height;
            };
        }
    }

    init
        () {
        var ctx;
        ctx = this.ctx || (this.world && this.ctx);
        this.initialized = true;
        if (ctx && this.img) {

            ctx.drawImage(this.img, this.x, this.y, this.width, this.height);
        }
    }
    draw
        () {
        this.init();
    }
}

class Player extends Sprite {
    constructor(options) {
        super(options);

        if (options && options.img) {
            this.img = options.img;
        }
        this.x = (options && options.x) || 0;
        this.y = (options && options.y) || 0;
        this.width = (options && options.width) || 1;
        this.height = (options && options.height) || 1;
    }

    move
        (dir) {
        var oldX, oldY, newX, newY, width, height;
        oldX = this.x;
        oldY = this.y;
        newX = oldX;
        newY = oldY;
        width = this.world.width;
        height = this.world.height;
        switch (dir) {
            case "up":
                newY -= 1;
                break;
            case "down":
                newY += 1;
                break;
            case "left":
                newX -= 1;
                break;
            case "right":
                newX += 1;
                break;
        }
        if (newX >= width) {
            newX = 0;
        } else if (newX < 0) {
            newX = newX + width;
        }
        if (newY >= height) {
            newY = 0;
        } else if (newY < 0) {
            newY = height + newY;
        }
        this.world.setValue(0, oldX, oldY);
        this.world.setValue(1, newX, newY);
        this.x = newX;
        this.y = newY;
    }
}


export {
    Member,
    createCanvas as Canvas,
    createCanvas,
    Game,
    Scene,
    World,
    Sprite,
    Player
};