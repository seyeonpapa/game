// ===== 영어 단어 게임 =====

let state = {
  selectedMode: 'mix',     // 'en2ko', 'ko2en', 'blank', 'mix'
  totalQuestions: 10,
  currentIndex: 0,
  questions: [],            // [{word, mode}, ...]
  correct: 0,
  wrong: 0,
  isAnswered: false,
  attempts: 0,
  hintLevel: 0,
};

const MODE_NAMES = {
  'en2ko': '단어 보고 뜻 맞추기',
  'ko2en': '뜻 보고 단어 쓰기',
  'blank': '빈칸 채우기',
};

const MODE_EMOJIS = {
  'en2ko': '🇺🇸 → 🇰🇷',
  'ko2en': '🇰🇷 → 🇺🇸',
  'blank': '__ 빈칸 채우기',
};

// ===== 화면 전환 =====
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

// ===== 모드 선택 =====
function selectMode(mode) {
  state.selectedMode = mode;
  document.querySelectorAll('.mode-card').forEach(card => {
    card.classList.remove('selected');
  });
  event.currentTarget.classList.add('selected');

  const labels = {
    'en2ko': '단어 → 뜻 모드 선택됨!',
    'ko2en': '뜻 → 단어 모드 선택됨!',
    'blank': '빈칸 채우기 모드 선택됨!',
    'mix': '랜덤 모드 선택됨!',
  };
  document.getElementById('selected-mode-text').textContent = labels[mode];
}

// ===== 게임 시작 =====
function startGame(count) {
  state.totalQuestions = count;
  state.currentIndex = 0;
  state.correct = 0;
  state.wrong = 0;

  // 단어 셔플 후 N개 선택
  const shuffled = [...ENGLISH_WORDS].sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, count);

  // 각 문제에 모드 할당
  state.questions = selected.map(word => {
    let mode = state.selectedMode;
    if (mode === 'mix') {
      const modes = ['en2ko', 'ko2en', 'blank'];
      mode = modes[Math.floor(Math.random() * modes.length)];
    }
    // 빈칸 모드는 영단어가 너무 짧으면 (1글자) en2ko로 변경
    if (mode === 'blank' && word.en.replace(/\s/g, '').length < 2) {
      mode = 'en2ko';
    }
    return { word, mode };
  });

  document.getElementById('progress-total').textContent = count;
  document.getElementById('correct-count').textContent = '0';
  document.getElementById('wrong-count').textContent = '0';

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

  state.isAnswered = false;
  state.attempts = 0;
  state.hintLevel = 0;

  // 진행도
  document.getElementById('progress-current').textContent = state.currentIndex + 1;
  const pct = (state.currentIndex / state.totalQuestions) * 100;
  document.getElementById('progress-fill').style.width = pct + '%';

  // 모드 라벨
  document.getElementById('mode-label').textContent = MODE_EMOJIS[q.mode];

  // 카드 애니메이션 다시
  const card = document.getElementById('question-card');
  card.style.animation = 'none';
  card.getBoundingClientRect();
  card.style.animation = '';

  // 모드별 렌더링
  const content = document.getElementById('question-content');
  const sub = document.getElementById('question-sub');
  const choiceGrid = document.getElementById('choice-grid');
  const inputArea = document.getElementById('input-area');
  const extraButtons = document.getElementById('extra-buttons');
  const answerCard = document.getElementById('answer-card');
  const feedback = document.getElementById('feedback-msg');
  const hintBtn = document.getElementById('btn-hint');

  // 초기화
  answerCard.classList.add('hidden');
  feedback.textContent = '';
  feedback.className = 'feedback-msg';
  hintBtn.disabled = false;
  hintBtn.querySelector('.hint-label').textContent = '힌트';
  extraButtons.classList.remove('hidden');

  const answerInput = document.getElementById('answer-input');
  answerInput.value = '';
  answerInput.disabled = false;
  answerInput.classList.remove('shake');

  if (q.mode === 'en2ko') {
    // 영단어 → 한국어 (객관식)
    content.textContent = q.word.en;
    content.className = 'question-content';
    sub.textContent = '뜻은 무엇일까요?';
    choiceGrid.classList.remove('hidden');
    inputArea.classList.add('hidden');
    // 힌트 버튼은 객관식에서는 숨김
    hintBtn.style.display = 'none';
    renderChoices(q.word);
  } else if (q.mode === 'ko2en') {
    // 한국어 → 영단어 (입력)
    content.textContent = q.word.ko;
    content.className = 'question-content korean';
    sub.textContent = '영어 단어를 적어봐요';
    choiceGrid.classList.add('hidden');
    inputArea.classList.remove('hidden');
    hintBtn.style.display = '';
    setTimeout(() => focusInputIfDesktop(), 100);
  } else if (q.mode === 'blank') {
    // 빈칸 채우기
    const blankResult = makeBlankWord(q.word.en);
    state.currentBlankPositions = blankResult.positions;
    content.innerHTML = blankResult.html;
    content.className = 'question-content';
    sub.textContent = `뜻: ${q.word.ko}`;
    choiceGrid.classList.add('hidden');
    inputArea.classList.remove('hidden');
    hintBtn.style.display = '';
    setTimeout(() => focusInputIfDesktop(), 100);
  }
}

