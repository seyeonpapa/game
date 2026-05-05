// ===== 따라그리기 게임 =====
// 모양 정의 (모두 viewBox 400x400 기준)

// 별 path 동적 생성
function genStarPath(cx, cy, outerR, innerR, points = 5) {
  let d = '';
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? outerR : innerR;
    const angle = (Math.PI * i) / points - Math.PI / 2;
    const x = cx + r * Math.cos(angle);
    const y = cy + r * Math.sin(angle);
    d += (i === 0 ? 'M' : 'L') + ' ' + x.toFixed(1) + ' ' + y.toFixed(1) + ' ';
  }
  return d + 'Z';
}

const SHAPES = [
  {
    id: 'heart',
    name: '하트',
    emoji: '❤️',
    d: 'M 200 340 C 100 270 50 200 50 130 C 50 80 90 50 130 50 C 165 50 195 75 200 110 C 205 75 235 50 270 50 C 310 50 350 80 350 130 C 350 200 300 270 200 340 Z',
  },
  {
    id: 'star',
    name: '별',
    emoji: '⭐',
    d: genStarPath(200, 210, 160, 70, 5),
  },
  {
    id: 'infinity',
    name: '무한대',
    emoji: '♾️',
    d: 'M 80 200 C 80 100 180 100 200 200 C 220 300 320 300 320 200 C 320 100 220 100 200 200 C 180 300 80 300 80 200 Z',
  },
  {
    id: 'circle',
    name: '동그라미',
    emoji: '⭕',
    d: 'M 200 50 A 150 150 0 1 1 199.99 50 Z',
  },
  {
    id: 'triangle',
    name: '세모',
    emoji: '🔺',
    d: 'M 200 60 L 350 320 L 50 320 Z',
  },
  {
    id: 'wave',
    name: '물결',
    emoji: '🌊',
    d: 'M 30 200 Q 80 100 130 200 Q 180 300 230 200 Q 280 100 330 200 Q 380 280 380 280',
  },
];

// 상태
let state = {
  currentShape: null,
  strokes: [],          // [[{x,y}, ...], ...]
  isDrawing: false,
  canvasSize: 400,
  guidePoints: null,    // 채점용 가이드 점들
};

// ===== 화면 전환 =====
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

// ===== 모양 선택 화면 렌더링 =====
function renderShapeGrid() {
  const grid = document.getElementById('shape-grid');
  grid.innerHTML = SHAPES.map(s => `
    <button class="shape-card" onclick="selectShape('${s.id}')">
      <svg class="shape-card-svg" viewBox="0 0 400 400">
        <path d="${s.d}" stroke="#5BA8E0" stroke-width="14" fill="none"
          stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      <span class="shape-card-name">${s.emoji} ${s.name}</span>
    </button>
  `).join('');
}

// ===== 모양 선택 =====
function selectShape(id) {
  state.currentShape = SHAPES.find(s => s.id === id);
  state.strokes = [];

  document.getElementById('game-shape-emoji').textContent = state.currentShape.emoji;
  document.getElementById('game-shape-name').textContent = state.currentShape.name;

  showScreen('screen-game');
  // DOM 보여진 후 캔버스 초기화
  requestAnimationFrame(() => {
    initCanvas();
  });
}

function goBackToShapes() {
  showScreen('screen-start');
}

function retryShape() {
  state.strokes = [];
  showScreen('screen-game');
  requestAnimationFrame(() => {
    initCanvas();
  });
}

// ===== 캔버스 초기화 =====
function initCanvas() {
  const canvas = document.getElementById('canvas');
  const wrapper = canvas.parentElement;
  const rect = wrapper.getBoundingClientRect();
  const size = Math.min(rect.width, rect.height);

  // 디바이스 픽셀 비율 처리 (선명한 그림)
  const dpr = window.devicePixelRatio || 1;
  canvas.width = size * dpr;
  canvas.height = size * dpr;
  canvas.style.width = size + 'px';
  canvas.style.height = size + 'px';

  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);

  state.canvasSize = size;
  state.ctx = ctx;
  state.canvas = canvas;

  // 가이드 점 샘플링 (채점용)
  state.guidePoints = sampleSvgPath(state.currentShape.d, 200, size / 400);

  setupDrawing();
  redraw();
}

// ===== SVG path를 점들로 샘플링 =====
function sampleSvgPath(pathD, n, scale) {
  const svgNS = 'http://www.w3.org/2000/svg';
  const tempSvg = document.createElementNS(svgNS, 'svg');
  tempSvg.setAttribute('width', '0');
  tempSvg.setAttribute('height', '0');
  tempSvg.style.position = 'absolute';
  tempSvg.style.visibility = 'hidden';
  const tempPath = document.createElementNS(svgNS, 'path');
  tempPath.setAttribute('d', pathD);
  tempSvg.appendChild(tempPath);
  document.body.appendChild(tempSvg);

  const totalLen = tempPath.getTotalLength();
  const pts = [];
  for (let i = 0; i <= n; i++) {
    const p = tempPath.getPointAtLength((i / n) * totalLen);
    pts.push({ x: p.x * scale, y: p.y * scale });
  }
  document.body.removeChild(tempSvg);
  return pts;
}

