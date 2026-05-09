// ===== 넌센스 퀴즈 게임 =====

let state = {
  totalQuestions: 10,
  currentIndex: 0,
  questions: [],
  correct: 0,
  wrong: 0,
  isAnswered: false,    // 이번 문제 결과 확정됐는지
  attempts: 0,          // 이번 문제 시도 횟수
  hintLevel: 0,         // 이번 문제에 사용한 힌트 단계 (0=없음, 1=글자수, 2=첫글자)
};

const MAX_ATTEMPTS = 3; // 최대 3번까지 도전
const MAX_HINT_LEVEL = 2; // 힌트 단계 최대치

// ===== 화면 전환 =====
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

// ===== 게임 시작 =====
function startQuiz(count) {
  state.totalQuestions = count;
  state.currentIndex = 0;
  state.correct = 0;
  state.wrong = 0;

  const shuffled = [...QUIZ_POOL].sort(() => Math.random() - 0.5);
  state.questions = shuffled.slice(0, count);

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

  // 힌트 버튼 활성화
  const hintBtn = document.getElementById('btn-hint');
  if (hintBtn) {
    hintBtn.disabled = false;
    hintBtn.querySelector('span:nth-child(2)').textContent = '힌트';
  }

  // 진행도
  document.getElementById('progress-current').textContent = state.currentIndex + 1;
  const pct = (state.currentIndex / state.totalQuestions) * 100;
  document.getElementById('progress-fill').style.width = pct + '%';

  // 문제 / 정답
  document.getElementById('question-text').textContent = q.question;
  document.getElementById('answer-text').textContent = q.answer;

  // UI 초기화
  document.getElementById('answer-card').classList.add('hidden');
  document.getElementById('input-area').classList.remove('hidden');
  document.getElementById('answer-label').textContent = '💖 정답';

  const input = document.getElementById('answer-input');
  input.value = '';
  input.disabled = false;
  input.classList.remove('shake');

  document.getElementById('feedback-msg').textContent = '';
  document.getElementById('feedback-msg').className = 'feedback-msg';

  // 카드 애니메이션 다시 적용
  const card = document.querySelector('.question-card');
  card.style.animation = 'none';
  card.getBoundingClientRect();
  card.style.animation = '';

  // 입력창 포커스 (모바일에서 키보드 자동 안 뜨는 게 더 자연스러우므로 PC만)
  if (window.matchMedia('(hover: hover)').matches) {
    setTimeout(() => input.focus(), 100);
  }
}

// ===== 답 정규화 (비교용) =====
function normalize(s) {
  return String(s)
    .toLowerCase()
    .replace(/\s+/g, '')           // 공백 제거
    .replace(/[!?.,~"'""''‘’]/g, '') // 특수문자 제거
    .replace(/[()（）]/g, '');
}

// ===== 답 비교 =====
function isAnswerCorrect(userInput, correctAnswer) {
  const u = normalize(userInput);
  const c = normalize(correctAnswer);
  if (!u) return false;
  if (u === c) return true;
  // 사용자 답이 정답을 포함하거나, 정답이 사용자 답을 포함 (정답이 짧을 때만)
  if (c.length >= 2 && u.includes(c)) return true;
  if (u.length >= 2 && c.includes(u) && u.length >= c.length - 1) return true;
  return false;
}

// ===== 힌트 사용 =====
function useHint() {
  if (state.isAnswered) return;
  if (state.hintLevel >= MAX_HINT_LEVEL) return;

  const q = state.questions[state.currentIndex];
  const answer = q.answer;
  const feedback = document.getElementById('feedback-msg');
  const hintBtn = document.getElementById('btn-hint');

  state.hintLevel++;

  if (state.hintLevel === 1) {
    // 1단계: 글자 수 + 패턴 (전부 ○)
    const pattern = makePattern(answer, 0);
    feedback.textContent = `💡 ${pattern} (${countDisplayChars(answer)}글자)`;
    feedback.className = 'feedback-msg hint';
    hintBtn.querySelector('span:nth-child(2)').textContent = '한 번 더';
  } else if (state.hintLevel === 2) {
    // 2단계: 첫 글자 공개
    const pattern = makePattern(answer, 1);
    feedback.textContent = `💡 ${pattern} (${countDisplayChars(answer)}글자)`;
    feedback.className = 'feedback-msg hint';
    hintBtn.disabled = true;
    hintBtn.querySelector('span:nth-child(2)').textContent = '힌트 끝';
  }
}

// 정답 패턴 만들기 (revealCount = 앞에서 몇 글자 보여줄지)
function makePattern(answer, revealCount) {
  const chars = Array.from(answer);
  let revealed = 0;
  return chars.map(ch => {
    if (ch === ' ') return ' ';
    if (/[!?.,~"'""''‘’()（）]/.test(ch)) return ch;
    if (revealed < revealCount) {
      revealed++;
      return ch;
    }
    return '○';
  }).join('');
}

// 공백/특수문자 제외한 글자 수
function countDisplayChars(s) {
  return Array.from(s).filter(ch => /[가-힣a-zA-Z0-9]/.test(ch)).length;
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
  state.attempts++;

  if (isAnswerCorrect(userAnswer, q.answer)) {
    // 정답!
    handleCorrect();
  } else {
    // 오답
    const remaining = MAX_ATTEMPTS - state.attempts;
    const feedback = document.getElementById('feedback-msg');
    if (remaining > 0) {
      feedback.textContent = `😅 아쉬워요! ${remaining}번 더 도전할 수 있어요`;
      feedback.className = 'feedback-msg error';
      input.classList.add('shake');
      setTimeout(() => input.classList.remove('shake'), 500);
      input.select();
    } else {
      // 기회 다 씀 → 정답 공개
      feedback.textContent = `😢 정답을 보여드릴게요`;
      feedback.className = 'feedback-msg error';
      setTimeout(() => revealAnswer(false), 600);
    }
  }
}

// ===== 정답! 처리 =====
function handleCorrect() {
  state.isAnswered = true;
  state.correct++;
  document.getElementById('correct-count').textContent = state.correct;

  document.getElementById('feedback-msg').textContent = '🎉 정답이에요!';
  document.getElementById('feedback-msg').className = 'feedback-msg success';

  document.getElementById('answer-input').disabled = true;

  // 정답 카드 표시
  setTimeout(() => {
    document.getElementById('answer-label').innerHTML = '🎉 정답!';
    revealAnswer(true);
  }, 700);
}

// ===== 포기 / 정답 보기 =====
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

  document.getElementById('input-area').classList.add('hidden');
  document.getElementById('answer-card').classList.remove('hidden');

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
    sub = '천재 수준이네요 ✨';
  } else if (percent >= 70) {
    emoji = '🌟';
    title = '아주 잘했어요!';
    sub = '머리가 정말 좋네요 ♥';
  } else if (percent >= 50) {
    emoji = '🎉';
    title = '잘했어요!';
    sub = '한 번 더 해볼까요?';
  } else if (percent >= 30) {
    emoji = '😊';
    title = '괜찮아요~';
    sub = '재미있었나요? 한 번 더!';
  } else {
    emoji = '🐣';
    title = '시작이 반!';
    sub = '다시 도전해봐요';
  }

  document.getElementById('result-emoji').textContent = emoji;
  document.getElementById('result-title').textContent = title;
  document.getElementById('result-sub').textContent = sub;
}

// ===== 다시 하기 =====
function restartGame() {
  showScreen('screen-start');
}

// ===== 엔터키로 제출 =====
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
