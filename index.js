var Myo = require('myo');
var osc = require('osc-min');
var dgram = require('dgram');

var udp = dgram.createSocket('udp4');

var getActiveGestureState = require('./getActiveGestureState')

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

var getOrientation = function(pitch) {
	// atSky
	if (pitch > 0.4) {
		return 'atSky'
	}

	// atForward
	if (pitch < 0.4 && pitch > -0.6) {
		return 'atForward'
	}

	// atGround
	if (pitch < -0.6) {
		return 'atGround'
	}
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
	// if(msg.indexOf('average') > -1) {
	// 	console.log(myoId, msg, args)
	// }

	var buf = osc.toBuffer({
		address: '/myo/' + myoId + '/' + msg,
		args: args
	});

	// udp.send(buf, 0, buf.length, outport, 'localhost');
	udp.send(buf, 0, buf.length, outport, '192.168.0.30');
};

var sendGestureOsc = function(msg, args) {
	// console.log(msg, args)

	var buf = osc.toBuffer({
		address: '/myo/' + msg,
		args: args
	});

	// udp.send(buf, 0, buf.length, outport, 'localhost');
	udp.send(buf, 0, buf.length, outport, '192.168.0.30');
}


var rms = function(readings) {
	let sumOfSquares = 0;
    const n = readings.length;

    // Calculate the sum of the squares of the readings
    for (let i = 0; i < n; i++) {
      sumOfSquares += readings[i] * readings[i];
    }

    // Calculate the mean of the squares
    const meanOfSquares = sumOfSquares / n;

    // Return the square root of the mean of squares
    return Math.sqrt(meanOfSquares);
}

// EMG
const emgReadings = []
let interval = 0
const emgs = [
	[
		//  array of arrays, where inner arrays are a range of past n values
		[],
		[],
		[],
		[],
		[],
		[],
		[],
		[]
	],
	[
			//  array of arrays, where inner arrays are a range of past n values
		[],
		[],
		[],
		[],
		[],
		[],
		[],
		[]
	]
]

// var throttleOsc = throttle(sendOsc)

Myo.on('emg', function(data) {

	for (let i = 0; data.length > i; i++) {

		if (emgs[this.connectIndex][i].length < 30) {
			emgs[this.connectIndex][i].push(data[i])
		} else {
			emgs[this.connectIndex][i].shift()

			let rmsVal = rms(emgs[this.connectIndex][i])
			let msg = i + '_emg_average'
			sendOsc(this.connectIndex, msg, rmsVal)

		}

	}

	// sendOsc(this.connectIndex, 'emg', data);
});


var accel = [
	{ pitch: 0, roll: 0 },
	{ pitch: 0, roll: 0 }
]
// Orientation
Myo.on('orientation', function(data) {
	var id = this.connectIndex;
	var quat = this.lastQuant;

	var roll = Math.atan2(2 * (quat.w * quat.x + quat.y * quat.z), 1 - 2 * (quat.x * quat.x + quat.y * quat.y) );
	var pitch = (Math.asin(2 * (quat.w * quat.y - quat.z * quat.x ) )) * -1;

	accel[id].pitch = pitch
	accel[id].roll = roll

	// we don't actually use yaw
	// var yaw;

	sendOsc(id, 'roll', roll);
	sendOsc(id, 'pitch', pitch);

	
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

	var ori = getOrientation(accel[id].pitch)

	gOrState[id]['fist'].atSky = ori === 'atSky' ? 1 : 0
	gOrState[id]['fist'].atForward = ori === 'atForward' ? 1 : 0
	gOrState[id]['fist'].atGround = ori === 'atGround' ? 1 : 0

	var state = getActiveGestureState(gOrState)

	console.log(state)

	for (let i = 0; state.length > i; i++) {
		if (state[i].indexOf(`${this.connectIndex}_fist`) > -1) {
			sendGestureOsc(state[i], 1)
		}
	}

});

