// ==========================================================================
// 만다린 게임 (Mandarin Puzzle) - 진입 모듈 (game.js)
// 게임 상태·라이프사이클·이벤트 바인딩을 맡고 기능은 game/ 모듈에 위임한다.
// 보안: ES 모듈 스코프로 상태 은닉(window 비노출), 허니팟·세션 검증은 game/ranking.js
// ==========================================================================
import { getSupabaseClient } from './common.js';
import { soundManager } from './game/sound.js';
import { TOTAL_TILES, generateBoard, cacheTileBoundingBoxes, clearTiles } from './game/board.js';
import { initDragEvents } from './game/input.js';
import { fetchTop5Scores, handleScoreSubmit, resetSubmission } from './game/ranking.js';
import {
  showToast, closeModal, updateHud, updateSoundIcon, hideStartOverlay, setActionText,
  resetTimerGauge, updateTimerDisplay, showResultModal, spawnFloatingScore
} from './game/ui.js';

const GAME_DURATION = 120; // 120초

// ==========================================================================
// 모듈 내부 은닉 상태 변수 (콘솔 직접 접근 차단)
// ==========================================================================
let isGameRunning = false;
let score = 0;
let remainingCount = TOTAL_TILES;
let timeLeft = GAME_DURATION;
let timerInterval = null;
let gameStartTime = null;

// ==========================================================================
// 초기화 (DOMContentLoaded)
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {
  // 1. Supabase 클라이언트 초기화
  if (!getSupabaseClient()) {
    console.error('Supabase SDK 로드 실패');
  }

  // 2. DOM 엘리먼트 바인딩 및 이벤트 초기화
  initDomEvents();

  // 3. 사운드 아이콘 초기 상태 반영
  updateSoundIcon(soundManager.isMuted);

  // 4. 사이드 Top 5 실시간 랭킹 불러오기
  fetchTop5Scores();

  // 5. 이전 닉네임 복원
  const savedNick = localStorage.getItem('mandarin_player_nickname');
  const nickInput = document.getElementById('player-nickname');
  if (savedNick && nickInput) {
    nickInput.value = savedNick;
    const countEl = document.getElementById('nickname-count');
    if (countEl) countEl.textContent = savedNick.length;
  }

  // 6. 보드 사전 생성 (시작 전 오버레이 뒤에 귤 타일을 미리 채워 레이아웃 크기 유지 및 시각적 완성도 보장)
  generateBoard();
  requestAnimationFrame(() => {
    cacheTileBoundingBoxes();
  });

  // 7. 첫 제스처 시 Web Audio API 안전 언락
  window.addEventListener('pointerdown', () => {
    soundManager.initContext();
  }, { once: true });
});

// ==========================================================================
// DOM 이벤트 바인딩
// ==========================================================================
function initDomEvents() {
  const btnStartRestart = document.getElementById('btn-start-restart');
  const btnOverlayStart = document.getElementById('btn-overlay-start');
  const btnSoundToggle = document.getElementById('btn-sound-toggle');
  const btnRefreshRanking = document.getElementById('btn-refresh-ranking');
  const btnModalRestart = document.getElementById('btn-modal-restart');
  const scoreSubmitForm = document.getElementById('score-submit-form');
  const nicknameInput = document.getElementById('player-nickname');
  const nicknameCount = document.getElementById('nickname-count');
  const boardContainer = document.getElementById('board-container');

  // 시작 / 재시작 버튼
  if (btnStartRestart) {
    btnStartRestart.addEventListener('click', () => {
      soundManager.initContext();
      if (!isGameRunning) {
        startGame();
      } else {
        if (confirm('게임을 다시 시작하시겠습니까? 현재 진행 상황은 초기화됩니다.')) {
          startGame();
        }
      }
    });
  }

  if (btnOverlayStart) {
    btnOverlayStart.addEventListener('click', () => {
      soundManager.initContext();
      startGame();
    });
  }

  // 사운드 토글
  if (btnSoundToggle) {
    btnSoundToggle.addEventListener('click', () => {
      soundManager.initContext();
      soundManager.toggleMute();
      updateSoundIcon(soundManager.isMuted);
      showToast(soundManager.isMuted ? '🔇 효과음이 꺼졌습니다.' : '🔊 효과음이 켜졌습니다.');
    });
  }

  // 랭킹 새로고침
  if (btnRefreshRanking) {
    btnRefreshRanking.addEventListener('click', () => {
      fetchTop5Scores(true);
    });
  }

  // 모달 재시작
  if (btnModalRestart) {
    btnModalRestart.addEventListener('click', () => {
      closeModal();
      startGame();
    });
  }

  // 닉네임 글자수 카운팅
  if (nicknameInput && nicknameCount) {
    nicknameInput.addEventListener('input', () => {
      nicknameCount.textContent = nicknameInput.value.length;
    });
  }

  // 점수 등록 폼 제출 (등록 시점의 점수·남은 귤·플레이 시간을 전달)
  if (scoreSubmitForm) {
    scoreSubmitForm.addEventListener('submit', (e) => handleScoreSubmit(e, () => ({
      score,
      remainingCount,
      playDuration: Math.max(1, Math.min(GAME_DURATION, Math.round((Date.now() - (gameStartTime || Date.now())) / 1000)))
    })));
  }

  // 드래그 제스처 바인딩 (마우스 & 터치)
  initDragEvents(boardContainer, { isRunning: () => isGameRunning, onSuccess: handleSuccessClear });

  // 윈도우 리사이즈 시 타일 바운딩 캐시 재계산
  window.addEventListener('resize', debounce(() => {
    cacheTileBoundingBoxes();
  }, 150));
}

