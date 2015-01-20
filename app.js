(function () {
    "use strict";
    
	var app = {
		about: (function (s) {
			var aboutText = [

			],
                i;
			for (i = 0; i < aboutText.length; i += 1) {
				s += aboutText[i];
			}
			return s;
		}("")),
		width: 16 * 200,
		height: 9 * 200,
		scale: 200
	};

	//Add stylesheet
	app.stylesheet = new Cel({
		type: "link",
		attrs: {
			"rel": "stylesheet",
			"href": "fullExhibit.css"
		}
	});
	document.head.appendChild(app.stylesheet);
	//Add exhibit
	app.exhibit = new Cel({
		type: "canvas",
		id: "exhibit",
		attrs: (function () {
			var override;
			override = { width: app.width, height: app.height };
			return override || {
				width: window.innerWidth + "px",
				height: window.innerHeight + "px"
			};
		}())
	});
	document.body.appendChild(app.exhibit);
	//Add description
	app.description = new Cel({
		type: "div",
		id: "description",
		innerHTML: app.about
	});
	document.body.appendChild(app.description);

	loadGame(app.exhibit, app.width, app.height);
}());
