// ── Default credentials (pre-fill on first visit) ─────────────────────────
;(function seedCredentials() {
  const defaults = {
    imgbb_key:    '08a9717d0f278f08f2dcf413be4cac27',
    ejs_service:  'snakes_and_ladders',
    ejs_template: 'template_93ufufa',
    ejs_key:      'tBSb3OERxxfySsy6n',
  };
  for (const [k, v] of Object.entries(defaults)) {
    if (!localStorage.getItem(k)) localStorage.setItem(k, v);
  }
})();

// ── State ──────────────────────────────────────────────────────────────────
let nsfwModel = null;
let points = [];          // [{id, x, y}]
let transitions = [];     // [{type, from, to}]
let boardMeta = {};
let boardImgFile = null;
let boardImgObjectUrl = null;
let boardImgBase64 = null;

// Transition-click state (step 3)
let pendingFrom = null;

// ── DOM refs ───────────────────────────────────────────────────────────────
const fileInput          = document.getElementById('fileInput');
const nsfwStatus         = document.getElementById('nsfwStatus');
const nsfwLoading        = document.getElementById('nsfwLoading');
const step1              = document.getElementById('step1');
const stepViewer         = document.getElementById('stepViewer');
const startChoiceRow     = document.getElementById('startChoiceRow');
const startChangeWarning = document.getElementById('startChangeWarning');
const boardImg           = document.getElementById('boardImg');
const overlay            = document.getElementById('overlay');
const coordsInfo         = document.getElementById('coordsInfo');
const modeBar            = document.getElementById('modeBar');
const modeLabel          = document.getElementById('modeLabel');
const imageWrap          = document.getElementById('imageWrap');
const step2Actions       = document.getElementById('step2Actions');
const step3Actions       = document.getElementById('step3Actions');
const pointsSection      = document.getElementById('pointsSection');
const pointCount         = document.getElementById('pointCount');
const pointsList         = document.getElementById('pointsList');
const transitionsSection = document.getElementById('transitionsSection');
const transitionCount    = document.getElementById('transitionCount');
const transitionsList    = document.getElementById('transitionsList');
const backToStep1Btn     = document.getElementById('backToStep1Btn');
const undoBtn            = document.getElementById('undoBtn');
const clearBtn           = document.getElementById('clearBtn');
const toStep3Btn         = document.getElementById('toStep3Btn');
const backToStep2Btn     = document.getElementById('backToStep2Btn');
const fromInput          = document.getElementById('fromInput');
const toInput            = document.getElementById('toInput');
const addTransitionBtn   = document.getElementById('addTransitionBtn');
const undoTransitionBtn  = document.getElementById('undoTransitionBtn');
const clearTransitionsBtn = document.getElementById('clearTransitionsBtn');
const toStep4Btn         = document.getElementById('toStep4Btn');
const step4              = document.getElementById('step4');
const metaForm           = document.getElementById('metaForm');
const fieldId            = document.getElementById('fieldId');
const fieldName          = document.getElementById('fieldName');
const fieldHistory       = document.getElementById('fieldHistory');
const fieldImageFilename = document.getElementById('fieldImageFilename');
const fieldTotal         = document.getElementById('fieldTotal');
const fieldWin           = document.getElementById('fieldWin');
const wordCount          = document.getElementById('wordCount');
const backToStep3Btn     = document.getElementById('backToStep3Btn');
const step5              = document.getElementById('step5');
const reviewTable        = document.getElementById('reviewTable');
const reviewImg          = document.getElementById('reviewImg');
const reviewCanvas       = document.getElementById('reviewCanvas');
const jsonOut            = document.getElementById('jsonOut');
const copyBtn            = document.getElementById('copyBtn');
const downloadBtn        = document.getElementById('downloadBtn');
const imgbbKey           = document.getElementById('imgbbKey');
const ejsService         = document.getElementById('ejsService');
const ejsTemplate        = document.getElementById('ejsTemplate');
const ejsKey             = document.getElementById('ejsKey');
const saveEjsBtn         = document.getElementById('saveEjsBtn');
const sendBtn            = document.getElementById('sendBtn');
const sendStatus         = document.getElementById('sendStatus');
const backToStep4Btn     = document.getElementById('backToStep4Btn');
const toastEl            = document.getElementById('toast');

