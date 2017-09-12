window.jQuery = $ = require("jquery");
var $ = require("jquery");
var _ = require("underscore");
var bootstrap = require("bootstrap");
// Required these in by default, feel free to add more.
var tinycolor = require("tinycolor2");
//https://github.com/bgrins/TinyColor
var ntc = require("ntc");
var ColorScheme = require("color-scheme");
var fontColorContrast = require('font-color-contrast');

var spectrumCanvas = document.getElementById("spectrum-canvas");
var spectrumCtx = spectrumCanvas.getContext("2d");
var spectrumCursor = document.getElementById("spectrum-cursor");
var spectrumRect = spectrumCanvas.getBoundingClientRect();

var currentColor = "";
var hue = 0;
var saturation = 1;
var lightness = 0.5;

var rgbFields = document.getElementById("rgb-fields");
var hexField = document.getElementById("hex-field");

var red = document.getElementById("red");
var blue = document.getElementById("blue");
var green = document.getElementById("green");
var hex = document.getElementById("hex");
var name = document.getElementById("name");
var schemeMode = document.getElementById("scheme-mode");
var variationMode = document.getElementById("variation-mode");
var exportButton = document.getElementById("export-button");
var exportButtons = document.querySelectorAll(".export-buttons");

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

	canvas.addEventListener("touchstart", function (e) {
		startGetSpectrumColor(e);
	}, false);
}

function colorToHue(color) {
	var color = tinycolor(color);
	var hueString = tinycolor("hsl " + color.toHsl().h + " 1 .5").toHslString();
	return hueString;
}

function colorToPos(color) {

	var color = tinycolor(color);
	var hsl = color.toHsl();
	hue = hsl.h;
	var hsv = color.toHsv();
	var x = spectrumRect.width - hue / 360 * spectrumRect.width;
	var y = spectrumRect.height * (1 - hsl.l);
	updateSpectrumCursor(x, y);
	setColorValues(color);
	setCurrentColor(color);
	createShadeSpectrum(colorToHue(color));
	enableSchemePicker();
	enableVariationPicker();
	enableExport();
}

function setColorValues(color) {
	//convert to tinycolor object
	var color = tinycolor(color);
	var rgbValues = color.toRgb();
	var hexValue = color.toHex();
	var hueValue = color.toHsl().h;

	//set inputs
	red.value = rgbValues.r;
	green.value = rgbValues.g;
	blue.value = rgbValues.b;
	hex.value = "#" + hexValue;

	var fontColorBasedOnBackground = fontColorContrast("#" + hexValue);

	if(fontColorBasedOnBackground == "#000000"){
		fontColorBasedOnBackground = "#364347";
	}

	name.value = ntc.name("#" + hexValue)[1];
	name.style.color = fontColorBasedOnBackground;


	var scheme = new ColorScheme();
	scheme
		.from_hue(hueValue)
		.scheme(schemeMode.value)
		.variation(variationMode.value); // Use the 'soft' color variation

	var colors = scheme.colors();
	buildColorListBar(colors);
}

function buildColorListBar(colors) {
	var colorsList = document.getElementById("colors-list");
	colorsList.classList.remove("justify-content-center", "align-items-center")
	// empty colors list of previous colors
	while (colorsList.firstChild) colorsList.removeChild(colorsList.firstChild);
	for (var i = 0; i < colors.length; i++) {
		var ntcColor = ntc.name("#" + colors[i]);
		var col = document.createElement("div");
		var blockSpan = document.createElement("div");
		var fontColorBasedOnBackground = fontColorContrast("#" + colors[i]);

		if(fontColorBasedOnBackground == "#000000"){
			fontColorBasedOnBackground = "#364347";
		}

		col.classList.add("col");
		blockSpan.classList.add("named-color-block");
		blockSpan.style.backgroundColor = "#" + colors[i];
		var nameDiv = document.createElement("div");
		nameDiv.innerHTML = ntcColor[1];
		nameDiv.style.color = fontColorBasedOnBackground;
		blockSpan.setAttribute("data-code", colors[i]);
		blockSpan.setAttribute("data-name", ntcColor[1]);
		var hexDiv = document.createElement("div");
		hexDiv.style.color = fontColorBasedOnBackground;
		hexDiv.classList.add("hex-span");
		hexDiv.innerHTML = "#" + colors[i];

		// special formatting for palettes on mobile (2x2 grid for mono, 2x4 for contrast, with hex code hidden)
		console.log($('#xs-media-query-test').is(':visible'));
		if($('#xs-media-query-test').is(':visible')){
			$('#analogic-scheme-option, #tetrade-scheme-option, #triade-scheme-option').remove();
			if(colors.length === 8){
				col.classList.add("col-3");
				nameDiv.style.fontSize = ".65rem";
				hexDiv.innerHTML = "";
			} else {
				col.classList.add("col-6");
			}
		}

		blockSpan.appendChild(nameDiv);
		blockSpan.appendChild(hexDiv);
		col.appendChild(blockSpan)
		colorsList.appendChild(col);
	}
}

