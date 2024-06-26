// let emgReadings = []

module.exports = function calculateRMS(reading, readings) {
  let value = 0

  if (readings.length < 30)  {

    readings.push(reading)

  } else {

    let sumOfSquares = 0;
    const n = readings.length;

    // Calculate the sum of the squares of the readings
    for (let i = 0; i < n; i++) {
      sumOfSquares += readings[i] * readings[i];
    }

    // Calculate the mean of the squares
    const meanOfSquares = sumOfSquares / n;

    // Return the square root of the mean of squares
    return Math.sqrt(meanOfSquares);

  }

  return value
  
}

// Example usage:
// const readings = [1, 2, 3, 4, 5]; // Replace with actual sensor values
// const rmsValue = calculateRMS(readings);
// console.log(rmsValue);
