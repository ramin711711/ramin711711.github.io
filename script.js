function calculateScore() {
    let ksqInput = document.getElementById("ksq").value;
    let bsqInput = document.getElementById("bsq").value;
    
    let ksqScores = ksqInput.split(",").map(num => parseFloat(num.trim())).filter(num => !isNaN(num));
    
    if (ksqScores.length === 0) {
        document.getElementById("result").innerText = "Xahiş edirik KSQ qiymətlərini düzgün daxil edin";
        document.getElementById("result").style.color = "red";
        return;
    }

    let ksqAverage = ksqScores.reduce((a, b) => a + b, 0) / ksqScores.length;
    
    if (bsqInput) {
        let bsqScore = parseFloat(bsqInput);
        if (isNaN(bsqScore)) {
            document.getElementById("result").innerText = "Xahiş edirik BSQ qiymətini düzgün daxil edin";
            document.getElementById("result").style.color = "red";
            return;
        }
        let finalScore = (ksqAverage * 0.6) + (bsqScore * 0.4);
        document.getElementById("result").innerText = finalScore.toFixed(2);
        document.getElementById("result").style.color = "#4caf50";  // Green for valid result
    } else {
        document.getElementById("result").innerText = ksqAverage.toFixed(2);
        document.getElementById("result").style.color = "#4caf50";  // Green for valid result
    }
}
