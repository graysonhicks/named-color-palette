window.jQuery = $ = require("jquery");
var $ = require("jquery");
var _ = require("underscore");
var bootstrap = require("bootstrap");
// Required these in by default, feel free to add more.
var tinycolor = require("tinycolor2");
//https://github.com/bgrins/TinyColor
var ntc = require("ntc");
var ColorScheme = require("color-scheme");
var fontColorContrast = require("font-color-contrast");

var spectrumCanvas = document.getElementById("spectrum-canvas");
var spectrumCtx = spectrumCanvas.getContext("2d");
var spectrumCursor = $("#spectrum-cursor");
var spectrumRect = spectrumCanvas.getBoundingClientRect();

var currentColor = "";
var hue = 0;
var saturation = 1;
var lightness = 0.5;

var rgbFields = $("#rgb-fields");
var hexField = $("#hex-field");

var red = $("#red");
var blue = $("#blue");
var green = $("#green");
var hex = $("#hex");
var name = $("#name");
var schemeMode = $("#scheme-mode");
var variationMode = $("#variation-mode");
var exportButton = $("#export-button");
var exportButtons = $(".export-buttons");

function ColorPicker() {
	createShadeSpectrum();
}

function refreshElementRects() {
	spectrumRect = spectrumCanvas.getBoundingClientRect();
}

function createShadeSpectrum(color) {
	canvas = spectrumCanvas;
	ctx = spectrumCtx;
	ctx.clearRect(0, 0, canvas.width, canvas.height);

	if (!color) color = "#f00";

	var gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
	// Create color gradient
	gradient.addColorStop(0, "rgb(255,   0,   0)");
	gradient.addColorStop(0.15, "rgb(255,   0, 255)");
	gradient.addColorStop(0.33, "rgb(0,     0, 255)");
	gradient.addColorStop(0.49, "rgb(0,   255, 255)");
	gradient.addColorStop(0.67, "rgb(0,   255,   0)");
	gradient.addColorStop(0.84, "rgb(255, 255,   0)");
	gradient.addColorStop(1, "rgb(255,   0,   0)");
	// Apply gradient to canvas
	ctx.fillStyle = gradient;
	ctx.fillRect(0, 0, canvas.width, canvas.height);

	// Create semi transparent gradient (white -> trans. -> black)
	gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
	gradient.addColorStop(0, "rgba(255, 255, 255, 1)");
	gradient.addColorStop(0.5, "rgba(255, 255, 255, 0)");
	gradient.addColorStop(0.5, "rgba(0,     0,   0, 0)");
	gradient.addColorStop(1, "rgba(0,     0,   0, 1)");
	// Apply gradient to canvas
	ctx.fillStyle = gradient;
	ctx.fillRect(0, 0, canvas.width, canvas.height);

	canvas.addEventListener("mousedown", function(e) {
		startGetSpectrumColor(e);
	});

	canvas.addEventListener(
		"touchstart",
		function(e) {
			startGetSpectrumColor(e);
		},
		false
	);
}

function colorToHue(color) {
	var color = tinycolor(color);
	var hueString = tinycolor("hsl " + color.toHsl().h + " 1 .5").toHslString();
	return hueString;
}

// this function handles refreshing the canvas / palette when the user changes the inputs instead of the cursor
function colorToPos(color) {
	var color = tinycolor(color);
	var hsl = color.toHsl();
	hue = hsl.h;
	var hsv = color.toHsv();
	var x = spectrumRect.width - hue / 360 * spectrumRect.width;
	var y = spectrumRect.height * (1 - hsl.l);

	return { x: x, y: y };
}

function setColorValues(color) {
	var rgbValues = color.toRgb();
	var hexValue = color.toHex();
	var hueValue = color.toHsl().h;

	//set user inputs at the bottom of the screen
	// RGB
	red.val(rgbValues.r);
	green.val(rgbValues.g);
	blue.val(rgbValues.b);

	// HEX
	hex.val("#" + hexValue);

	// NAME
	// use font-color-contrast to check background-color for whether font should be dark or light
	// this is for the chosen color box at the bottom of the screen
	var fontColorBasedOnBackground = fontColorContrast("#" + hexValue);

	if (fontColorBasedOnBackground == "#000000") {
		fontColorBasedOnBackground = "#364347";
	}

	name
		.val(ntc.name("#" + hexValue)[1])
		.css("color", fontColorBasedOnBackground)
		.css("background-color", "#" + currentColor.toHex());

	// CURSOR
	spectrumCursor.css("background-color", "#" + color.toHex());
}