// ── Step management ────────────────────────────────────────────────────────
let currentStep = 1;

function setStep(n) {
  currentStep = n;
  document.querySelectorAll('.step[data-step]').forEach(el => {
    el.classList.toggle('active', parseInt(el.dataset.step) === n);
    el.classList.toggle('done',   parseInt(el.dataset.step) <  n);
  });
  step1.classList.toggle('hidden',             n !== 1);
  stepViewer.classList.toggle('hidden',        n !== 2 && n !== 3);
  startChoiceRow.classList.toggle('hidden',    n !== 2);
  pointsSection.classList.toggle('hidden',     n !== 2);
  transitionsSection.classList.toggle('hidden',n !== 3);
  step2Actions.classList.toggle('hidden',      n !== 2);
  step3Actions.classList.toggle('hidden',      n !== 3);
  modeBar.classList.toggle('hidden',           n !== 3);
  step4.classList.toggle('hidden',             n !== 4);
  step5.classList.toggle('hidden',             n !== 5);

  if (n === 2) {
    coordsInfo.textContent = `${boardImg.naturalWidth}×${boardImg.naturalHeight} px — click each square on the board`;
    renderPoints();
  }
  if (n === 3) {
    coordsInfo.textContent = 'Click a circle to select FROM (orange), then click the destination circle';
    pendingFrom = null;
    updateModeLabel();
    renderPointsAndTransitions();
  }
  if (n === 5) buildReview();
}

// ── Tab navigation: click any completed step to go back ───────────────────
document.querySelectorAll('.step[data-step]').forEach(el => {
  el.style.cursor = 'pointer';
  el.addEventListener('click', () => {
    const n = parseInt(el.dataset.step);
    if (n < currentStep) setStep(n);
  });
});

// ── NSFW model loading ─────────────────────────────────────────────────────
async function loadNSFW() {
  try {
    nsfwModel = await nsfwjs.load('https://cdn.jsdelivr.net/npm/nsfwjs@4/quant_nsfw_mobilenet/');
    nsfwLoading.textContent = '✓ Image safety checker ready';
  } catch {
    nsfwLoading.textContent = 'Image safety checker unavailable — uploads still allowed';
    nsfwModel = null;
  }
}

async function checkNSFW(imgEl) {
  if (!nsfwModel) return true;
  try {
    const predictions = await nsfwModel.classify(imgEl);
    return predictions.filter(p => ['Porn','Hentai','Sexy'].includes(p.className) && p.probability > 0.6).length === 0;
  } catch { return true; }
}

// ── Image loading ──────────────────────────────────────────────────────────
fileInput.addEventListener('change', async (ev) => {
  const f = ev.target.files && ev.target.files[0];
  if (!f) return;
  if (!f.type.startsWith('image/')) { showNSFWStatus('error', 'File must be an image.'); return; }
  if (f.size > 20 * 1024 * 1024)  { showNSFWStatus('error', 'Image must be under 20 MB.'); return; }

  showNSFWStatus('checking', 'Checking image…');
  const url = URL.createObjectURL(f);
  const tempImg = new Image();
  tempImg.onload = async () => {
    const safe = await checkNSFW(tempImg);
    if (!safe) {
      showNSFWStatus('error', 'Image flagged as inappropriate. Please upload a board image.');
      URL.revokeObjectURL(url);
      return;
    }
    showNSFWStatus('ok', '✓ Image OK');
    boardImgFile = f;
    if (boardImgObjectUrl) URL.revokeObjectURL(boardImgObjectUrl);
    boardImgObjectUrl = url;

    const reader = new FileReader();
    reader.onload = e => { boardImgBase64 = e.target.result.split(',')[1]; };
    reader.readAsDataURL(f);

    fieldImageFilename.value = f.name;
    loadBoardImage(url);
  };
  tempImg.crossOrigin = 'anonymous';
  tempImg.src = url;
});

function showNSFWStatus(type, msg) {
  nsfwStatus.className = `nsfw-status ${type}`;
  nsfwStatus.textContent = msg;
  nsfwStatus.classList.remove('hidden');
}

