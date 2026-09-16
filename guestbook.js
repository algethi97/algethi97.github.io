// ==========================================================================
// 방명록 로직 모듈 (guestbook.js)
// Supabase Cloud 연동, RLS 보안 방어, XSS 차단, 쿨다운(도배 방지), 페이징
// ==========================================================================

const SUPABASE_CONFIG = {
  url: 'https://fspkdczsrfoyebznfkwr.supabase.co',
  key: 'sb_publishable_oZWWsYIiUzSB6-9F5I5bdw_sLakHhyW'
};

const COOLDOWN_SECONDS = 30;
const PAGE_SIZE = 15;

let supabaseClient = null;
let currentOffset = 0;
let totalMessagesCount = 0;
let isFetching = false;
let isSubmitting = false;
let cooldownInterval = null;

// ==========================================================================
// 초기화
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {
  // 1. Supabase 클라이언트 초기화
  if (window.supabase && window.supabase.createClient) {
    supabaseClient = window.supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.key);
  } else {
    console.error('Supabase SDK 로드 실패');
    showNotification('데이터베이스 모듈을 불러오지 못했습니다. 페이지를 새로고침 해주세요.', '❌');
    return;
  }

  // 2. DOM 요소 바인딩 및 이벤트 리스너 등록
  initGuestbookEvents();

  // 3. 이전 쿨다운 상태 복원
  restoreCooldownState();

  // 4. 초기 방명록 데이터 불러오기
  loadGuestbookMessages(true);
});

// ==========================================================================
// 이벤트 핸들러 초기화
// ==========================================================================
function initGuestbookEvents() {
  const form = document.getElementById('guestbook-form');
  const messageInput = document.getElementById('message');
  const charCounter = document.getElementById('char-count');
  const loadMoreBtn = document.getElementById('load-more-btn');

  // 실시간 글자수 카운팅
  if (messageInput && charCounter) {
    messageInput.addEventListener('input', () => {
      charCounter.textContent = messageInput.value.length;
    });
  }

  // 방명록 제출 핸들러
  if (form) {
    form.addEventListener('submit', handleFormSubmit);
  }

  // 이전 방명록 더보기 버튼
  if (loadMoreBtn) {
    loadMoreBtn.addEventListener('click', () => {
      loadGuestbookMessages(false);
    });
  }
}

