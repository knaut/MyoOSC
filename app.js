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

console.log('OSC Port:', outport, 'hello test');

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

function finiteDifferenceMethod(alpha, L, T, nx, nt) {
    // Parameters
    let dx = L / (nx - 1);  // Spatial step
    let dt = T / nt;        // Temporal step
    let r = alpha * dt / (dx * dx);  // Stability criterion
    
    // Initial conditions
    let u = [];  // Temperature distribution array
    for (let i = 0; i < nx; i++) {
        u[i] = Math.sin(Math.PI * i * dx / L);  // Initial temperature profile (sinusoidal)
    }
    
    // Time stepping loop
    for (let k = 0; k < nt; k++) {
        let u_new = [];
        
        // Boundary conditions (fixed at ends)
        u_new[0] = 0;     // u(0, t) = 0
        u_new[nx - 1] = 0;  // u(L, t) = 0
        
        // Interior points
        for (let i = 1; i < nx - 1; i++) {
            u_new[i] = u[i] + r * (u[i + 1] - 2 * u[i] + u[i - 1]);
        }
        
        // Update u for the next time step
        u = u_new.slice();
    }
    
    return u;
}

// Example usage:
let alpha = 0.1;  // Thermal diffusivity
let L = 1.0;      // Length of the rod
let T = 1.0;      // Total time
let nx = 5;      // Number of spatial grid points
let nt = 1000;    // Number of time steps

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

// EMG
Myo.on('emg', function(data) {
	sendOsc(this.connectIndex, 'emg', data);

	/*
	if(this.connectIndex === 1) {
		let result = finiteDifferenceMethod( data[0] , L, T, nx, nt);

		// var sum = result.reduce(function(acc, curr) {
		// 	return acc + curr
		// }, result[0] )

		var mySum = 0;
		for (let i = 0; result.length > i; ++i) {
			mySum = mySum + result[i]
		}

		// mySum = mySum/result.length

		throttleLog(data[0], mySum)
	}
	*/

	
});

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

	if (orientationVals[this.connectIndex].atSky) {
		sendOsc(this.connectIndex, 'fist_atSky', 1)
	}

	if (orientationVals[this.connectIndex].atForward) {
		sendOsc(this.connectIndex, 'fist_atForward', 1)
	}

	if (orientationVals[this.connectIndex].atGround) {
		sendOsc(this.connectIndex, 'fist_atGround', 1)
	}

});

Myo.on('fist_off', function() {
	this.vibrate('short');

	orientationVals[this.connectIndex].fist = 0

	sendOsc(this.connectIndex, 'fist', 0);
	sendOsc(this.connectIndex, 'fist_atSky', 0)
	sendOsc(this.connectIndex, 'fist_atForward', 0)
	sendOsc(this.connectIndex, 'fist_atGround', 0)
	
});

// Wave In
Myo.on('wave_in', function() {
	this.vibrate('short');
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
});

Myo.on('wave_in_off', function() {
	this.vibrate('short');
	sendOsc(this.connectIndex, 'wave_in', 0);
	sendOsc(this.connectIndex, 'waveIn_atSky', 0)
	sendOsc(this.connectIndex, 'waveIn_atForward', 0)
	sendOsc(this.connectIndex, 'waveIn_atGround', 0)
});

// Wave Out
Myo.on('wave_out', function() {
	this.vibrate('short');
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
});

Myo.on('wave_out_off', function() {
	this.vibrate('short');
	sendOsc(this.connectIndex, 'wave_out', 0);
	sendOsc(this.connectIndex, 'waveOut_atSky', 0)
	sendOsc(this.connectIndex, 'waveOut_atForward', 0)
	sendOsc(this.connectIndex, 'waveOut_atGround', 0)
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



















