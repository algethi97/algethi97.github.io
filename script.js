// =========================================
// 공통 자바스크립트 로직 (script.js)
// =========================================

document.addEventListener('DOMContentLoaded', () => {
  console.log('Portfolio Site loaded successfully.');

  // 1. 비어있는 우측 탭 클릭 시 안내 피드백
  const emptyTab = document.querySelector('.tab-item.empty-tab');
  if (emptyTab) {
    emptyTab.addEventListener('click', (e) => {
      e.preventDefault();
      showToast('준비 중인 탭입니다. 곧 새로운 콘텐츠로 찾아올게요!', '⏳');
    });
  }

  // 2. 스크롤 인터랙션 (IntersectionObserver 기반 Fade-in)
  initScrollAnimation();

  // 3. 원클릭 클립보드 복사 및 토스트 알림 연동
  initCopyFeature();
});

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
    const textToCopy = copyTarget.getAttribute('data-copy');
    const customMessage = copyTarget.getAttribute('data-message') || `"${textToCopy}" 클립보드에 복사되었습니다!`;

    if (!textToCopy) return;

    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(textToCopy);
      } else {
        // Fallback for older browsers or non-secure contexts
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
  // 관찰 대상 요소들 선택 (카드, 섹션 등)
  const targets = document.querySelectorAll('.card, .project-card, .quick-link-card, .hero-section, .page-header');

  targets.forEach((target, index) => {
    target.classList.add('fade-in');
    // 약간의 순차적(stagger) 딜레이 효과 추가
    const delay = (index % 4) * 0.08;
    target.style.transitionDelay = `${delay}s`;
  });

  if (!('IntersectionObserver' in window)) {
    // IntersectionObserver 미지원 브라우저는 바로 노출
    targets.forEach(target => target.classList.add('visible'));
    return;
  }

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        obs.unobserve(entry.target); // 한 번 노출된 요소는 계속 유지
      }
    });
  }, {
    root: null,
    rootMargin: '0px 0px -40px 0px',
    threshold: 0.1
  });

  targets.forEach(target => observer.observe(target));
}
