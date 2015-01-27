(function () {
    "use strict";
    //The .method method, to add a method to an object's prototype (chainable) - from JS: The Good Parts
    //This checks to see if the object has its own method,
    //It will override its prototype's method if there is any
    Object.prototype.method = function (name, func) {
        //if (!this.prototype[name]) {
        if (!this.hasOwnProperty(name)) {
            this.prototype[name] = func;
        }
        return this;
    };
    //The .inherits method, to hide the ugliness of inheritance (chainable) - from JS: The Good Parts
    Object.method('inherits', function (Parent) {
        this.prototype = new Parent();
        return this;
    });
    //The .contains method; given a needle, returns the index of it if found, -1 otherwise
    Array.method('contains', function (needle) {
        var i;
        for (i = 0; i < this.length; i += 1) {
            if (this[i] === needle) {
                return i;
            }
        }
        return -1;
    });
    //The .filterByType method; returns an array containing all of the elements of a given type
    Array.method('filterByType', function (Type) {
        var i,
            matches = [];
        if (this.length < 1) {
            return matches;
        }
        for (i = 0; i < this.length; i += 1) {
            if (this[i] instanceof Type) {
                matches.push(this[i]);
            }
        }
        return matches;
    });
    //The .joinArray method; joins the current array with another by appending the array given as an argument to the current one
    Array.method('joinArray', function (arrayB) {
        var i;
        for (i = 0; i < arrayB.length; i += 1) {
            this.push(arrayB[i]);
        }
        return this;
    });
}());
