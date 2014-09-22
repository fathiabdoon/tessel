// Maps ambient sound levels to spectrum output on neopixel LEDs.
// Calibrate to the max ambient level with soundMax:
'use strict';
var soundMax = 0.200;
var soundMin = 0.035;

// require modules
var tessel = require('tessel');
var ambientlib = require('ambient-attx4');
var Neopixels = require('neopixels');

// initializing modules
var ambient = ambientlib.use(tessel.port.B);
var neopixels = new Neopixels();

// setting constants
var leds = 60;
var threshold = 0.01;
var color = {
  off: [0x00, 0x00, 0x00],
  green: [0xFF, 0x00, 0x00],
  red: [0x00, 0xFF, 0x00],
  blue: [0x00, 0x00, 0xFF],
  purple: [0x00, 0xFF, 0xFF],
  yellow: [0xFF, 0xFF, 0x00],
  cyan: [0xFF, 0x00, 0xFF]
};
var currentColor = color.off;

// set all LEDs off
neopixels.animate( leds, Buffer.concat(setAll(leds, color.off)) );

// when ready
ambient.on('ready', function () {
  // ready animation for fun
  neopixels.animate( leds, Buffer.concat(tracer(leds)) );
  // Set a sound level trigger float between 0 and 1
  ambient.setSoundTrigger(threshold);

  ambient.on('sound-trigger', function(data) {
    console.log('Tripped sound threshold at level ', data);
    var newColor = convertColor(data);
    neopixels.animate( leds, Buffer.concat(setAll(leds, newColor)) );
  });

});

// error logging
ambient.on('error', function (err) {
  console.log(err);
});

function convertColor (decimal) {
  var halfway = (soundMax + soundMin) / 2;
  var output = [0x00, 0x00, 0x00]; // GRB off
  decimal = decimal > soundMax ? soundMax : decimal;
  if ( decimal === halfway ) {
    output[0] = 0xFF; // G
  } else if ( decimal > halfway ) {
    output[1] = (decimal-halfway)/(halfway) * 0xFF; // R
    output[0] = 0xFF - output[1]; // G
  } else if (decimal > soundMin ) {
    output[0] = decimal / halfway * 0xFF; // G
    output[2] = 0xFF - output[0]; // B
  }
  return output;
}

// set leds to color
function setAll (numLEDs, color) {
  var buf = new Buffer(numLEDs * 3);
  for (var i = 0; i < buf.length; i += 3) {
    buf[i] = color[0];
    buf[i+1] = color[1];
    buf[i+2] = color[2];
  }
  currentColor = color;
  return [buf];
}

// An example animation
function tracer(numLEDs) {
  var trail = 20;
  var arr = new Array(numLEDs);
  for (var i = 0; i < numLEDs; i++) {
    var buf = new Buffer(numLEDs * 3);
    buf.fill(0);
    for (var col = 0; col < 3; col++){
      for (var k = 0; k < trail; k++) {
        buf[(3*(i+numLEDs*col/3)+col+1 +3*k)] = 0xFF*(trail-k)/trail;
      }
    }
    arr[i] = buf;
  }
  var newArr = [];
  for (var i = 0; i < arr.length; i++) {
    newArr.push(arr[i]);
    newArr.push(arr[i]);
    newArr.push(arr[i]);
    newArr.push(arr[i]);
    newArr.push(arr[i]);
    newArr.push(arr[i]);
  }
  return newArr;
}
