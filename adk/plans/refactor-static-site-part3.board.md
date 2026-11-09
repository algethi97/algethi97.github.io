## 사람
### 목표
정적 사이트 리팩토링을 마무리합니다. 작업 트리에 적용만 되어 있는 스타일시트 분리(`style.css`와 `css/pages.css`·`css/guestbook.css`·`css/game.css`)가 이전 커밋(dbefa5f)과 같은 화면을 내는지 검증하고, 쓰지 않는 파일을 지우고, README와 `adk/mapping.adesk.md`를 실제 저장소와 맞춥니다. 화면 디자인과 기능 동작은 바꾸지 않습니다.

### 결정과 이유
- D1 (선택 A): 작업 트리의 CSS 분리 결과를 되돌리지 않고 유지하며, 단계 1에서 검증하고 정리합니다. 이미 적용된 분리를 버리고 다시 하는 비용이 크고, 이전 커밋과 비교하면 화면 동일성을 확인할 수 있기 때문입니다.
- D2 (선택 A): `!important`는 지워도 화면이 같다고 확인된 것만 지우고, 지운 목록과 개수를 보고합니다. 확인되지 않은 것은 남겨 화면이 달라질 위험을 막습니다.
- 이전에 확정된 결정(범위는 구조만, 빌드 도구 없음, 미사용 이미지 3개와 Python 골격 삭제, ES 모듈 분할, 유틸은 현재 동작 유지)도 그대로 적용합니다.
- 실행 AI는 중계 claude-sonnet-5-5(medium), 구현 gpt-6.1-sol(medium)이며 바꾸지 않습니다.

### 현재 작업
단계 1. CSS 분리 결과 검증과 정리 · 완료

## AI
단계 1을 완료했습니다. 맵에 style.css와 css/pages.css·css/guestbook.css·css/game.css의 책임 및 검증 대상을 반영했습니다. 화면 보존·기능 정상·새 콘솔 오류 없음은 이번 사용자 전달 결과를 근거로 완료 처리했으며 모델의 직접 브라우저 재검증 결과는 아닙니다. 기존 분리 커밋에서 제거한 선택자는 .tab-item.empty-tab과 모바일 복합 선택자 중 .tab-item.empty-tab 부분입니다. .tabs-grid의 기본·모바일 3열 선언도 제거되어 있습니다. 기존 !important 제거는 .game-main-content의 max-width·padding 2개, .orange-badge의 background-color·color·border-color 3개, .btn-hud-icon의 margin 1개, .hud-action-group .btn 및 .btn-hud-action 규칙의 margin-top·height 2개, .start-btn-lg의 margin-top 1개로 총 9개이며 20개가 남아 있습니다. 이번 실행에서 추가 CSS 삭제는 하지 않았습니다. JavaScript 9개 파일 구문 검사, 회귀 테스트 9개, 맵 공백 검사 및 최종 ADesk 검증기가 통과했습니다. eval CSP 항목은 사용자 확인에 따라 닫았습니다. 모바일 탭 글자 크기·잘림은 기준 버전에도 있는 기존 문제로 별도 수정 결정을 기다리며 이번 단계에서는 변경하지 않았습니다.

### 진행 상태

### 주의

### 참조
