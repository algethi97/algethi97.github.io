// ==========================================================================
// Supabase 랭킹 시스템 (사이드 Top 5 조회 및 신규 기록 등록)
// ==========================================================================
import { getSupabaseClient, formatTimeAgo, setButtonLoading } from '../common.js';
import { soundManager } from './sound.js';
import { showToast, closeModal } from './ui.js';

const SUBMIT_COOLDOWN_MS = 10000; // 도배 방지 10초 쿨다운

// 보안 및 어뷰징 방지 플래그
let hasSubmittedThisGame = false;
let lastSubmitTimestamp = 0;

// 새 게임 세션 등록 플래그 리셋
export function resetSubmission() {
  hasSubmittedThisGame = false;
}

export async function fetchTop5Scores(isManual = false) {
  const supabaseClient = getSupabaseClient();
  if (!supabaseClient) return;

  const skeleton = document.getElementById('leaderboard-skeleton');
  const top5List = document.getElementById('top5-list');
  const emptyView = document.getElementById('top5-empty');
  const refreshBtn = document.getElementById('btn-refresh-ranking');

  if (refreshBtn) refreshBtn.classList.add('spinning');
  if (skeleton) skeleton.style.display = 'flex';
  if (top5List) top5List.style.display = 'none';
  if (emptyView) emptyView.style.display = 'none';

  try {
    const { data, error } = await supabaseClient
      .from('mandarin-game_scores')
      .select('id, nickname, score, remaining_count, play_time, created_at')
      .order('score', { ascending: false })
      .order('created_at', { ascending: true })
      .limit(5);

    if (error) throw error;

    renderTop5List(data || []);
    if (isManual) {
      showToast('명예의 전당(Top 5)이 갱신되었습니다. ✨');
    }
  } catch (err) {
    console.error('Top 5 불러오기 실패:', err);
    if (isManual) {
      showToast('랭킹을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.');
    }
  } finally {
    if (skeleton) skeleton.style.display = 'none';
    if (refreshBtn) {
      setTimeout(() => refreshBtn.classList.remove('spinning'), 500);
    }
  }
}

// XSS 원천 차단: DOM 생성 및 textContent 바인딩
function renderTop5List(scores) {
  const top5List = document.getElementById('top5-list');
  const emptyView = document.getElementById('top5-empty');

  if (!scores || scores.length === 0) {
    if (top5List) top5List.style.display = 'none';
    if (emptyView) emptyView.style.display = 'block';
    return;
  }

  if (emptyView) emptyView.style.display = 'none';
  if (top5List) {
    top5List.style.display = 'flex';
    top5List.innerHTML = '';

    scores.forEach((item, index) => {
      const rank = index + 1;
      const li = document.createElement('li');
      li.className = `top5-item rank-${rank}`;
      li.dataset.recordId = item.id;

      // 좌측 순위 및 닉네임 그룹
      const rankCol = document.createElement('div');
      rankCol.className = 'top5-rank-col';

      // 메달/배지
      const badgeSpan = document.createElement('span');
      if (rank === 1) {
        badgeSpan.className = 'rank-badge gold';
        badgeSpan.textContent = '🥇 1st';
      } else if (rank === 2) {
        badgeSpan.className = 'rank-badge silver';
        badgeSpan.textContent = '🥈 2nd';
      } else if (rank === 3) {
        badgeSpan.className = 'rank-badge bronze';
        badgeSpan.textContent = '🥉 3rd';
      } else {
        badgeSpan.className = 'rank-badge normal';
        badgeSpan.textContent = `${rank}th`;
      }
      rankCol.appendChild(badgeSpan);

      // 플레이어 정보 (textContent로 XSS 원천 차단)
      const playerInfo = document.createElement('div');
      playerInfo.className = 'player-info';

      const nameSpan = document.createElement('span');
      nameSpan.className = 'player-name';
      nameSpan.textContent = item.nickname || '익명';
      nameSpan.setAttribute('title', item.nickname || '익명');

      const timeSpan = document.createElement('span');
      timeSpan.className = 'record-time';
      timeSpan.textContent = formatTimeAgo(item.created_at);

      playerInfo.appendChild(nameSpan);
      playerInfo.appendChild(timeSpan);
      rankCol.appendChild(playerInfo);

      // 우측 스코어 그룹
      const scoreCol = document.createElement('div');
      scoreCol.className = 'top5-score-col';

      const scoreValSpan = document.createElement('span');
      scoreValSpan.className = 'score-val';
      scoreValSpan.textContent = String(item.score);

      const scoreUnitSpan = document.createElement('span');
      scoreUnitSpan.className = 'score-unit';
      scoreUnitSpan.textContent = '점';

      scoreCol.appendChild(scoreValSpan);
      scoreCol.appendChild(scoreUnitSpan);

      li.appendChild(rankCol);
      li.appendChild(scoreCol);
      top5List.appendChild(li);
    });
  }
}

