// =========================================
// 공통 자바스크립트 로직 (script.js)
// =========================================

document.addEventListener('DOMContentLoaded', () => {
  console.log('Portfolio Site loaded successfully.');

  // 비어있는 우측 탭 클릭 시 안내 피드백 (선택적)
  const emptyTab = document.querySelector('.tab-item.empty-tab');
  if (emptyTab) {
    emptyTab.addEventListener('click', (e) => {
      e.preventDefault();
      // 향후 메뉴 추가 예정 안내
      console.log('준비 중인 탭입니다.');
    });
  }

  // 카드 호버 시 인터랙션 등 추가 가능
});
