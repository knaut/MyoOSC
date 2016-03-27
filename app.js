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

var sendOsc = function( myoId, msg, args ) {
	var buf = osc.toBuffer({
		address: '/myo/' + myo + '/' + msg,
		args: args
	});
}

// Myo stuff

var Myo = require('myo');
Myo.connect('com.stolksdorf.app');


Myo.on('connected', function() {
	console.log('unlock', this);
	Myo.setLockingPolicy('none');
	this.unlock('hold');

});

Myo.on('arm_sync', function() {
	console.log('sync');
	this.locked = false;
})

// Myo.on('fist', function() {
// 	console.log('Hello Myo!');
// 	this.vibrate();
// 	console.log(this);
// });

