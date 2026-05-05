// ===== 사다리 게임 =====

const COLORS = [
  '#FF6B9D', '#5BA8E0', '#FFD93D', '#A8E6CF',
  '#C8B6FF', '#FFB347', '#FF8FAB', '#6BCFA8',
];

const TEXT_DARK_BGS = ['#FFD93D', '#A8E6CF']; // 밝은 배경에는 진한 글자

// 상태
let state = {
  playerCount: 4,
  players: ['', '', '', ''],
  results: ['', '', '', ''],
  rungs: [],          // [row][colIdx] = true if rung between col and col+1
  rungRows: 0,
  finalMap: [],       // finalMap[startCol] = endCol
  revealed: new Set(),// 이미 공개된 참가자 인덱스
};

// ===== 화면 전환 =====
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

// ===== 인원 설정 =====
function setPlayerCount(n) {
  state.playerCount = n;
  // 기존 입력 보존
  while (state.players.length < n) state.players.push('');
  while (state.results.length < n) state.results.push('');
  state.players = state.players.slice(0, n);
  state.results = state.results.slice(0, n);

  // 버튼 active 토글
  document.querySelectorAll('.count-btn').forEach(btn => {
    btn.classList.toggle('active', parseInt(btn.dataset.n) === n);
  });

  renderInputs();
}

// ===== 입력 칸 렌더링 =====
function renderInputs() {
  const playerGrid = document.getElementById('player-inputs');
  const resultGrid = document.getElementById('result-inputs');

  playerGrid.innerHTML = state.players.map((v, i) => `
    <div class="input-row-wrapper">
      <span class="input-color-dot" style="background:${COLORS[i]}"></span>
      <input type="text" class="player-input"
        placeholder="${i + 1}번 참가자"
        value="${escapeHtml(v)}"
        data-index="${i}"
        maxlength="10"
        oninput="updatePlayer(${i}, this.value)">
    </div>
  `).join('');

  resultGrid.innerHTML = state.results.map((v, i) => `
    <input type="text" class="result-input"
      placeholder="결과 ${i + 1}"
      value="${escapeHtml(v)}"
      data-index="${i}"
      maxlength="10"
      oninput="updateResult(${i}, this.value)">
  `).join('');
}

function updatePlayer(i, val) {
  state.players[i] = val;
}
function updateResult(i, val) {
  state.results[i] = val;
}

// ===== 빠른 입력 =====
function fillResults(type) {
  if (type === 'order') {
    state.results = state.results.map((_, i) => `${i + 1}번째`);
  } else if (type === 'winner') {
    const winnerIdx = Math.floor(Math.random() * state.playerCount);
    state.results = state.results.map((_, i) => i === winnerIdx ? '🎉 당첨' : '통과');
  } else if (type === 'clear') {
    state.results = state.results.map(() => '');
  }
  renderInputs();
}

// ===== 게임 시작 =====
function startGame() {
  // 빈 참가자 이름 자동 채우기
  state.players = state.players.map((v, i) => v.trim() || `${i + 1}번`);
  state.results = state.results.map((v, i) => v.trim() || `결과 ${i + 1}`);

  generateLadder();
  computeFinalMap();
  state.revealed.clear();
  showScreen('screen-game');

  // 화면 그리기 (DOM이 보여진 후 사이즈 측정)
  requestAnimationFrame(() => {
    renderGameScreen();
  });
}

function goBackToSetup() {
  renderInputs();
  showScreen('screen-setup');
}

function shuffleAndRedraw() {
  generateLadder();
  computeFinalMap();
  state.revealed.clear();
  renderGameScreen();
}

// ===== 사다리 생성 =====
function generateLadder() {
  const n = state.playerCount;
  // 행 수 (참가자 많을수록 더 많이)
  const rows = Math.max(8, n * 2 + 4);
  state.rungRows = rows;
  state.rungs = [];

  for (let r = 0; r < rows; r++) {
    const row = new Array(n - 1).fill(false);
    let prevHadRung = false;
    for (let c = 0; c < n - 1; c++) {
      // 인접 행에 가로줄 두 개가 한 컬럼을 공유 못하게
      if (!prevHadRung && Math.random() < 0.5) {
        row[c] = true;
        prevHadRung = true;
      } else {
        prevHadRung = false;
      }
    }
    state.rungs.push(row);
  }
}

// ===== 시작 → 끝 매핑 계산 =====
function computeFinalMap() {
  const n = state.playerCount;
  state.finalMap = new Array(n);

  for (let start = 0; start < n; start++) {
    let col = start;
    for (let r = 0; r < state.rungRows; r++) {
      // 현재 col 기준: 왼쪽(col-1, col) 또는 오른쪽(col, col+1) 가로줄 확인
      if (col < n - 1 && state.rungs[r][col]) {
        col++; // 오른쪽으로
      } else if (col > 0 && state.rungs[r][col - 1]) {
        col--; // 왼쪽으로
      }
    }
    state.finalMap[start] = col;
  }
}

