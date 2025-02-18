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

    // **Correct Calculation: KSQ 40% + BSQ 60%**
    let finalScore = (ksqAverage * 0.4) + (bsqScore * 0.6);

    // **Fix Decimal Rounding Issue**
    finalScore = Math.round(finalScore * 10) / 10; // Keeps one decimal place

    // Display the result
    document.getElementById("result").innerText = finalScore.toFixed(1);
}
