function calculateScore() {
    // Get input values
    let ksqInput = document.getElementById("ksq").value;
    let bsqInput = document.getElementById("bsq").value;

    // Convert KSQ values into an array of numbers
    let ksqValues = ksqInput.split(",").map(num => parseFloat(num.trim())).filter(num => !isNaN(num));

    // Ensure there are valid KQS values
    let ksqAverage = 0;
    if (ksqValues.length > 0) {
        let ksqSum = ksqValues.reduce((sum, num) => sum + num, 0);
        ksqAverage = ksqSum / ksqValues.length;
    }

    // Convert BSQ to number (default to 0 if empty)
    let bsqScore = parseFloat(bsqInput);
    if (isNaN(bsqScore)) bsqScore = 0;

    // Calculate the final score
    let finalScore = (ksqAverage * 0.4) + (bsqScore * 0.6);

    // Limit to max 3 decimal places without unnecessary zeros
    finalScore = parseFloat(finalScore.toFixed(3));

    // Display the result
    document.getElementById("result").innerText = finalScore;
}
