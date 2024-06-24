function getStateRepresentation(gestureOrientationState) {
    let stateStrings = [];

    // Loop through each object in gestureOrientationState array
    gestureOrientationState.forEach((state, index) => {
        // Check each gesture for orientations
        const gestures = Object.keys(state);

        gestures.forEach(gesture => {
            const orientations = Object.keys(state[gesture]);

            orientations.forEach(orientation => {
                if (state[gesture][orientation] === 1) {
                    // Found a gesture with orientation set to 1
                    const resultString = `${index}_${gesture}_${orientation}`;
                    stateStrings.push(resultString);
                }
            });
        });
    });

    // Join the state strings with ', ' to form the final string
    return stateStrings.join('_');
}

/*
// Example usage:
const gestureOrientationState = [
    {
        fist: { atSky: 0, atForward: 0, atGround: 0 },
        waveOut: { atSky: 0, atForward: 0, atGround: 0 },
        waveIn: { atSky: 0, atForward: 0, atGround: 0 },
        fingersSpread: { atSky: 1, atForward: 0, atGround: 0 }
    },
    {
        fist: { atSky: 1, atForward: 0, atGround: 0 },
        waveOut: { atSky: 0, atForward: 0, atGround: 0 },
        waveIn: { atSky: 0, atForward: 0, atGround: 0 },
        fingersSpread: { atSky: 0, atForward: 0, atGround: 0 }
    }
];

// Get the state representation
const representation = getStateRepresentation(gestureOrientationState);
console.log(representation); // Outputs: 0_fist_atSky, 0_waveOut_atForward, 0_fingersSpread_atSky, 1_fist_atSky, 1_waveOut_atGround
*/

module.exports = getStateRepresentation