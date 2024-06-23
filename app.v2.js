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

console.log('OSC Port:', outport, 'hello remote');
var oscLog = [
	{
		myoId: null,
		emg: null,
		pitch: null,
		roll: null,
		gesture: null,
		// hit: null
	},
	{
		myoId: null,
		emg: null,
		pitch: null,
		roll: null,
		gesture: null,
		// hit: null
	}
]

var formatOSC = function(myoId, msg, args) {
	oscLog = [
		{
			myoId: myoId,
			emg: msg === 'emg' ? msg : oscLog[0].emg,
			pitch: msg === 'pitch' ? msg : oscLog[0].pitch,
			roll: msg === 'roll' ? msg : oscLog[0].roll,
			gesture: msg === 'wave_in' || 'wave_out' ? msg : oscLog[0].gesture,
			// hit: null
		},
		{
			myoId: myoId,
			emg: msg === 'emg' ? msg : oscLog[0].emg,
			pitch: msg === 'pitch' ? msg : oscLog[0].pitch,
			roll: msg === 'roll' ? msg : oscLog[0].roll,
			gesture: null,
			// hit: null
		}
	]
/*
	if (oscLog[0].myoId === null) {
		oscLog[0].myoId = myoId
	}
	if (oscLog[0].emg === null) {
		oscLog[0].emg = args
	}
	if (oscLog[0].pitch === null) {
		oscLog[0].pitch = args
	}
	if (oscLog[0].roll === null) {
		oscLog[0].roll = args
	}
	if (oscLog[0].gesture === null) {
		oscLog[0].gesture = args
	}
	if (oscLog[0].hit === null) {
		oscLog[0].hit = args
	}

	if (oscLog[1].myoId === null) {
		oscLog[1].myoId = myoId
	}
	if (oscLog[1].emg === null) {
		oscLog[1].emg = args
	}
	if (oscLog[1].pitch === null) {
		oscLog[1].pitch = args
	}
	if (oscLog[1].roll === null) {
		oscLog[1].roll = args
	}
	if (oscLog[1].gesture === null) {
		oscLog[1].gesture = args
	}
	// if (oscLog[1].hit === null) {
	// 	oscLog[1].hit = msg
	// }

	if (oscLog[0].myoId !== null 
		&& oscLog[0].emg !== null
		
		&& oscLog[0].pitch !== null
			
		&& oscLog[0].roll !== null
			
		&& oscLog[0].gesture !== null
			
		&& oscLog[0].hit !== null
			
	 	&& oscLog[1].myoId !== null
			
		&& oscLog[1].emg !== null
			
		&& oscLog[1].pitch !== null
			
		&& oscLog[1].roll !== null
			
		&& oscLog[1].gesture !== null
	) {
		// console.log(oscLog)



		// oscLog = [
		// 	{
		// 		myoId: null,
		// 		emg: null,
		// 		pitch: null,
		// 		roll: null,
		// 		gesture: null,
		// 		// hit: null
		// 	},
		// 	{
		// 		myoId: null,
		// 		emg: null,
		// 		pitch: null,
		// 		roll: null,
		// 		gesture: null,
		// 		// hit: null
		// 	}
		// ]



	}
*/
	
}

function throttle (callback, limit) {
    var waiting = false;                      
    return function () {                      
        if (!waiting) {                       
            callback.apply(this, arguments);  
            waiting = true;                   
            setTimeout(function () {          
                waiting = false;              
            }, limit);
        }
    }
}


var throttleLog = throttle(console.log, 200)

var sendOsc = function( myoId, msg, args ) {
	// formatOSC( myoId, msg, args )
	throttleLog( myoId, msg, args )
	// console.log(oscLog)
	
	

	var buf = osc.toBuffer({
		address: '/myo/' + myoId + '/' + msg,
		args: args
	});

	// udp.send(buf, 0, buf.length, outport, 'localhost');
	udp.send(buf, 0, buf.length, outport, '192.168.0.30');
};

// Myo stuff
var Myo = require('myo');
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



















