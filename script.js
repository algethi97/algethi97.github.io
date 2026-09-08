// =========================================
// 공통 자바스크립트 로직 (script.js)
// 데스크테리어 줌인 & 인터랙티브 기능
// =========================================

document.addEventListener('DOMContentLoaded', () => {
  console.log('Deskterior Portfolio loaded.');

  // 1. 데스크테리어 모니터 줌인/줌아웃 시스템 초기화
  initDeskZoom();

  // 2. 비어있는 우측 탭 클릭 시 안내 피드백
  const emptyTabs = document.querySelectorAll('.tab-item.empty-tab');
  emptyTabs.forEach(tab => {
    tab.addEventListener('click', (e) => {
      e.preventDefault();
      showToast('준비 중인 탭입니다. 곧 새로운 콘텐츠로 찾아올게요!', '⏳');
    });
  });

  // 3. 스크롤 인터랙션 (IntersectionObserver)
  initScrollAnimation();

  // 4. 원클릭 클립보드 복사 및 토스트 알림
  initCopyFeature();
});

/* =========================================
   데스크테리어 모니터 줌인 / 줌아웃 시스템
   ========================================= */
function initDeskZoom() {
  const viewport = document.querySelector('.desk-viewport');
  if (!viewport) return; // index.html 이외의 단독 서브페이지 예외 처리

  const canvas = document.querySelector('.desk-canvas');
  const overlay = document.querySelector('.monitor-hint-overlay');
  const zoomoutBtn = document.querySelector('.desk-zoomout-btn');
  const scrollable = document.querySelector('.monitor-scrollable');

  // 줌인 함수
  function zoomIn() {
    if (viewport.classList.contains('is-zoomed')) return;
    viewport.classList.add('is-zoomed');
    showToast('모니터 화면에 진입했습니다. 자유롭게 둘러보세요!', '🖥️');
  }

  // 줌아웃 함수
  function zoomOut() {
    if (!viewport.classList.contains('is-zoomed')) return;
    viewport.classList.remove('is-zoomed');
    if (scrollable) {
      scrollable.scrollTo({ top: 0, behavior: 'smooth' });
    }
    showToast('데스크 전체 뷰로 전환되었습니다.', '🔍');
  }

  // 모니터 오버레이 또는 캔버스 클릭 시 줌인 (줌아웃 상태일 때만)
  if (overlay) {
    overlay.addEventListener('click', (e) => {
      e.stopPropagation();
      zoomIn();
    });
  }

  if (canvas) {
    canvas.addEventListener('click', (e) => {
      if (!viewport.classList.contains('is-zoomed')) {
        zoomIn();
      }
    });
  }

  // 줌아웃 버튼 클릭 시 복귀
  if (zoomoutBtn) {
    zoomoutBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      zoomOut();
    });
  }

  // ESC 키 누르면 데스크 뷰로 줌아웃
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && viewport.classList.contains('is-zoomed')) {
      zoomOut();
    }
  });
}

/* =========================================
   토스트 알림 시스템 (Toast Notification)
   ========================================= */
let toastTimeout = null;

function showToast(message, icon = '📋') {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  let toast = container.querySelector('.toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast';
    container.appendChild(toast);
  }

  toast.innerHTML = `<span class="toast-icon">${icon}</span><span>${message}</span>`;
  toast.classList.add('show');

  if (toastTimeout) {
    clearTimeout(toastTimeout);
  }

  toastTimeout = setTimeout(() => {
    toast.classList.remove('show');
  }, 2500);
}

/* =========================================
   원클릭 복사 기능 (Copy to Clipboard)
   ========================================= */
function initCopyFeature() {
  document.addEventListener('click', async (e) => {
    const copyTarget = e.target.closest('[data-copy]');
    if (!copyTarget) return;

    e.preventDefault();
    e.stopPropagation();
    const textToCopy = copyTarget.getAttribute('data-copy');
    const customMessage = copyTarget.getAttribute('data-message') || `"${textToCopy}" 클립보드에 복사되었습니다!`;

    if (!textToCopy) return;

    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(textToCopy);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = textToCopy;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      showToast(customMessage, '✅');
    } catch (err) {
      console.error('클립보드 복사 실패:', err);
      showToast('복사에 실패했습니다. 다시 시도해 주세요.', '⚠️');
    }
  });
}

/* =========================================
   스크롤 인터랙션 초기화 (Scroll Fade-in)
   ========================================= */
function initScrollAnimation() {
  const targets = document.querySelectorAll('.card, .project-card, .quick-link-card, .hero-section, .page-header');

  targets.forEach((target, index) => {
    target.classList.add('fade-in');
    const delay = (index % 4) * 0.06;
    target.style.transitionDelay = `${delay}s`;
  });

  if (!('IntersectionObserver' in window)) {
    targets.forEach(target => target.classList.add('visible'));
    return;
  }

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        obs.unobserve(entry.target);
      }
    });
  }, {
    root: null,
    rootMargin: '0px 0px -30px 0px',
    threshold: 0.08
  });

  targets.forEach(target => observer.observe(target));
}
