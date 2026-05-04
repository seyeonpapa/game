// ===== API 설정 (프록시 서버 경유) =====
const API_URL = '/api/search';

// ===== 게임 상태 =====
const PLAYER_COLORS = ['var(--p1)', 'var(--p2)', 'var(--p3)', 'var(--p4)'];
const COLOR_HEX = ['#E85D3A', '#2E7D6F', '#7B1FA2', '#1565C0'];

let state = {
  playerCount: 0,
  mode: '', // 'pvp' or 'pvc'
  difficulty: 1,
  players: [],
  currentPlayerIndex: 0,
  currentWord: '',
  lastChar: '',
  usedWords: new Set(),
  round: 1,
  isGameOver: false,
  wordDB: null,
  allWords: null,
};

// ===== 로컬 사전 초기화 (컴퓨터 플레이어용) =====
const { db: wordDB, allWords } = initWordDB();
state.wordDB = wordDB;
state.allWords = allWords;

// ===== API 단어 검색 =====
async function searchWordAPI(word) {
  try {
    const params = new URLSearchParams({
      q: word,
      method: 'exact',
      pos: '1',
    });
    const res = await fetch(`${API_URL}?${params}`);
    if (!res.ok) return null;
    const data = await res.json();

    if (!data.channel || !data.channel.item || data.channel.total === 0) {
      return null;
    }

    // 정확히 일치하는 명사 찾기 (번호 제거: "사과01" → "사과")
    const items = data.channel.item.filter(item =>
      item.word.replace(/\d+$/, '') === word && item.pos === '명사'
    );

    if (items.length === 0) return null;

    // 가장 대표적인 뜻 반환
    const bestItem = items[0];
    return {
      word: word,
      meaning: bestItem.sense?.definition || '',
    };
  } catch (e) {
    console.error('API 호출 실패:', e);
    return null;
  }
}

// ===== API로 특정 글자로 시작하는 단어 검색 (힌트용) =====
async function searchWordsStartingWith(char) {
  try {
    const params = new URLSearchParams({
      q: char,
      method: 'start',
      pos: '1',
      num: '20',
    });
    const res = await fetch(`${API_URL}?${params}`);
    if (!res.ok) return [];
    const data = await res.json();

    if (!data.channel || !data.channel.item) return [];

    return data.channel.item
      .filter(item => {
        const w = item.word.replace(/\d+$/, '');
        return w.length >= 2 && item.pos === '명사' && /^[가-힣]+$/.test(w);
      })
      .map(item => ({
        word: item.word.replace(/\d+$/, ''),
        meaning: item.sense?.definition || '',
      }));
  } catch (e) {
    console.error('API 힌트 검색 실패:', e);
    return [];
  }
}

// ===== 화면 전환 =====
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

function goBack(targetScreen) {
  showScreen(targetScreen);
}

// ===== 인원 선택 =====
function selectPlayers(count) {
  state.playerCount = count;
  if (count === 2) {
    showScreen('screen-mode');
  } else {
    state.mode = 'pvp';
    showNameInputs();
  }
}

// ===== 모드 선택 (2인용) =====
function selectMode(mode) {
  state.mode = mode;
  if (mode === 'pvc') {
    showScreen('screen-difficulty');
  } else {
    showNameInputs();
  }
}

// ===== 난이도 선택 =====
function selectDifficulty(level) {
  state.difficulty = level;
  showNameInputs();
}

// ===== 뒤로가기 (이름 화면에서) =====
function goBackFromNames() {
  if (state.mode === 'pvc') {
    showScreen('screen-difficulty');
  } else if (state.playerCount === 2) {
    showScreen('screen-mode');
  } else {
    showScreen('screen-start');
  }
}

