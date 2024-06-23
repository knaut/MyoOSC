var osc = require('osc-min');
var dgram = require('dgram');

var udp = dgram.createSocket('udp4');

var outport;
if (process.argv[2]) {
	outport = parseInt(process.argv[2]);
} else {
	outport = 41234;
}

console.log('OSC Port:', outport);

function throttle (callback, limit) {
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

var sendOsc = function( myoId, msg, args ) {
	var buf = osc.toBuffer({
		address: '/myo/' + myoId + '/' + msg,
		args: args
	});

	// udp.send(buf, 0, buf.length, outport, 'localhost');
	udp.send(buf, 0, buf.length, outport, '192.168.0.30');
};

// Myo setup
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


var throttleLog = throttle(console.log, 200)

var orientationVals = [
	{
		atSky: 0,
		atForward: 0,
		atGround: 0,
		fist: 0,
		fingersSpread: 0,
		waveOut: 0,
		waveIn: 0
	},
	{
		atSky: 0,
		atForward: 0,
		atGround: 0,
		fist: 0,
		fingersSpread: 0,
		waveOut: 0,
		waveIn: 0
	},
]

function sendDualGesture(leftGesture, rightGesture, orientation, value) {

	if (orientationVals[0][orientation] && orientationVals[1][orientation]) {
		
		if (orientationVals[0][leftGesture] && orientationVals[1][rightGesture]) {

			sendOsc(3, `0_${leftGesture}_1_${rightGesture}_${orientation}`, value)
		} else {

			sendOsc(3, `0_${leftGesture}_1_${rightGesture}_${orientation}`, 0)
		}

	} else {
		sendOsc(3, `0_${leftGesture}_1_${rightGesture}_${orientation}`, 0)
	}
}

/*
function sendDualGesture(leftGesture, rightGesture, value) {
	if (orientationVals[0].atSky && orientationVals[1].atSky) {
		// console.log(orientationVals, leftGesture, rightGesture, value)
		if (orientationVals[0][leftGesture] && orientationVals[1][rightGesture]) {

			sendOsc(3, `0_${leftGesture}_1_${rightGesture}_atSky`, value)	
		}
	}

	if (orientationVals[0].atForward && orientationVals[1].atForward) {
		if (orientationVals[0][leftGesture] && orientationVals[1][rightGesture]) {
			sendOsc(3, `0_${leftGesture}_1_${rightGesture}_atForward`, value)	
		}
	}

	if (orientationVals[0].atGround && orientationVals[1].atGround) {
		if (orientationVals[0][leftGesture] && orientationVals[1][rightGesture]) {
			sendOsc(3, `0_${leftGesture}_1_${rightGesture}_atGround`, value)	
		}
	}
}
*/


// EMG
Myo.on('emg', function(data) {
	sendOsc(this.connectIndex, 'emg', data);
});

// Orientation
Myo.on('orientation', function(data) {
	var quat = this.lastQuant;

	var roll = Math.atan2(2 * (quat.w * quat.x + quat.y * quat.z), 1 - 2 * (quat.x * quat.x + quat.y * quat.y) );
	var pitch = (Math.asin(2 * (quat.w * quat.y - quat.z * quat.x ) )) * -1;
	// we don't actually use yaw
	// var yaw;

	sendOsc(this.connectIndex, 'roll', roll);
	sendOsc(this.connectIndex, 'pitch', pitch);

	// atForward
	if (pitch < 0.4 && pitch > -0.6) {
		sendOsc(this.connectIndex, 'atForward', 1);

		orientationVals[this.connectIndex].atForward = 1

	} else {
		sendOsc(this.connectIndex, 'atForward', 0);
		sendOsc(this.connectIndex, 'fist_atForward', 0)
		sendOsc(this.connectIndex, 'fingersSpread_atForward', 0)
		sendOsc(this.connectIndex, 'waveIn_atForward', 0)
		sendOsc(this.connectIndex, 'waveOut_atForward', 0)

		orientationVals[this.connectIndex].atForward = 0
	}

	// atGround
	if (pitch < -0.6) {
		sendOsc(this.connectIndex, 'atGround', 1);

		orientationVals[this.connectIndex].atGround = 1

	} else {
		sendOsc(this.connectIndex, 'atGround', 0);
		sendOsc(this.connectIndex, 'fist_atGround', 0)
		sendOsc(this.connectIndex, 'fingersSpread_atGround', 0)
		sendOsc(this.connectIndex, 'waveIn_atGround', 0)
		sendOsc(this.connectIndex, 'waveOut_atGround', 0)

		orientationVals[this.connectIndex].atGround = 0
	}

	// atSky
	if (pitch > 0.4) {
		sendOsc(this.connectIndex, 'atSky', 1);

		orientationVals[this.connectIndex].atSky = 1

	} else {
		sendOsc(this.connectIndex, 'atSky', 0);
		sendOsc(this.connectIndex, 'fist_atSky', 0)
		sendOsc(this.connectIndex, 'fingersSpread_atSky', 0)
		sendOsc(this.connectIndex, 'waveIn_atSky', 0)
		sendOsc(this.connectIndex, 'waveOut_atSky', 0)

		orientationVals[this.connectIndex].atSky = 0
		
	}

});

// Poses
// Fist
Myo.on('fist', function() {
	this.vibrate('short');
	sendOsc(this.connectIndex, 'fist', 1);
	orientationVals[this.connectIndex].fist = 1;

	// single gestures
	if (orientationVals[this.connectIndex].atSky) {
		sendOsc(this.connectIndex, 'fist_atSky', 1)
	}

	if (orientationVals[this.connectIndex].atForward) {
		sendOsc(this.connectIndex, 'fist_atForward', 1)
	}

	if (orientationVals[this.connectIndex].atGround) {
		sendOsc(this.connectIndex, 'fist_atGround', 1)
	}

	// dual gestures (fist)
	// sendDualGesture('fist', 'fist', 1)

	sendDualGesture('fist', 'fist', 'atSky', 1)
	sendDualGesture('fist', 'fist', 'atForward', 1)
	sendDualGesture('fist', 'fist', 'atGround', 1)

	sendDualGesture('fist', 'waveOut', 'atSky', 1)
	sendDualGesture('fist', 'waveOut', 'atForward', 1)
	sendDualGesture('fist', 'waveOut', 'atGround', 1)

	sendDualGesture('fist', 'waveIn', 'atSky', 1)
	sendDualGesture('fist', 'waveIn', 'atForward', 1)
	sendDualGesture('fist', 'waveIn', 'atGround', 1)

	sendDualGesture('fist', 'fingersSpread', 'atSky', 1)
	sendDualGesture('fist', 'fingersSpread', 'atForward', 1)
	sendDualGesture('fist', 'fingersSpread', 'atGround', 1)

	// sendDualGesture('fist', 'waveIn', 'atForward', 1)
	// sendDualGesture('fist', 'fingersSpread', 'atGround', 1)

/*
	sendDualGesture('fist', 'waveOut', 1)
	sendDualGesture('fist', 'waveIn', 1)
	sendDualGesture('fist', 'fingersSpread', 1)

	sendDualGesture('waveOut', 'fist', 1)
	sendDualGesture('waveIn', 'fist', 1)
	sendDualGesture('fingersSpread', 'fist', 1)
*/


});

Myo.on('fist_off', function() {
	this.vibrate('short');
	orientationVals[this.connectIndex].fist = 0

	sendOsc(this.connectIndex, 'fist', 0);
	sendOsc(this.connectIndex, 'fist_atSky', 0)
	sendOsc(this.connectIndex, 'fist_atForward', 0)
	sendOsc(this.connectIndex, 'fist_atGround', 0)
	

	// if (orientationVals[0].atSky && orientationVals[1].atSky) {
		// sendOsc(3, '0_fist_1_fist_atSky', 0)
		
	// }

	sendDualGesture('fist', 'fist', 'atSky', 0)
	sendDualGesture('fist', 'fist', 'atForward', 0)
	sendDualGesture('fist', 'fist', 'atGround', 0)

	sendDualGesture('fist', 'waveOut', 'atSky', 0)
	sendDualGesture('fist', 'waveOut', 'atForward', 0)
	sendDualGesture('fist', 'waveOut', 'atGround', 0)

	sendDualGesture('fist', 'waveIn', 'atSky', 0)
	sendDualGesture('fist', 'waveIn', 'atForward', 0)
	sendDualGesture('fist', 'waveIn', 'atGround', 0)

	sendDualGesture('fist', 'fingersSpread', 'atSky', 0)
	sendDualGesture('fist', 'fingersSpread', 'atForward', 0)
	sendDualGesture('fist', 'fingersSpread', 'atGround', 0)


	// sendDualGesture('fist', 'waveIn', 'atForward', 0)
	// sendDualGesture('fist', 'fingersSpread', 'atGround', 0)
	

	// dual gesture off signals

	// console.log(orientationVals)

	// sendDualGesture('fist', 'fist', 0)

	/*
	if (this.connectIndex === 0) {
		sendDualGesture('fist', 'waveOut', 0)
		sendDualGesture('fist', 'waveIn', 0)
		sendDualGesture('fist', 'fingersSpread', 0)
	}

	if (this.connectIndex === 1) {
		sendDualGesture('waveOut', 'fist', 0)
		sendDualGesture('waveIn', 'fist', 0)
		sendDualGesture('fingersSpread', 'fist', 0)
	}
	*/
	
});

// Wave In
Myo.on('wave_in', function() {
	this.vibrate('short');
	orientationVals[this.connectIndex].waveIn = 1;
	
	sendOsc(this.connectIndex, 'wave_in', 1);

	if (orientationVals[this.connectIndex].atSky) {
		sendOsc(this.connectIndex, 'waveIn_atSky', 1)
	}

	if (orientationVals[this.connectIndex].atForward) {
		sendOsc(this.connectIndex, 'waveIn_atForward', 1)
	}

	if (orientationVals[this.connectIndex].atGround) {
		sendOsc(this.connectIndex, 'waveIn_atGround', 1)
	}



	// dual gestures (fist, waveIn)
	/*
	if (orientationVals[0].atSky && orientationVals[1].atSky) {
		if (orientationVals[0].fist && orientationVals[1].waveIn) {
			sendOsc(3, '0_fist_1_waveIn_atSky', 1)	
		}
	}

	if (orientationVals[0].atForward && orientationVals[1].atForward) {
		if (orientationVals[0].fist && orientationVals[1].waveIn) {
			sendOsc(3, '0_fist_1_waveIn_atForward', 1)	
		}
	}

	if (orientationVals[0].atGround && orientationVals[1].atGround) {
		if (orientationVals[0].fist && orientationVals[1].waveIn) {
			sendOsc(3, '0_fist_1_waveIn_atGround', 1)	
		}
	}
	*/


});

Myo.on('wave_in_off', function() {
	this.vibrate('short');
	orientationVals[this.connectIndex].waveIn = 0;

	sendOsc(this.connectIndex, 'wave_in', 0);
	sendOsc(this.connectIndex, 'waveIn_atSky', 0)
	sendOsc(this.connectIndex, 'waveIn_atForward', 0)
	sendOsc(this.connectIndex, 'waveIn_atGround', 0)

	sendDualGesture('fist', 'waveIn', 'atSky', 0)
	sendDualGesture('fist', 'waveIn', 'atForward', 0)
	sendDualGesture('fist', 'waveIn', 'atGround', 0)
});

// Wave Out
Myo.on('wave_out', function() {
	this.vibrate('short');
	orientationVals[this.connectIndex].waveOut = 1;

	sendOsc(this.connectIndex, 'wave_out', 1);

	if (orientationVals[this.connectIndex].atSky) {
		sendOsc(this.connectIndex, 'waveOut_atSky', 1)
	}

	if (orientationVals[this.connectIndex].atForward) {
		sendOsc(this.connectIndex, 'waveOut_atForward', 1)
	}

	if (orientationVals[this.connectIndex].atGround) {
		sendOsc(this.connectIndex, 'waveOut_atGround', 1)
	}

	// dual gestures (fist, waveOut)
	if (orientationVals[0].atSky && orientationVals[1].atSky) {
		if (orientationVals[0].fist && orientationVals[1].waveOut) {
			sendOsc(3, '0_fist_1_waveOut_atSky', 1)	
		}
	}

	if (orientationVals[0].atForward && orientationVals[1].atForward) {
		if (orientationVals[0].fist && orientationVals[1].waveOut) {
			sendOsc(3, '0_fist_1_waveOut_atForward', 1)	
		}
	}

	if (orientationVals[0].atGround && orientationVals[1].atGround) {
		if (orientationVals[0].fist && orientationVals[1].waveOut) {
			sendOsc(3, '0_fist_1_waveOut_atGround', 1)	
		}
	}
});

Myo.on('wave_out_off', function() {
	this.vibrate('short');
	orientationVals[this.connectIndex].waveOut = 0;

	sendOsc(this.connectIndex, 'wave_out', 0);
	sendOsc(this.connectIndex, 'waveOut_atSky', 0)
	sendOsc(this.connectIndex, 'waveOut_atForward', 0)
	sendOsc(this.connectIndex, 'waveOut_atGround', 0)

	if (this.connectIndex === 1) {
		sendOsc(3, '0_fist_1_waveOut_atSky', 0)
		sendOsc(3, '0_fist_1_waveOut_atForward', 0)
		sendOsc(3, '0_fist_1_waveOut_atGround', 0)
	}
});

// Fingers Spread
Myo.on('fingers_spread', function() {
	this.vibrate('short');
	sendOsc(this.connectIndex, 'fingers_spread', 1);

	if (orientationVals[this.connectIndex].atSky) {
		sendOsc(this.connectIndex, 'fingersSpread_atSky', 1)
	}

	if (orientationVals[this.connectIndex].atForward) {
		sendOsc(this.connectIndex, 'fingersSpread_atForward', 1)
	}

	if (orientationVals[this.connectIndex].atGround) {
		sendOsc(this.connectIndex, 'fingersSpread_atGround', 1)
	}
});

Myo.on('fingers_spread_off', function() {
	this.vibrate('short');
	sendOsc(this.connectIndex, 'fingers_spread', 0);
	sendOsc(this.connectIndex, 'fingersSpread_atSky', 0)
	sendOsc(this.connectIndex, 'fingersSpread_atForward', 0)
	sendOsc(this.connectIndex, 'fingersSpread_atGround', 0)
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



















