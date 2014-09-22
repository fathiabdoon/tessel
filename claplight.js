'use strict';

// require modules
var tessel = require('tessel');
var ambientlib = require('ambient-attx4');
var Neopixels = require('neopixels');

// initializing modules
var ambient = ambientlib.use(tessel.port.B);
var neopixels = new Neopixels();

// setting constants
var leds = 60;
var clapdelay = 300;
var color = {
  off: [0x00, 0x00, 0x00],
  blue: [0x00, 0x00, 0xFF],
  green: [0x00, 0xFF, 0x00],
  red: [0xFF, 0x00, 0x00]
};
var currentColor = color.off;

// set all LEDs off
neopixels.animate( leds, Buffer.concat(setAll(leds, color.off)) );

// when ready
ambient.on('ready', function () {
  // Set a sound level trigger float between 0 and 1
  ambient.setSoundTrigger(0.1);

  ambient.on('sound-trigger', function(data) {
    console.log('Something happened with sound: ', data);
    if (currentColor === color.off) {
      neopixels.animate( leds, Buffer.concat(setAll(leds, color.red)) );
    } else {
      neopixels.animate( leds, Buffer.concat(setAll(leds, color.off)) );
    }
  });

  // Clear it
  ambient.clearSoundTrigger();

  //After delay reset sound trigger
  setTimeout(function () {
    ambient.setSoundTrigger(0.1);
  }, clapdelay);
});

// error logging
ambient.on('error', function (err) {
  console.log(err);
});

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
