/* --------
    FUNCTIONS
   -------- */

/* cel: Create ELement
*/
function Cel(options) {
  var generic_options = {
    type: "div",
    id: "",
    classes: [],
    attrs: {},
    innerHTML: "",
    children: []
  };
  var type =    options.type ?
                  options.type : generic_options.type,
      id =      options.id ?
                  options.id : generic_options.id,
      classes = options.classes ?
                  options.classes : generic_options.classes,
      attrs = options.attrs ?
                  options.attrs : generic_options.attrs,
      innerHTML = options.innerHTML ?
                  options.innerHTML : generic_options.innerHTML,
      children = options.children ?
                  options.children : generic_options.children;

  return function(){
    //Create element of type
    var el = document.createElement(type);

    //Assign the element's id
    el.id = id;

    //Assign the element's classes
    for (var i = 0, l = classes.length; i < l; i++) {
      el.classList.add(classes[i]);
    }
    //Set the element's attributes
    for (var key in attrs) {
      el.setAttribute(key, attrs[key]);
    }
    //Assign the element's contents
    el.innerHTML = innerHTML;
    //Append any children specified to the element
    for (var i = 0, l = children.length; i < l; i++) {
      el.appendChild(children[i]);
    }

    return el;
  }();
}

function addToContainer(el, container) {
  container.appendChild(el);
}
function addToDocument(el) {
  addToContainer(el, document.body);
}
