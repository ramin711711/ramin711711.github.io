/* ===========================
   script.js — Full final JS
   =========================== */

/* --------- Utilities --------- */
const $ = sel => document.querySelector(sel);
const $$ = sel => Array.from(document.querySelectorAll(sel));
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const toFixedSmart = (num, d = 3) => {
  if (typeof num !== 'number' || Number.isNaN(num)) return '0';
  const s = Number(num).toFixed(d);
  return s.replace(/\.?0+$/, '');
};

/* --------- i18n strings --------- */
const I18N = {
  az: {
    title: "Akademik Qiymət Hesablama",
    calcTitle: "📊 KQS və BSQ daxil edin",
    ksq: "📊 KQS qiymətləri (vergüllə ayırın):",
    bsq: "📝 BSQ qiyməti (əgər varsa):",
    scheme: "🎯 Qiymətləndirmə sistemi:",
    result: "Nəticə:",
    history: "📈 Nəticə tarixi",
    exam: "⏳ İmtahana geri sayım",
    azBadge: "🇦🇿 40/60",
    weightNote: "AZ default 40/60 saxlanılıb. Custom seçsən, sürüşdür.",
    needKQS: "Ən azı bir KQS qiyməti daxil edin.",
    saved: "Nəticə yadda saxlandı.",
    cleared: "Tarix təmizləndi.",
    tipHigh: "Möhtəşəm! Sabit performans üçün həftəlik planını qoruyub saxla.",
    tipImproveK: "KQS ortalamanız BSQ-dan aşağıdır: həftəlik test və praktikanı artır.",
    tipImproveB: "BSQ aşağıdır: imtahan strategiyası və sınaq testlərinə fokuslan.",
    countdown: "Geri sayım:",
    days: "gün",
    pdfTitle: "Akademik Hesabat",
    shareText: "Mənim akademik nəticəm:",
    csvHeader: "Tarix,KQS Orta,BSQ,Nəticə,Sxem"
  },
  en: {
    title: "Academic Grade Calculator",
    calcTitle: "📊 Enter Scores",
    ksq: "📊 Assignment / Exam scores (comma-separated):",
    bsq: "📝 Final Exam score (if applicable):",
    scheme: "🎯 Grading scheme:",
    result: "Result:",
    history: "📈 Score history",
    exam: "⏳ Exam countdown",
    azBadge: "🇦🇿 40/60",
    weightNote: "AZ default 40/60 preserved. Choose Custom to adjust.",
    needKQS: "Enter at least one score.",
    saved: "Result saved.",
    cleared: "History cleared.",
    tipHigh: "Excellent! Keep a weekly routine to stay consistent.",
    tipImproveK: "Assignment/exam average is lower than final: add drills and practice.",
    tipImproveB: "Final exam score is lower: focus on exam strategy and timed mocks.",
    countdown: "Countdown:",
    days: "days",
    pdfTitle: "Academic Report",
    shareText: "My academic result:",
    csvHeader: "Date,KQS Avg,BSQ,Final,Scheme"
  }
};

/* --------- App state & elements --------- */
let currentLang = localStorage.getItem('lang') || 'az';
const darkToggle = $('#darkToggle');

const schemeSelect = $('#schemeSelect');
const customWeights = $('#customWeights');
const kqsWeight = $('#kqsWeight');
const bsqWeight = $('#bsqWeight');
const kqsWeightVal = $('#kqsWeightVal');
const bsqWeightVal = $('#bsqWeightVal');

const ksqInput = $('#ksq');
const bsqInput = $('#bsq');
const btnCalc = $('#btn-calc');
const btnSave = $('#btn-save');
const btnClear = $('#btn-clear');
const btnCSV = $('#btn-csv');
const btnPDF = $('#btn-pdf');
const btnShare = $('#btn-share');

const resultEl = $('#result');
const convertedEl = $('#converted');
const tipsBox = $('#tipsBox');

const yearEl = $('#year');

