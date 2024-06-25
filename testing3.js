function getStateRepresentation(gestureOrientationState) {
    let stateStrings = [];

    // Loop through each object in gestureOrientationState array
    gestureOrientationState.forEach((state, index) => {
        // Check each gesture for orientations
        const gestures = Object.keys(state);
        let objectString = `Object ${index + 1}:`;

        gestures.forEach(gesture => {
            const orientations = Object.keys(state[gesture]);
            orientations.forEach(orientation => {
                if (state[gesture][orientation] === 1) {
                    // Found a gesture with orientation set to 1
                    objectString += ` ${gesture}.${orientation}`;
                }
            });
        });

        if (objectString !== `Object ${index + 1}:`) {
            stateStrings.push(objectString);
        }
    });

    // Join the state strings if there are multiple results
    return stateStrings.join(', ');
}

// Example usage:
const gestureOrientationState = [
    {
        fist: { atSky: 0, atForward: 0, atGround: 0 },
        waveOut: { atSky: 0, atForward: 0, atGround: 0 },
        waveIn: { atSky: 0, atForward: 0, atGround: 0 },
        fingersSpread: { atSky: 0, atForward: 0, atGround: 0 }
    },
    {
        fist: { atSky: 0, atForward: 0, atGround: 0 },
        waveOut: { atSky: 0, atForward: 0, atGround: 1 },
        waveIn: { atSky: 0, atForward: 0, atGround: 0 },
        fingersSpread: { atSky: 0, atForward: 0, atGround: 0 }
    }
];

// Get the state representation
const representation = getStateRepresentation(gestureOrientationState);
console.log(representation);
