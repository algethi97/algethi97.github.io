// ==========================================================================
// HUD · 타이머 게이지 · 결과 모달 · 플로팅 점수 · 게임 전용 토스트
// ==========================================================================

export function updateSoundIcon(isMuted) {
  const soundIcon = document.getElementById('sound-icon');
  if (soundIcon) {
    soundIcon.textContent = isMuted ? '🔇' : '🔊';
  }
}

export function hideStartOverlay() {
  document.getElementById('game-start-overlay').style.display = 'none';
}

export function setActionText(text) {
  document.getElementById('btn-action-text').textContent = text;
}

export function updateHud(score, remainingCount, timeLeft) {
  const scoreVal = document.getElementById('hud-score');
  const remainingVal = document.getElementById('hud-remaining');
  const timerVal = document.getElementById('hud-timer');

  if (scoreVal) scoreVal.innerHTML = `${score}<span class="stat-unit">점</span>`;
  if (remainingVal) remainingVal.innerHTML = `${remainingCount}<span class="stat-unit">개</span>`;
  if (timerVal) timerVal.innerHTML = `${timeLeft}<span class="stat-unit">s</span>`;
}

export function resetTimerGauge() {
  const gaugeBar = document.getElementById('timer-gauge-bar');
  const timerBox = document.querySelector('.timer-box');
  if (gaugeBar) gaugeBar.style.width = '100%';
  if (timerBox) timerBox.classList.remove('time-warning');
}

// 게이지 폭, 10초 이하 경고 연출, 남은 시간 표시를 한 번에 갱신
export function updateTimerDisplay(timeLeft, percentage) {
  const gaugeBar = document.getElementById('timer-gauge-bar');
  const timerBox = document.querySelector('.timer-box');
  if (gaugeBar) gaugeBar.style.width = `${percentage}%`;

  if (timeLeft <= 10 && timerBox) {
    timerBox.classList.add('time-warning');
  }

  const timerVal = document.getElementById('hud-timer');
  if (timerVal) {
    timerVal.innerHTML = `${timeLeft}<span class="stat-unit">s</span>`;
  }
}

export function showResultModal({ isClear, finalScore, harvestedCount, playDuration }) {
  if (isClear) {
    document.getElementById('modal-result-emoji').textContent = '👑';
    document.getElementById('modal-result-title').textContent = '대단합니다! ALL CLEAR!';
    document.getElementById('modal-result-subtitle').textContent = '170개의 귤을 모두 수확했습니다! (+50점 보너스)';
  } else {
    document.getElementById('modal-result-emoji').textContent = '⏰';
    document.getElementById('modal-result-title').textContent = 'TIME OVER!';
    document.getElementById('modal-result-subtitle').textContent = '제한 시간이 종료되었습니다. 수고하셨습니다!';
  }

  document.getElementById('modal-final-score').textContent = `${finalScore}점`;
  document.getElementById('modal-harvested-count').textContent = `${harvestedCount}개`;
  document.getElementById('modal-play-time').textContent = `${playDuration}초`;

  // 등록 버튼 초기화
  const submitBtn = document.getElementById('btn-submit-score');
  if (submitBtn) {
    submitBtn.disabled = false;
    const textEl = submitBtn.querySelector('.btn-text');
    if (textEl) textEl.textContent = '🏆 랭킹 등록하기';
  }

  // 내 최근 점수 위젯 갱신
  updateMyLastScore(finalScore);

  // 모달 노출
  const modal = document.getElementById('game-modal');
  if (modal) {
    modal.style.display = 'flex';
    const nickInput = document.getElementById('player-nickname');
    if (nickInput) {
      setTimeout(() => nickInput.focus(), 200);
    }
  }
}

export function closeModal() {
  const modal = document.getElementById('game-modal');
  if (modal) modal.style.display = 'none';
}

function updateMyLastScore(scoreVal) {
  const card = document.getElementById('my-last-score-card');
  const scoreEl = document.getElementById('my-last-score');
  if (card && scoreEl) {
    scoreEl.textContent = String(scoreVal);
    card.style.display = 'block';
  }
}

// 플로팅 점수 텍스트 생성
export function spawnFloatingScore(x, y, text) {
  const container = document.getElementById('board-container');
  const floatEl = document.createElement('div');
  floatEl.className = 'floating-score';
  floatEl.textContent = text;
  floatEl.style.left = `${x}px`;
  floatEl.style.top = `${y}px`;

  container.appendChild(floatEl);

  setTimeout(() => {
    if (floatEl.parentNode) {
      floatEl.parentNode.removeChild(floatEl);
    }
  }, 800);
}

// 게임 전용 토스트 (#game-toast-container, 3.2초 노출)
export function showToast(msg) {
  const container = document.getElementById('game-toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = 'game-toast';
  toast.textContent = msg;

  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('show');
  }, 10);

  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, 300);
  }, 3200);
}