/* Chart / history */
let history = JSON.parse(localStorage.getItem('history') || '[]');
let chart = null;

/* --------- Helpers: translations & UI --------- */
function applyLang(lang) {
  currentLang = lang;
  const t = I18N[lang] || I18N.az;
  $('#title-text').textContent = t.title;
  $('#calc-title').textContent = t.calcTitle;
  $('#label-ksq').innerHTML = `<strong>${t.ksq}</strong>`;
  $('#label-bsq').innerHTML = `<strong>${t.bsq}</strong>`;
  $('#label-scheme').innerHTML = `<strong>${t.scheme}</strong>`;
  $('#label-result').textContent = t.result;
  $('#history-title').textContent = t.history;
  $('#exam-title').textContent = t.exam;
  $('#az-badge').textContent = t.azBadge;
  $('#weight-note').textContent = t.weightNote;
  localStorage.setItem('lang', lang);
}
$$('.chip[data-lang]').forEach(btn => {
  btn.addEventListener('click', () => applyLang(btn.dataset.lang));
});
applyLang(currentLang);

/* Footer year */
yearEl.textContent = new Date().getFullYear();

/* Dark mode (left intact) */
if (localStorage.getItem('dark') === '1') {
  darkToggle.checked = true;
  document.documentElement.classList.add('dark');
}
darkToggle.addEventListener('change', () => {
  document.documentElement.classList.toggle('dark', darkToggle.checked);
  localStorage.setItem('dark', darkToggle.checked ? '1' : '0');
});

/* --------- Weight sliders handling --------- */
function updateWeightLabels() {
  kqsWeightVal.textContent = kqsWeight.value;
  const comp = 100 - Number(kqsWeight.value);
  bsqWeight.value = comp;
  bsqWeightVal.textContent = comp;
}
kqsWeight.addEventListener('input', () => {
  updateWeightLabels();
  if (schemeSelect.value === 'custom') computeAndDisplay();
});
updateWeightLabels();

schemeSelect.addEventListener('change', () => {
  customWeights.classList.toggle('hidden', schemeSelect.value !== 'custom');
  updateKQSBSQLabels();
  computeAndDisplay();
});

/* --------- KQS/BSQ label adjustment (dynamic text) --------- */
function updateKQSBSQLabels() {
  const t = I18N[currentLang] || I18N.az;
  if (schemeSelect.value === 'az' || schemeSelect.value === 'custom') {
    $('#label-ksq').innerHTML = `<strong>${t.ksq}</strong>`;
    $('#label-bsq').innerHTML = `<strong>${t.bsq}</strong>`;
    $('#bsq').parentElement.style.display = 'block';
  } else {
    // For US, UK, ECTS — change the wording to be generic for those systems
    if (currentLang === 'az') {
      $('#label-ksq').innerHTML = `<strong>📊 Qiymətlər '%' (vergüllə ayırın):</strong>`;
      $('#label-bsq').innerHTML = `<strong>📝 Əlavə imtahan / Final (əgər varsa):</strong>`;
    } else {
      $('#label-ksq').innerHTML = `<strong>📊 All scores (comma-separated):</strong>`;
      $('#label-bsq').innerHTML = `<strong>📝 Extra exam / Final (if any):</strong>`;
    }
    $('#bsq').parentElement.style.display = 'block';
  }
}

/* --------- Parsing KQS --------- */
function parseKQS(input) {
  if (!input) return [];
  return input.split(',')
    .map(s => parseFloat(s.trim()))
    .filter(n => !Number.isNaN(n));
}

/* --------- Core Calculations --------- */
function calcAZ(ksqArray, bsq) {
  const kAvg = ksqArray.length ? (ksqArray.reduce((a, b) => a + b, 0) / ksqArray.length) : 0;
  const b = Number.isFinite(bsq) ? bsq : 0;
  const final = kAvg * 0.4 + b * 0.6;
  return { kAvg, final };
}

