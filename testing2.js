function getStateRepresentation(gestureState) {
    let stateStrings = [];

    // Loop through each object in gestureState array
    gestureState.forEach((state, index) => {
        // Check if any property value is 1
        const props = Object.keys(state);
        let objectString = `Object ${index + 1}:`;
        let foundOne = false;

        for (let i = 0; i < props.length; i++) {
            if (state[props[i]] === 1) {
                // Found a property that is 1
                objectString += ` ${props[i]}`;
                foundOne = true;
            }
        }

        if (foundOne) {
            stateStrings.push(objectString);
        }
    });

    // Join the state strings if there are multiple results
    return stateStrings.join(', ');
}

// Example usage:
const gestureState = [
    { fist: 0, waveOut: 0, waveIn: 0, fingersSpread: 0 },
    { fist: 0, waveOut: 1, waveIn: 0, fingersSpread: 0 }
];

// Assume we change values to 1 in both objects
// gestureState[0].fist = 1;

// Get the state representation
const representation = getStateRepresentation(gestureState);
console.log(representation); // Outputs: Object 1: fist, fingersSpread | Object 2: waveOut, fingersSpread