// ==========================================================================
// 방명록 목록 불러오기 (페이징 & 캐싱 부하 최소화)
// ==========================================================================
async function loadGuestbookMessages(isInitial = false) {
  if (isFetching) return;
  isFetching = true;

  const listContainer = document.getElementById('guestbook-list');
  const skeleton = document.getElementById('guestbook-skeleton');
  const emptyState = document.getElementById('guestbook-empty');
  const loadMoreBtn = document.getElementById('load-more-btn');
  const totalCountEl = document.getElementById('total-count');

  if (isInitial) {
    currentOffset = 0;
    listContainer.innerHTML = '';
    skeleton.style.display = 'grid';
    emptyState.style.display = 'none';
    loadMoreBtn.style.display = 'none';
  } else {
    setButtonLoading(loadMoreBtn, true);
  }

  try {
    const { data, error, count } = await supabaseClient
      .from('guestbook')
      .select('id, nickname, message, created_at', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(currentOffset, currentOffset + PAGE_SIZE - 1);

    if (error) {
      console.error('방명록 조회 오류:', error);
      throw error;
    }

    if (count !== null && totalCountEl) {
      totalMessagesCount = count;
      totalCountEl.textContent = count;
    }

    if (isInitial && (!data || data.length === 0)) {
      emptyState.style.display = 'block';
      loadMoreBtn.style.display = 'none';
    } else if (data && data.length > 0) {
      data.forEach(item => {
        const card = createMessageCardElement(item);
        listContainer.appendChild(card);
      });

      currentOffset += data.length;

      // 더 불러올 데이터가 남아있는지 판별
      if (currentOffset < totalMessagesCount) {
        loadMoreBtn.style.display = 'inline-flex';
      } else {
        loadMoreBtn.style.display = 'none';
      }
    }
  } catch (err) {
    console.error('방명록 로딩 중 실패:', err);
    showNotification('방명록을 불러오는 중 문제가 발생했습니다.', '⚠️');
  } finally {
    isFetching = false;
    skeleton.style.display = 'none';
    if (!isInitial) {
      setButtonLoading(loadMoreBtn, false);
    }
  }
}

// ==========================================================================
// 방명록 등록 처리 (보안 검사, 쿨다운, 유효성 검증)
// ==========================================================================
async function handleFormSubmit(e) {
  e.preventDefault();

  if (isSubmitting) return;

  // 1. 허니팟 필드(스팸 봇 감지) 검사
  const honeypot = document.getElementById('honeypot-website');
  if (honeypot && honeypot.value.trim() !== '') {
    console.warn('봇 스팸 의심 요청 차단');
    // 봇에게는 정상 등록된 것처럼 속이고 종료
    document.getElementById('guestbook-form').reset();
    showNotification('메시지가 등록되었습니다! ✨', '🎉');
    return;
  }

  // 2. 쿨다운 검사
  const remainingCooldown = getRemainingCooldown();
  if (remainingCooldown > 0) {
    showNotification(`도배 방지를 위해 ${remainingCooldown}초 후에 등록 가능합니다.`, '⏳');
    return;
  }

  // 3. 입력값 추출 및 유효성 검사
  const nicknameInput = document.getElementById('nickname');
  const messageInput = document.getElementById('message');
  const submitBtn = document.getElementById('submit-btn');

  const nickname = nicknameInput.value.trim();
  const message = messageInput.value.trim();

  if (nickname.length < 1 || nickname.length > 20) {
    showNotification('닉네임은 1자 이상 20자 이하로 입력해주세요.', '⚠️');
    nicknameInput.focus();
    return;
  }

  if (message.length < 1 || message.length > 500) {
    showNotification('메시지 내용은 1자 이상 500자 이하로 입력해주세요.', '⚠️');
    messageInput.focus();
    return;
  }

  // 4. 전송 시작 (더블 서브밋 방지)
  isSubmitting = true;
  setButtonLoading(submitBtn, true);

  try {
    const { data, error } = await supabaseClient
      .from('guestbook')
      .insert([{ nickname, message }])
      .select();

    if (error) {
      console.error('방명록 등록 오류:', error);
      throw error;
    }

    // 5. 성공 처리
    const newEntry = (data && data[0]) ? data[0] : {
      id: Date.now(),
      nickname,
      message,
      created_at: new Date().toISOString()
    };

    // 폼 초기화
    document.getElementById('guestbook-form').reset();
    document.getElementById('char-count').textContent = '0';

    // 목록 상단에 새 메시지 카드 추가
    const listContainer = document.getElementById('guestbook-list');
    const emptyState = document.getElementById('guestbook-empty');
    emptyState.style.display = 'none';

    const card = createMessageCardElement(newEntry);
    card.classList.add('just-added');
    listContainer.prepend(card);

    // 총 개수 갱신
    totalMessagesCount += 1;
    document.getElementById('total-count').textContent = totalMessagesCount;

    // 쿨다운 시작 (30초)
    startCooldown(COOLDOWN_SECONDS);

    showNotification('방명록이 성공적으로 등록되었습니다! 🎉', '✨');
  } catch (err) {
    console.error('방명록 저장 실패:', err);
    showNotification('방명록 저장에 실패했습니다. 잠시 후 다시 시도해주세요.', '⚠️');
  } finally {
    isSubmitting = false;
    setButtonLoading(submitBtn, false);
  }
}

// ==========================================================================
// 메시지 카드 DOM 생성 (XSS 방어: escapeHtml 및 안전한 엘리먼트 빌드)
// ==========================================================================
function createMessageCardElement(entry) {
  const card = document.createElement('article');
  card.className = 'guestbook-card';
  card.id = `guestbook-entry-${entry.id}`;

  const safeNickname = escapeHtml(entry.nickname);
  const safeMessage = escapeHtml(entry.message).replace(/\n/g, '<br>');
  const formattedTime = formatDateTime(entry.created_at);
  const relativeTime = getRelativeTimeString(entry.created_at);

  card.innerHTML = `
    <div class="card-meta">
      <div class="meta-left">
        <span class="entry-badge">#${entry.id}</span>
        <strong class="entry-author">${safeNickname}</strong>
      </div>
      <div class="meta-right">
        <span class="entry-time" title="${formattedTime}">${relativeTime}</span>
      </div>
    </div>
    <div class="card-content">
      <p>${safeMessage}</p>
    </div>
  `;

  return card;
}

// ==========================================================================
// 쿨다운(도배 방지) 관리
// ==========================================================================
function startCooldown(seconds) {
  const targetTime = Date.now() + (seconds * 1000);
  localStorage.setItem('guestbook_cooldown_target', targetTime.toString());
  updateCooldownUI(seconds);

  if (cooldownInterval) clearInterval(cooldownInterval);

  cooldownInterval = setInterval(() => {
    const remaining = Math.ceil((targetTime - Date.now()) / 1000);
    if (remaining <= 0) {
      clearInterval(cooldownInterval);
      cooldownInterval = null;
      localStorage.removeItem('guestbook_cooldown_target');
      endCooldownUI();
    } else {
      updateCooldownUI(remaining);
    }
  }, 1000);
}

function restoreCooldownState() {
  const remaining = getRemainingCooldown();
  if (remaining > 0) {
    startCooldown(remaining);
  }
}

function getRemainingCooldown() {
  const target = localStorage.getItem('guestbook_cooldown_target');
  if (!target) return 0;
  const remaining = Math.ceil((parseInt(target, 10) - Date.now()) / 1000);
  return remaining > 0 ? remaining : 0;
}

function updateCooldownUI(seconds) {
  const submitBtn = document.getElementById('submit-btn');
  const banner = document.getElementById('cooldown-banner');
  const timerEl = document.getElementById('cooldown-timer');

  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.classList.add('is-cooling');
  }
  if (banner && timerEl) {
    banner.style.display = 'flex';
    timerEl.textContent = seconds;
  }
}