function generatePalette(hex, schemeMode, variationMode) {
	// the awesome color-scheme-js(https://github.com/c0bra/color-scheme-js) handles the palette generation, but only returns hex codes
	var scheme = new ColorScheme();
	scheme
		.from_hex(hex)
		.scheme(schemeMode.val()) // changes how many colors and color theory behind it
		.variation(variationMode.val()); // adds a variation to the colors chosen by the scheme

	return scheme.colors();
}

function buildColorListBar(colors) {
	var colorsList = $("#colors-list");
	// empty any existing content from the bar
	colorsList.removeClass("justify-content-center align-items-center").empty();

	// loop over each color and build the elements and styles to display them across top of screen with background-color, and their hex and semantic name shown
	for (var i = 0; i < colors.length; i++) {
		// the ntc library http://www.chir.ag/projects/ntc returns a semantic name based on the color
		var ntcColor = ntc.name("#" + colors[i]);

		// col is parent container (bootstrap 4 auto column)
		var col = $("<div/>").addClass("col");

		// block span is what gets palette bg color
		// data attributes set for building data for ajax without having to redo color manipulations
		var block = $("<div/>")
			.addClass("named-color-block")
			.css("background-color", "#" + colors[i])
			.attr("data-code", colors[i])
			.attr("data-name", ntcColor[1]);

		// name of font is gotten with ntc, and color is contrasted based on bg
		var fontColorBasedOnBackground = fontColorContrast("#" + colors[i]);

		if (fontColorBasedOnBackground == "#000000") {
			fontColorBasedOnBackground = "#364347";
		}

		var nameDiv = $("<div/>")
			.html(ntcColor[1])
			.css("color", fontColorBasedOnBackground);

		// hex code is entered and colored based on contrast
		var hexDiv = $("<div/>")
			.addClass("hex-span")
			.css("color", fontColorBasedOnBackground)
			.html("#" + colors[i]);

		// special formatting for palettes on mobile (2x2 grid for mono, 2x4 for contrast, with hex code hidden)

		if ($("#xs-media-query-test").is(":visible")) {
			// remove larger palettes on mobile since too cluttered to fit
			$("#analogic-scheme-option, #tetrade-scheme-option, #triade-scheme-option").remove();
			if (colors.length === 8) {
				col.addClass("col-3");
				nameDiv.css("font-size", ".65rem");
				hexDiv.empty();
			} else {
				col.addClass("col-6");
			}
		}

		// attach name and hex code in block
		block.append(nameDiv);
		block.append(hexDiv);
		// attach block to bootstrap col
		col.append(block);
		// attach col to list container
		colorsList.append(col);
	} //end loop of colors
}

function setCurrentColor(color) {
	currentColor = tinycolor(color);
}

function updateSpectrumCursorPosition(x, y) {
	//assign position
	spectrumCursor.css("left", x + "px");
	spectrumCursor.css("top", y + "px");
}

// this function handles getting the color when the color is changed via the cursor
function getSpectrumColor(e) {
	// got some help here - http://stackoverflow.com/questions/23520909/get-hsl-value-given-x-y-and-hue
	e.preventDefault();
	//get x/y coordinates
	// notice different formula for getting coords on touch

	if (e.targetTouches) {
		var x = e.targetTouches[0].pageX - spectrumRect.left;
		var y = e.targetTouches[0].pageY - spectrumRect.top;
	} else {
		var x = e.pageX - spectrumRect.left;
		var y = e.pageY - spectrumRect.top;
	}

	//constrain x/y max/min
	if (x > spectrumRect.width) {
		x = spectrumRect.width;
	}
	if (x < 0) {
		x = 0;
	}
	if (y > spectrumRect.height) {
		y = spectrumRect.height;
	}
	if (y < 0) {
		y = 0.1;
	}
	//convert between hsv and hsl
	var xRatio = x / spectrumRect.width * 100;
	var yRatio = y / spectrumRect.height * 100;

	// saturation and lightness are decided based on the height of the canvas

	// lightness is capped at 1
	var hslLightness = 1 - yRatio / 100;
	// saturation has a floor of .5, and a ceiling of 1
	// color gains saturation towards bottom of canvas, but floored at .5 going towards top
	var hslSaturation = Math.max(0.5, Math.min(yRatio / 100, 1));

	// hue is based off the width of the canvas
	// converted to degrees
	var hsvValue = xRatio / 100;
	var percent = x / spectrumRect.width;
	hue = 360 - 360 * percent;

	// tinycolor based on the canvas determined HSL values and passed in to next functions
	return {
		color: tinycolor("hsl " + hue + " " + hslSaturation + " " + hslLightness),
		x: x,
		y: y
	};
}

