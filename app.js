(function() {
	var app = {
		about: function(s) {
			var aboutText = [

			];
			for (var i = 0; i < aboutText.length; i++) {
				s+= aboutText[i];
			}
			return s;
		}("");
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
		attrs: function() {
			return {
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
});
