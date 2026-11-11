## 사람
### 목표

### 결정과 이유

### 현재 작업

## AI
1단계를 완료했습니다. `.desk-canvas`의 상시 `will-change: transform`을 제거하고, 브라우저 비교로 확인된 홈 본문의 별도 합성 힌트도 `.monitor-scrollable .fade-in.visible`에서 해제했습니다.

Chrome 156에서 모바일 390×844·배율 3, 데스크톱 1440×900·배율 1로 비교했습니다. 선명도는 원본 픽셀 탭 영역의 가로 이웃 픽셀 밝기 차이 평균이며, 아래 값은 소수점 넷째 자리로 표시했습니다.

| 경로 | 수정 전 | 수정 후 | 육안 결과 | 전체 캡처 |
| --- | ---: | ---: | --- | --- |
| A 모바일 | 3.2419 | 3.2568 | 강한 흐림은 재현되지 않았고 탭 윤곽 차이는 작았습니다. | [전](C:/Projects/algethi97.github.io/.scratch/zoom-blur/before-a-mobile.png) · [후](C:/Projects/algethi97.github.io/.scratch/zoom-blur/after-a-mobile.png) |
| A 데스크톱 | 2.3113 | 3.3896 | 탭과 본문의 번짐이 재현됐고 최종 화면에서 개선됐습니다. | [전](C:/Projects/algethi97.github.io/.scratch/zoom-blur/before-a-desktop.png) · [후](C:/Projects/algethi97.github.io/.scratch/zoom-blur/after-a-desktop.png) |
| B 모바일 | 3.2419 | 3.2568 | 뚜렷한 흐림은 재현되지 않았으며 선명도가 소폭 개선됐습니다. | [전](C:/Projects/algethi97.github.io/.scratch/zoom-blur/before-b-mobile.png) · [후](C:/Projects/algethi97.github.io/.scratch/zoom-blur/after-b-mobile.png) |
| B 데스크톱 | 3.3646 | 3.3896 | 기존에도 비교적 선명했고 최종 탭·본문도 또렷했습니다. | [전](C:/Projects/algethi97.github.io/.scratch/zoom-blur/before-b-desktop.png) · [후](C:/Projects/algethi97.github.io/.scratch/zoom-blur/after-b-desktop.png) |
| C 데스크톱 재확대 | 2.3113 | 3.3896 | 재확대 때의 탭·본문 번짐이 개선됐습니다. | [전](C:/Projects/algethi97.github.io/.scratch/zoom-blur/before-c-desktop-rezoom.png) · [후](C:/Projects/algethi97.github.io/.scratch/zoom-blur/after-c-desktop-rezoom.png) |

C의 홈 버튼 재로딩 직후에는 결정 A대로 축소 화면이 유지됩니다([전](C:/Projects/algethi97.github.io/.scratch/zoom-blur/before-c-desktop-reloaded-desk.png) · [후](C:/Projects/algethi97.github.io/.scratch/zoom-blur/after-c-desktop-reloaded-desk.png)). 이 축소 화면은 확대 선명도 비교에 포함하지 않았습니다.

모든 확대 표본의 정지 상태 `will-change`는 `auto`였습니다. 확대·축소·ESC·탭 이동·홈 복귀·움직임 줄이기와 기존 테스트 9개가 통과했습니다. 정확한 수치와 전체·탭 캡처 경로는 [results.json](C:/Projects/algethi97.github.io/.scratch/zoom-blur/results.json)에 기록했습니다.

실제 휴대폰의 보고 증상과 전환 체감은 실기기 QA로 남겼습니다. 배경 그림 자체의 확대 거칠음은 남아 있으며 계획 범위대로 그림은 변경하지 않았습니다.

### 진행 상태

### 주의

### 참조
