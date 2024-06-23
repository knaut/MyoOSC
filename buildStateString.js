/*
	want to build OSC string messages with following patterns:

	0_fist
	0_fist_atSky
	0_fist_1_fist
	0_fist_1_fist_atSky
	0_fist_atSky_1_fist_atSky

*/

var gestHasOrientation = function(gest) {
	for (var orientation in gest) {
		if (gest[orientation]) {
			return orientation
		}
	}

	return false
}

var armHasGesture = function(arm) {
	for (var gestKey in arm) {
		var gest = arm[gestKey]

		var gestOri = gestHasOrientation(gest)

		if (gestOri) {
			return gestKey + '_' + gestOri
		}
	}

	return false
}



var buildStateString = function( state ) {
	var str = ''

	var leftGestString = armHasGesture( state[0] )
	var rightGestString = armHasGesture( state[1] )

	if (leftGestString) {
		leftGestString = '0_' + leftGestString

		str = leftGestString
	}

	if (rightGestString) {
		rightGestString = '1_' + rightGestString

		if (leftGestString) {
			str = str + '_' + rightGestString
		} else {
			str = rightGestString
		}
	}

	return str
	
}


module.exports = buildStateString
