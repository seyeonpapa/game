// ===== 밸런스 게임 질문 데이터 =====
// 각 선택지에 특성 태그(traits) 부여 → 결과 화면에서 성격 분석에 사용
// 특성: 건강, 자유, 모험, 지혜, 사랑, 재미, 따뜻함, 창의력, 용기, 매력, 호기심, 감성
const QUESTIONS = [
  {
    left:  { emoji: '😴', text: '잠 안 자도 건강하고 안 졸리기', traits: ['건강', '자유'] },
    right: { emoji: '🍰', text: '마음껏 먹어도 건강하고 살 안 찌기', traits: ['건강', '재미'] },
  },
  {
    left:  { emoji: '🌍', text: '모든 나라의 말 다 할 수 있기', traits: ['지혜', '호기심'] },
    right: { emoji: '🐾', text: '모든 동물과 대화할 수 있기', traits: ['따뜻함', '모험'] },
  },
  {
    left:  { emoji: '🍦', text: '매일 아이스크림 무료로 먹기', traits: ['재미', '자유'] },
    right: { emoji: '📚', text: '매일 새 만화책 한 권씩 받기', traits: ['지혜', '호기심'] },
  },
  {
    left:  { emoji: '🦋', text: '하늘을 날 수 있는 날개 갖기', traits: ['자유', '모험'] },
    right: { emoji: '🐠', text: '물속에서 숨쉴 수 있는 아가미 갖기', traits: ['모험', '호기심'] },
  },
  {
    left:  { emoji: '⏸️', text: '시간을 잠시 멈출 수 있기', traits: ['지혜', '자유'] },
    right: { emoji: '⏪', text: '시간을 되돌릴 수 있기', traits: ['사랑', '따뜻함'] },
  },
  {
    left:  { emoji: '🛠️', text: '무엇이든 척척 만들 수 있는 손', traits: ['창의력', '용기'] },
    right: { emoji: '🎨', text: '무엇이든 예쁘게 그릴 수 있는 손', traits: ['창의력', '감성'] },
  },
  {
    left:  { emoji: '🧹', text: '마법으로 청소 끝내기', traits: ['자유', '따뜻함'] },
    right: { emoji: '✏️', text: '마법으로 숙제 끝내기', traits: ['자유', '지혜'] },
  },
  {
    left:  { emoji: '👻', text: '보이지 않는 투명 망토 갖기', traits: ['자유', '호기심'] },
    right: { emoji: '💭', text: '친구와 마음으로 대화하는 능력', traits: ['사랑', '따뜻함'] },
  },
  {
    left:  { emoji: '👯', text: '매일 새로운 친구 사귀기', traits: ['매력', '모험'] },
    right: { emoji: '👭', text: '평생 가는 단짝 친구 한 명', traits: ['사랑', '따뜻함'] },
  },
  {
    left:  { emoji: '💪', text: '100살까지 아주 건강하게 살기', traits: ['건강', '지혜'] },
    right: { emoji: '☀️', text: '평생 행복하게 웃으며 살기', traits: ['사랑', '재미'] },
  },
  {
    left:  { emoji: '⭐', text: '슈퍼 스타로 1년 살기', traits: ['매력', '재미'] },
    right: { emoji: '🌳', text: '평범하게 100년 살기', traits: ['따뜻함', '지혜'] },
  },
  {
    left:  { emoji: '🚀', text: '우주여행 한 번 가보기', traits: ['모험', '용기'] },
    right: { emoji: '🤿', text: '바다 깊은 곳 탐험하기', traits: ['모험', '호기심'] },
  },
  {
    left:  { emoji: '🎮', text: '마음껏 게임할 수 있는 1년', traits: ['재미', '자유'] },
    right: { emoji: '📺', text: '마음껏 만화 볼 수 있는 1년', traits: ['재미', '감성'] },
  },
  {
    left:  { emoji: '🦁', text: '동물들의 대장 되기', traits: ['용기', '사랑'] },
    right: { emoji: '🌳', text: '식물들의 대장 되기', traits: ['따뜻함', '감성'] },
  },
  {
    left:  { emoji: '🎤', text: '평생 노래 부르며 살기', traits: ['창의력', '감성'] },
    right: { emoji: '💃', text: '평생 춤추며 살기', traits: ['창의력', '자유'] },
  },
  {
    left:  { emoji: '📖', text: '책 한 권 읽으면 모두 외워짐', traits: ['지혜', '호기심'] },
    right: { emoji: '🎬', text: '영화 한 편 보면 모두 외워짐', traits: ['지혜', '재미'] },
  },
  {
    left:  { emoji: '🏃', text: '100m를 1초에 달리기', traits: ['용기', '자유'] },
    right: { emoji: '🍳', text: '어떤 음식이든 5분 만에 만들기', traits: ['창의력', '따뜻함'] },
  },
  {
    left:  { emoji: '💖', text: '모든 사람이 나를 좋아하기', traits: ['매력', '사랑'] },
    right: { emoji: '🤗', text: '내가 모든 사람을 좋아하기', traits: ['따뜻함', '사랑'] },
  },
  {
    left:  { emoji: '🦕', text: '공룡 시대로 가서 살기', traits: ['모험', '용기'] },
    right: { emoji: '🤖', text: '미래 100년 후로 가서 살기', traits: ['호기심', '모험'] },
  },
  {
    left:  { emoji: '🤫', text: '내 비밀을 친구들이 다 알기', traits: ['자유', '사랑'] },
    right: { emoji: '👀', text: '친구들의 비밀을 내가 다 알기', traits: ['호기심', '지혜'] },
  },
  {
    left:  { emoji: '🎶', text: '내가 만든 노래가 세계 최고', traits: ['창의력', '감성'] },
    right: { emoji: '🖼️', text: '내가 그린 그림이 세계 최고', traits: ['창의력', '매력'] },
  },
  {
    left:  { emoji: '🧜‍♀️', text: '바다에서 인어 친구 만나기', traits: ['모험', '감성'] },
    right: { emoji: '🧚‍♀️', text: '숲에서 요정 친구 만나기', traits: ['따뜻함', '감성'] },
  },
  {
    left:  { emoji: '🎈', text: '영원히 9살로 살기', traits: ['재미', '자유'] },
    right: { emoji: '👩‍💼', text: '하루 빨리 멋진 어른 되기', traits: ['지혜', '용기'] },
  },
  {
    left:  { emoji: '⭐', text: '하늘에 내 이름의 별 하나 갖기', traits: ['감성', '자유'] },
    right: { emoji: '🏝️', text: '바다에 내 이름의 섬 하나 갖기', traits: ['자유', '모험'] },
  },
  {
    left:  { emoji: '🐶', text: '동물 친구 100마리와 살기', traits: ['따뜻함', '사랑'] },
    right: { emoji: '👫', text: '사람 친구 100명과 살기', traits: ['매력', '사랑'] },
  },
  {
    left:  { emoji: '✏️', text: '평생 숙제가 사라지기', traits: ['자유', '재미'] },
    right: { emoji: '📝', text: '평생 시험이 사라지기', traits: ['자유', '지혜'] },
  },
  {
    left:  { emoji: '🌈', text: '비 올 때마다 무지개 보기', traits: ['감성', '따뜻함'] },
    right: { emoji: '❄️', text: '눈 올 때마다 반짝이 별 보기', traits: ['감성', '호기심'] },
  },
  {
    left:  { emoji: '✈️', text: '1년 동안 마음껏 세계여행', traits: ['모험', '호기심'] },
    right: { emoji: '🛌', text: '1년 동안 마음껏 푹 쉬기', traits: ['자유', '따뜻함'] },
  },
  {
    left:  { emoji: '😋', text: '모든 음식이 다 맛있게 느껴지기', traits: ['재미', '따뜻함'] },
    right: { emoji: '👗', text: '어떤 옷이든 다 잘 어울리기', traits: ['매력', '자유'] },
  },
  {
    left:  { emoji: '💭', text: '잘 때 항상 행복한 꿈 꾸기', traits: ['따뜻함', '감성'] },
    right: { emoji: '🌅', text: '아침에 항상 좋은 일 생기기', traits: ['사랑', '재미'] },
  },
  {
    left:  { emoji: '🌱', text: '식물에게 물 주면 바로 쑥쑥 자람', traits: ['따뜻함', '감성'] },
    right: { emoji: '🐾', text: '동물에게 인사하면 바로 친구됨', traits: ['따뜻함', '사랑'] },
  },
  {
    left:  { emoji: '🌸', text: '평생 따뜻한 봄날씨로 살기', traits: ['따뜻함', '사랑'] },
    right: { emoji: '🍂', text: '평생 시원한 가을날씨로 살기', traits: ['감성', '자유'] },
  },
  {
    left:  { emoji: '🧹', text: '마법 빗자루로 하늘 날기', traits: ['모험', '자유'] },
    right: { emoji: '🪄', text: '마법 양탄자로 하늘 날기', traits: ['매력', '자유'] },
  },
  {
    left:  { emoji: '🌸', text: '내가 노래하면 꽃이 활짝 피기', traits: ['창의력', '감성'] },
    right: { emoji: '✨', text: '내가 춤을 추면 별이 반짝이기', traits: ['창의력', '매력'] },
  },
  {
    left:  { emoji: '🐰', text: '어떤 동물이든 나를 보면 좋아함', traits: ['매력', '따뜻함'] },
    right: { emoji: '🌷', text: '어떤 식물이든 나를 보면 활짝 피기', traits: ['따뜻함', '감성'] },
  },
  {
    left:  { emoji: '😊', text: '슬픈 친구를 웃게 해주는 능력', traits: ['재미', '사랑'] },
    right: { emoji: '💪', text: '힘든 친구를 도와주는 능력', traits: ['용기', '따뜻함'] },
  },
  {
    left:  { emoji: '🌈', text: '머리카락이 매일 무지개 색', traits: ['매력', '감성'] },
    right: { emoji: '✨', text: '옷에 별이 반짝반짝 빛나기', traits: ['창의력', '매력'] },
  },
  {
    left:  { emoji: '🦄', text: '나만의 유니콘 친구 갖기', traits: ['감성', '사랑'] },
    right: { emoji: '🐉', text: '나만의 작은 용 친구 갖기', traits: ['용기', '모험'] },
  },
];

