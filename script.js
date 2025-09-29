const canvas = document.getElementById("ritualCanvas");
const ctx = canvas.getContext("2d");

const WIDTH = canvas.width;
const HEIGHT = canvas.height;
const GRID_SIZE = 5;
const CELL_SIZE = 80;
const DOT_RADIUS = 6;

const grid = [];
const dotPositions = {};
for (let y = 0; y < GRID_SIZE; y++) {
  for (let x = 0; x < GRID_SIZE; x++) {
    grid.push([x, y]);
    dotPositions[`${x},${y}`] = [80 + x * CELL_SIZE, 80 + y * CELL_SIZE];
  }
}

let playerLines = [];
let aiLines = [];
let spellActivated = false;
let selectedDot = null;

const cornerSquares = [
  [[0,0],[0,1],[1,1],[1,0]],
  [[3,0],[3,1],[4,1],[4,0]],
  [[0,3],[0,4],[1,4],[1,3]],
  [[3,3],[3,4],[4,4],[4,3]]
];

const innerDiamond = [[2,1],[1,2],[2,3],[3,2],[2,1]];
const outerDiamond = [[2,0],[0,2],[2,4],[4,2],[2,0]];

function drawScene() {
  ctx.clearRect(0, 0, WIDTH, HEIGHT);
  drawGrid();
  drawLines(playerLines, "rgb(60,120,200)");
  drawLines(aiLines, "rgb(255,215,0)");

  if (spellActivated) {
    drawCircle(dotPositions["2,2"], 12, "rgb(180,0,180)");
    setFeedback("✨ Spell Activated: Diamond Glyph ✨");
  } else {
    setFeedback("");
  }
}

function drawGrid() {
  for (const [key, pos] of Object.entries(dotPositions)) {
    drawCircle(pos, DOT_RADIUS, "rgb(200,200,200)");
  }
}

function drawCircle(pos, radius, color) {
  ctx.beginPath();
  ctx.arc(pos[0], pos[1], radius, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
}

function drawLines(lines, color) {
  ctx.strokeStyle = color;
  ctx.lineWidth = 4;
  for (const [start, end] of lines) {
    const a = dotPositions[`${start[0]},${start[1]}`];
    const b = dotPositions[`${end[0]},${end[1]}`];
    ctx.beginPath();
    ctx.moveTo(a[0], a[1]);
    ctx.lineTo(b[0], b[1]);
    ctx.stroke();
  }
}

function setFeedback(text) {
  document.getElementById("feedback").textContent = text;
}

function getNearestDot(pos) {
  for (const [key, screenPos] of Object.entries(dotPositions)) {
    const dx = pos.x - screenPos[0];
    const dy = pos.y - screenPos[1];
    if (Math.hypot(dx, dy) < 20) {
      return key.split(",").map(Number);
    }
  }
  return null;
}

canvas.addEventListener("mousedown", e => {
  const rect = canvas.getBoundingClientRect();
  const pos = { x: e.clientX - rect.left, y: e.clientY - rect.top };
  const clicked = getNearestDot(pos);
  if (!clicked) return;

  if (selectedDot === null) {
    selectedDot = clicked;
  } else {
    if (selectedDot[0] !== clicked[0] || selectedDot[1] !== clicked[1]) {
      playerLines.push([selectedDot, clicked]);
    }
    selectedDot = null;
  }

  if (!spellActivated && checkCornersComplete()) {
    completeDiamondPattern();
    spellActivated = true;
  }

  drawScene();
});

function isSameLine(a, b) {
  return a[0][0] === b[0][0] && a[0][1] === b[0][1] && a[1][0] === b[1][0] && a[1][1] === b[1][1];
}

function checkCornersComplete() {
  for (const square of cornerSquares) {
    for (let i = 0; i < square.length; i++) {
      const start = square[i];
      const end = square[(i + 1) % square.length];
      if (!playerLines.some(l => isSameLine(l, [start, end]) || isSameLine(l, [end, start]))) {
        return false;
      }
    }
  }
  return true;
}

function completeDiamondPattern() {
  aiLines = [];
  for (let i = 0; i < innerDiamond.length - 1; i++) {
    aiLines.push([innerDiamond[i], innerDiamond[i + 1]]);
  }
  for (let i = 0; i < outerDiamond.length - 1; i++) {
    aiLines.push([outerDiamond[i], outerDiamond[i + 1]]);
  }
}

drawScene();