// ===== 게임 화면 렌더링 =====
function renderGameScreen() {
  const n = state.playerCount;

  // 참가자 행
  const playersRow = document.getElementById('players-row');
  playersRow.style.gridTemplateColumns = `repeat(${n}, 1fr)`;
  playersRow.innerHTML = state.players.map((name, i) => `
    <button class="player-name-btn"
      data-index="${i}"
      style="border-color:${COLORS[i]}"
      onclick="revealPath(${i})">
      ${escapeHtml(name)}
    </button>
  `).join('');

  // 결과 행
  const resultsRow = document.getElementById('results-row');
  resultsRow.style.gridTemplateColumns = `repeat(${n}, 1fr)`;
  resultsRow.innerHTML = state.results.map((name, i) => `
    <div class="result-name-tag" data-index="${i}">${escapeHtml(name)}</div>
  `).join('');

  // SVG 사다리
  drawLadderSvg();
}

// ===== SVG 사다리 그리기 =====
function drawLadderSvg() {
  const svg = document.getElementById('ladder-svg');
  const rect = svg.getBoundingClientRect();
  const W = rect.width || 600;
  const H = rect.height || 380;

  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);

  const n = state.playerCount;
  const padX = W * 0.06;
  const colSpacing = (W - 2 * padX) / (n - 1);
  const rowH = (H - 20) / (state.rungRows + 1);
  const topY = 10;
  const bottomY = topY + rowH * (state.rungRows + 1);

  let svgContent = '';

  // 세로 기둥
  for (let i = 0; i < n; i++) {
    const x = padX + i * colSpacing;
    svgContent += `<line x1="${x}" y1="${topY}" x2="${x}" y2="${bottomY}"
      stroke="var(--ladder-color)" stroke-width="4" stroke-linecap="round"/>`;
  }

  // 가로줄
  for (let r = 0; r < state.rungRows; r++) {
    const y = topY + (r + 1) * rowH;
    for (let c = 0; c < n - 1; c++) {
      if (state.rungs[r][c]) {
        const x1 = padX + c * colSpacing;
        const x2 = padX + (c + 1) * colSpacing;
        svgContent += `<line x1="${x1}" y1="${y}" x2="${x2}" y2="${y}"
          stroke="var(--ladder-color)" stroke-width="4" stroke-linecap="round"/>`;
      }
    }
  }

  // 경로 영역 (초기엔 비어있음)
  svgContent += '<g id="paths-layer"></g>';

  svg.innerHTML = svgContent;

  // 좌표 정보 저장 (경로 그릴 때 사용)
  state.layout = { W, H, padX, colSpacing, rowH, topY };
}