// ===== 특성별 형용사 (결과 메시지용) =====
const TRAIT_ADJECTIVES = {
  '건강': '건강한',
  '자유': '자유로운',
  '모험': '모험을 좋아하는',
  '지혜': '지혜로운',
  '사랑': '사랑이 가득한',
  '재미': '재미있는',
  '따뜻함': '마음이 따뜻한',
  '창의력': '창의적인',
  '용기': '용감한',
  '매력': '매력 넘치는',
  '호기심': '호기심 많은',
  '감성': '감성이 풍부한',
};

// ===== 특성별 칭찬 한 줄 =====
const TRAIT_DESCRIPTIONS = {
  '건강': '튼튼하고 활기차게 하루를 살아가요',
  '자유': '하늘을 나는 새처럼 자유로워요',
  '모험': '새로운 세상이 늘 궁금한 탐험가예요',
  '지혜': '똑똑하고 깊이 생각할 줄 알아요',
  '사랑': '주변 모두를 따뜻하게 안아주는 마음이에요',
  '재미': '함께 있으면 모두가 즐거워져요',
  '따뜻함': '햇살같이 포근한 사람이에요',
  '창의력': '머릿속에 반짝이는 아이디어가 가득해요',
  '용기': '어려움 앞에서도 씩씩하게 도전해요',
  '매력': '반짝반짝 빛나는 매력이 있어요',
  '호기심': '세상의 모든 것이 궁금한 똑똑이예요',
  '감성': '예쁜 것을 보고 마음을 잘 느껴요',
};

