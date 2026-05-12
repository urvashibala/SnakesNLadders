const DEFAULT_IMG = '/public/boards/Gyan_Chaupar_National_Museum_India.JPG';

const boardImg = document.getElementById('boardImg');
const overlay = document.getElementById('overlay');
const coordsInfo = document.getElementById('coordsInfo');
const loadBtn = document.getElementById('loadBtn');
const imgUrlInput = document.getElementById('imgUrl');
const fileInput = document.getElementById('fileInput');
const pointsList = document.getElementById('pointsList');
const undoBtn = document.getElementById('undoBtn');
const clearBtn = document.getElementById('clearBtn');
const doneBtn = document.getElementById('doneBtn');
const output = document.getElementById('output');
const jsonOut = document.getElementById('jsonOut');
const copyBtn = document.getElementById('copyBtn');
const closeOut = document.getElementById('closeOut');

let points = [];
let startIndex = 1;

function getStartChoice(){
  const r = document.querySelector('input[name="start"]:checked');
  return r ? parseInt(r.value,10) : 1;
}

function resizeOverlay(){
  const rect = boardImg.getBoundingClientRect();
  overlay.width = rect.width;
  overlay.height = rect.height;
  overlay.style.left = boardImg.offsetLeft + 'px';
  overlay.style.top = boardImg.offsetTop + 'px';
}

function imgLoaded(){
  // match overlay to displayed image size
  resizeOverlay();
  coordsInfo.textContent = `Image loaded: ${boardImg.naturalWidth}×${boardImg.naturalHeight} — Click to record coordinates`;
}

window.addEventListener('resize', ()=>{
  if(boardImg.src) resizeOverlay();
});

boardImg.addEventListener('load', imgLoaded);

document.getElementById('imageWrap').addEventListener('click', (ev)=>{
  if(!boardImg.naturalWidth) return;
  const rect = boardImg.getBoundingClientRect();
  const clickX = ev.clientX - rect.left;
  const clickY = ev.clientY - rect.top;

  // convert to image native coordinates
  const x = (clickX) * (boardImg.naturalWidth / rect.width);
  const y = (clickY) * (boardImg.naturalHeight / rect.height);

  const id = points.length === 0 ? getStartChoice() : (points[points.length-1].id + 1);
  const entry = { id, x: +x.toFixed(1), y: +y.toFixed(1) };
  points.push(entry);
  renderPoints();
});

function renderPoints(){
  pointsList.innerHTML = '';
  const ctx = overlay.getContext('2d');
  // clear
  overlay.width = overlay.width; // clear
  // draw markers scaled to displayed size
  const rect = boardImg.getBoundingClientRect();
  const sx = rect.width / boardImg.naturalWidth;
  const sy = rect.height / boardImg.naturalHeight;
  const r = Math.max(4, 6 * Math.min(sx, sy));
  for(const p of points){
    const li = document.createElement('li');
    li.textContent = `${p.id}: ${p.x.toFixed(1)}, ${p.y.toFixed(1)}`;
    pointsList.appendChild(li);

    const cx = p.x * sx;
    const cy = p.y * sy;
    // draw
    ctx.beginPath();
    ctx.strokeStyle = 'red';
    ctx.lineWidth = 2;
    ctx.arc(cx, cy, r, 0, Math.PI*2);
    ctx.stroke();
    ctx.fillStyle = 'rgba(255,0,0,0.15)';
    ctx.fill();
    ctx.fillStyle = 'black';
    ctx.font = `${Math.max(10, r)}px Arial`;
    ctx.fillText(String(p.id), cx - (r/2), cy + (r/2));
  }
}

undoBtn.addEventListener('click', ()=>{ points.pop(); renderPoints(); });
clearBtn.addEventListener('click', ()=>{ points=[]; renderPoints(); });

doneBtn.addEventListener('click', ()=>{
  output.hidden = false;
  const exportData = points.map(p=>({id:p.id,x:p.x,y:p.y}));
  jsonOut.value = JSON.stringify(exportData, null, 2);
});

copyBtn.addEventListener('click', async ()=>{
  try{ await navigator.clipboard.writeText(jsonOut.value); alert('Copied to clipboard'); }
  catch(e){ alert('Copy failed'); }
});
closeOut.addEventListener('click', ()=>{ output.hidden = true; });

loadBtn.addEventListener('click', ()=>{
  const url = imgUrlInput.value && imgUrlInput.value.trim() ? imgUrlInput.value.trim() : DEFAULT_IMG;
  startIndex = getStartChoice();
  points = [];
  boardImg.src = url;
});

fileInput.addEventListener('change', (ev)=>{
  const f = ev.target.files && ev.target.files[0];
  if(!f) return;
  const url = URL.createObjectURL(f);
  startIndex = getStartChoice();
  points = [];
  boardImg.src = url;
});

// On load: attempt to read ?img= query
const params = new URLSearchParams(window.location.search);
if(params.get('img')){
  imgUrlInput.value = params.get('img');
  loadBtn.click();
} else {
  // default to project board image path
  imgUrlInput.placeholder = DEFAULT_IMG;
}
