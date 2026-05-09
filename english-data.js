// ===== 영어 단어 데이터 =====
const ENGLISH_WORDS = [
  // 인사
  { en: 'hello', ko: '안녕' },
  { en: 'goodbye', ko: '잘 가' },
  { en: 'yes', ko: '그래, 응' },
  { en: 'no', ko: '아니' },

  // 사람
  { en: 'I', ko: '나' },
  { en: 'my', ko: '나의' },
  { en: 'you', ko: '너' },
  { en: 'we', ko: '우리' },
  { en: 'boy', ko: '소년, 남자아이' },
  { en: 'girl', ko: '소녀, 여자아이' },
  { en: 'baby', ko: '아기' },

  // 가족
  { en: 'family', ko: '가족' },
  { en: 'mom', ko: '엄마' },
  { en: 'dad', ko: '아빠' },
  { en: 'grandma', ko: '할머니' },
  { en: 'grandpa', ko: '할아버지' },
  { en: 'sister', ko: '여자 형제(언니, 누나, 여동생)' },
  { en: 'brother', ko: '남자 형제(오빠, 형, 남동생)' },

  // 동물
  { en: 'cat', ko: '고양이' },
  { en: 'dog', ko: '개' },
  { en: 'puppy', ko: '강아지' },
  { en: 'kitten', ko: '새끼 고양이' },
  { en: 'bird', ko: '새' },
  { en: 'fish', ko: '물고기' },
  { en: 'rabbit', ko: '토끼' },
  { en: 'lion', ko: '사자' },
  { en: 'monkey', ko: '원숭이' },
  { en: 'giraffe', ko: '기린' },
  { en: 'elephant', ko: '코끼리' },
  { en: 'zebra', ko: '얼룩말' },
  { en: 'panda', ko: '판다' },

  // 사물
  { en: 'doll', ko: '인형' },
  { en: 'ball', ko: '공' },
  { en: 'book', ko: '책' },
  { en: 'bag', ko: '가방' },
  { en: 'pen', ko: '펜' },
  { en: 'pencil', ko: '연필' },
  { en: 'hat', ko: '모자' },
  { en: 'robot', ko: '로봇' },
  { en: 'watch', ko: '손목시계' },
  { en: 'card', ko: '카드' },
  { en: 'present', ko: '선물' },
  { en: 'cake', ko: '케이크' },
  { en: 'house', ko: '집' },

  // 동작
  { en: 'sing', ko: '노래하다' },
  { en: 'dance', ko: '춤추다' },
  { en: 'color', ko: '색칠하다' },
  { en: 'read', ko: '읽다' },
  { en: 'jump', ko: '뛰어오르다' },
  { en: 'jump rope', ko: '줄넘기를 하다' },
  { en: 'sleep', ko: '잠을 자다' },
  { en: 'eat', ko: '먹다' },
  { en: 'have', ko: '가지고 있다' },
  { en: 'walk', ko: '걷다' },
  { en: 'fly', ko: '날다' },
  { en: 'swim', ko: '수영하다' },
  { en: 'climb', ko: '오르다' },
  { en: 'run', ko: '달리다' },
  { en: 'jump high', ko: '높이 뛰다' },
  { en: 'run fast', ko: '빠르게 달리다' },

  // 색깔
  { en: 'red', ko: '빨간색' },
  { en: 'yellow', ko: '노란색' },
  { en: 'blue', ko: '파란색' },
  { en: 'green', ko: '초록색' },
  { en: 'violet', ko: '보라색' },
  { en: 'orange', ko: '주황색 / 오렌지' },
  { en: 'indigo', ko: '남색' },
  { en: 'rainbow', ko: '무지개' },

  // 감정
  { en: 'happy', ko: '행복한' },
  { en: 'sad', ko: '슬픈' },
  { en: 'angry', ko: '화난' },
  { en: 'sorry', ko: '미안한' },
  { en: 'sleepy', ko: '졸린' },
  { en: 'hungry', ko: '배고픈' },

  // 의문
  { en: 'what', ko: '무엇' },
  { en: 'birthday', ko: '생일' },

  // 숫자
  { en: 'one', ko: '하나, 1' },
  { en: 'two', ko: '둘, 2' },
  { en: 'three', ko: '셋, 3' },
  { en: 'four', ko: '넷, 4' },
  { en: 'five', ko: '다섯, 5' },
  { en: 'six', ko: '여섯, 6' },

  // 신체
  { en: 'finger', ko: '손가락' },
  { en: 'fingers', ko: '손가락들' },
  { en: 'eyes', ko: '눈(들)' },
  { en: 'ears', ko: '귀(들)' },
  { en: 'nose', ko: '코' },
  { en: 'mouth', ko: '입' },
  { en: 'hair', ko: '머리카락' },
  { en: 'face', ko: '얼굴' },

  // 과일
  { en: 'apple', ko: '사과' },
  { en: 'apples', ko: '사과들' },
  { en: 'banana', ko: '바나나' },
  { en: 'bananas', ko: '바나나들' },
  { en: 'oranges', ko: '오렌지들' },
  { en: 'melon', ko: '멜론' },
  { en: 'melons', ko: '멜론들' },

  // 음식
  { en: 'pizza', ko: '피자' },
  { en: 'chicken', ko: '치킨' },
  { en: 'rice', ko: '밥' },
  { en: 'soup', ko: '수프' },
  { en: 'bread', ko: '빵' },
  { en: 'cheese', ko: '치즈' },
  { en: 'milk', ko: '우유' },
  { en: 'juice', ko: '주스' },

  // 형용사
  { en: 'big', ko: '큰 (크기)' },
  { en: 'small', ko: '작은 (크기)' },
  { en: 'tall', ko: '키가 큰' },
  { en: 'short', ko: '키가 작은 / 길이가 짧은' },
  { en: 'long', ko: '길이가 긴' },
  { en: 'fast', ko: '빠른' },
  { en: 'slow', ko: '느린' },
];
