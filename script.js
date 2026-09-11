// ==========================================================================
// 공통 자바스크립트 로직 (script.js)
// 데스크테리어 줌인 & 화면 속으로 빨려 들어가는 시네마틱 전환 연출
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {
  console.log('Deskterior Portfolio loaded.');

  // 1. 화면 속으로 들어가는 시네마틱 전환 (Warp-in Transition) 초기화
  initWarpTransitions();

  // 2. 데스크테리어 모니터 줌인/줌아웃 시스템 초기화
  initDeskZoom();

  // 3. 비어있는 우측 탭 클릭 시 안내 피드백
  const emptyTabs = document.querySelectorAll('.tab-item.empty-tab');
  emptyTabs.forEach(tab => {
    tab.addEventListener('click', (e) => {
      e.preventDefault();
      showToast('준비 중인 탭입니다. 곧 새로운 콘텐츠로 찾아올게요!', '⏳');
    });
  });

  // 4. 스크롤 인터랙션 (IntersectionObserver)
  initScrollAnimation();

  // 5. 원클릭 클립보드 복사 및 토스트 알림
  initCopyFeature();
});

/* ==========================================================================
   화면 속으로 빨려 들어가는 시네마틱 전환 연출 (Warp-in & Page Transitions)
   ========================================================================= */
function initWarpTransitions() {
  const viewport = document.querySelector('.desk-viewport');

  // [A] index.html에서 서브페이지(about.html, portfolio.html)로 넘어갈 때의 연출
  if (viewport) {
    // 서브페이지에서 홈으로 돌아왔을 때의 처리: 줌인 애니메이션 없이 즉시 모니터 뷰로 안착
    if (sessionStorage.getItem('return_to_monitor') === 'true') {
      sessionStorage.removeItem('return_to_monitor');
      viewport.classList.add('is-zoomed');
      
      // 초기 렌더링이 완료된 후 트랜지션을 다시 복원하여 이후 줌아웃 버튼이 정상 동작하도록 함
      requestAnimationFrame(() => {
        setTimeout(() => {
          document.documentElement.classList.remove('instant-zoomed');
        }, 60);
      });
    }

    // 모니터 내부의 모든 서브페이지 이동 링크 감지
    const navLinks = document.querySelectorAll('a[href*="about.html"], a[href*="portfolio.html"]');

    navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetUrl = link.getAttribute('href');

        // 부드럽고 곧은 모니터 줌인 & 페이드아웃 발동
        viewport.classList.add('is-zoomed');
        viewport.classList.add('warp-in');

        // 흔들림 없이 부드럽게 페이드아웃된 후 페이지 이동
        setTimeout(() => {
          window.location.href = targetUrl;
        }, 450);
      });
    });
  }

  // [B] 서브페이지(about.html, portfolio.html) 전용 진입 및 복귀 연출
  const isStandalone = document.body.classList.contains('standalone-page');
  if (isStandalone) {
    // 1. 모니터 속에서 확장되어 나타나는 부드러운 진입 효과
    document.body.classList.add('page-entering');
    requestAnimationFrame(() => {
      setTimeout(() => {
        document.body.classList.remove('page-entering');
      }, 30);
    });

    // 2. 홈으로 돌아갈 때 모니터 밖으로 나가는 부드러운 전환 효과
    const homeLinks = document.querySelectorAll('a[href*="index.html"]');
    homeLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetUrl = link.getAttribute('href');

        // 서브페이지에서 돌아갈 때 줌 상태를 유지하도록 세션 플래그 설정
        sessionStorage.setItem('return_to_monitor', 'true');

        document.body.classList.add('page-leaving');
        setTimeout(() => {
          window.location.href = targetUrl;
        }, 320);
      });
    });
  }
}

/* ==========================================================================
   데스크테리어 모니터 줌인 / 줌아웃 시스템
   ========================================================================== */
function initDeskZoom() {
  const viewport = document.querySelector('.desk-viewport');
  if (!viewport) return;

  const canvas = document.querySelector('.desk-canvas');
  const overlay = document.querySelector('.monitor-hint-overlay');
  const zoomoutBtn = document.querySelector('.desk-zoomout-btn');
  const scrollable = document.querySelector('.monitor-scrollable');

  // 줌인 함수
  function zoomIn() {
    if (viewport.classList.contains('is-zoomed') || viewport.classList.contains('warp-in')) return;
    viewport.classList.add('is-zoomed');
    showToast('모니터 화면에 진입했습니다. 탭을 눌러 이동해보세요!', '🖥️');
  }

  // 줌아웃 함수
  function zoomOut() {
    if (!viewport.classList.contains('is-zoomed')) return;
    viewport.classList.remove('is-zoomed');
    viewport.classList.remove('warp-in');
    if (scrollable) {
      scrollable.scrollTo({ top: 0, behavior: 'smooth' });
    }
    showToast('데스크 전체 뷰로 전환되었습니다.', '🔍');
  }

  // 모니터 화면 또는 오버레이 클릭 시에만 줌인 (줌아웃 상태일 때만)
  const monitorScreen = document.querySelector('.monitor-screen');
  if (monitorScreen) {
    monitorScreen.addEventListener('click', (e) => {
      if (!viewport.classList.contains('is-zoomed')) {
        zoomIn();
      }
    });
  }

  if (overlay) {
    overlay.addEventListener('click', (e) => {
      e.stopPropagation();
      zoomIn();
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

/* ==========================================================================
   토스트 알림 시스템 (Toast Notification)
   ========================================================================== */
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

/* ==========================================================================
   원클릭 복사 기능 (Copy to Clipboard)
   ========================================================================== */
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

/* ==========================================================================
   스크롤 인터랙션 초기화 (Scroll Fade-in)
   ========================================================================== */
function initScrollAnimation() {
  const targets = document.querySelectorAll('.card, .project-card, .quick-link-card, .hero-section, .page-header');

  targets.forEach((target, index) => {
    target.classList.add('fade-in');
    const delay = (index % 4) * 0.05;
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
    rootMargin: '0px 0px -20px 0px',
    threshold: 0.05
  });

  targets.forEach(target => observer.observe(target));
}
