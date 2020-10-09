/* game-engine.js */
import { filterByType, contains } from './helpers.js';

class Member {
    constructor() {
        this.X = 0;
        this.Y = 0;
        this.parent = null;
        this.children = [];
        this.updateable = true; //aka visible or drawable (this doesn't affect updateability of children)
        this.controllable = false; //Will be checked in this.update
        this.FPS = 60;
        this.keyEvents = [];

        this.loop = this.loop.bind(this);
        let t = Member.time()

        // hooks for child instances
        this.unregisteredHooks = new Map();
    }

    static time() {
        return new Date().getTime();
    }

    /* hooks */
    handleEvents() { this.printHookMessage("handleEvents"); }
    update() { this.printHookMessage("update"); }
    render() { this.printHookMessage("render"); }

    printHookMessage(name) {
        if (this.unregisteredHooks.get(name)) return;
        console.log("NEED TO OVERRIDE THE " + name + " METHOD FOR ME! (" + this.constructor.name + ")");
        this.unregisteredHooks.set(name, true);
    }
    
    loop() {
        // Provide escape hatch to stop the event loop
        if (!this.inLoop) return;

        const newTime = Member.time();
        const deltaTime = this.t - newTime;
        this.t = newTime;

        this._handleEvents(newTime, deltaTime);
        this._update(newTime, deltaTime);
        this._render(newTime, deltaTime);
        
        window.setTimeout(() => requestAnimationFrame(this.loop), 1000 / this.FPS);
    }

    _handleEvents(t, dt) {
        this.handleEvents(t, dt);

        this.children.forEach(submember => {
            submember._handleEvents(t, dt);
        });
    }

    _update(t, dt) {
        if (this.controllable) {
            this.controlUpdate();
        }

        this.update(t, dt);

        this.children.forEach(submember => {
            if (submember.updateable) {
                submember._update();
            }
        })
    }

    _render(t, dt) {
        if (!this.initialized) {
            this.init();
        } else {
            this.render(t, dt);

            this.children.forEach(submember => {
                submember._render(t, dt);
            })
        }
    }

    startUpdateLoop() {
        this.inLoop = true;
        this.loop();
    }

    init() {
        this.initialized = true;
        //Child classes will override this method
        return this;
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
        if (!(member instanceof Member)) {
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
    static CustomEvents = [
        "tick"
    ];

    /**
     * 
     * @param {{
     * canvas: HTMLCanvasElement,
     * scenes: Scene[],
     * container: HTMLElement
     * }} options 
     */
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

    update(d, dt) {
        // Clear the canvas before drawing
        this.ctx.clearRect(0, 0, this.X, this.Y);
    }

    /**
     * 
     * @param {Scene} scene 
     */
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

    /**
     * @returns {Scene[]} scenes
     */
    getScenes() {
        return filterByType(this.children, Scene);
    }

    /**
     * @returns {Player[]} players
     */
    getPlayers() {
        var scenes, players,
            i;
        //Start with empty array
        players = [];
        //Get all scenes
        scenes = this.getScenes();
        for (i = 0; i < scenes.length; i += 1) {
            players = [...players, ...scenes[i].getPlayers()];
        }
        return players;
    }

    async addAssets(assets, callback) {
        Promise.all(Object.keys(assets).map((assetName) => new Promise((resolve, reject) => {
            const asset = assets[assetName];
            console.log("Loading asset name ", assetName, asset)
            if (asset.type === "image") {
                const image = new Image();
                image.src = asset.src;
                image.onload = () => resolve();
                image.onerror= () => reject(new Error("Could not load image asset with src " + asset.src));
                this.assets[assetName] = image;
            }
            else {
                console.log("No preloading necessary for asset type " + asset.type);
                resolve();
            }
        })))
        .catch(err => {
            console.error("Error in Game.addAssets: ", err);
        })
        .finally(() => callback && callback());
    }

    addEventListener(event, listener) {
        if (Game.CustomEvents.indexOf(event)>=0) {
            console.log("TODO add custom event listeners for " + event)
            //this.on(event, listener);
        } else {
            this.element.addEventListener(event, listener);
        }
        return this;
    }

    removeEventListener(event, listener) {
        if (Game.CustomEvents.indexOf(event)>=0) {
            console.log("TODO add custom event listeners for " + event)
            //this.off(event, listener);
        } else {
            this.element.removeEventListener(event, listener);
        }
        return this;
    }
}

class Scene extends Member {
    constructor() {
        super();
    }

    addWorld(world) {
        this.addChild(world);
        if (this.hasChild(world)) {
            world.scene = this;
            world.ctx = this.ctx;
            world.unitX = this.canvas.width / world.width;
            world.unitY = this.canvas.height / world.height;
        }
        return this;
    }

    /**
     * @returns {World[]} worlds
     */
    getWorlds() {
        return filterByType(this.children, World);
    }

    addSprite(sprite, x, y) {
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

    getSprites() {
        return filterByType(this.children, Sprite);
    }

    getPlayers() {
        const worlds = this.getWorlds();
        const players = worlds.flatMap(world => world.getPlayers());
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

    render() {
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

    /**
     * @returns {Sprite[]} sprites
     */
    getSprites
        () {
        return filterByType(this.children, Sprite);
    }

    /**
     * @returns {Player[]} players
     */
    getPlayers() {
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

    init() {
        var ctx;
        ctx = this.ctx || (this.world && this.ctx);
        this.initialized = true;
        if (ctx && this.img) {

            ctx.drawImage(this.img, this.x, this.y, this.width, this.height);
        }
    }
    
    render() {
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