// ===== 특성별 이모지 =====
const TRAIT_EMOJIS = {
  '건강': '💪', '자유': '🦋', '모험': '🚀', '지혜': '📚',
  '사랑': '💖', '재미': '🎉', '따뜻함': '☀️', '창의력': '🎨',
  '용기': '🦁', '매력': '✨', '호기심': '🔍', '감성': '🌸',
};

// ===== 게임 상태 =====
let state = {
  totalQuestions: 10,
  currentIndex: 0,
  questions: [],
  answers: [],
  isAnimating: false,
};

// ===== 화면 전환 =====
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

// ===== 게임 시작 =====
function startGame(count) {
  state.totalQuestions = count;
  state.currentIndex = 0;
  state.answers = [];

  const shuffled = [...QUESTIONS].sort(() => Math.random() - 0.5);
  state.questions = shuffled.slice(0, count);

  // 좌우 위치도 랜덤하게 섞기 (편향 방지)
  state.questions = state.questions.map(q => {
    if (Math.random() < 0.5) {
      return { left: q.right, right: q.left };
    }
    return q;
  });

  document.getElementById('progress-total').textContent = count;
  showScreen('screen-game');
  renderQuestion();
}

// ===== 질문 렌더링 =====
function renderQuestion() {
  const q = state.questions[state.currentIndex];
  if (!q) {
    showResult();
    return;
  }

  document.getElementById('progress-current').textContent = state.currentIndex + 1;
  const pct = ((state.currentIndex) / state.totalQuestions) * 100;
  document.getElementById('progress-fill').style.width = pct + '%';

  document.getElementById('emoji-left').textContent = q.left.emoji;
  document.getElementById('text-left').textContent = q.left.text;
  document.getElementById('emoji-right').textContent = q.right.emoji;
  document.getElementById('text-right').textContent = q.right.text;

  const cardLeft = document.getElementById('card-left');
  const cardRight = document.getElementById('card-right');
  cardLeft.classList.remove('selected', 'faded');
  cardRight.classList.remove('selected', 'faded');

  state.isAnimating = false;
}