// ===== PC에서만 자동 포커스 =====
function focusInputIfDesktop() {
  if (window.matchMedia('(hover: hover)').matches) {
    document.getElementById('answer-input').focus();
  }
}

// ===== 빈칸 단어 만들기 =====
function makeBlankWord(word) {
  const chars = word.split('');
  // 글자 위치 (공백 제외)
  const letterIndices = chars
    .map((c, i) => ({ c, i }))
    .filter(o => /[a-zA-Z]/.test(o.c))
    .map(o => o.i);

  // 빈칸 개수: 단어 길이에 따라
  const len = letterIndices.length;
  let blankCount = 1;
  if (len >= 5) blankCount = 2;

  // 랜덤 위치 선택 (첫 글자/마지막 글자 제외하면 더 좋지만, 짧은 단어 고려해 그냥 랜덤)
  const shuffled = [...letterIndices].sort(() => Math.random() - 0.5);
  const blankPositions = shuffled.slice(0, Math.min(blankCount, len)).sort((a, b) => a - b);

  // HTML 생성
  let html = '';
  chars.forEach((c, i) => {
    if (blankPositions.includes(i)) {
      html += `<span class="blank-letter">_</span>`;
    } else if (c === ' ') {
      html += '&nbsp;&nbsp;';
    } else {
      html += escapeHtml(c);
    }
  });

  return { html, positions: blankPositions };
}

