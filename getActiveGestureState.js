function getActiveGestureState(gestureOrientationState) {
    let activeGestures = [];
    let combinedGestures = [];

    for (let i = 0; i < gestureOrientationState.length; i++) {
        let gestureState = gestureOrientationState[i];
        for (let gesture in gestureState) {
            for (let orientation in gestureState[gesture]) {
                if (gestureState[gesture][orientation] === 1) {
                    activeGestures.push(`${i}_${gesture}`);
                    activeGestures.push(`${i}_${gesture}_${orientation}`);
                    combinedGestures.push(`${i}_${gesture}_${orientation}`);
                }
            }
        }
    }

    if (combinedGestures.length > 1) {
        activeGestures.push(`${combinedGestures.join('_')}`);
    }

    return activeGestures.length === 0 ? ["No active gesture"] : activeGestures;
}

module.exports = getActiveGestureState