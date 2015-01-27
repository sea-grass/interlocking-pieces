
var GameEngine = {};
(function () {
    "use strict";
    /*global console */
    var Member, Canvas, Game, Scene, Sprite;
    /* Member */
    Member = GameEngine.Member = function () {
        this.X = 0;
        this.Y = 0;
        this.parent = null;
        this.children = [];
        this.updateable = true; //aka visible or drawable (this doesn't affect updateability of children)
        this.controllable = false; //Will be checked in this.update
        this.FPS = 60;
        this.keyEvents = [];
    };
    Member.method('updateAll', function () {
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
    });
    Member.method('update', function () {
        if (this.controllable) {
            this.controlUpdate();
        }
        if (!this.initialized) {
            this.init();
        } else {
            this.draw();
        }
    });
    Member.method('startUpdateLoop', function (fps) {
        var that;
        this.updateAll();
        this.inLoop = true;
        that = this;
        this.intervalID = window.setInterval(function () {
            that.updateAll();
        }, 1000 / this.FPS);
    });
    Member.method('init', function () {
        this.initialized = true;
        //Child classes will override this method
        return this;
    });
    Member.method('draw', function () {
        //Child classes will override this method
    });
    //Descends into the children recursively, checking to see if the child is anywhere inside it
    Member.method('hasChild', function (member) {
        var i,
            submember;
        //Search this member's children
        if (this.children.contains(member) !== -1) {
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
    });
    Member.method('addChild', function (member) {
        if (typeof (member) !== typeof (new Member())) {
            throw 'Error here!';
        }
        //Only add child if it is not already a child of this member
        if (!this.hasChild(member)) {
            member.parent = this;
            this.children.push(member);
        }
    });
    /* Canvas */
    Canvas = GameEngine.Canvas = function (options) {
        var thisCanvas, container;
        container = options.container || document.body;
        thisCanvas = document.createElement("canvas");
        thisCanvas.width = options.width || 320;
        thisCanvas.height = options.height || 480;
        
        container.appendChild(thisCanvas);
        
        return thisCanvas;
    };
    /* Game */
    Game = GameEngine.Game = function (options) {
        var i;
        
        this.assets = {};

        if (options) {
            if (!options.canvas) {
                throw "Requires canvas";
            }
            this.X = options.canvas.width; //Big X is the width of the application
            this.Y = options.canvas.height; //Big Y is the height of the application

            this.canvas = options.canvas;
            this.canvas.game = this;

            this.ctx = this.canvas.getContext("2d");

            if (options.scenes) {
                for (i = 0; i < options.scenes.length; i += 1) {
                    this.children.push(options.scenes[i]);
                }
            }
        }
    };
    Game.inherits(Member);
    Game.Keys = {
        "LEFT": 37,
        "RIGHT": 39,
        "SPACE": 32

    };
    Game.method('addScene', function (scene) {
        this.addChild(scene);
        if (this.hasChild(scene)) {
            scene.canvas = this.canvas;
            scene.ctx = this.ctx;
            scene.X = this.X;
            scene.Y = this.Y;
        }
        return this;
    });
    Game.method('getScenes', function () {
        return this.children.filterByType(Scene);
    });
    Game.method('addAssets', function (assets, callback) {
        var asset, name, image, assetLoaded;
        assetLoaded = (function (assets) {
            var name, assetsLoaded = {};
            for (name in assets) {
                if (assets.hasOwnProperty(name)) {
                    console.log("adding asset " + name);
                    assetsLoaded[name] = {"loaded": false};
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
    });
    /* Scene */
    Scene = GameEngine.Scene = function () {
    };
    Scene.inherits(Member);
    Scene.method('addSprite', function (sprite, x, y) {
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
    });
    /* Sprite */
    Sprite = GameEngine.Sprite = function (options) {
        var that;
        this.img = new Image();
        this.img = options.img;
        this.name = options.name || "";
        that = this;
        this.img.onload = function (e) {
            that.width = that.img.width;
            that.height = that.img.height;
        };
        
    };
    Sprite.inherits(Member);
    Sprite.method('init', function () {
        this.initialized = true;
        this.ctx.drawImage(this.img, this.x, this.y, this.width, this.height);
    });
    Sprite.method('draw', function () {
        this.init();
    });
}());