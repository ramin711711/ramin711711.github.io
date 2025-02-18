function calculateScore() {
    // Get input values
    let ksqInput = document.getElementById("ksq").value;
    let bsqInput = document.getElementById("bsq").value;

    // Convert KSQ values into an array of numbers
    let ksqValues = ksqInput.split(",").map(num => parseFloat(num.trim())).filter(num => !isNaN(num));

    // Calculate KSQ Average
    let ksqSum = ksqValues.reduce((sum, num) => sum + num, 0);
    let ksqAverage = ksqValues.length > 0 ? ksqSum / ksqValues.length : 0;

    // Convert BSQ to number
    let bsqScore = parseFloat(bsqInput);
    if (isNaN(bsqScore)) bsqScore = 0; // Default to 0 if empty

    // Calculate final score (KSQ 40% + BSQ 60%)
    let finalScore = (ksqAverage * 0.4) + (bsqScore * 0.6);
    
    // Display the result
    document.getElementById("result").innerText = finalScore.toFixed(2);
}
