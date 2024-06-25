function getStateRepresentation(gestureState) {
    let stateString = "";

    // Loop through each object in gestureState array
    gestureState.forEach((state, index) => {
        // Check if any property value is 1
        const props = Object.keys(state);
        for (let i = 0; i < props.length; i++) {
            if (state[props[i]] === 1) {
                // Found the property that is 1, construct the string representation
                stateString = `Object ${index + 1}: ${props[i]}`;
                break; // Exit loop once found
            }
        }
    });

    return stateString;
}

// Example usage:
const gestureState = [
    { fist: 0, waveOut: 0, waveIn: 0, fingersSpread: 0 },
    { fist: 0, waveOut: 0, waveIn: 0, fingersSpread: 0 }
];

// Assume we change one of the values to 1
gestureState[0].fist = 1;
gestureState[1].fingersSpread = 1;

// Get the state representation
const representation = getStateRepresentation(gestureState);
console.log(representation); // Outputs: Object 1: fist