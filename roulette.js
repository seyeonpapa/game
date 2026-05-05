// ===== 룰렛 게임 =====

// 슬라이스 색상 (8개까지 다양하게)
const SLICE_COLORS = [
  '#FF6B9D', // 핑크
  '#5BA8E0', // 블루
  '#FFD93D', // 노랑
  '#A8E6CF', // 민트
  '#C8B6FF', // 라벤더
  '#FFB347', // 오렌지
  '#FF8FAB', // 로즈
  '#6BCFA8', // 그린
];

// 빠른 예시
const PRESETS = {
  food: ['떡볶이', '치킨', '피자', '짜장면', '햄버거'],
  drink: ['딸기우유', '초코우유', '오렌지주스', '콜라'],
  activity: ['게임하기', '책 읽기', '낮잠 자기', '산책 가기', '간식 먹기', '그림 그리기'],
};

// 상태
let state = {
  items: [],
  isSpinning: false,
  currentRotation: 0,
};

const MIN_ITEMS = 2;
const MAX_ITEMS = 8;

// ===== 화면 전환 =====
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

// ===== 항목 추가 =====
function addItem() {
  const input = document.getElementById('item-input');
  const text = input.value.trim();
  if (!text) return;

  if (state.items.length >= MAX_ITEMS) {
    return;
  }

  if (state.items.includes(text)) {
    flashInput('이미 있는 항목이에요!');
    return;
  }

  state.items.push(text);
  input.value = '';
  input.focus();
  renderItems();
}

// ===== 항목 제거 =====
function removeItem(index) {
  state.items.splice(index, 1);
  renderItems();
}

// ===== 항목 리스트 렌더링 =====
function renderItems() {
  const list = document.getElementById('items-list');
  const counter = document.getElementById('item-count');
  const startBtn = document.getElementById('btn-start');
  const addBtn = document.getElementById('btn-add');
  const input = document.getElementById('item-input');

  counter.textContent = state.items.length;

  // 카운터 색상
  const counterEl = counter.parentElement;
  if (state.items.length === MAX_ITEMS) {
    counterEl.classList.add('full');
  } else {
    counterEl.classList.remove('full');
  }

  // 항목 표시
  if (state.items.length === 0) {
    list.innerHTML = '<p class="empty-msg">최소 2개, 최대 8개까지 넣을 수 있어요!</p>';
  } else {
    list.innerHTML = state.items.map((item, i) => `
      <span class="item-chip" style="background:${SLICE_COLORS[i]}">
        ${escapeHtml(item)}
        <button class="item-chip-remove" onclick="removeItem(${i})" title="삭제">✕</button>
      </span>
    `).join('');
  }

  // 버튼 활성화/비활성화
  startBtn.disabled = state.items.length < MIN_ITEMS;
  addBtn.disabled = state.items.length >= MAX_ITEMS;
  input.disabled = state.items.length >= MAX_ITEMS;

  if (state.items.length >= MAX_ITEMS) {
    input.placeholder = '항목이 가득 찼어요!';
  } else {
    input.placeholder = '예: 떡볶이, 치킨, 짜장면...';
  }
}

// ===== 빠른 예시 로드 =====
function loadPreset(key) {
  state.items = [...PRESETS[key]].slice(0, MAX_ITEMS);
  renderItems();
}

// ===== 입력창 흔들기 =====
function flashInput(msg) {
  const input = document.getElementById('item-input');
  const original = input.placeholder;
  input.placeholder = msg;
  input.style.borderColor = 'var(--primary)';
  input.style.animation = 'shake 0.4s';
  setTimeout(() => {
    input.placeholder = original;
    input.style.borderColor = '';
    input.style.animation = '';
  }, 1500);
}

// ===== HTML 이스케이프 =====
function escapeHtml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

// ===== 룰렛 시작 =====
function startRoulette() {
  if (state.items.length < MIN_ITEMS) return;
  drawWheel();
  document.getElementById('result-display').innerHTML = '';
  document.getElementById('result-display').className = 'result-display';
  showScreen('screen-game');
}

function goBackToInput() {
  showScreen('screen-start');
}

