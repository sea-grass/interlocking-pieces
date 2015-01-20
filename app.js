(function() {
	var app = {
		about: function(s) {
			var aboutText = [

			];
			for (var i = 0; i < aboutText.length; i++) {
				s+= aboutText[i];
			}
			return s;
		}(""),
		width: 16 * 200,
		height: 9 * 200,
		scale: 200
	};
	//loadGame that will be called once the target canvas element is ready
	function loadGame(target) {
		if (!target) {
		//Missing target element
			throw {
				name: "NumArguments",
				message: "Error! Missing the target canvas element"
			};
		}
		console.log("Load game, pass it the canvas!");
		var myGame = new Game({
			canvas: target,
			dimensions: {
				x: app.width,
				y: app.height
			}
		});
	}

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
		attrs: function() {
			var override;
			override = { width: app.width, height: app.height };
			return override || {
				width: window.innerWidth + "px",
				height: window.innerHeight + "px"
			}
		}()
	});
	document.body.appendChild(app.exhibit);
	//Add description
	app.description = new Cel({
		type: "div",
		id: "description",
		innerHTML: app.about
	});
	document.body.appendChild(app.description);

	loadGame(app.exhibit);
}())