// ===== 선택 =====
function select(side) {
  if (state.isAnimating) return;
  state.isAnimating = true;

  const q = state.questions[state.currentIndex];
  state.answers.push({ question: q, choice: side });

  const selectedCard = document.getElementById(side === 'left' ? 'card-left' : 'card-right');
  const otherCard = document.getElementById(side === 'left' ? 'card-right' : 'card-left');

  selectedCard.classList.add('selected');
  otherCard.classList.add('faded');

  const pct = ((state.currentIndex + 1) / state.totalQuestions) * 100;
  document.getElementById('progress-fill').style.width = pct + '%';

  setTimeout(() => {
    state.currentIndex++;
    renderQuestion();
  }, 800);
}

// ===== 특성 점수 계산 =====
function calculateTraits() {
  const scores = {};
  state.answers.forEach(ans => {
    const chosen = ans.question[ans.choice];
    if (chosen.traits) {
      chosen.traits.forEach(t => {
        scores[t] = (scores[t] || 0) + 1;
      });
    }
  });
  // 점수 높은 순으로 정렬
  return Object.entries(scores)
    .sort((a, b) => b[1] - a[1])
    .map(([trait, count]) => ({ trait, count }));
}

// ===== 결과 메시지 생성 =====
function buildResultMessage(topTraits) {
  if (topTraits.length === 0) {
    return {
      title: '당신은 정말 멋진 사람이에요!',
      sub: '모든 면에서 반짝반짝 빛나요 ✨',
      emoji: '🌟',
    };
  }

  const top1 = topTraits[0].trait;
  const adj1 = TRAIT_ADJECTIVES[top1];
  const emoji = TRAIT_EMOJIS[top1];

  // 동점이거나 두 번째 특성이 있으면 두 개 합쳐서
  if (topTraits.length >= 2 && topTraits[1].count >= topTraits[0].count - 1) {
    const top2 = topTraits[1].trait;
    const adj2 = TRAIT_ADJECTIVES[top2];
    return {
      title: `당신은 ${adj1} ${adj2} 사람이에요!`,
      sub: `${TRAIT_DESCRIPTIONS[top1]} ♥`,
      emoji: emoji,
    };
  }

  return {
    title: `당신은 ${adj1} 사람이에요!`,
    sub: `${TRAIT_DESCRIPTIONS[top1]} ♥`,
    emoji: emoji,
  };
}

// ===== 결과 표시 =====
function showResult() {
  const topTraits = calculateTraits();
  const msg = buildResultMessage(topTraits);

  document.getElementById('result-emoji').textContent = msg.emoji;
  document.getElementById('result-title').textContent = msg.title;
  document.getElementById('result-sub').textContent = msg.sub;

  // 상위 3개 특성 뱃지
  const topBadges = topTraits.slice(0, 3).map(({ trait, count }) => `
    <div class="trait-badge">
      <span class="trait-badge-emoji">${TRAIT_EMOJIS[trait]}</span>
      <span class="trait-badge-text">${trait}</span>
      <span class="trait-badge-count">${count}</span>
    </div>
  `).join('');
  document.getElementById('result-traits').innerHTML = topBadges;

  // 선택한 답변들 리스트
  const list = document.getElementById('result-list');
  list.innerHTML = state.answers.map((ans, i) => {
    const chosen = ans.question[ans.choice];
    const other = ans.question[ans.choice === 'left' ? 'right' : 'left'];
    const sideClass = ans.choice === 'right' ? 'right-side' : '';
    return `
      <div class="result-item ${sideClass}" style="animation-delay: ${i * 0.05}s">
        <span class="result-item-emoji">${chosen.emoji}</span>
        <span class="result-item-text">${chosen.text}</span>
      </div>
    `;
  }).join('');

  showScreen('screen-result');
}

// ===== 다시 하기 =====
function restartGame() {
  showScreen('screen-start');
}
