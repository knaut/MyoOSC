var buildStateString = require('./buildStateString')

var gOrStateTest = [
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
		atGround: 1
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
		atGround: 1
	}
}
]

var result = buildStateString( gOrStateTest, true )

console.log(result)