function loadBoardImage(url) {
  points = [];
  transitions = [];
  pendingFrom = null;
  boardImg.onload = () => {
    setStep(2);                          // makes stepViewer visible first
    requestAnimationFrame(() => {        // wait for browser to paint layout
      resizeOverlay();
      renderPoints();
    });
  };
  boardImg.src = url;
}

// ── Start-index change while in step 2 ────────────────────────────────────
document.querySelectorAll('input[name="start"]').forEach(radio => {
  radio.addEventListener('change', () => {
    if (currentStep !== 2) return;
    if (points.length === 0) return;
    if (!confirm('Changing the start index will clear all marked squares. Continue?')) {
      // revert
      const prev = getStartIndex() === 0 ? '1' : '0';
      document.querySelector(`input[name="start"][value="${prev}"]`).checked = true;
      return;
    }
    points = [];
    renderPoints();
    showToast('Squares cleared — start marking from scratch');
  });
});

function getStartIndex() {
  return parseInt(document.querySelector('input[name="start"]:checked').value, 10);
}

// ── Canvas helpers ─────────────────────────────────────────────────────────
function resizeOverlay() {
  const rect = boardImg.getBoundingClientRect();
  overlay.width  = rect.width;
  overlay.height = rect.height;
  overlay.style.left = '0px';
  overlay.style.top  = '0px';
}

window.addEventListener('resize', () => {
  if (boardImg.src) { resizeOverlay(); redraw(); }
  if (currentStep === 5 && reviewImg.src) {
    const rect = reviewImg.getBoundingClientRect();
    reviewCanvas.width  = rect.width;
    reviewCanvas.height = rect.height;
    renderReview();
  }
});

function redraw() {
  if (currentStep === 2) renderPoints();
  if (currentStep === 3) renderPointsAndTransitions();
}

function scaleFactors() {
  const rect = boardImg.getBoundingClientRect();
  return { sx: rect.width / boardImg.naturalWidth, sy: rect.height / boardImg.naturalHeight };
}

// ── Rendering: numbered circles ────────────────────────────────────────────
function renderPoints() {
  resizeOverlay();
  const ctx = overlay.getContext('2d');
  overlay.width = overlay.width;
  const { sx, sy } = scaleFactors();
  const r = markerRadius(sx, sy);

  for (const p of points) drawSquareMarker(ctx, p.x * sx, p.y * sy, r, p.id, '#e03030', false);

  pointsList.innerHTML = '';
  for (const p of points) {
    const li = document.createElement('li');
    li.textContent = `${p.id}: (${p.x.toFixed(1)}, ${p.y.toFixed(1)})`;
    pointsList.appendChild(li);
  }
  pointCount.textContent = points.length;
}

function markerRadius(sx, sy) {
  return Math.max(12, 16 * Math.min(sx, sy));
}

