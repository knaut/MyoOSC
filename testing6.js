function getActiveGestureState(gestureOrientationState) {
    let activeGestures = [];

    for (let i = 0; i < gestureOrientationState.length; i++) {
        let gestureState = gestureOrientationState[i];
        for (let gesture in gestureState) {
            for (let orientation in gestureState[gesture]) {
                if (gestureState[gesture][orientation] === 1) {
                    activeGestures.push(`${gesture} at ${orientation}`);
                }
            }
        }
    }

    if (activeGestures.length === 0) {
        return "No active gesture";
    } else {
        return activeGestures.join(', ');
    }
}

// Example usage:
var gestureOrientationState = [
    {
        fist: {
            atSky: 0,
            atForward: 0,
            atGround: 0
        },
        waveOut: {
            atSky: 0,
            atForward: 1,
            atGround: 0
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
            atSky: 1,
            atForward: 0,
            atGround: 0
        },
        waveOut: {
            atSky: 0,
            atForward: 0,
            atGround: 0
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
];

console.log(getActiveGestureState(gestureOrientationState));  // Output: "waveOut at atForward, fist at atSky"
