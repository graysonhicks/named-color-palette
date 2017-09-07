window.jQuery = $ = require("jquery");
var $ = require("jquery");
var _ = require("underscore");
// Required these in by default, feel free to add more.
var tinycolor = require("tinycolor2");
//https://github.com/bgrins/TinyColor
var ntc = require("ntc");
var ColorScheme = require("color-scheme");

var colorIndicator = document.getElementById("color-indicator");

var spectrumCanvas = document.getElementById("spectrum-canvas");
var spectrumCtx = spectrumCanvas.getContext("2d");
var spectrumCursor = document.getElementById("spectrum-cursor");
var spectrumRect = spectrumCanvas.getBoundingClientRect();

var hueCanvas = document.getElementById("hue-canvas");
var hueCtx = hueCanvas.getContext("2d");
var hueCursor = document.getElementById("hue-cursor");
var hueRect = hueCanvas.getBoundingClientRect();

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

function ColorPicker() {
	createShadeSpectrum();
	createHueSpectrum();
}

function refreshElementRects() {
	spectrumRect = spectrumCanvas.getBoundingClientRect();
	hueRect = hueCanvas.getBoundingClientRect();
}

function createShadeSpectrum(color) {
	canvas = spectrumCanvas;
	ctx = spectrumCtx;
	ctx.clearRect(0, 0, canvas.width, canvas.height);

	if (!color) color = "#f00";

	var gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
  // Create color gradient
  gradient.addColorStop(0,    "rgb(255,   0,   0)");
  gradient.addColorStop(0.15, "rgb(255,   0, 255)");
  gradient.addColorStop(0.33, "rgb(0,     0, 255)");
  gradient.addColorStop(0.49, "rgb(0,   255, 255)");
  gradient.addColorStop(0.67, "rgb(0,   255,   0)");
  gradient.addColorStop(0.84, "rgb(255, 255,   0)");
  gradient.addColorStop(1,    "rgb(255,   0,   0)");
  // Apply gradient to canvas
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Create semi transparent gradient (white -> trans. -> black)
  gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0,   "rgba(255, 255, 255, 1)");
  gradient.addColorStop(0.5, "rgba(255, 255, 255, 0)");
  gradient.addColorStop(0.5, "rgba(0,     0,   0, 0)");
  gradient.addColorStop(1,   "rgba(0,     0,   0, 1)");
  // Apply gradient to canvas
  ctx.fillStyle = gradient;
	ctx.fillRect(0, 0, canvas.width, canvas.height);


	canvas.addEventListener("mousedown", function(e) {
		startGetSpectrumColor(e);
	});
}

function createHueSpectrum() {
	var canvas = hueCanvas;
	var ctx = hueCtx;
	var hueGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
	hueGradient.addColorStop(0.0, "hsl(0,100%,50%)");
	hueGradient.addColorStop(0.17, "hsl(298.8, 100%, 50%)");
	hueGradient.addColorStop(0.33, "hsl(241.2, 100%, 50%)");
	hueGradient.addColorStop(0.5, "hsl(180, 100%, 50%)");
	hueGradient.addColorStop(0.67, "hsl(118.8, 100%, 50%)");
	hueGradient.addColorStop(0.83, "hsl(61.2,100%,50%)");
	hueGradient.addColorStop(1.0, "hsl(360,100%,50%)");
	ctx.fillStyle = hueGradient;
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	canvas.addEventListener("mousedown", function(e) {
		startGetHueColor(e);
	});
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
	var x = spectrumRect.width * hsv.s;
	var y = spectrumRect.height * (1 - hsv.v);
	var hueY = hueRect.height - hue / 360 * hueRect.height;
	updateSpectrumCursor(x, y);
	updateHueCursor(hueY);
	setCurrentColor(color);
	createShadeSpectrum(colorToHue(color));
}