// ===== 휠 그리기 (SVG) =====
function drawWheel() {
  const wheel = document.getElementById('wheel');
  const n = state.items.length;
  const cx = 200, cy = 200, r = 195;
  const sliceAngle = 360 / n;

  let svg = '';

  // 슬라이스
  for (let i = 0; i < n; i++) {
    const startAngle = i * sliceAngle - 90; // -90으로 시작점을 위로
    const endAngle = (i + 1) * sliceAngle - 90;
    const path = describeSlice(cx, cy, r, startAngle, endAngle);
    svg += `<path d="${path}" fill="${SLICE_COLORS[i]}" stroke="white" stroke-width="3"/>`;

    // 텍스트 (슬라이스 중앙에)
    const midAngle = (startAngle + endAngle) / 2;
    const textRadius = r * 0.65;
    const tx = cx + textRadius * Math.cos((midAngle * Math.PI) / 180);
    const ty = cy + textRadius * Math.sin((midAngle * Math.PI) / 180);
    const rotateAngle = midAngle + 90; // 글자가 바깥쪽 향하게

    // 폰트 크기는 항목 개수에 따라 조정
    const fontSize = n <= 4 ? 22 : n <= 6 ? 18 : 15;

    // 텍스트 색상은 배경 밝기에 따라 (노랑/민트는 진한 글씨)
    const lightBgs = ['#FFD93D', '#A8E6CF'];
    const textColor = lightBgs.includes(SLICE_COLORS[i]) ? '#2C3E50' : 'white';

    // 글자 길이 제한 (잘림 방지)
    let displayText = state.items[i];
    const maxLen = n <= 4 ? 8 : n <= 6 ? 6 : 5;
    if (displayText.length > maxLen) {
      displayText = displayText.slice(0, maxLen - 1) + '…';
    }

    svg += `<text x="${tx}" y="${ty}"
      transform="rotate(${rotateAngle}, ${tx}, ${ty})"
      text-anchor="middle"
      dominant-baseline="middle"
      fill="${textColor}"
      font-family="Jua, sans-serif"
      font-size="${fontSize}"
      style="pointer-events:none">${escapeHtml(displayText)}</text>`;
  }

  // 외곽 원
  svg += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="white" stroke-width="6"/>`;

  wheel.innerHTML = svg;

  // 회전 초기화
  state.currentRotation = 0;
  wheel.style.transition = 'none';
  wheel.style.transform = 'rotate(0deg)';
  // 강제 reflow
  wheel.getBoundingClientRect();
  wheel.style.transition = '';
}

// SVG 호 path 생성
function describeSlice(cx, cy, r, startAngle, endAngle) {
  const start = polarToCartesian(cx, cy, r, startAngle);
  const end = polarToCartesian(cx, cy, r, endAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? 0 : 1;
  return [
    `M ${cx} ${cy}`,
    `L ${start.x} ${start.y}`,
    `A ${r} ${r} 0 ${largeArcFlag} 1 ${end.x} ${end.y}`,
    'Z'
  ].join(' ');
}

function polarToCartesian(cx, cy, r, angleDeg) {
  const angleRad = (angleDeg * Math.PI) / 180;
  return {
    x: cx + r * Math.cos(angleRad),
    y: cy + r * Math.sin(angleRad),
  };
}

// ===== 룰렛 돌리기 =====
function spinWheel() {
  if (state.isSpinning) return;
  state.isSpinning = true;

  const spinBtn = document.getElementById('btn-spin');
  spinBtn.disabled = true;
  spinBtn.querySelector('.spin-text').textContent = '두근두근...';

  document.getElementById('result-display').innerHTML = '';
  document.getElementById('result-display').className = 'result-display';

  const wheel = document.getElementById('wheel');
  const n = state.items.length;
  const sliceAngle = 360 / n;

  // 랜덤 당첨 인덱스
  const winnerIndex = Math.floor(Math.random() * n);

  // 포인터는 위(12시 방향)에 있고, 슬라이스 0번은 위에서 시작
  // 휠을 시계방향으로 돌리면, winnerIndex 슬라이스가 위로 와야 함
  // 슬라이스 i의 중앙: i * sliceAngle + sliceAngle/2 (시작점 위 기준)
  // 휠 회전 X도 → 슬라이스 i 중앙은 (i*sliceAngle + sliceAngle/2 - X) 위치
  // 위(0도)에 오려면: X = i*sliceAngle + sliceAngle/2
  const targetAngle = winnerIndex * sliceAngle + sliceAngle / 2;

  // 5~7바퀴 + targetAngle만큼 추가 회전 (반시계 방향)
  const extraSpins = 5 + Math.floor(Math.random() * 3);
  // 시계방향 회전을 음수로 → 휠이 돌아가는 효과
  const finalRotation = state.currentRotation - (360 * extraSpins) - targetAngle;

  state.currentRotation = finalRotation;
  wheel.style.transform = `rotate(${finalRotation}deg)`;

  // 4.5초 후 결과 표시
  setTimeout(() => {
    showResult(state.items[winnerIndex], SLICE_COLORS[winnerIndex]);
    state.isSpinning = false;
    spinBtn.disabled = false;
    spinBtn.querySelector('.spin-text').textContent = '다시 돌리기!';
  }, 4600);
}

// ===== 결과 표시 =====
function showResult(item, color) {
  const display = document.getElementById('result-display');
  display.innerHTML = `
    <div class="result-card">
      <div class="result-label">🎉 당첨! 🎉</div>
      <div class="result-text" style="color:${color}">${escapeHtml(item)}</div>
    </div>
  `;
  display.classList.add('show');

  // 컨페티 효과
  launchConfetti(color);
}

// ===== 컨페티 효과 =====
function launchConfetti(mainColor) {
  const colors = [mainColor, '#FFD93D', '#FF6B9D', '#5BA8E0', '#A8E6CF'];
  for (let i = 0; i < 40; i++) {
    const confetti = document.createElement('div');
    confetti.className = 'confetti';
    confetti.style.left = Math.random() * 100 + 'vw';
    confetti.style.top = '-20px';
    confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
    confetti.style.animationDelay = Math.random() * 0.5 + 's';
    confetti.style.animationDuration = (2 + Math.random() * 1.5) + 's';
    confetti.style.borderRadius = Math.random() < 0.5 ? '50%' : '2px';
    confetti.style.transform = `rotate(${Math.random() * 360}deg)`;
    document.body.appendChild(confetti);
    setTimeout(() => confetti.remove(), 4000);
  }
}

// ===== 키보드 이벤트 =====
document.addEventListener('DOMContentLoaded', () => {
  const input = document.getElementById('item-input');
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addItem();
    }
  });
  renderItems();
});
