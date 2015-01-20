"use strict";

function Member() {
    this.X = 0;
    this.Y = 0;
    this.children = [];
    this.updateable = true; //aka visible or drawable (this doesn't affect updateability of children)
}
Member.method('update', function () {
    var i,
        submember;
    //Default update method
    //Calls update on self and all updateable children
    this.update();
    for (i = 0; i < this.children; i += 1) {
        submember = this.children[i];
        if (submember.updateable) {
            submember.update();
        }
    }
});
//Descends into the children recursively, checking to see if the child is anywhere inside it
Member.method('hasChild', function (member) {
    var i,
        submember;
    //Search this member's children
    if (this.children.contains(member)) {
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
    if (typeof (member) !== typeof (Member)) {
        throw 'Error here!';
    }
    //Only add child if it is not already a child of this member
    if (!this.hasChild(member)) {
        this.children.push(member);
    }
});
function Scene() {
    this.inherits(Member);
}
//Defining of the library
function Game(options) {
    var i;
    this.inherits(Member);
    
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
    return this;
});
Game.method('getScenes', function () {
    return this.children.filterByType(Scene);
});

function Scene() {
    this.inherits(Member);
}
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
    game.addScene(new Scene());
    console.log(game.getScenes());
    alert("hi");
}