function escapeHtml(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// ===== 객관식 보기 만들기 =====
function renderChoices(correctWord) {
  const choiceGrid = document.getElementById('choice-grid');

  // 정답 + 오답 3개
  const wrongs = ENGLISH_WORDS
    .filter(w => w.en !== correctWord.en && w.ko !== correctWord.ko)
    .sort(() => Math.random() - 0.5)
    .slice(0, 3);

  const choices = [...wrongs, correctWord].sort(() => Math.random() - 0.5);

  choiceGrid.innerHTML = choices.map(w => `
    <button class="choice-btn" onclick="checkChoice(this, '${escapeHtml(w.ko)}', '${escapeHtml(correctWord.ko)}')">
      ${escapeHtml(w.ko)}
    </button>
  `).join('');
}

// ===== 객관식 답 체크 =====
function checkChoice(btn, chosen, correct) {
  if (state.isAnswered) return;
  state.isAnswered = true;

  const allBtns = document.querySelectorAll('.choice-btn');
  allBtns.forEach(b => b.disabled = true);

  if (chosen === correct) {
    btn.classList.add('correct');
    state.correct++;
    document.getElementById('correct-count').textContent = state.correct;
    document.getElementById('feedback-msg').textContent = '🎉 정답이에요!';
    document.getElementById('feedback-msg').className = 'feedback-msg success';
    setTimeout(() => revealAnswer(true), 700);
  } else {
    btn.classList.add('wrong');
    // 정답 버튼 표시
    allBtns.forEach(b => {
      if (b.textContent.trim() === correct) {
        b.classList.add('correct');
      }
    });
    state.wrong++;
    document.getElementById('wrong-count').textContent = state.wrong;
    document.getElementById('feedback-msg').textContent = '😅 아쉬워요...';
    document.getElementById('feedback-msg').className = 'feedback-msg error';
    setTimeout(() => revealAnswer(false), 1100);
  }
}

// ===== 답 정규화 =====
function normalize(s) {
  return String(s).toLowerCase().replace(/\s+/g, '').replace(/[.,!?]/g, '').trim();
}

// ===== 입력 답 비교 =====
function isAnswerCorrect(userInput, correctAnswer) {
  const u = normalize(userInput);
  const c = normalize(correctAnswer);
  if (!u) return false;
  return u === c;
}

// ===== 답 제출 =====
function submitAnswer() {
  if (state.isAnswered) return;

  const input = document.getElementById('answer-input');
  const userAnswer = input.value.trim();
  if (!userAnswer) {
    input.classList.add('shake');
    setTimeout(() => input.classList.remove('shake'), 500);
    return;
  }

  const q = state.questions[state.currentIndex];
  const correctAnswer = q.word.en; // ko2en, blank 모두 영단어가 정답
  state.attempts++;

  if (isAnswerCorrect(userAnswer, correctAnswer)) {
    handleCorrect();
  } else {
    const remaining = 3 - state.attempts;
    const feedback = document.getElementById('feedback-msg');
    if (remaining > 0) {
      feedback.textContent = `😅 아쉬워요! ${remaining}번 더 도전!`;
      feedback.className = 'feedback-msg error';
      input.classList.add('shake');
      setTimeout(() => input.classList.remove('shake'), 500);
      input.select();
    } else {
      feedback.textContent = `😢 정답을 보여드릴게요`;
      feedback.className = 'feedback-msg error';
      setTimeout(() => revealAnswer(false), 600);
    }
  }
}

function handleCorrect() {
  state.isAnswered = true;
  state.correct++;
  document.getElementById('correct-count').textContent = state.correct;
  document.getElementById('feedback-msg').textContent = '🎉 정답이에요!';
  document.getElementById('feedback-msg').className = 'feedback-msg success';
  document.getElementById('answer-input').disabled = true;
  setTimeout(() => revealAnswer(true), 700);
}

// ===== 힌트 사용 =====
function useHint() {
  if (state.isAnswered) return;
  if (state.hintLevel >= 2) return;

  const q = state.questions[state.currentIndex];
  const answer = q.word.en;
  const feedback = document.getElementById('feedback-msg');
  const hintBtn = document.getElementById('btn-hint');

  state.hintLevel++;

  if (state.hintLevel === 1) {
    // 글자 수 + 모든 글자 _
    const pattern = answer.split('').map(c => c === ' ' ? ' ' : '_').join(' ');
    feedback.textContent = `💡 ${pattern} (${answer.replace(/\s/g, '').length}글자)`;
    feedback.className = 'feedback-msg hint';
    hintBtn.querySelector('.hint-label').textContent = '한 번 더';
  } else if (state.hintLevel === 2) {
    // 첫 글자 공개
    let revealedFirst = false;
    const pattern = answer.split('').map(c => {
      if (c === ' ') return ' ';
      if (!revealedFirst && /[a-zA-Z]/.test(c)) {
        revealedFirst = true;
        return c;
      }
      return '_';
    }).join(' ');
    feedback.textContent = `💡 ${pattern} (${answer.replace(/\s/g, '').length}글자)`;
    feedback.className = 'feedback-msg hint';
    hintBtn.disabled = true;
    hintBtn.querySelector('.hint-label').textContent = '힌트 끝';
  }
}

// ===== 정답 보기 (포기) =====
function giveUp() {
  if (state.isAnswered) return;
  if (!confirm('정답을 보면 오답으로 처리돼요. 그래도 볼까요?')) return;
  revealAnswer(false);
}

// ===== 정답 공개 =====
function revealAnswer(wasCorrect) {
  state.isAnswered = true;
  if (!wasCorrect) {
    state.wrong++;
    document.getElementById('wrong-count').textContent = state.wrong;
  }

  const q = state.questions[state.currentIndex];

  // 입력 모드면 영단어 + 뜻 같이 표시
  // 객관식 모드면 한국어 뜻
  const answerCard = document.getElementById('answer-card');
  const answerLabel = document.getElementById('answer-label');
  const answerText = document.getElementById('answer-text');

  answerLabel.textContent = wasCorrect ? '🎉 정답!' : '💖 정답';

  if (q.mode === 'en2ko') {
    answerText.innerHTML = `<span style="font-family:'Fredoka',sans-serif">${escapeHtml(q.word.en)}</span><br><span style="font-family:'Jua',sans-serif;color:#5BA8E0;font-size:1.2rem">→ ${escapeHtml(q.word.ko)}</span>`;
  } else {
    answerText.innerHTML = `<span style="font-family:'Fredoka',sans-serif">${escapeHtml(q.word.en)}</span><br><span style="font-family:'Jua',sans-serif;color:#5BA8E0;font-size:1.2rem">${escapeHtml(q.word.ko)}</span>`;
  }

  document.getElementById('input-area').classList.add('hidden');
  document.getElementById('extra-buttons').classList.add('hidden');
  document.getElementById('choice-grid').classList.add('hidden');
  answerCard.classList.remove('hidden');

  // 진행도 업데이트
  const pct = ((state.currentIndex + 1) / state.totalQuestions) * 100;
  document.getElementById('progress-fill').style.width = pct + '%';
}

// ===== 다음 문제 =====
function nextQuestion() {
  state.currentIndex++;
  renderQuestion();
}

// ===== 나가기 =====
function quitGame() {
  if (confirm('정말 나갈까요? 점수는 사라져요!')) {
    showScreen('screen-start');
  }
}

// ===== 결과 표시 =====
function showResult() {
  showScreen('screen-result');

  const total = state.totalQuestions;
  const correct = state.correct;
  const percent = total > 0 ? (correct / total) * 100 : 0;

  document.getElementById('final-correct').textContent = correct;
  document.getElementById('final-total').textContent = total;

  const circumference = 2 * Math.PI * 54;
  const progressEl = document.getElementById('score-progress');
  progressEl.setAttribute('stroke-dashoffset', circumference);

  setTimeout(() => {
    progressEl.setAttribute('stroke-dashoffset',
      circumference - (circumference * percent / 100));
  }, 200);

  let title, sub, emoji;
  if (percent >= 90) {
    emoji = '🏆';
    title = '완벽해요!';
    sub = '영어 천재 ✨';
  } else if (percent >= 70) {
    emoji = '🌟';
    title = '아주 잘했어요!';
    sub = '영어 실력이 쑥쑥 ♥';
  } else if (percent >= 50) {
    emoji = '🎉';
    title = '잘했어요!';
    sub = '한 번 더 해볼까요?';
  } else if (percent >= 30) {
    emoji = '😊';
    title = '괜찮아요~';
    sub = '연습하면 더 잘할 수 있어요!';
  } else {
    emoji = '🐣';
    title = '시작이 반!';
    sub = '천천히 다시 도전해봐요';
  }

  document.getElementById('result-emoji').textContent = emoji;
  document.getElementById('result-title').textContent = title;
  document.getElementById('result-sub').textContent = sub;
}

// ===== 다시 하기 =====
function restartGame() {
  showScreen('screen-start');
}

// ===== 엔터키 제출 =====
document.addEventListener('DOMContentLoaded', () => {
  const input = document.getElementById('answer-input');
  if (input) {
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        if (state.isAnswered) {
          nextQuestion();
        } else {
          submitAnswer();
        }
      }
    });
  }
});