function endCooldownUI() {
  const submitBtn = document.getElementById('submit-btn');
  const banner = document.getElementById('cooldown-banner');

  if (submitBtn) {
    submitBtn.disabled = false;
    submitBtn.classList.remove('is-cooling');
  }
  if (banner) {
    banner.style.display = 'none';
  }
}

// ==========================================================================
// 유틸리티 함수 (XSS 방어, 날짜 포맷, 버튼 로딩 상태)
// ==========================================================================
function escapeHtml(text) {
  if (!text) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function formatDateTime(isoString) {
  if (!isoString) return '';
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return '';

  const pad = (n) => n.toString().padStart(2, '0');
  const y = date.getFullYear();
  const m = pad(date.getMonth() + 1);
  const d = pad(date.getDate());
  const hh = pad(date.getHours());
  const mm = pad(date.getMinutes());

  return `${y}.${m}.${d} ${hh}:${mm}`;
}

function getRelativeTimeString(isoString) {
  if (!isoString) return '';
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return '';

  const diffMs = Date.now() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return '방금 전';
  if (diffMin < 60) return `${diffMin}분 전`;
  if (diffHour < 24) return `${diffHour}시간 전`;
  if (diffDay < 7) return `${diffDay}일 전`;

  return formatDateTime(isoString);
}

function setButtonLoading(button, isLoading) {
  if (!button) return;
  const textSpan = button.querySelector('.btn-text');
  const loaderSpan = button.querySelector('.btn-loader');

  if (isLoading) {
    button.disabled = true;
    if (textSpan) textSpan.style.opacity = '0.5';
    if (loaderSpan) loaderSpan.style.display = 'inline-block';
  } else {
    button.disabled = false;
    if (textSpan) textSpan.style.opacity = '1';
    if (loaderSpan) loaderSpan.style.display = 'none';
  }
}

function showNotification(message, icon = '💬') {
  if (typeof window.showToast === 'function') {
    window.showToast(message, icon);
  } else {
    alert(message);
  }
}