function setColorValues(color) {
	//convert to tinycolor object
	var color = tinycolor(color);
	var rgbValues = color.toRgb();
	var hexValue = color.toHex();
	var hueValue = color.toHsl().h;
	var scheme = new ColorScheme();
	console.log(hueValue);
	scheme
		.from_hue(hueValue) // Start the scheme
		.scheme("triade") // Use the 'triade' scheme, that is, colors
		// selected from 3 points equidistant around
		// the color wheel.
		.variation("default"); // Use the 'soft' color variation

	var colors = scheme.colors();
	console.log(colors);
	$("#colors-list").empty();
	for (var i = 0; i < colors.length; i++) {
		var ntcColor = ntc.name("#" + colors[i]);
		$("#colors-list").append("<span class='named-color-block' style='background-color:#" + colors[i] + ";'>" + ntcColor[1] + "</span>");
	}

	//
	// hexValue = ntc.name("#" + hexValue);
	// hexValue = hexValue[1];

	//set inputs
	red.value = rgbValues.r;
	green.value = rgbValues.g;
	blue.value = rgbValues.b;
	hex.value = "#" + hexValue;
}

function setCurrentColor(color) {
	color = tinycolor(color);
	currentColor = color;
	colorIndicator.style.backgroundColor = color;
	document.body.style.backgroundColor = color;
	spectrumCursor.style.backgroundColor = color;
	hueCursor.style.backgroundColor = "hsl(" + color.toHsl().h + ", 100%, 50%)";
}

function updateHueCursor(y) {
	hueCursor.style.top = y + "px";
}

function updateSpectrumCursor(x, y) {
	//assign position
	spectrumCursor.style.left = x + "px";
	spectrumCursor.style.top = y + "px";
}

var startGetSpectrumColor = function(e) {
	getSpectrumColor(e);
	spectrumCursor.classList.add("dragging");
	window.addEventListener("mousemove", getSpectrumColor);
	window.addEventListener("mouseup", endGetSpectrumColor);
};

function getSpectrumColor(e) {
	// got some help here - http://stackoverflow.com/questions/23520909/get-hsl-value-given-x-y-and-hue
	e.preventDefault();
	//get x/y coordinates

	var x = e.pageX - spectrumRect.left;
	var y = e.pageY - spectrumRect.top;
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
	var hsvValue = 1 - yRatio / 100;
	var hsvSaturation = xRatio / 100;
	lightness = hsvValue / 2 * (2 - hsvSaturation);
	saturation = hsvValue * hsvSaturation / (1 - Math.abs(2 * lightness - 1));
	var color = tinycolor("hsl " + hue + " " + saturation + " " + lightness);
	setCurrentColor(color);
	setColorValues(color);
	updateSpectrumCursor(x, y);
}

function endGetSpectrumColor(e) {
	spectrumCursor.classList.remove("dragging");
	window.removeEventListener("mousemove", getSpectrumColor);
}

function startGetHueColor(e) {
	getHueColor(e);
	hueCursor.classList.add("dragging");
	window.addEventListener("mousemove", getHueColor);
	window.addEventListener("mouseup", endGetHueColor);
}

function getHueColor(e) {
	e.preventDefault();
	var y = e.pageY - hueRect.top;
	if (y > hueRect.height) {
		y = hueRect.height;
	}
	if (y < 0) {
		y = 0;
	}
	var percent = y / hueRect.height;
	hue = 360 - 360 * percent;
	var hueColor = tinycolor("hsl " + hue + " 1 .5").toHslString();
	var color = tinycolor("hsl " + hue + " " + saturation + " " + lightness).toHslString();
	createShadeSpectrum(hueColor);
	updateHueCursor(y, hueColor);
	setCurrentColor(color);
	setColorValues(color);
}

function endGetHueColor(e) {
	hueCursor.classList.remove("dragging");
	window.removeEventListener("mousemove", getHueColor);
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

window.addEventListener("resize", function() {
	refreshElementRects();
});

new ColorPicker();