// ===== 이름 입력 =====
function showNameInputs() {
  const container = document.getElementById('name-inputs');
  container.innerHTML = '';

  const humanCount = state.mode === 'pvc' ? 1 : state.playerCount;

  for (let i = 0; i < humanCount; i++) {
    const row = document.createElement('div');
    row.className = 'name-row';
    row.innerHTML = `
      <div class="name-dot" style="background:${COLOR_HEX[i]}"></div>
      <input type="text" class="name-input" placeholder="플레이어 ${i + 1} 이름"
        value="플레이어 ${i + 1}" data-index="${i}">
    `;
    container.appendChild(row);
  }

  if (state.mode === 'pvc') {
    const diffNames = ['', '초등 저학년', '초등 고학년', '중학생', '고등학생+'];
    const row = document.createElement('div');
    row.className = 'name-row';
    row.innerHTML = `
      <div class="name-dot" style="background:${COLOR_HEX[1]}"></div>
      <input type="text" class="name-input" value="컴퓨터 (${diffNames[state.difficulty]})" disabled>
    `;
    container.appendChild(row);
  }

  showScreen('screen-names');

  setTimeout(() => {
    const firstInput = container.querySelector('.name-input:not([disabled])');
    if (firstInput) {
      firstInput.select();
    }
  }, 100);
}

// ===== 게임 시작 =====
function startGame() {
  state.players = [];
  const inputs = document.querySelectorAll('#name-inputs .name-input');

  if (state.mode === 'pvc') {
    const name = inputs[0].value.trim() || '플레이어 1';
    const diffNames = ['', '초등 저학년', '초등 고학년', '중학생', '고등학생+'];
    state.players = [
      { name, isComputer: false, eliminated: false, wordsPlayed: 0, hintsLeft: 3, color: COLOR_HEX[0] },
      { name: `컴퓨터 (${diffNames[state.difficulty]})`, isComputer: true, eliminated: false, wordsPlayed: 0, hintsLeft: 0, color: COLOR_HEX[1] },
    ];
  } else {
    inputs.forEach((input, i) => {
      const name = input.value.trim() || `플레이어 ${i + 1}`;
      state.players.push({
        name, isComputer: false, eliminated: false, wordsPlayed: 0, hintsLeft: 3, color: COLOR_HEX[i],
      });
    });
  }

  state.currentPlayerIndex = 0;
  state.currentWord = '';
  state.lastChar = '';
  state.usedWords = new Set();
  state.round = 1;
  state.isGameOver = false;

  showScreen('screen-game');
  renderPlayerBar();
  renderTurn();

  document.getElementById('current-word').textContent = '첫 단어를 입력하세요!';
  document.getElementById('next-char-hint').innerHTML = '';
  document.getElementById('history-words').innerHTML = '';
  document.getElementById('round-number').textContent = '1';

  const wordInput = document.getElementById('word-input');
  wordInput.value = '';
  wordInput.disabled = false;
  wordInput.focus();

  wordInput.onkeydown = (e) => {
    if (e.key === 'Enter' && !wordInput.disabled) {
      submitWord();
    }
  };
}

// ===== 플레이어 바 렌더링 =====
function renderPlayerBar() {
  const bar = document.getElementById('player-bar');
  bar.innerHTML = state.players.map((p, i) => `
    <div class="player-tag ${i === state.currentPlayerIndex ? 'active' : ''} ${p.eliminated ? 'eliminated' : ''}"
      style="color: ${p.color}" id="player-tag-${i}">
      <div class="player-dot" style="background: ${p.color}"></div>
      <span class="player-name">${p.name}</span>
      <span class="player-score">${p.wordsPlayed}단어</span>
    </div>
  `).join('');
}

// ===== 턴 표시 =====
function renderTurn() {
  const player = state.players[state.currentPlayerIndex];
  const indicator = document.getElementById('turn-indicator');
  indicator.innerHTML = `<span style="color:${player.color}">🎯 ${player.name}</span>의 차례`;

  const hintBtn = document.getElementById('btn-hint');
  const hintCount = document.getElementById('hint-count');

  if (player.isComputer) {
    hintBtn.disabled = true;
    hintCount.textContent = '-';
  } else {
    hintBtn.disabled = player.hintsLeft <= 0;
    hintCount.textContent = player.hintsLeft;
  }
}

