var osc = require('osc-min');
var dgram = require('dgram');

var udp = dgram.createSocket('udp4');

var outport;
if (process.argv[2]) {
	outport = parseInt(process.argv[2]);
} else {
	outport = 41234;
}

// example OSC message
/*
var sendHeartbeat = function() {
	var buf = osc.toBuffer({
		address: '/hearbeat',
		args: [
			12,
			'stringingnging',
			new Buffer('beat', {
				type: 'integer',
				value: 7
			})
		]
	})

	udp.send(buf, 0, buf.length, outport, 'localhost');
	console.log(buf)
};

setInterval(sendHeartbeat, 2000);
*/

console.log('OSC Port:', outport);

var sendOsc = function( myoId, msg, args ) {
	var buf = osc.toBuffer({
		address: '/myo/' + myoId + '/' + msg,
		args: args
	});

	udp.send(buf, 0, buf.length, outport, 'localhost');
};

// Myo stuff
var Myo = require('myo');
Myo.connect('com.stolksdorf.app');

Myo.on('connected', function() {
	// console.log(this);

	// set the locking policy
	Myo.setLockingPolicy('none');
	
	// tell the connected myos to hold at unlocked
	this.unlock('hold');

	// streaming EMG
	this.streamEMG(true);

	this.requestBatteryLevel();
	this.requestBluetoothStrength();
});

// EMG
Myo.on('emg', function(data) {
	sendOsc(this.connectIndex, 'emg', data);
});

// Orientation
Myo.on('orientation', function(data) {
	var quat = this.lastQuant;

	var roll = Math.atan2(2 * (quat.w * quat.x + quat.y * quat.z), 1 - 2 * (quat.x * quat.x + quat.y * quat.y) );
	var pitch = Math.asin(2 * (quat.w * quat.y - quat.z * quat.x ) );
	// we don't actually use yaw
	// var yaw;

	sendOsc(this.connectIndex, 'roll', roll);
	sendOsc(this.connectIndex, 'pitch', pitch);

	// atForward
	if (pitch < 0.4 && pitch > -0.6) {
		sendOsc(this.connectIndex, 'atForward', 1);
	} else {
		sendOsc(this.connectIndex, 'atForward', 0);
	}

	// atGround
	if (pitch < -0.6) {
		sendOsc(this.connectIndex, 'atGround', 1);
	} else {
		sendOsc(this.connectIndex, 'atGround', 0);
	}

	// atSky
	if (pitch > 0.4) {
		sendOsc(this.connectIndex, 'atSky', 1);
	} else {
		sendOsc(this.connectIndex, 'atSky', 0);
	}
});

// Poses
// Fist
Myo.on('fist', function() {
	this.vibrate('short');
	sendOsc(this.connectIndex, 'fist', 1);
});

Myo.on('fist_off', function() {
	this.vibrate('short');
	sendOsc(this.connectIndex, 'fist', 0);
});

// Wave In
Myo.on('wave_in', function() {
	this.vibrate('short');
	sendOsc(this.connectIndex, 'wave_in', 1);
});

Myo.on('wave_in_off', function() {
	this.vibrate('short');
	sendOsc(this.connectIndex, 'wave_in', 0);
});

// Wave Out
Myo.on('wave_out', function() {
	this.vibrate('short');
	sendOsc(this.connectIndex, 'wave_out', 1);
});

Myo.on('wave_out_off', function() {
	this.vibrate('short');
	sendOsc(this.connectIndex, 'wave_out', 0);
});

// Fingers Spread
Myo.on('fingers_spread', function() {
	this.vibrate('short');
	sendOsc(this.connectIndex, 'fingers_spread', 1);
});

Myo.on('fingers_spread_off', function() {
	this.vibrate('short');
	sendOsc(this.connectIndex, 'fingers_spread', 0);
});

// Double Tap
// not for now

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
	sendOsc(this.connectIndex, 'battery_level', data);
});

Myo.on('bluetooth_strength', function(data) {
	sendOsc(this.connectIndex, 'bluetooth_strength', data);
});



















