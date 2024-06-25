function getActiveGestureState(gestureOrientationState) {
    let activeGestures = [];
    let combinedGestures = [];

    for (let i = 0; i < gestureOrientationState.length; i++) {
        let gestureState = gestureOrientationState[i];
        for (let gesture in gestureState) {
            for (let orientation in gestureState[gesture]) {
                if (gestureState[gesture][orientation] === 1) {
                    activeGestures.push(`Index ${i}: ${gesture}`);
                    activeGestures.push(`Index ${i}: ${gesture} at ${orientation}`);
                    combinedGestures.push(`Index ${i}: ${gesture} at ${orientation}`);
                }
            }
        }
    }

    if (combinedGestures.length > 1) {
        activeGestures.push(`Combined: ${combinedGestures.join(' and ')}`);
    }

    return activeGestures.length === 0 ? ["No active gesture"] : activeGestures;
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

console.log(getActiveGestureState(gestureOrientationState));