// ===== 그리기 이벤트 =====
function setupDrawing() {
  const canvas = state.canvas;

  // 기존 리스너 제거를 위해 새로 만든 함수 참조 저장
  if (state.handlers) {
    canvas.removeEventListener('pointerdown', state.handlers.down);
    canvas.removeEventListener('pointermove', state.handlers.move);
    canvas.removeEventListener('pointerup', state.handlers.up);
    canvas.removeEventListener('pointercancel', state.handlers.up);
    canvas.removeEventListener('pointerleave', state.handlers.up);
  }

  const handlers = {
    down: (e) => {
      e.preventDefault();
      state.isDrawing = true;
      const pt = getCanvasPos(e);
      state.strokes.push([pt]);
      canvas.setPointerCapture(e.pointerId);
    },
    move: (e) => {
      if (!state.isDrawing) return;
      e.preventDefault();
      const pt = getCanvasPos(e);
      const currentStroke = state.strokes[state.strokes.length - 1];
      // 같은 위치 중복 점 방지
      const last = currentStroke[currentStroke.length - 1];
      if (Math.hypot(pt.x - last.x, pt.y - last.y) < 1) return;
      currentStroke.push(pt);
      redraw();
    },
    up: (e) => {
      state.isDrawing = false;
    },
  };
  state.handlers = handlers;

  canvas.addEventListener('pointerdown', handlers.down);
  canvas.addEventListener('pointermove', handlers.move);
  canvas.addEventListener('pointerup', handlers.up);
  canvas.addEventListener('pointercancel', handlers.up);
  canvas.addEventListener('pointerleave', handlers.up);
}

function getCanvasPos(e) {
  const rect = state.canvas.getBoundingClientRect();
  return {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top,
  };
}

// ===== 화면 다시 그리기 =====
function redraw() {
  const ctx = state.ctx;
  const size = state.canvasSize;
  ctx.clearRect(0, 0, size, size);

  // 가이드 (흐리게)
  drawGuide(ctx, state.currentShape.d, size, '#C8D4E0', 16);

  // 사용자 그림
  ctx.strokeStyle = '#FF6B9D';
  ctx.lineWidth = 7;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  for (const stroke of state.strokes) {
    if (stroke.length < 2) {
      // 점 한 개일 때 작은 동그라미
      if (stroke.length === 1) {
        ctx.fillStyle = '#FF6B9D';
        ctx.beginPath();
        ctx.arc(stroke[0].x, stroke[0].y, 3.5, 0, Math.PI * 2);
        ctx.fill();
      }
      continue;
    }
    ctx.beginPath();
    ctx.moveTo(stroke[0].x, stroke[0].y);
    for (let i = 1; i < stroke.length; i++) {
      ctx.lineTo(stroke[i].x, stroke[i].y);
    }
    ctx.stroke();
  }
}

function drawGuide(ctx, pathD, size, color, lineWidth) {
  const scale = size / 400;
  ctx.save();
  ctx.scale(scale, scale);
  const path = new Path2D(pathD);
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth / scale;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.stroke(path);
  ctx.restore();
}

// ===== 지우기 =====
function clearDrawing() {
  state.strokes = [];
  redraw();
}

// ===== 완료 =====
function finishDrawing() {
  // 사용자가 아무것도 안 그린 경우
  const totalPoints = state.strokes.reduce((sum, s) => sum + s.length, 0);
  if (totalPoints < 5) {
    alert('조금 더 그려볼까요?');
    return;
  }

  const score = calculateScore();
  showResult(score);
}

// ===== 점수 계산 =====
function calculateScore() {
  const userPoints = state.strokes.flat();
  const guidePoints = state.guidePoints;
  const size = state.canvasSize;

  if (userPoints.length === 0) return 0;

  // 사용자 점들도 균등하게 샘플링 (성능 + 공정성)
  const sampledUser = resamplePoints(userPoints, 200);

  // 1) 정확도: 사용자 점들이 가이드와 평균 얼마나 가까운가
  let totalDist = 0;
  for (const up of sampledUser) {
    let minDist = Infinity;
    for (const gp of guidePoints) {
      const d = Math.hypot(up.x - gp.x, up.y - gp.y);
      if (d < minDist) minDist = d;
    }
    totalDist += minDist;
  }
  const avgDist = totalDist / sampledUser.length;
  // 캔버스 크기 비례 (size의 8% 이상이면 0점)
  const distThreshold = size * 0.08;
  const accuracy = Math.max(0, 100 - (avgDist / distThreshold) * 100);

  // 2) 커버리지: 가이드 점들이 사용자 그림으로 덮였는가
  const coverThreshold = size * 0.06;
  let covered = 0;
  for (const gp of guidePoints) {
    let minDist = Infinity;
    for (const up of sampledUser) {
      const d = Math.hypot(up.x - gp.x, up.y - gp.y);
      if (d < minDist) {
        minDist = d;
        if (minDist < coverThreshold) break; // 일찍 종료
      }
    }
    if (minDist < coverThreshold) covered++;
  }
  const coverage = (covered / guidePoints.length) * 100;

  // 최종 점수: 정확도 50% + 커버리지 50%
  const finalScore = Math.round(accuracy * 0.5 + coverage * 0.5);
  return Math.min(100, Math.max(0, finalScore));
}