// ===== 입력 잠금/해제 =====
function setInputLocked(locked) {
  const input = document.getElementById('word-input');
  const submitBtn = document.getElementById('btn-submit');
  const hintBtn = document.getElementById('btn-hint');
  const giveupBtn = document.getElementById('btn-giveup');
  input.disabled = locked;
  submitBtn.disabled = locked;
  if (locked) {
    hintBtn.disabled = true;
    giveupBtn.disabled = true;
  } else {
    const player = state.players[state.currentPlayerIndex];
    hintBtn.disabled = player.hintsLeft <= 0;
    giveupBtn.disabled = false;
  }
}

// ===== 단어 제출 (비동기 — API 호출) =====
async function submitWord() {
  const input = document.getElementById('word-input');
  const word = input.value.trim();

  if (!word) return;

  // 기본 검증 (빠른 체크)
  const quickCheck = validateWordLocal(word);
  if (!quickCheck.valid) {
    showMessage(quickCheck.message, 'error');
    input.select();
    return;
  }

  // API 검증 중 입력 잠금
  setInputLocked(true);
  showMessage('📖 사전에서 확인 중...', 'success');

  const apiResult = await searchWordAPI(word);

  if (!apiResult) {
    // API에서 못 찾음 → 로컬 사전도 확인
    if (state.allWords.has(word)) {
      const firstChar = word[0];
      const entry = state.wordDB[firstChar]?.find(e => e.word === word);
      setInputLocked(false);
      applyWord(word, entry ? entry.meaning : '');
    } else {
      setInputLocked(false);
      showMessage('📕 사전에 없는 단어예요! 다시 시도해주세요.', 'error');
      input.select();
    }
    return;
  }

  // API에서 찾음!
  setInputLocked(false);
  applyWord(word, apiResult.meaning);
}

// ===== 로컬 기본 검증 (글자 수, 한글, 중복, 첫 글자) =====
function validateWordLocal(word) {
  if (word.length < 2) {
    return { valid: false, message: '2글자 이상의 단어를 입력해주세요!' };
  }

  if (!/^[가-힣]+$/.test(word)) {
    return { valid: false, message: '한글 단어만 입력할 수 있어요!' };
  }

  if (state.usedWords.has(word)) {
    return { valid: false, message: '이미 사용된 단어예요!' };
  }

  if (state.lastChar) {
    const firstChar = word[0];
    const validChars = getStartChars(state.lastChar);
    if (!validChars.includes(firstChar)) {
      const charList = validChars.map(c => `"${c}"`).join(' 또는 ');
      return { valid: false, message: `${charList}(으)로 시작하는 단어를 입력해주세요!` };
    }
  }

  return { valid: true };
}

// ===== 단어 적용 =====
function applyWord(word, meaning) {
  const player = state.players[state.currentPlayerIndex];

  state.usedWords.add(word);
  state.currentWord = word;
  state.lastChar = word[word.length - 1];
  player.wordsPlayed++;

  document.getElementById('current-word').textContent = word;

  const nextChars = getStartChars(state.lastChar);
  const charBadges = nextChars.map(c => `<span class="next-char-badge">${c}</span>`).join(' ');
  document.getElementById('next-char-hint').innerHTML = `다음 글자: ${charBadges}`;

  const historyEl = document.getElementById('history-words');
  const chip = document.createElement('span');
  chip.className = 'history-chip';
  chip.textContent = word;
  chip.title = meaning;
  chip.style.borderColor = player.color;
  historyEl.appendChild(chip);

  if (meaning) {
    showMessage(`✅ "${word}" — ${meaning}`, 'success');
  } else {
    showMessage(`✅ "${word}" 정답!`, 'success');
  }

  document.getElementById('word-input').value = '';
  renderPlayerBar();
  nextTurn();
}

// ===== 다음 턴 =====
function nextTurn() {
  if (state.isGameOver) return;

  let next = state.currentPlayerIndex;
  let count = 0;

  do {
    next = (next + 1) % state.players.length;
    count++;
    if (count > state.players.length) break;
  } while (state.players[next].eliminated);

  if (next <= state.currentPlayerIndex) {
    state.round++;
    document.getElementById('round-number').textContent = state.round;
  }

  state.currentPlayerIndex = next;
  renderPlayerBar();
  renderTurn();

  const currentPlayer = state.players[state.currentPlayerIndex];

  if (currentPlayer.isComputer) {
    computerTurn();
  } else {
    setInputLocked(false);
    const input = document.getElementById('word-input');
    input.focus();
  }
}

