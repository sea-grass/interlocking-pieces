/* --------
    FUNCTIONS
   -------- */

/* Cel: Create ELement
*/
function Cel(options) {
    "use strict";
    var generic_options = {
        type: "div",
        id: "",
        classes: [],
        attrs: {},
        innerHTML: "",
        children: []
    },  type =    options.type || generic_options.type,
        id =      options.id || generic_options.id,
        classes = options.classes || generic_options.classes,
        attrs = options.attrs || generic_options.attrs,
        innerHTML = options.innerHTML || generic_options.innerHTML,
        children = options.children || generic_options.children;

    return (function () {
        var i, l, key,
            el = document.createElement(type);  //Create element of type

        //Assign the element's id
        el.id = id;

        //Assign the element's classes
        for (i = 0, l = classes.length; i < l; i += 1) {
            el.classList.add(classes[i]);
        }
        //Set the element's attributes
        for (key in attrs) {
            if (attrs.hasOwnProperty(key)) {
                el.setAttribute(key, attrs[key]);
            }
        }
        //Assign the element's contents
        el.innerHTML = innerHTML;
        //Append any children specified to the element
        for (i = 0, l = children.length; i < l; i += 1) {
            el.appendChild(children[i]);
        }

        return el;
    }());
}

function addToContainer(el, container) {
    container.appendChild(el);
}
function addToDocument(el) {
    addToContainer(el, document.body);
}