function setCurrentColor(color) {
	currentColor = tinycolor(color);
	name.style.backgroundColor = "#" + currentColor.toHex();
	spectrumCursor.style.backgroundColor = "#" + currentColor.toHex();
}

function updateSpectrumCursor(x, y) {
	//assign position
	spectrumCursor.style.left = x + "px";
	spectrumCursor.style.top = y + "px";
}

function getSpectrumColor(e) {
	// got some help here - http://stackoverflow.com/questions/23520909/get-hsl-value-given-x-y-and-hue

	e.preventDefault();
	//get x/y coordinates
	console.log(e.targetTouches);
	if(e.targetTouches){
				var x = e.targetTouches[0].pageX - spectrumRect.left;
				var y = e.targetTouches[0].pageY - spectrumRect.top;
	} else {
			var x = e.pageX - spectrumRect.left;
			var y = e.pageY - spectrumRect.top;
	}

	//constrain x max
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
	var hsvLightness = 1 - (yRatio / 100);
	var hsvSaturation = Math.max(.5, Math.min((yRatio / 100), 1));

	var hsvValue = xRatio / 100;
	var percent = x / spectrumRect.width;

	hue = 360 - 360 * percent;
	// lightness = (hsvValue / 2) * (2 - hsvSaturation);
	// saturation = hsvValue * 1 / (1 - Math.abs(2 * lightness - 1));

	console.log(hue, hsvSaturation, hsvLightness);

	var color = tinycolor("hsl " + hue + " " + hsvSaturation + " " + hsvLightness);
	setCurrentColor(color);
	setColorValues(color);
	updateSpectrumCursor(x, y);
	enableSchemePicker();
	enableVariationPicker();
	enableExport();
}

var startGetSpectrumColor = function(e) {
	getSpectrumColor(e);
	spectrumCursor.classList.add("dragging");
	spectrumCanvas.addEventListener("mousemove", getSpectrumColor);
	spectrumCanvas.addEventListener("mouseup", endGetSpectrumColor);

	spectrumCanvas.addEventListener("touchmove", getSpectrumColor);
	spectrumCanvas.addEventListener("touchend", endGetSpectrumColor);
};

function endGetSpectrumColor(e) {
	spectrumCursor.classList.remove("dragging");
	spectrumCanvas.removeEventListener("mousemove", getSpectrumColor);
	spectrumCanvas.removeEventListener("touchmove", getSpectrumColor);
}

function enableSchemePicker() {
	schemeMode.disabled = false;
}

function enableVariationPicker() {
	variationMode.disabled = false;
}

function enableExport() {
	exportButton.disabled = false;
}

function buildDataforAjax(e) {
	var post = {};
	var colorBlocks = document.querySelectorAll(".named-color-block");
	var currentColorHex = tinycolor(currentColor).toHex();

	post.colors = [];
	post.type = e.currentTarget.dataset.type;

	for (var i = 0; i < colorBlocks.length; i++) {
		var color = {
			name: colorBlocks[i].dataset.name,
			code: colorBlocks[i].dataset.code
		};
		post.colors.push(color);
	}

	// adding current color to array
	post.colors.push({
		name: ntc.name("#" + currentColorHex)[1],
		code: currentColorHex,
		is_current: true
	});

	postToGetFile(post);
}

function postToGetFile(post) {
	var params = $.param(post);
	window.open("https://pallypal.herokuapp.com/build/?" + params);
}

// Add event listeners

red.addEventListener("change", function() {
	var color = tinycolor("rgb " + red.value + " " + green.value + " " + blue.value);
	colorToPos(color);
});

green.addEventListener("change", function() {
	var color = tinycolor("rgb " + red.value + " " + green.value + " " + blue.value);
	colorToPos(color);
});

blue.addEventListener("change", function() {
	var color = tinycolor("rgb " + red.value + " " + green.value + " " + blue.value);
	colorToPos(color);
});

hex.addEventListener("change", function() {
	var color = tinycolor(hex.value);
	colorToPos(color);
});

schemeMode.addEventListener("change", function() {
	var color = tinycolor(currentColor);
	colorToPos(color);
});

variationMode.addEventListener("change", function() {
	var color = tinycolor(currentColor);
	colorToPos(color);
});

for (var i = 0; i < exportButtons.length; i++) {
	exportButtons[i].addEventListener("click", function(e) {
		var data = buildDataforAjax(e);
	});
}

window.addEventListener("resize", function() {
	refreshElementRects();
});

new ColorPicker();