function drawSquareMarker(ctx, cx, cy, r, label, strokeColor, highlighted) {
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fillStyle = highlighted ? '#fff3b0' : 'white';
  ctx.fill();
  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = highlighted ? 3 : 2;
  ctx.stroke();

  const fontSize = Math.max(10, Math.round(r * 1.1));
  ctx.font = `bold ${fontSize}px Arial, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#111';
  ctx.fillText(String(label), cx, cy);
}

function renderPointsAndTransitions() {
  resizeOverlay();
  const ctx = overlay.getContext('2d');
  overlay.width = overlay.width;
  const { sx, sy } = scaleFactors();
  const r = markerRadius(sx, sy);

  // Transitions first (drawn under markers)
  for (const t of transitions) {
    const from = points.find(p => p.id === t.from);
    const to   = points.find(p => p.id === t.to);
    if (!from || !to) continue;
    drawArrow(ctx, from.x * sx, from.y * sy, to.x * sx, to.y * sy,
      t.type === 'snake' ? '#d93030' : '#1a8f1a', r, t.type);
  }

  // Markers
  for (const p of points) {
    const isFrom = p.id === pendingFrom;
    drawSquareMarker(ctx, p.x * sx, p.y * sy, r, p.id,
      isFrom ? '#d97706' : '#3060e0', isFrom);
  }

  // List
  transitionsList.innerHTML = '';
  for (const t of transitions) {
    const li = document.createElement('li');
    li.className = t.type;
    li.textContent = `${t.type === 'snake' ? '🐍' : '🪜'} ${t.type.toUpperCase()}: ${t.from} → ${t.to}`;
    transitionsList.appendChild(li);
  }
  transitionCount.textContent = transitions.length;
}

function drawArrow(ctx, x1, y1, x2, y2, color, markerR, label) {
  const headLen = Math.max(10, markerR * 0.85);
  const angle = Math.atan2(y2 - y1, x2 - x1);
  const dist = Math.hypot(x2 - x1, y2 - y1);
  const shrink = markerR * 1.15;
  if (dist < shrink * 2) return;

  const ax1 = x1 + Math.cos(angle) * shrink;
  const ay1 = y1 + Math.sin(angle) * shrink;
  const ax2 = x2 - Math.cos(angle) * shrink;
  const ay2 = y2 - Math.sin(angle) * shrink;

  // Shaft
  ctx.beginPath();
  ctx.moveTo(ax1, ay1);
  ctx.lineTo(ax2, ay2);
  ctx.strokeStyle = color;
  ctx.lineWidth = 2.5;
  ctx.stroke();

  // Arrowhead
  ctx.beginPath();
  ctx.moveTo(ax2, ay2);
  ctx.lineTo(ax2 - headLen * Math.cos(angle - Math.PI / 6), ay2 - headLen * Math.sin(angle - Math.PI / 6));
  ctx.moveTo(ax2, ay2);
  ctx.lineTo(ax2 - headLen * Math.cos(angle + Math.PI / 6), ay2 - headLen * Math.sin(angle + Math.PI / 6));
  ctx.strokeStyle = color;
  ctx.lineWidth = 2.5;
  ctx.stroke();

  // Label pill at midpoint, offset perpendicular to arrow
  if (label) {
    const midX = (ax1 + ax2) / 2;
    const midY = (ay1 + ay2) / 2;
    const perp = angle - Math.PI / 2;
    const offset = markerR * 0.9;
    const lx = midX + Math.cos(perp) * offset;
    const ly = midY + Math.sin(perp) * offset;

    const fontSize = Math.max(9, markerR * 0.7);
    ctx.font = `bold ${fontSize}px Arial, sans-serif`;
    const tw = ctx.measureText(label).width;
    const pad = 3;

    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.rect(lx - tw / 2 - pad, ly - fontSize / 2 - pad, tw + pad * 2, fontSize + pad * 2);
    ctx.fill();

    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, lx, ly);
  }
}

// ── Step 2: click to place squares ────────────────────────────────────────
imageWrap.addEventListener('click', (ev) => {
  if (currentStep === 2) handleStep2Click(ev);
  if (currentStep === 3) handleStep3Click(ev);
});

function handleStep2Click(ev) {
  if (!boardImg.naturalWidth) return;
  const rect = boardImg.getBoundingClientRect();
  const x = +((ev.clientX - rect.left) * (boardImg.naturalWidth  / rect.width)).toFixed(1);
  const y = +((ev.clientY - rect.top)  * (boardImg.naturalHeight / rect.height)).toFixed(1);

  const id = points.length === 0 ? getStartIndex() : (points[points.length - 1].id + 1);
  points.push({ id, x, y });
  renderPoints();
}

backToStep1Btn.addEventListener('click', () => setStep(1));
undoBtn.addEventListener('click',  () => { points.pop(); renderPoints(); });
clearBtn.addEventListener('click', () => { points = []; renderPoints(); });

toStep3Btn.addEventListener('click', () => {
  if (points.length < 2) { alert('Please mark at least 2 squares first.'); return; }
  setStep(3);
});

// ── Step 3: click to draw transitions ─────────────────────────────────────
function handleStep3Click(ev) {
  const rect = boardImg.getBoundingClientRect();
  const clickX = ev.clientX - rect.left;
  const clickY = ev.clientY - rect.top;
  const { sx, sy } = scaleFactors();
  const r = markerRadius(sx, sy);

  let nearest = null, nearestDist = Infinity;
  for (const p of points) {
    const d = Math.hypot(p.x * sx - clickX, p.y * sy - clickY);
    if (d < r * 2 && d < nearestDist) { nearest = p; nearestDist = d; }
  }
  if (!nearest) return;

  if (pendingFrom === null) {
    pendingFrom = nearest.id;
    fromInput.value = nearest.id;
  } else {
    const fromId = pendingFrom;
    const toId = nearest.id;
    pendingFrom = null;
    fromInput.value = '';
    toInput.value = '';
    if (fromId === toId) { updateModeLabel(); renderPointsAndTransitions(); return; }
    addTransition(fromId, toId);
  }
  updateModeLabel();
  renderPointsAndTransitions();
}

function updateModeLabel() {
  if (pendingFrom === null) {
    modeLabel.textContent = 'Step 1 of 2: click a circle to set the FROM square';
    modeLabel.className = 'mode-from';
  } else {
    modeLabel.textContent = `FROM: square ${pendingFrom} selected (orange) — now click the TO square`;
    modeLabel.className = 'mode-to';
  }
}

function addTransition(fromId, toId) {
  const type = fromId > toId ? 'snake' : 'ladder';
  transitions.push({ type, from: fromId, to: toId });
  showToast(`${type === 'snake' ? '🐍 Snake' : '🪜 Ladder'} added: ${fromId} → ${toId}`);
}

addTransitionBtn.addEventListener('click', () => {
  const from = parseInt(fromInput.value, 10);
  const to   = parseInt(toInput.value, 10);
  if (isNaN(from) || isNaN(to) || from === to) { alert('Enter two distinct square numbers.'); return; }
  if (!points.find(p => p.id === from)) { alert(`Square ${from} not found in marked squares.`); return; }
  if (!points.find(p => p.id === to))   { alert(`Square ${to} not found in marked squares.`);   return; }
  addTransition(from, to);
  fromInput.value = '';
  toInput.value = '';
  pendingFrom = null;
  updateModeLabel();
  renderPointsAndTransitions();
});

undoTransitionBtn.addEventListener('click',  () => { transitions.pop(); renderPointsAndTransitions(); });
clearTransitionsBtn.addEventListener('click',() => { transitions = []; renderPointsAndTransitions(); });
backToStep2Btn.addEventListener('click', () => setStep(2));

toStep4Btn.addEventListener('click', () => { prefillMeta(); setStep(4); });

// ── Step 4: Board metadata form ────────────────────────────────────────────
function prefillMeta() {
  const start  = getStartIndex();
  const lastId = points.length ? points[points.length - 1].id : 0;
  fieldTotal.value = points.length;
  fieldWin.value   = lastId;
  const startRadio = document.querySelector(`input[name="startSq"][value="${start}"]`);
  if (startRadio) startRadio.checked = true;
}

fieldHistory.addEventListener('input', () => {
  const wc = countWords(fieldHistory.value);
  wordCount.textContent = wc;
  wordCount.style.color = wc > 50 ? '#c00' : '#333';
});

function countWords(str) {
  return str.trim() === '' ? 0 : str.trim().split(/\s+/).length;
}

backToStep3Btn.addEventListener('click', () => setStep(3));

metaForm.addEventListener('submit', (ev) => {
  ev.preventDefault();
  if (!validateMeta()) return;
  boardMeta = {
    id:           fieldId.value.trim(),
    name:         fieldName.value.trim(),
    historyText:  fieldHistory.value.trim(),
    imageUrl:     `/boards/${fieldImageFilename.value.trim()}`,
    totalSquares: parseInt(fieldTotal.value, 10),
    startSquare:  parseInt(document.querySelector('input[name="startSq"]:checked').value, 10),
    winSquare:    parseInt(fieldWin.value, 10),
  };
  setStep(5);
});

function validateMeta() {
  let ok = true;
  const clear = id => { document.getElementById(id).textContent = ''; };
  const err   = (id, msg) => { document.getElementById(id).textContent = msg; ok = false; };
  clear('errId'); clear('errName'); clear('errHistory'); clear('errImage');
  clear('errTotal'); clear('errStart'); clear('errWin'); clear('errConsistency');

  if (!/^[A-Za-z0-9_]+$/.test(fieldId.value.trim()))
    err('errId', 'Only letters, numbers, underscores — no spaces.');

  if (!fieldName.value.trim()) err('errName', 'Required.');

  if (!fieldHistory.value.trim()) err('errHistory', 'Required.');
  else if (countWords(fieldHistory.value) > 50) err('errHistory', 'Exceeds 50 words.');

  if (!fieldImageFilename.value.trim()) err('errImage', 'Required.');

  const total  = parseInt(fieldTotal.value, 10);
  const win    = parseInt(fieldWin.value, 10);
  const startR = document.querySelector('input[name="startSq"]:checked');

  if (!startR) err('errStart', 'Select a start square.');
  if (isNaN(total) || total < 2) err('errTotal', 'Must be an integer ≥ 2.');
  if (isNaN(win)   || win < 0)   err('errWin',   'Must be a non-negative integer.');

  if (ok && startR) {
    const startVal = parseInt(startR.value, 10);
    if (startVal === 0 && total !== win + 1)
      err('errConsistency', `With start=0: totalSquares must equal winSquare+1 (expected ${win + 1}, got ${total}).`);
    if (startVal === 1 && total !== win)
      err('errConsistency', `With start=1: totalSquares must equal winSquare (expected ${win}, got ${total}).`);
  }
  return ok;
}

// ── Step 5: Review & Send ──────────────────────────────────────────────────
function buildReview() {
  const rows = [
    ['ID',            boardMeta.id],
    ['Name',          boardMeta.name],
    ['History',       boardMeta.historyText],
    ['Image URL',     boardMeta.imageUrl],
    ['Total Squares', boardMeta.totalSquares],
    ['Start Square',  boardMeta.startSquare],
    ['Win Square',    boardMeta.winSquare],
    ['Squares',       `${points.length} marked`],
    ['Transitions',   `${transitions.length} (${transitions.filter(t=>t.type==='snake').length} snakes, ${transitions.filter(t=>t.type==='ladder').length} ladders)`],
  ];
  reviewTable.innerHTML = rows.map(([k, v]) => `<tr><th>${k}</th><td>${v}</td></tr>`).join('');

  reviewImg.onload = () => {
    const rect = reviewImg.getBoundingClientRect();
    reviewCanvas.width  = rect.width;
    reviewCanvas.height = rect.height;
    renderReview();
  };
  reviewImg.src = boardImgObjectUrl;
  jsonOut.value = buildJSON();

  imgbbKey.value    = localStorage.getItem('imgbb_key')    || '';
  ejsService.value  = localStorage.getItem('ejs_service')  || '';
  ejsTemplate.value = localStorage.getItem('ejs_template') || '';
  ejsKey.value      = localStorage.getItem('ejs_key')      || '';
}

function renderReview() {
  const ctx = reviewCanvas.getContext('2d');
  reviewCanvas.width = reviewCanvas.width;
  const sx = reviewImg.getBoundingClientRect().width  / reviewImg.naturalWidth;
  const sy = reviewImg.getBoundingClientRect().height / reviewImg.naturalHeight;
  const r  = markerRadius(sx, sy);

  for (const t of transitions) {
    const from = points.find(p => p.id === t.from);
    const to   = points.find(p => p.id === t.to);
    if (!from || !to) continue;
    drawArrow(ctx, from.x * sx, from.y * sy, to.x * sx, to.y * sy,
      t.type === 'snake' ? '#d93030' : '#1a8f1a', r, t.type);
  }
  for (const p of points) drawSquareMarker(ctx, p.x * sx, p.y * sy, r, p.id, '#3060e0', false);
}

reviewImg.addEventListener('load', () => setTimeout(renderReview, 80));

function buildJSON() {
  return JSON.stringify({
    id:           boardMeta.id,
    name:         boardMeta.name,
    historyText:  boardMeta.historyText,
    imageUrl:     boardMeta.imageUrl,
    totalSquares: boardMeta.totalSquares,
    startSquare:  boardMeta.startSquare,
    winSquare:    boardMeta.winSquare,
    squares:      points.map(p => ({ id: p.id, x: p.x, y: p.y })),
    transitions:  transitions.map(t => ({ type: t.type, from: t.from, to: t.to })),
  }, null, 2);
}

copyBtn.addEventListener('click', async () => {
  try { await navigator.clipboard.writeText(jsonOut.value); showToast('JSON copied to clipboard'); }
  catch { alert('Copy failed — select and copy manually.'); }
});

downloadBtn.addEventListener('click', () => {
  const blob = new Blob([jsonOut.value], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `data_${boardMeta.id}.json`;
  a.click();
  URL.revokeObjectURL(a.href);
});

saveEjsBtn.addEventListener('click', () => {
  localStorage.setItem('imgbb_key',    imgbbKey.value.trim());
  localStorage.setItem('ejs_service',  ejsService.value.trim());
  localStorage.setItem('ejs_template', ejsTemplate.value.trim());
  localStorage.setItem('ejs_key',      ejsKey.value.trim());
  saveEjsBtn.textContent = 'Saved ✓';
  setTimeout(() => { saveEjsBtn.textContent = 'Save credentials'; }, 2000);
});

sendBtn.addEventListener('click', async () => {
  const imgbb = imgbbKey.value.trim() || localStorage.getItem('imgbb_key');
  const svc   = ejsService.value.trim()  || localStorage.getItem('ejs_service');
  const tpl   = ejsTemplate.value.trim() || localStorage.getItem('ejs_template');
  const key   = ejsKey.value.trim()      || localStorage.getItem('ejs_key');

  if (!imgbb) { showSendStatus('error', 'Enter and save your ImgBB API key first.'); return; }
  if (!svc || !tpl || !key) { showSendStatus('error', 'Enter and save your EmailJS credentials first.'); return; }

  sendBtn.disabled = true;

  // Upload full-quality image to ImgBB
  let imageUrl = null;
  if (boardImgFile) {
    showSendStatus('info', 'Uploading image…');
    try {
      imageUrl = await uploadToImgbb(boardImgFile, imgbb);
    } catch (e) {
      showSendStatus('error', `Image upload failed: ${e.message}`);
      sendBtn.disabled = false;
      return;
    }
  }

  showSendStatus('info', 'Sending approval email…');

  // Strip pixel x/y coords — approve.html only needs IDs, not canvas positions
  const squaresStripped = points.map(({ id }) => ({ id }));
  const payload = {
    meta:          boardMeta,
    squares:       squaresStripped,
    transitions:   transitions,
    imageFilename: boardImgFile ? boardImgFile.name : '',
    imageUrl,
  };

  const encoded = btoa(unescape(encodeURIComponent(JSON.stringify(payload))));
  const approvalUrl = `${window.location.origin}/tools/annotator/approve.html?data=${encoded}`;

  try {
    emailjs.init(key);
    await emailjs.send(svc, tpl, {
      board_id:    boardMeta.id,
      board_name:  boardMeta.name,
      preview_url: approvalUrl,
    });
    showSendStatus('ok', 'Sent! Check your email for the approval link.');
  } catch (e) {
    showSendStatus('error', `Send failed: ${e.text || e.message || JSON.stringify(e)}`);
  } finally {
    sendBtn.disabled = false;
  }
});

async function uploadToImgbb(file, apiKey) {
  const form = new FormData();
  form.append('key', apiKey);
  form.append('image', file);
  const resp = await fetch('https://api.imgbb.com/1/upload', { method: 'POST', body: form });
  if (!resp.ok) throw new Error(`ImgBB ${resp.status}`);
  const data = await resp.json();
  if (!data.success) throw new Error(data.error?.message || 'ImgBB upload failed');
  return data.data.url;
}



function showSendStatus(type, msg) {
  sendStatus.className = `send-status ${type}`;
  sendStatus.textContent = msg;
  sendStatus.classList.remove('hidden');
}

backToStep4Btn.addEventListener('click', () => setStep(4));

// ── Toast notifications ────────────────────────────────────────────────────
let toastTimer = null;
function showToast(msg) {
  toastEl.textContent = msg;
  toastEl.classList.remove('hidden');
  toastEl.classList.add('visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toastEl.classList.remove('visible');
    setTimeout(() => toastEl.classList.add('hidden'), 300);
  }, 2500);
}

// ── Init ───────────────────────────────────────────────────────────────────
loadNSFW();
