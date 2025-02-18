function calculateScore() {
    let ksqInput = document.getElementById("ksq").value;
    let bsqInput = document.getElementById("bsq").value;

    let ksqScores = ksqInput.split(",").map(num => parseFloat(num.trim())).filter(num => !isNaN(num));

    if (ksqScores.length === 0) {
        document.getElementById("result").innerText = "❌ Xahiş edirik, KSQ qiymətlərini düzgün daxil edin!";
        return;
    }

    let ksqAverage = ksqScores.reduce((a, b) => a + b, 0) / ksqScores.length;

    if (bsqInput) {
        let bsqScore = parseFloat(bsqInput);
        if (isNaN(bsqScore)) {
            document.getElementById("result").innerText = "❌ Xahiş edirik BSQ qiymətini düzgün daxil edin!";
            return;
        }
        let finalScore = (ksqAverage * 0.6) + (bsqScore * 0.4);
        document.getElementById("result").innerText = `🎯 Sizin yekun balınız: ${finalScore.toFixed(2)}`;
    } else {
        document.getElementById("result").innerText = `📊 KSQ Ortalaması: ${ksqAverage.toFixed(2)}`;
    }
}