function calcCustom(ksqArray, bsq, kWeightPercent) {
  const kAvg = ksqArray.length ? (ksqArray.reduce((a, b) => a + b, 0) / ksqArray.length) : 0;
  const b = Number.isFinite(bsq) ? bsq : 0;
  const kw = clamp(Number(kWeightPercent) / 100, 0, 1);
  const bw = 1 - kw;
  const final = kAvg * kw + b * bw;
  return { kAvg, final };
}

/* --------- Converters --------- */
function toUSGPA(score) {
  // Using common US mapping (fine-grained), return exact GPA decimal
  let grade, gpa;
  if (score >= 93) { grade = 'A'; gpa = 4.0; }
  else if (score >= 90) { grade = 'A-'; gpa = 3.7; }
  else if (score >= 87) { grade = 'B+'; gpa = 3.3; }
  else if (score >= 83) { grade = 'B'; gpa = 3.0; }
  else if (score >= 80) { grade = 'B-'; gpa = 2.7; }
  else if (score >= 77) { grade = 'C+'; gpa = 2.3; }
  else if (score >= 73) { grade = 'C'; gpa = 2.0; }
  else if (score >= 70) { grade = 'C-'; gpa = 1.7; }
  else if (score >= 67) { grade = 'D+'; gpa = 1.3; }
  else if (score >= 65) { grade = 'D'; gpa = 1.0; }
  else { grade = 'F'; gpa = 0.0; }
  return { grade, gpa };
}

function toUKClass(final) {
  if (final >= 70) return { percent: final, class: 'First Class (1st)' };
  if (final >= 60) return { percent: final, class: 'Upper Second (2:1)' };
  if (final >= 50) return { percent: final, class: 'Lower Second (2:2)' };
  if (final >= 40) return { percent: final, class: 'Third' };
  return { percent: final, class: 'Fail' };
}

function toECTS(final) {
  if (final >= 90) return { grade: 'A' };
  if (final >= 80) return { grade: 'B' };
  if (final >= 70) return { grade: 'C' };
  if (final >= 60) return { grade: 'D' };
  if (final >= 50) return { grade: 'E' };
  return { grade: 'F' };
}

