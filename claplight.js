// Double-clap to turn on or off;
// Single-clap to cycle through colors.

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
var clapdelay = 400;
var color = {
  off: [0x00, 0x00, 0x00],
  green: [0xFF, 0x00, 0x00],
  red: [0x00, 0xFF, 0x00],
  blue: [0x00, 0x00, 0xFF],
  purple: [0x00, 0xFF, 0xFF],
  yellow: [0xFF, 0xFF, 0x00],
  cyan: [0xFF, 0x00, 0xFF]
};
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
      setColor = (setColor === color.off) ? color.green : color.off;
    } else if (setColor !== color.off) { // single clap for color switching
      switch (setColor) {
        case color.green:
          setColor = color.red;
          break;
        case color.red:
          setColor = color.blue;
          break;
        case color.blue:
          setColor = color.yellow;
          break;
        case color.yellow:
          setColor = color.purple;
          break;
        case color.purple:
          setColor = color.cyan;
          break;
        case color.cyan:
          setColor = color.green;
          break;
        default:
          setColor = color.green;
      }
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
