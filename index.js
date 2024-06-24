// Myo setup
var Myo = require('myo');
var osc = require('osc-min');
var dgram = require('dgram');

var udp = dgram.createSocket('udp4');

var buildStateString = require('./buildStateString')

var outport;
if (process.argv[2]) {
	outport = parseInt(process.argv[2]);
} else {
	outport = 41234;
}

Myo.connect('com.stolksdorf.app');

Myo.on('connected', function() {
	// set the locking policy
	Myo.setLockingPolicy('none');
	// tell the connected myos to hold at unlocked
	this.unlock('hold');
	// streaming EMG
	this.streamEMG(true);
	this.requestBatteryLevel();
	this.requestBluetoothStrength();
});

console.log('OSC Port:', outport);

var orientationState = [
	{
		atSky: 0,
		atForward: 0,
		atGround: 0
	},
	{
		atSky: 0,
		atForward: 0,
		atGround: 0
	},
]

var gestureState = [
	{
		fist: 0,
		waveOut: 0,
		waveIn: 0,
		fingersSpread: 0	
	},
	{
		fist: 0,
		waveOut: 0,
		waveIn: 0,
		fingersSpread: 0
	}
]

var gOrState = [
{
	fist: {
		atSky: 0,
		atForward: 0,
		atGround: 0
	},
	waveOut: {
		atSky: 0,
		atForward: 0,
		atGround: 0,
	},
	waveIn: {
		atSky: 0,
		atForward: 0,
		atGround: 0
	},
	fingersSpread: {
		atSky: 0,
		atForward: 0,
		atGround: 0
	}
},
{
	fist: {
		atSky: 0,
		atForward: 0,
		atGround: 0
	},
	waveOut: {
		atSky: 0,
		atForward: 0,
		atGround: 0,
	},
	waveIn: {
		atSky: 0,
		atForward: 0,
		atGround: 0
	},
	fingersSpread: {
		atSky: 0,
		atForward: 0,
		atGround: 0
	}
}
]

var activeGestureCombos = {
	// builds up a dictionary progressively
	// ex: 0_fist: 0
}


var throttle = function(callback, limit) {
    var waiting = false;                      // Initially, we're not waiting
    return function () {                      // We return a throttled function
        if (!waiting) {                       // If we're not waiting
            callback.apply(this, arguments);  // Execute users function
            waiting = true;                   // Prevent future invocations
            setTimeout(function () {          // After a period of time
                waiting = false;              // And allow future invocations
            }, limit);
        }
    }
}

var throttleLog = throttle(console.log, 200)

var sendOsc = function( myoId, msg, args ) {
	var buf = osc.toBuffer({
		address: '/myo/' + myoId + '/' + msg,
		args: args
	});

	// udp.send(buf, 0, buf.length, outport, 'localhost');
	udp.send(buf, 0, buf.length, outport, '192.168.0.30');
};

var sendGestureOsc = function(msg, args) {
	console.log(msg, args)

	var buf = osc.toBuffer({
		address: '/myo/3/' + msg,
		args: args
	});

	// udp.send(buf, 0, buf.length, outport, 'localhost');
	udp.send(buf, 0, buf.length, outport, '192.168.0.30');
}

var updateActiveGestures = function(string) {
	if (!activeGestureCombos[string]) {
		activeGestureCombos[string] = 1
	} else {
		activeGestureCombos[string] = 0
	}
}

var sendGesture = function () {
	var gestOri = buildStateString(gOrState, true)
	// var gestOriToggle = updateActiveGestures(gestOri)

	var gest = buildStateString(gOrState, false)
	// var gestToggle = updateActiveGestures(gest)

	// console.log(gestOri)
	// console.log(gest)
	// console.log(activeGestureCombos)

	sendGestureOsc(gest, null)
	sendGestureOsc(gestOri, null)
}

// EMG
Myo.on('emg', function(data) {
	sendOsc(this.connectIndex, 'emg', data);
});



