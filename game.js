function Sprite(options) {
	var default_options = {
		w: 100,
		h: 100,
		x: 0,
		y: 0,
		//fill: #current ctx.fillStyle,
		//stroke: #current ctx.strokeStyle
	};
}
/* options = {
	canvas: aCanvasInit,
	dimensions: { x: int, y: int }
} */
function Game(options) {
	var game = {};
	var ctx = game.ctx = options.canvas.getContext("2d");

	var w = ctx.canvas.width, h = ctx.canvas.height,
	    wx = options.dimensions.x, hy = options.dimensions.y;
	console.log(w, h);
	console.log(wx, hy);

	//Draw background
	ctx.fillStyle = "#abc";
	ctx.fillRect(0, 0, w, h);
	//Draw game border
	ctx.fillStyle = "#cba";
	ctx.strokeStyle = "#faa";
	ctx.lineWidth = "10";
	ctx.rect(10, 10, wx - 10, hy - 10);
	ctx.stroke();
	//Draw ground
	ctx.fillStyle = "#444";
	ctx.fillRect(0, hy*9/10, wx, hy);

	return {

	};
}
