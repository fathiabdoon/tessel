'use strict';

// Demo program to make the servo rotate when a clap is detected.

var tessel = require('tessel');
var servolib = require('servo-pca9685');
var ambientlib = require('ambient-attx4');

var servo = servolib.use(tessel.port.A);
var ambient = ambientlib.use(tessel.port.B);

var servo1 = 1;
var position = 0;
var clapdelay = 100;

servo.on('ready', function () {
  // zero position at initialization
  servo.move(servo1, position);

  ambient.on('ready', function () {
    // Set a sound level trigger float between 0 and 1
    ambient.setSoundTrigger(0.1);

    ambient.on('sound-trigger', function(data) {
      console.log('Something happened with sound: ', data);

      servo.configure(servo1, 0.05, 0.12, function () {
        // Increment by 10% (~18 deg for a normal servo)
        position += 0.1;
        if (position > 1) {
          position = 0; // Reset servo position
        }
        servo.move(servo1, position);
        console.log('Position (in range 0-1):', position);
      });

      // Clear it
      ambient.clearSoundTrigger();

      //After delay reset sound trigger
      setTimeout(function () {
          ambient.setSoundTrigger(0.1);
      },clapdelay);
    });

  });

  ambient.on('error', function (err) {
    console.log(err);
  });
});