// Orientation
Myo.on('orientation', function(data) {
	var id = this.connectIndex;
	var quat = this.lastQuant;

	var roll = Math.atan2(2 * (quat.w * quat.x + quat.y * quat.z), 1 - 2 * (quat.x * quat.x + quat.y * quat.y) );
	var pitch = (Math.asin(2 * (quat.w * quat.y - quat.z * quat.x ) )) * -1;
	// we don't actually use yaw
	// var yaw;

	sendOsc(id, 'roll', roll);
	sendOsc(id, 'pitch', pitch);

	// atSky
	if (pitch > 0.4) {
		// sendOsc(this.connectIndex, 'atSky', 1);
		orientationState[id].atSky = 1
	} else {
		orientationState[id].atSky = 0
	}

	// atForward
	if (pitch < 0.4 && pitch > -0.6) {
		// sendOsc(this.connectIndex, 'atForward', 1);
		orientationState[id].atForward = 1
	} else {
		orientationState[id].atForward = 0
	}

	// atGround
	if (pitch < -0.6) {
		// sendOsc(this.connectIndex, 'atGround', 1);
		orientationState[id].atGround = 1
	} else {
		orientationState[id].atGround = 0
	}
});

// Gyroscope
Myo.on('gyroscope', function() {
	var g = this.lastIMU.gyroscope;

	if (g.x > 200 || g.y > 200 || g.z > 200) {
		sendOsc(this.connectIndex, 'hit', 1);
	} else {
		sendOsc(this.connectIndex, 'hit', 0);
	}
});

// useful statuses
Myo.on('battery_level', function(data) {
	// sendOsc(this.connectIndex, 'battery_level', data);
});

Myo.on('bluetooth_strength', function(data) {
	// sendOsc(this.connectIndex, 'bluetooth_strength', data);
});

// GESTURES
Myo.on('fist', function() {
	this.vibrate('short');
	var id = this.connectIndex;

	gOrState[id]['fist'].atSky = orientationState[id].atSky
	gOrState[id]['fist'].atForward = orientationState[id].atForward
	gOrState[id]['fist'].atGround = orientationState[id].atGround

	sendGesture()

});

Myo.on('fist_off', function() {
	this.vibrate('short');
	var id = this.connectIndex;

	gOrState[id]['fist'].atSky = 0
	gOrState[id]['fist'].atForward = 0
	gOrState[id]['fist'].atGround = 0

	sendGesture()

});

Myo.on('wave_out', function() {
	this.vibrate('short');
	var id = this.connectIndex;

	gOrState[id]['waveOut'].atSky = orientationState[id].atSky
	gOrState[id]['waveOut'].atForward = orientationState[id].atForward
	gOrState[id]['waveOut'].atGround = orientationState[id].atGround

	sendGesture()
});

Myo.on('wave_out_off', function() {
	this.vibrate('short');
	var id = this.connectIndex;

	gOrState[id]['waveOut'].atSky = 0
	gOrState[id]['waveOut'].atForward = 0
	gOrState[id]['waveOut'].atGround = 0

	sendGesture()
});

Myo.on('wave_in', function() {
	this.vibrate('short');
	var id = this.connectIndex;

	gOrState[id]['waveIn'].atSky = orientationState[id].atSky
	gOrState[id]['waveIn'].atForward = orientationState[id].atForward
	gOrState[id]['waveIn'].atGround = orientationState[id].atGround

	sendGesture()
});

Myo.on('wave_in_off', function() {
	this.vibrate('short');
	var id = this.connectIndex;

	gOrState[id]['waveOut'].atSky = 0
	gOrState[id]['waveOut'].atForward = 0
	gOrState[id]['waveOut'].atGround = 0

	sendGesture()
});

Myo.on('fingers_spread', function() {
	this.vibrate('short');
	var id = this.connectIndex;

	gOrState[id]['fingersSpread'].atSky = orientationState[id].atSky
	gOrState[id]['fingersSpread'].atForward = orientationState[id].atForward
	gOrState[id]['fingersSpread'].atGround = orientationState[id].atGround

	sendGesture()
});

Myo.on('fingers_spread_off', function() {
	this.vibrate('short');
	var id = this.connectIndex;

	gOrState[id]['fingersSpread'].atSky = 0
	gOrState[id]['fingersSpread'].atForward = 0
	gOrState[id]['fingersSpread'].atGround = 0

	sendGesture()
});





