// ===== 컴퓨터 턴 (API 연동) =====
async function computerTurn() {
  const input = document.getElementById('word-input');
  input.disabled = true;
  document.getElementById('btn-submit').disabled = true;

  document.getElementById('input-area').style.display = 'none';
  document.getElementById('computer-thinking').classList.remove('hidden');

  // 최소 생각 시간 (자연스러운 딜레이)
  const minDelay = 800 + Math.random() * 1200;
  const startTime = Date.now();

  const result = await computerChooseWord();

  // 최소 딜레이 보장
  const elapsed = Date.now() - startTime;
  if (elapsed < minDelay) {
    await new Promise(r => setTimeout(r, minDelay - elapsed));
  }

  document.getElementById('computer-thinking').classList.add('hidden');
  document.getElementById('input-area').style.display = 'block';

  if (result) {
    applyWord(result.word, result.meaning);
  } else {
    showMessage(`🤖 컴퓨터가 단어를 찾지 못했어요!`, 'error');
    eliminateCurrentPlayer();
  }
}

// ===== 난이도별 단어 필터 =====
// 난이도별로 적절한 단어 길이/타입 선호도
function difficultyFilter(word, definition) {
  const len = word.length;
  // 쉬운 난이도일수록 짧은 단어 선호
  // 어려운 난이도일수록 다양한 길이 허용
  switch (state.difficulty) {
    case 1: return len <= 3; // 초등 저학년: 2~3글자
    case 2: return len <= 4; // 초등 고학년: 2~4글자
    case 3: return len <= 5; // 중학생: 2~5글자
    case 4: return true;     // 고등학생+: 모든 길이
    default: return true;
  }
}

// ===== 컴퓨터 단어 선택 (API + 로컬 결합) =====
async function computerChooseWord() {
  // 첫 턴
  if (!state.lastChar && state.usedWords.size === 0) {
    const allEntries = [];
    Object.values(state.wordDB).forEach(entries => {
      entries.forEach(e => {
        if (e.level <= state.difficulty && e.word.length >= 2) {
          allEntries.push(e);
        }
      });
    });
    if (allEntries.length === 0) return null;
    const picked = allEntries[Math.floor(Math.random() * allEntries.length)];
    return { word: picked.word, meaning: picked.meaning };
  }

  // 1. API에서 시작 글자별 단어 검색 (두음법칙 모두 포함)
  const startChars = getStartChars(state.lastChar);
  let apiCandidates = [];

  for (const ch of startChars) {
    const results = await searchWordsStartingWith(ch);
    apiCandidates.push(...results);
  }

  // 사용된 단어 제거 + 한 글자 단어 제거 + 난이도 필터링
  apiCandidates = apiCandidates.filter(r =>
    !state.usedWords.has(r.word) &&
    r.word.length >= 2 &&
    difficultyFilter(r.word, r.meaning)
  );

  // 2. 로컬 사전 후보도 함께 모음
  const localCandidates = findWords(state.wordDB, state.lastChar, state.difficulty, state.usedWords)
    .map(e => ({ word: e.word, meaning: e.meaning }));

  // 중복 제거하며 합치기
  const merged = new Map();
  [...apiCandidates, ...localCandidates].forEach(c => {
    if (!merged.has(c.word)) merged.set(c.word, c);
  });

  let candidates = Array.from(merged.values());

  if (candidates.length === 0) return null;

  // 3. 난이도별 전략
  if (state.difficulty >= 3) {
    // 중상급: 상대가 이을 단어가 적은 글자로 끝나는 단어 선호 (전략적)
    const scored = await Promise.all(candidates.slice(0, 15).map(async c => {
      const endChar = c.word[c.word.length - 1];
      // 로컬에서 빠르게 다음 단어 수 계산
      const nextWords = findWords(state.wordDB, endChar, 4, state.usedWords);
      return { ...c, score: nextWords.length };
    }));

    scored.sort((a, b) => a.score - b.score);
    const topN = scored.slice(0, Math.min(5, scored.length));
    return topN[Math.floor(Math.random() * topN.length)];
  } else {
    // 초중급: 랜덤 선택
    return candidates[Math.floor(Math.random() * candidates.length)];
  }
}