// 점들을 N개로 균등 리샘플링
function resamplePoints(pts, n) {
  if (pts.length <= n) return pts;
  // 누적 거리
  const cum = [0];
  for (let i = 1; i < pts.length; i++) {
    cum.push(cum[i - 1] + Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y));
  }
  const totalLen = cum[cum.length - 1];
  if (totalLen === 0) return [pts[0]];

  const result = [];
  for (let i = 0; i <= n; i++) {
    const targetLen = (i / n) * totalLen;
    // 이진 탐색 또는 선형 탐색
    let j = 0;
    while (j < cum.length - 1 && cum[j + 1] < targetLen) j++;
    if (j >= pts.length - 1) {
      result.push(pts[pts.length - 1]);
    } else {
      const segLen = cum[j + 1] - cum[j];
      const t = segLen === 0 ? 0 : (targetLen - cum[j]) / segLen;
      result.push({
        x: pts[j].x + (pts[j + 1].x - pts[j].x) * t,
        y: pts[j].y + (pts[j + 1].y - pts[j].y) * t,
      });
    }
  }
  return result;
}

// ===== 결과 표시 =====
function showResult(score) {
  showScreen('screen-result');

  // 점수 카운트업 애니메이션
  const scoreEl = document.getElementById('score-number');
  const progressEl = document.getElementById('score-progress');
  const circumference = 2 * Math.PI * 54; // 339.292

  scoreEl.textContent = '0';
  progressEl.setAttribute('stroke-dashoffset', circumference);

  // 점수에 따른 메시지 + 이모지
  let title, sub, emoji;
  if (score >= 90) {
    emoji = '🌟';
    title = '완벽해요!';
    sub = '구름냥도 깜짝 놀랐어요 ✨';
  } else if (score >= 75) {
    emoji = '🎉';
    title = '아주 잘했어요!';
    sub = '거의 똑같이 그렸네요 ♥';
  } else if (score >= 60) {
    emoji = '😊';
    title = '잘했어요!';
    sub = '조금만 더 연습하면 완벽 ~';
  } else if (score >= 40) {
    emoji = '💪';
    title = '괜찮아요~';
    sub = '한 번 더 도전해볼까요?';
  } else if (score >= 20) {
    emoji = '🎨';
    title = '재미있어요!';
    sub = '천천히 따라 그려봐요';
  } else {
    emoji = '🐣';
    title = '시작이 반!';
    sub = '다시 한 번 도전해봐요';
  }

  document.getElementById('result-emoji').textContent = emoji;
  document.getElementById('result-title').textContent = title;
  document.getElementById('result-sub').textContent = sub;

  // 점수 + 진행 원 애니메이션
  setTimeout(() => {
    animateScoreNumber(scoreEl, 0, score, 1300);
    progressEl.setAttribute('stroke-dashoffset',
      circumference - (circumference * score / 100));
  }, 200);

  // 미리보기 캔버스에 사용자 그림 + 가이드 그리기
  drawPreview();
}

function animateScoreNumber(el, from, to, duration) {
  const start = performance.now();
  function step(now) {
    const t = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - t, 3); // easeOutCubic
    el.textContent = Math.round(from + (to - from) * eased);
    if (t < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

function drawPreview() {
  const canvas = document.getElementById('preview-canvas');
  const dpr = window.devicePixelRatio || 1;
  const previewSize = 180;
  canvas.width = previewSize * dpr;
  canvas.height = previewSize * dpr;
  canvas.style.width = previewSize + 'px';
  canvas.style.height = previewSize + 'px';
  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);

  // 가이드
  drawGuide(ctx, state.currentShape.d, previewSize, '#E5EEF7', 6);

  // 사용자 그림 (스케일 조정)
  const scale = previewSize / state.canvasSize;
  ctx.strokeStyle = '#FF6B9D';
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  for (const stroke of state.strokes) {
    if (stroke.length < 2) continue;
    ctx.beginPath();
    ctx.moveTo(stroke[0].x * scale, stroke[0].y * scale);
    for (let i = 1; i < stroke.length; i++) {
      ctx.lineTo(stroke[i].x * scale, stroke[i].y * scale);
    }
    ctx.stroke();
  }
}

// ===== 초기 ===
window.addEventListener('DOMContentLoaded', () => {
  renderShapeGrid();
});

// 화면 회전/리사이즈 시 캔버스 다시
window.addEventListener('resize', () => {
  if (document.getElementById('screen-game').classList.contains('active')) {
    initCanvas();
  }
});
