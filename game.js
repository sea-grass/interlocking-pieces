"use strict";

function Member() {
    this.X = 0;
    this.Y = 0;
    this.parent;
    this.children = [];
    this.updateable = true; //aka visible or drawable (this doesn't affect updateability of children)
    this.FPS = 1;
}
Member.method('updateAll', function () {
    var i,
        submember;
    //Default update method
    //Calls update on self and all updateable children
    this.update();
    for (i = 0; i < this.children.length; i += 1) {
        submember = this.children[i];
        if (submember.updateable) {
            submember.updateAll();
        }
    }
});
Member.method('update', function() {
    if (!this.initialized) {
        this.init();
    } else {
        this.draw();
    }
});
Member.method('startUpdateLoop', function(fps) {
    var that;
    this.updateAll();
    this.inLoop = true;
    var that = this;
    this.intervalID = window.setInterval(function() {
        that.updateAll(); 
    }, 1000 / this.FPS);
});
Member.method('init', function() {
    this.initialized = true;
    //Child classes will override this method
    return this;
});
Member.method('draw', function() {
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
function Scene() {
    this.inherits(Member);
}
//Defining of the library
Game.inherits(Member);
function Game(options) {
    var i;
    
    this.X = options.dimensions.x; //Big X is the width of the application
    this.Y = options.dimensions.y; //Big Y is the height of the application
    
    this.canvas = options.canvas;
    this.ctx = this.canvas.getContext("2d");
    if (options.scenes) {
        for (i = 0; i < options.scenes.length; i += 1) {
            this.children.push(options.scenes[i]);
        }
    }
}
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

Scene.inherits(Member);
function Scene() {
}
Scene.method('addSprite', function(sprite) {
    this.addChild(sprite);
    if (this.hasChild(sprite)) {
        sprite.canvas = this.canvas;
        sprite.ctx = this.ctx;
        sprite.X = this.X;
        sprite.Y = this.Y;
        sprite.x = this.X / 2;
        sprite.y = this.Y / 2;
    }
    return this;
});
Sprite.inherits(Member);
function Sprite(imgSrc) {
    this.img = new Image(imgSrc);
    this.x; //The sprite's x position on the scene
    this.y; //The sprite's y position on the scene
}
Sprite.method('init', function() {
    this.ctx.drawImage(this.img, this.x, this.y);
});
Sprite.method('draw', function() {
    console.log("drawing sprite");
});
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
    var game = new Game({
        canvas: target,
        dimensions: {
            "x": width,
            "y": height
        }
    });
    target.game = game;
    game.addScene(new Scene());
    var scene = game.getScenes()[0]
    var bartSkatingUrl = "bart-skater.png";
    scene.addSprite(new Sprite(bartSkatingUrl));
    game.init().startUpdateLoop();
    console.log(scene);
}