// ===== 메시지 표시 =====
function showMessage(text, type) {
  const box = document.getElementById('message-box');
  box.textContent = text;
  box.className = `message-box ${type}`;
}

// ===== 힌트 사용 (API 연동) =====
async function useHint() {
  const player = state.players[state.currentPlayerIndex];
  if (player.hintsLeft <= 0 || player.isComputer) return;

  if (!state.lastChar) {
    // 첫 턴: 로컬 사전에서 힌트
    const allEntries = [];
    Object.values(state.wordDB).forEach(entries => {
      entries.forEach(e => {
        if (e.word.length >= 2 && !state.usedWords.has(e.word)) {
          allEntries.push(e);
        }
      });
    });
    if (allEntries.length === 0) {
      showMessage('힌트를 줄 수 있는 단어가 없어요...', 'error');
      return;
    }
    const hint = allEntries[Math.floor(Math.random() * allEntries.length)];
    player.hintsLeft--;
    updateHintUI(player);
    const charHint = '◯'.repeat(hint.word.length);
    showMessage(`💡 힌트: ${charHint} (${hint.word.length}글자) — "${hint.meaning}"`, 'hint');
    return;
  }

  // API에서 힌트 단어 검색
  setInputLocked(true);
  showMessage('💡 힌트를 찾는 중...', 'success');

  const startChars = getStartChars(state.lastChar);
  let hintWords = [];

  for (const ch of startChars) {
    const results = await searchWordsStartingWith(ch);
    const filtered = results.filter(r => !state.usedWords.has(r.word));
    hintWords.push(...filtered);
    if (hintWords.length >= 5) break;
  }

  // API 결과가 없으면 로컬 사전 사용
  if (hintWords.length === 0) {
    hintWords = findWords(state.wordDB, state.lastChar, 4, state.usedWords);
  }

  setInputLocked(false);

  if (hintWords.length === 0) {
    showMessage('힌트를 줄 수 있는 단어가 없어요...', 'error');
    return;
  }

  const hint = hintWords[Math.floor(Math.random() * hintWords.length)];

  player.hintsLeft--;
  updateHintUI(player);

  const charHint = '◯'.repeat(hint.word.length);
  showMessage(`💡 힌트: ${charHint} (${hint.word.length}글자) — "${hint.meaning}"`, 'hint');
}

function updateHintUI(player) {
  document.getElementById('hint-count').textContent = player.hintsLeft;
  if (player.hintsLeft <= 0) {
    document.getElementById('btn-hint').disabled = true;
  }
}

// ===== 포기 =====
function giveUp() {
  const player = state.players[state.currentPlayerIndex];

  if (state.players.filter(p => !p.eliminated).length <= 1) {
    return;
  }

  showMessage(`😢 ${player.name}이(가) 포기했어요!`, 'error');
  eliminateCurrentPlayer();
}

// ===== 플레이어 탈락 =====
function eliminateCurrentPlayer() {
  const player = state.players[state.currentPlayerIndex];
  player.eliminated = true;

  renderPlayerBar();

  const remaining = state.players.filter(p => !p.eliminated);

  if (remaining.length <= 1) {
    endGame(remaining[0]);
  } else {
    nextTurn();
  }
}

// ===== 게임 종료 =====
function endGame(winner) {
  state.isGameOver = true;

  setTimeout(() => {
    showScreen('screen-result');

    document.getElementById('result-title').textContent = winner
      ? `🎉 ${winner.name} 승리!`
      : '무승부!';

    const statsEl = document.getElementById('result-stats');
    statsEl.innerHTML = state.players.map(p => `
      <div class="stat-row">
        <div class="stat-name">
          <span class="stat-dot" style="background:${p.color}"></span>
          ${p.name}
        </div>
        <div class="stat-value">${p.wordsPlayed}단어 ${p.eliminated ? '(탈락)' : '(승리!)'}</div>
      </div>
    `).join('');
  }, 800);
}

// ===== 게임 나가기 =====
function quitGame() {
  if (confirm('정말 게임을 끝낼까요?')) {
    location.href = '/';
  }
}