function updateWithColorAndCoords(color, x, y) {
	// current color set
	setCurrentColor(color);
	// inputs and backgrounds set
	setColorValues(color);
	updateSpectrumCursorPosition(x, y);
	// get color palette
	var hexColor = color.toHex();
	var colors = generatePalette(hexColor, schemeMode, variationMode);

	// pass colors array to be build in to color list bar at top of page
	buildColorListBar(colors);
	enableSchemePicker();
	enableVariationPicker();
	enableExport();
}

var startGetSpectrumColor = function(e) {
	// color and coords from getSpectrumColor
	var colorAndPos = getSpectrumColor(e);
	var color = colorAndPos.color;
	var x = colorAndPos.x;
	var y = colorAndPos.y;

	updateWithColorAndCoords(color, x, y);

	//canvas and touch events
	spectrumCursor.addClass("dragging");
	spectrumCanvas.addEventListener("mousemove", startGetSpectrumColor);
	spectrumCanvas.addEventListener("mouseup", endGetSpectrumColor);

	spectrumCanvas.addEventListener("touchmove", startGetSpectrumColor);
	spectrumCanvas.addEventListener("touchend", endGetSpectrumColor);
};

function endGetSpectrumColor(e) {
	spectrumCursor.removeClass("dragging");
	spectrumCanvas.removeEventListener("mousemove", startGetSpectrumColor);
	spectrumCanvas.removeEventListener("touchmove", startGetSpectrumColor);
}

function enableSchemePicker() {
	schemeMode.attr("disabled", false);
}

function enableVariationPicker() {
	variationMode.attr("disabled", false);
}

function enableExport() {
	exportButton.attr("disabled", false);
}

function buildDataforAjax(e) {
	var post = {};
	var colorBlocks = $(".named-color-block");
	var currentColorHex = currentColor.toHex();

	post.colors = [];
	// type is type of css file requested (css, scss, or sass)
	post.type = e.currentTarget.dataset.type;

	// build a color object with its semantic name and color code (hex)
	// push each object to array
	for (var i = 0; i < colorBlocks.length; i++) {
		var color = {
			name: colorBlocks[i].dataset.name,
			code: colorBlocks[i].dataset.code
		};
		post.colors.push(color);
	}

	// adding current color to array for unique handling in stylesheet
	post.colors.push({
		name: ntc.name("#" + currentColorHex)[1],
		code: currentColorHex,
		is_current: true
	});

	getFile(post);
}

function getFile(post) {
	var params = $.param(post);
	window.open("https://pallypal.herokuapp.com/build/?" + params);
}

// Add event listeners
$(".rgb-inputs").change(function() {
	var color = tinycolor("rgb " + red.val() + " " + green.val() + " " + blue.val());
	var coords = colorToPos(color);

	updateWithColorAndCoords(color, coords.x, coords.y);
});

hex.change(function() {
	var color = tinycolor(hex.val());
	var coords = colorToPos(color);
	updateWithColorAndCoords(color, coords.x, coords.y);
});

$(".scheme-and-variation-selects").change(function() {
	var color = tinycolor(currentColor);
	var coords = colorToPos(color);
	updateWithColorAndCoords(color, coords.x, coords.y);
});

exportButtons.click(function(e) {
	var data = buildDataforAjax(e);
});

window.addEventListener("resize", function() {
	refreshElementRects();
});

new ColorPicker();