Myo.on('fist_off', function() {
	// this.vibrate('short');
	var id = this.connectIndex;

	var state = getActiveGestureState(gOrState)

	console.log(state)

	for (let i = 0; state.length > i; i++) {
		if (state[i].indexOf(`${this.connectIndex}_fist`) > -1) {
			sendGestureOsc(state[i], 0)
		}
	}

	gOrState[id]['fist'].atSky = 0
	gOrState[id]['fist'].atForward = 0
	gOrState[id]['fist'].atGround = 0

});

Myo.on('wave_out', function() {
	this.vibrate('short');
	var id = this.connectIndex;

	var ori = getOrientation(accel[id].pitch)

	gOrState[id]['waveOut'].atSky = ori === 'atSky' ? 1 : 0
	gOrState[id]['waveOut'].atForward = ori === 'atForward' ? 1 : 0
	gOrState[id]['waveOut'].atGround = ori === 'atGround' ? 1 : 0

	var state = getActiveGestureState(gOrState)

	console.log(state)

	for (let i = 0; state.length > i; i++) {
		if (state[i].indexOf(`${this.connectIndex}_waveOut`) > -1) {
			sendGestureOsc(state[i], 1)
		}
	}

});

Myo.on('wave_out_off', function() {
	// this.vibrate('short');
	var id = this.connectIndex;

	var state = getActiveGestureState(gOrState)

	console.log(state)

	for (let i = 0; state.length > i; i++) {
		if (state[i].indexOf(`${this.connectIndex}_waveOut`) > -1) {
			sendGestureOsc(state[i], 0)
		}
	}

	gOrState[id]['waveOut'].atSky = 0
	gOrState[id]['waveOut'].atForward = 0
	gOrState[id]['waveOut'].atGround = 0

});

Myo.on('wave_in', function() {
	this.vibrate('short');
	var id = this.connectIndex;

	var ori = getOrientation(accel[id].pitch)

	gOrState[id]['waveIn'].atSky = ori === 'atSky' ? 1 : 0
	gOrState[id]['waveIn'].atForward = ori === 'atForward' ? 1 : 0
	gOrState[id]['waveIn'].atGround = ori === 'atGround' ? 1 : 0

	var state = getActiveGestureState(gOrState)

	console.log(state)

	for (let i = 0; state.length > i; i++) {
		if (state[i].indexOf(`${this.connectIndex}_waveIn`) > -1) {
			sendGestureOsc(state[i], 1)
		}
	}
});

Myo.on('wave_in_off', function() {
	// this.vibrate('short');
	var id = this.connectIndex;

	var state = getActiveGestureState(gOrState)

	console.log(state)

	for (let i = 0; state.length > i; i++) {
		if (state[i].indexOf(`${this.connectIndex}_waveIn`) > -1) {
			sendGestureOsc(state[i], 0)
		}
	}

	gOrState[id]['waveIn'].atSky = 0
	gOrState[id]['waveIn'].atForward = 0
	gOrState[id]['waveIn'].atGround = 0
});

Myo.on('fingers_spread', function() {
	this.vibrate('short');
	var id = this.connectIndex;

	var ori = getOrientation(accel[id].pitch)

	gOrState[id]['fingersSpread'].atSky = ori === 'atSky' ? 1 : 0
	gOrState[id]['fingersSpread'].atForward = ori === 'atForward' ? 1 : 0
	gOrState[id]['fingersSpread'].atGround = ori === 'atGround' ? 1 : 0

	var state = getActiveGestureState(gOrState)

	console.log(state)

	for (let i = 0; state.length > i; i++) {
		if (state[i].indexOf(`${this.connectIndex}_fingersSpread`) > -1) {
			sendGestureOsc(state[i], 1)
		}
	}
});

Myo.on('fingers_spread_off', function() {
	// this.vibrate('short');
	var id = this.connectIndex;

	var state = getActiveGestureState(gOrState)

	console.log(state)

	for (let i = 0; state.length > i; i++) {
		if (state[i].indexOf(`${this.connectIndex}_fingersSpread`) > -1) {
			sendGestureOsc(state[i], 0)
		}
	}

	gOrState[id]['fingersSpread'].atSky = 0
	gOrState[id]['fingersSpread'].atForward = 0
	gOrState[id]['fingersSpread'].atGround = 0
});





