/* --------- Chart & history --------- */
function initChart() {
  const canvas = document.getElementById('historyChart');
  if (!canvas) return;
  if (window.Chart && !chart) {
    chart = new Chart(canvas.getContext('2d'), {
      type: 'line',
      data: {
        labels: history.map(h => h.date),
        datasets: [{
          label: 'Final',
          data: history.map(h => h.final),
          tension: 0.25,
          borderColor: '#0d6efd',
          backgroundColor: 'rgba(13,110,253,0.15)',
          fill: true
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: { y: { suggestedMin: 0, suggestedMax: 100 } }
      }
    });
  }
}

function updateChart() {
  if (!chart) { initChart(); return; }
  chart.data.labels = history.map(h => h.date);
  chart.data.datasets[0].data = history.map(h => h.final);
  chart.update();
}

/* --------- Result display & compute --------- */
function showTips(kAvg, bsq, final) {
  const t = I18N[currentLang] || I18N.az;
  let msg = '';
  if (final >= 90) msg = t.tipHigh;
  else if (kAvg < bsq) msg = t.tipImproveK;
  else msg = t.tipImproveB;
  tipsBox.textContent = msg;
}

function computeAndDisplay() {
  const t = I18N[currentLang] || I18N.az;
  const ksqArr = parseKQS(ksqInput.value || '');

  // For AZ/custom we require at least one KQS
  if ((schemeSelect.value === 'az' || schemeSelect.value === 'custom') && ksqArr.length === 0) {
    resultEl.textContent = '—';
    convertedEl.textContent = '';
    tipsBox.textContent = t.needKQS;
    return null;
  }

  const bsqRaw = bsqInput.value;
  const bsq = (bsqRaw === '' || bsqRaw === null) ? NaN : parseFloat(bsqRaw);

  // Determine base result depending on scheme:
  // - az -> 40/60 weighting
  // - custom -> user weighting
  // - us/uk/ects -> simple average of all provided scores (ksq list + bsq if present)
  let base = { kAvg: 0, final: 0 };
  if (schemeSelect.value === 'az') {
    base = calcAZ(ksqArr, bsq);
  } else if (schemeSelect.value === 'custom') {
    base = calcCustom(ksqArr, bsq, Number(kqsWeight.value));
  } else {
    // GPA/UK/ECTS: average all numeric inputs (if none -> prompt)
    const allScores = [];
    if (ksqArr.length) allScores.push(...ksqArr);
    if (Number.isFinite(bsq)) allScores.push(bsq);
    if (allScores.length === 0) {
      resultEl.textContent = '—';
      convertedEl.textContent = schemeSelect.value === 'us' ? 'Enter numeric score' : 'Enter numeric score';
      return null;
    }
    const avg = allScores.reduce((a, b) => a + b, 0) / allScores.length;
    base.kAvg = avg;
    base.final = avg;
  }

  const finalNum = Number(toFixedSmart(base.final, 3));
  resultEl.textContent = toFixedSmart(finalNum, 3);

  // Converted display per scheme
  let convertText = '';
  if (schemeSelect.value === 'az' || schemeSelect.value === 'custom') {
    convertText = `AZ: ${toFixedSmart(finalNum, 2)}/100`;
  } else if (schemeSelect.value === 'us') {
    const u = toUSGPA(finalNum);
    // exact GPA decimal shown with two decimals
    convertText = `US: ${u.grade} · GPA ${u.gpa.toFixed(2)} · ${toFixedSmart(finalNum, 2)}/100`;
  } else if (schemeSelect.value === 'uk') {
    const u = toUKClass(finalNum);
    convertText = `UK: ${u.class} · ${toFixedSmart(u.percent, 2)}%`;
  } else if (schemeSelect.value === 'ects') {
    const e = toECTS(finalNum);
    convertText = `ECTS: ${e.grade} · ${toFixedSmart(finalNum, 2)}/100`;
  }
  convertedEl.textContent = convertText;

  // Tips only meaningful for AZ/custom (use base.kAvg and bsq)
  if (schemeSelect.value === 'az' || schemeSelect.value === 'custom') {
    showTips(base.kAvg, Number.isFinite(bsq) ? bsq : 0, finalNum);
  } else {
    tipsBox.textContent = '';
  }

  return finalNum;
}

/* --------- Save / Clear (fixed variable names) --------- */
function saveResult() {
  const now = new Date().toLocaleDateString();
  const ksqArr = parseKQS(ksqInput.value || '');
  const bsqRaw = bsqInput.value;
  const bsq = (bsqRaw === '' || bsqRaw === null) ? NaN : parseFloat(bsqRaw);
  const final = computeAndDisplay();
  if (final === null) return;

  // compute kAvg properly
  const kAvg = ksqArr.length ? (ksqArr.reduce((a, b) => a + b, 0) / ksqArr.length) : 0;

  history.push({
    date: now,
    kAvg: Number(toFixedSmart(kAvg, 3)),
    bsq: Number.isFinite(bsq) ? bsq : 0,
    final: Number(toFixedSmart(final, 3)),
    scheme: schemeSelect.value
  });
  localStorage.setItem('history', JSON.stringify(history));
  updateChart();
  tipsBox.textContent = I18N[currentLang].saved;
}

function clearHistory() {
  history = [];
  localStorage.setItem('history', JSON.stringify(history));
  updateChart();
  tipsBox.textContent = I18N[currentLang].cleared;
}

/* --------- Event listeners --------- */
btnCalc.addEventListener('click', computeAndDisplay);
btnSave.addEventListener('click', saveResult);
btnClear.addEventListener('click', clearHistory);

/* Export CSV (keeps your previous behaviour) */
if (btnCSV) {
  btnCSV.addEventListener('click', () => {
    const t = I18N[currentLang] || I18N.az;
    const header = t.csvHeader;
    const rows = history.map(h => `${h.date},${h.kAvg},${h.bsq},${h.final},${h.scheme}`);
    const csv = [header, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'grades_history.csv';
    a.click();
    URL.revokeObjectURL(url);
  });
}

/* --------- PDF Export (keeps your previous behaviour) --------- */
if (btnPDF) {
  btnPDF.addEventListener('click', async () => {
    const t = I18N[currentLang] || I18N.az;
    if (!window.jspdf || !window.html2canvas) {
      tipsBox.textContent = 'PDF tools not loaded.';
      return;
    }
    try {
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF({ unit: 'pt', format: 'a4' });
      doc.setFontSize(18);
      doc.text(t.pdfTitle, 40, 40);

      const node = document.querySelector('main.container');
      const canvas = await html2canvas(node, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      const pageWidth = doc.internal.pageSize.getWidth();
      const imgWidth = pageWidth - 80;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      doc.addImage(imgData, 'PNG', 40, 70, imgWidth, imgHeight);
      doc.save('academic_report.pdf');
    } catch (err) {
      console.error(err);
      tipsBox.textContent = 'PDF export failed.';
    }
  });
}

/* --------- Share button (keeps your previous behaviour) --------- */
if (btnShare) {
  btnShare.addEventListener('click', async () => {
    const t = I18N[currentLang] || I18N.az;
    const text = `${t.shareText} ${resultEl.textContent} (${convertedEl.textContent})`;
    if (navigator.share) {
      try { await navigator.share({ text }); } catch (e) { /* ignore */ }
    } else if (navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(text);
        tipsBox.textContent = 'Copied to clipboard.';
      } catch { tipsBox.textContent = 'Copy failed.'; }
    }
  });
}

/* --------- Exam countdown (left intact) --------- */
let countdownTimer = null;
$('#btn-countdown').addEventListener('click', () => {
  const dateStr = $('#examDate').value;
  const out = $('#countdown');
  if (!dateStr) { out.textContent = '—'; return; }
  const target = new Date(dateStr + 'T00:00:00');
  clearInterval(countdownTimer);
  countdownTimer = setInterval(() => {
    const now = new Date();
    const diff = target - now;
    if (diff <= 0) {
      clearInterval(countdownTimer);
      out.textContent = '0d 0h 0m 0s';
      return;
    }
    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff % 86400000) / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    out.textContent = `${d}d ${h}h ${m}m ${s}s`;
  }, 1000);
});

/* --------- Embedded calc logic (safe eval-like) --------- */
const resultCalc = $('#resultCalc');
$$('.horizontal-buttons button').forEach(btn => {
  btn.addEventListener('click', () => {
    const c = btn.dataset.c;
    if (c === 'C') resultCalc.value = '';
    else if (c === 'B') resultCalc.value = resultCalc.value.slice(0, -1);
    else if (c === '=') {
      const expr = resultCalc.value;
      if (!/^[0-9+\-*/.%() ]+$/.test(expr)) { resultCalc.value = 'Xəta'; return; }
      try {
        const val = Function(`"use strict"; return (${expr})`)();
        resultCalc.value = String(val);
      } catch {
        resultCalc.value = 'Xəta';
      }
    } else {
      resultCalc.value += c;
    }
  });
});

/* --------- Recompute triggers (updates conversions immediately) --------- */
kqsWeight.addEventListener('change', computeAndDisplay);
schemeSelect.addEventListener('change', computeAndDisplay);
ksqInput.addEventListener('input', computeAndDisplay);
bsqInput.addEventListener('input', computeAndDisplay);

/* --------- Init on load --------- */
document.addEventListener('DOMContentLoaded', () => {
  updateKQSBSQLabels();
  computeAndDisplay();
  initChart();
  // attempt to register service worker (HTML already attempts; this is a safety fallback)
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker?.register('./sw.js').catch(() => { /* ignore */ });
  }
});
