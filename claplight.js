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
var clapdelay = 500;
var color = {
  off: [0x00, 0x00, 0x00],
  blue: [0x00, 0x00, 0xFF],
  green: [0xFF, 0x00, 0x00],
  red: [0x00, 0xFF, 0x00]
};
var currentColor = color.off;
var last = Date.now();
var setColor = color.off;

// set all LEDs off
neopixels.animate( leds, Buffer.concat(setAll(leds, color.off)) );

// when ready
ambient.on('ready', function () {
  // ready animation for fun
  neopixels.animate( leds, Buffer.concat(tracer(leds)) );
  // Set a sound level trigger float between 0 and 1
  ambient.setSoundTrigger(0.1);

  ambient.on('sound-trigger', function(data) {
    console.log('Tripped sound threshold at level ', data);
    // Clear it
    ambient.clearSoundTrigger();

    // double clap handler to turn on and off
    if ( Date.now() - last < clapdelay ) {
      setColor = (setColor === color.off) ? color.red : color.off;
    } else if (setColor !== color.off) { // single clap for color switching
      setColor = (setColor === color.red) ? color.green : color.red;
    }

    last = Date.now();
    neopixels.animate( leds, Buffer.concat(setAll(leds, setColor)) );

    //After delay reset sound trigger
    setTimeout(function () {
      ambient.setSoundTrigger(0.1);
    }, 10);
  });

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
