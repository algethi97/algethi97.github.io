## 사람
### 목표

### 결정과 이유

### 현재 작업

## AI
### 진행 상태
- 단계 1을 완료했습니다. 상단 탭은 타이틀바와 스크롤 영역 사이 고정 행으로 옮겼고, 화면 켜짐(powering-on 0.3초) 뒤 확대되도록 구현했습니다.
- Chrome 헤드리스로 측정한 결과 완료 기준 여섯 항목이 모두 통과했습니다. 탭 위치는 스크롤 네 곳 모두 차이 0px입니다. 프로젝트 테스트 9개와 동봉 검증기도 통과했습니다.

### 주의
- 이 PC는 Windows 애니메이션 효과가 꺼져 있어 '움직임 줄이기'로 판정됩니다. 그래서 켜짐 연출이 보이지 않고 바로 확대되는데, 이는 계획대로입니다.
- 탭 줄이 스크롤바 폭만큼 약간 넓어졌습니다. 글자·아이콘·높이는 같습니다.

### 참조
- index.html의 .monitor-screen 자식 순서: .monitor-hint-overlay → .window-titlebar → header.nav-header → .monitor-scrollable
- style.css: .monitor-screen .nav-header, .monitor-hint-overlay::after, @keyframes monitor-power-on
- script.js: initDeskZoom()의 zoomIn()·zoomOut()·powerOnTimer