// 점수 등록 핸들러 (어뷰징 방지, 허니팟, 중복 방지)
// getResult: 현재 게임의 { score, remainingCount, playDuration }을 호출 시점 값으로 돌려준다
export async function handleScoreSubmit(e, getResult) {
  e.preventDefault();
  const supabaseClient = getSupabaseClient();
  if (!supabaseClient) {
    showToast('데이터베이스에 연결할 수 없습니다.');
    return;
  }

  // 1. 봇 허니팟 검증 (hidden 필드에 값이 입력되어 있으면 매크로로 간주하고 차단)
  const honeypot = document.getElementById('honeypot-game-website');
  if (honeypot && honeypot.value.trim() !== '') {
    console.warn('Bot detected by honeypot.');
    closeModal();
    return;
  }

  // 2. 1게임 1회 등록 원칙 (중복 등록 차단)
  if (hasSubmittedThisGame) {
    showToast('이미 이번 게임의 점수가 등록되었습니다. 새 게임에 도전해 보세요!');
    closeModal();
    return;
  }

  // 3. 도배 방지 쿨다운 검증 (10초)
  const now = Date.now();
  if (now - lastSubmitTimestamp < SUBMIT_COOLDOWN_MS) {
    const waitSec = Math.ceil((SUBMIT_COOLDOWN_MS - (now - lastSubmitTimestamp)) / 1000);
    showToast(`도배 방지를 위해 ${waitSec}초 후에 다시 시도해 주세요.`);
    return;
  }

  const nickInput = document.getElementById('player-nickname');
  const submitBtn = document.getElementById('btn-submit-score');
  const rawNickname = (nickInput.value || '').trim();

  // 4. 닉네임 유효성 검사
  if (!rawNickname || rawNickname.length < 1) {
    showToast('닉네임을 1글자 이상 입력해 주세요.');
    nickInput.focus();
    return;
  }

  if (rawNickname.length > 20) {
    showToast('닉네임은 최대 20자까지 가능합니다.');
    return;
  }

  // 5. 점수 및 플레이 시간 무결성 검증
  const { score, remainingCount, playDuration } = getResult();
  if (score < 0 || score > 220) {
    showToast('비정상적인 점수 데이터입니다.');
    return;
  }

  // 버튼 로딩 상태
  setButtonLoading(submitBtn, true);

  try {
    const { data, error } = await supabaseClient
      .from('mandarin-game_scores')
      .insert([
        {
          nickname: rawNickname,
          score: score,
          remaining_count: remainingCount,
          play_time: playDuration
        }
      ])
      .select();

    if (error) throw error;

    hasSubmittedThisGame = true; // 이번 세션 등록 완료
    lastSubmitTimestamp = Date.now();

    // 로컬 스토리지에 마지막 닉네임 저장
    localStorage.setItem('mandarin_player_nickname', rawNickname);

    showToast(`🎉 ${rawNickname}님의 점수(${getResult().score}점)가 명예의 전당에 등록되었습니다!`);
    closeModal();

    // 사이드 Top 5 즉각 갱신
    await fetchTop5Scores();

    // 등록된 기록이 5위 내에 있다면 하이라이트
    if (data && data[0]) {
      highlightLeaderboardItem(data[0].id);
    }
  } catch (err) {
    console.error('점수 등록 오류:', err);
    showToast('점수 등록 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.');
  } finally {
    setButtonLoading(submitBtn, false);
  }
}

function highlightLeaderboardItem(recordId) {
  setTimeout(() => {
    const el = document.querySelector(`.top5-item[data-record-id="${recordId}"]`);
    if (el) {
      el.classList.add('newly-ranked');
      soundManager.playSuccessChime();
    }
  }, 200);
}