// ===== 경로 표시 (한 명) =====
function revealPath(startCol) {
  if (state.revealed.has(startCol)) return;

  const endCol = state.finalMap[startCol];
  const color = COLORS[startCol];

  // 경로 좌표 계산
  const points = computePath(startCol);
  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

  const pathsLayer = document.getElementById('paths-layer');
  const SVG_NS = 'http://www.w3.org/2000/svg';

  // 그룹 (path + marker)
  const group = document.createElementNS(SVG_NS, 'g');
  pathsLayer.appendChild(group);

  // 경로 (선)
  const pathEl = document.createElementNS(SVG_NS, 'path');
  pathEl.setAttribute('d', pathD);
  pathEl.setAttribute('stroke', color);
  pathEl.setAttribute('stroke-width', '6');
  pathEl.setAttribute('stroke-linecap', 'round');
  pathEl.setAttribute('stroke-linejoin', 'round');
  pathEl.setAttribute('fill', 'none');
  pathEl.setAttribute('opacity', '0.55');
  group.appendChild(pathEl);

  const totalLength = pathEl.getTotalLength();
  // 길이에 비례한 애니메이션 시간 (속도 일정)
  const SPEED = 280; // px per second
  const duration = Math.max(900, (totalLength / SPEED) * 1000);

  // 선 그리기 애니메이션
  pathEl.style.strokeDasharray = totalLength;
  pathEl.style.strokeDashoffset = totalLength;
  pathEl.style.transition = `stroke-dashoffset ${duration}ms linear`;
  pathEl.getBoundingClientRect(); // reflow
  pathEl.style.strokeDashoffset = '0';

  // 마커 (동그라미 + 그림자)
  const markerShadow = document.createElementNS(SVG_NS, 'circle');
  markerShadow.setAttribute('r', '12');
  markerShadow.setAttribute('fill', color);
  markerShadow.setAttribute('opacity', '0.3');
  group.appendChild(markerShadow);

  const marker = document.createElementNS(SVG_NS, 'circle');
  marker.setAttribute('r', '10');
  marker.setAttribute('fill', color);
  marker.setAttribute('stroke', 'white');
  marker.setAttribute('stroke-width', '3');
  group.appendChild(marker);

  // 마커 애니메이션 (requestAnimationFrame)
  const startTime = performance.now();

  function animateMarker(now) {
    const elapsed = now - startTime;
    const t = Math.min(elapsed / duration, 1);
    const len = totalLength * t;
    const pt = pathEl.getPointAtLength(len);

    marker.setAttribute('cx', pt.x);
    marker.setAttribute('cy', pt.y);
    markerShadow.setAttribute('cx', pt.x);
    markerShadow.setAttribute('cy', pt.y + 3);

    // 살짝 통통 튀는 효과
    const bounce = 1 + Math.sin(elapsed / 100) * 0.08;
    marker.setAttribute('r', 10 * bounce);

    if (t < 1) {
      requestAnimationFrame(animateMarker);
    } else {
      // 도착! 결과 하이라이트
      const resultTag = document.querySelector(`.result-name-tag[data-index="${endCol}"]`);
      resultTag.classList.add('highlighted');
      resultTag.style.background = color;

      // 마커 도착 효과 (펄스)
      marker.style.transition = 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)';
      marker.setAttribute('r', '16');
      setTimeout(() => {
        marker.setAttribute('r', '10');
      }, 400);
    }
  }
  requestAnimationFrame(animateMarker);

  state.revealed.add(startCol);

  // 참가자 버튼 색상 변경
  const playerBtn = document.querySelector(`.player-name-btn[data-index="${startCol}"]`);
  playerBtn.classList.add('revealed');
  playerBtn.style.background = color;
}

// ===== 시작 컬럼에서 끝까지 경로 좌표 계산 =====
function computePath(startCol) {
  const { padX, colSpacing, rowH, topY } = state.layout;
  const n = state.playerCount;

  let col = startCol;
  const points = [];
  // 시작점 (위)
  points.push({ x: padX + col * colSpacing, y: topY });

  for (let r = 0; r < state.rungRows; r++) {
    const y = topY + (r + 1) * rowH;
    // 현재 col에서 그 row의 가로줄 확인
    if (col < n - 1 && state.rungs[r][col]) {
      // 오른쪽 이동
      points.push({ x: padX + col * colSpacing, y: y });
      col++;
      points.push({ x: padX + col * colSpacing, y: y });
    } else if (col > 0 && state.rungs[r][col - 1]) {
      // 왼쪽 이동
      points.push({ x: padX + col * colSpacing, y: y });
      col--;
      points.push({ x: padX + col * colSpacing, y: y });
    }
  }

  // 끝점 (아래)
  const bottomY = topY + rowH * (state.rungRows + 1);
  points.push({ x: padX + col * colSpacing, y: bottomY });

  return points;
}

// ===== 모두 보기 =====
function showAllPaths() {
  let delay = 0;
  for (let i = 0; i < state.playerCount; i++) {
    if (!state.revealed.has(i)) {
      setTimeout(() => revealPath(i), delay);
      delay += 350;
    }
  }
}

// ===== 초기화 =====
function resetPaths() {
  state.revealed.clear();
  document.getElementById('paths-layer').innerHTML = '';
  document.querySelectorAll('.player-name-btn').forEach(btn => {
    btn.classList.remove('revealed');
    btn.style.background = '';
  });
  document.querySelectorAll('.result-name-tag').forEach(tag => {
    tag.classList.remove('highlighted');
    tag.style.background = '';
  });
}

// ===== HTML 이스케이프 =====
function escapeHtml(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

// ===== 초기 렌더링 =====
window.addEventListener('DOMContentLoaded', () => {
  renderInputs();
});

// 화면 회전이나 리사이즈 시 사다리 재그리기
window.addEventListener('resize', () => {
  if (document.getElementById('screen-game').classList.contains('active')) {
    drawLadderSvg();
    // 기존 경로 다시 그리기
    const revealed = [...state.revealed];
    state.revealed.clear();
    document.querySelectorAll('.player-name-btn').forEach(btn => {
      btn.classList.remove('revealed');
      btn.style.background = '';
    });
    document.querySelectorAll('.result-name-tag').forEach(tag => {
      tag.classList.remove('highlighted');
      tag.style.background = '';
    });
    revealed.forEach(i => revealPath(i));
  }
});
