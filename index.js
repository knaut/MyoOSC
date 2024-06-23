// Myo setup
var Myo = require('myo');
var osc = require('osc-min');
var dgram = require('dgram');

var udp = dgram.createSocket('udp4');

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
	}
}
]

var buildStateString = function() {
	var str = ''
	var arr = ['', '']

	for (var i = 0; gOrState.length > i; i++) {
		var id = i;
		var arm = gOrState[i];

		for (var gest in arm) {
			var gestOr = arm[gest]

			// if (gestOr) {
			// 	str =+ id + '_' + gest + '_' 
			// }

			console.log({gestOr})

			var hasOri = false
			for (var ori in gestOr) {

				if ( gestOr[ori] ) {

					hasOri = true
					str = id + '_' + gest + '_' + ori

				}

			}

			if (hasOri) {
				arr[id] = str
			} else {
				arr[id] = ''
			}
		}
	}

	if (arr[0] && arr[1]) {
		return arr[0] + '_' + arr[1]
	}

	if (arr[0]) return arr[0]

	if (arr[1]) return arr[1]
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





/*
var buildGestureString = function( id, gestureString, state ) {
	// should result in ex: "0_fist_1_fist"
	// or send an OFF state if the gesture combo was exited?
	var otherArmId = (id === 0 ? 1 : 0)

	var currentOtherArmGestureState = gestureState[ otherArmId ]
	var currentOtherArmGestureString = ''

	// based on the state, was this the same gesture, so we toggle off?
	// var isLastGesture = false

	// for (var key in gestureState[ id ]) {
	// 	if (gestureState[ id ][ key ] === state) {

	// 	}
	// }

	// state var for gesture toggles
	for (var key of currentOtherArmGestureState) {
		var val = currentOtherArmGestureState[key]
		if (val === 1) {
			currentOtherArmGestureString = key
			break
		}
	}

	var dualGestureBase = 	id + '_' + gestureString + '_' + 
						otherArmId + '_' + currentOtherArmGestureString

	return dualGestureBase
}

var lastGestureString = ''
var lastDualGestureString = ''
var lastDualGestureOrientationString = ''

var updateGesturesOSC = function( id, gestureString, state ) {

	var newGestureString = buildGestureString( id, gestureString )

	gestureState[ id ][ gestureString ] = state

	var newGestureStringUpdated = buildGestureString( id, gestureString )
		
	var toggle = 1
	if (newGestureString === newGestureStringUpdated) {
		toggle = 0
	}

	console.log(newGestureString, newGestureStringUpdated, toggle)

	sendOsc(id, newGestureStringUpdated, toggle)




	// could also do "0_fist_atSky_1_fist_atGround"…
	// or 0_fist_1_fist_atSky…
	// etc.


}
*/




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

	/*
	var string = buildStateString()

	gestureState[id].fist = 1

	console.log(gestureState)

	var updatedString = buildStateString()

	var toggle = string === updatedString ? 0 : 1

	console.log(updatedString)
	*/
	

});

Myo.on('fist_off', function() {
	this.vibrate('short');
	var id = this.connectIndex;

	gestureState[id].fist = 0

	var updatedString = buildStateString()

	console.log(gestureState)
	console.log(updatedString)

});

Myo.on('wave_out', function() {
	this.vibrate('short');
	var id = this.connectIndex;

	gestureState[id].waveOut = 1

	console.log(gestureState)
});

Myo.on('wave_out_off', function() {
	this.vibrate('short');
	var id = this.connectIndex;

	gestureState[id].waveOut = 0

	console.log(gestureState)
});

Myo.on('wave_in', function() {
	this.vibrate('short');
	var id = this.connectIndex;

	gestureState[id].waveIn = 1

	console.log(gestureState)
});

Myo.on('wave_in_off', function() {
	this.vibrate('short');
	var id = this.connectIndex;

	gestureState[id].waveIn = 0

	console.log(gestureState)
});

Myo.on('fingers_spread', function() {
	this.vibrate('short');
	var id = this.connectIndex;

	gestureState[id].fingersSpread = 1

	console.log(gestureState)
});

Myo.on('fingers_spread_off', function() {
	this.vibrate('short');
	var id = this.connectIndex;

	gestureState[id].fingersSpread = 0

	console.log(gestureState)
});





























