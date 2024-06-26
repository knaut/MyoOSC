module.exports = class ChangeTracker {
    constructor(timespan) {
        this.timespan = timespan;
        this.values = [];  // Array to store timestamped values
    }

    // Method to add a new value with timestamp
    addValue(value, timestamp) {
        let absValue = Math.abs(value)
        console.log(absValue)
        this.values.push({ value: absValue, timestamp });
        this.cleanupOldValues(timestamp);
    }

    // Method to clean up values older than the timespan
    cleanupOldValues(currentTimestamp) {
        while (this.values.length > 0 && currentTimestamp - this.values[0].timestamp > this.timespan) {
            this.values.shift();
        }
    }

    // Method to calculate the average change over the timespan
    calculateAverageChange() {
        if (this.values.length < 2) {
            return 0;  // Not enough data to calculate change
        }

        // Calculate change between the first and last values within the timespan
        let startValue = this.values[0].value;
        let endValue = this.values[this.values.length - 1].value;
        let change = endValue - startValue;

        // Calculate average change per millisecond
        let averageChange = change / this.timespan;

        return averageChange;
    }
}

/*
// Example usage:

// Initialize ChangeTracker for a 500 ms timespan
let changeTracker = new ChangeTracker(500);

// Simulate receiving noisy signal values every 100 ms
setInterval(() => {
    let noisyValue = Math.random() * 100;  // Example noisy signal value (replace with your actual value source)
    let timestamp = Date.now();  // Current timestamp

    // Add the noisy value to ChangeTracker
    changeTracker.addValue(noisyValue, timestamp);

    // Calculate and log the average change every 500 ms
    let averageChange = changeTracker.calculateAverageChange();
    console.log(`Average change over ${changeTracker.timespan} ms: ${averageChange.toFixed(2)}`);
}, 100);
*/