var osc = require('osc-min');
var dgram = require('dgram');

var udp = dgram.createSocket('udp4');

// console.log(udp);

var outport;
if (process.argv[2]) {
	outport = parseInt(process.argv[2]);
} else {
	outport = 41234;
}

// console.log(outport);
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

// Myo stuff

var Myo = require('myo');

Myo.connect('com.stolksdorf.app');

Myo.on('fist', function() {
	console.log('Hello Myo!');
	this.vibrate();
})