// ==========================================================================
// 게임 라이프사이클 (시작, 타이머, 종료)
// ==========================================================================
function startGame() {
  isGameRunning = true;
  score = 0;
  remainingCount = TOTAL_TILES;
  timeLeft = GAME_DURATION;
  gameStartTime = Date.now();
  resetSubmission(); // 새 게임 세션 등록 플래그 리셋

  // 오버레이 및 모달 숨김
  hideStartOverlay();
  closeModal();

  // 버튼 텍스트 변경
  setActionText('🔄 다시 시작');

  // HUD 갱신
  updateHud(score, remainingCount, timeLeft);

  // 보드 새로 생성
  generateBoard();

  // 타일 상대 좌표 캐싱
  requestAnimationFrame(() => {
    cacheTileBoundingBoxes();
  });

  // 타이머 가동
  if (timerInterval) clearInterval(timerInterval);
  resetTimerGauge();

  timerInterval = setInterval(() => {
    timeLeft--;
    if (timeLeft < 0) {
      timeLeft = 0;
      clearInterval(timerInterval);
      endGame(false);
      return;
    }

    // 게이지 바 계산 및 10초 이하 경고 연출
    updateTimerDisplay(timeLeft, (timeLeft / GAME_DURATION) * 100);
  }, 1000);
}

function endGame(isClear = false) {
  if (!isGameRunning) return;
  isGameRunning = false;
  if (timerInterval) clearInterval(timerInterval);

  soundManager.playGameOver();

  // 모달 데이터 채우기
  const playDuration = Math.max(1, Math.min(GAME_DURATION, Math.round((Date.now() - gameStartTime) / 1000)));
  const harvestedCount = TOTAL_TILES - remainingCount;

  // 올클리어 보너스 (최대 220점)
  let finalScore = score;
  if (isClear) {
    finalScore += 50; // 올클리어 보너스 50점
    score = finalScore;
  }

  showResultModal({ isClear, finalScore, harvestedCount, playDuration });

  setActionText('🎮 게임 시작');
}

// ==========================================================================
// 합계 10 완성 시 타일 제거 & Pop 애니메이션 & 스코어링
// ==========================================================================
function handleSuccessClear(targetTiles) {
  const count = targetTiles.length;
  score += count;
  remainingCount -= count;

  // 1. Pop 사운드 효과음 재생
  soundManager.playPop(1.0 + (count * 0.05));
  soundManager.playSuccessChime();

  // 2. 타일 수확 처리 및 중심 좌표 계산 (boardContainer 기준)
  const center = clearTiles(targetTiles);

  // 3. 플로팅 스코어 이펙트 (+N)
  spawnFloatingScore(center.x, center.y, `+${count}`);

  // 4. HUD 업데이트
  updateHud(score, remainingCount, timeLeft);

  // 5. 올클리어 체크 (귤이 0개 남음)
  if (remainingCount <= 0) {
    endGame(true);
  }
}

// ==========================================================================
// 유틸리티 함수
// ==========================================================================
function debounce(fn, delay) {
  let timer = null;
  return function (...args) {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}
