(function () {
    "use strict";
    //The .method method, to add a method to an object's prototype (chainable) - from JS: The Good Parts
    Object.prototype.method = function (name, func) {
	console.log("hook");
        if (!this.prototype[name]) {
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
            matches = [],
	    instanceOfType = new Type();
        if (this.length < 1) {
            return matches;
        }
        for (i = 0; i < this.length; i += 1) {
            if (typeof (this[i]) === typeof (instanceOfType)) {
                matches.push(this[i]);
            }
        }
        return matches;
    });
}());
