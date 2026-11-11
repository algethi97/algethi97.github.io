# 홈 모니터 확대 화면 흐림 수정

## 현재 문제

홈(`index.html`)에서 모니터를 확대한 화면의 글자와 그림이 흐릿하게 보인다. 사용자가 보고한 증상은 두 가지다.

1. 실제 휴대폰에서 홈 모니터를 확대하면 홈 화면이 흐릿하게 보인다. (QA 항목 "실제 모바일 사용감"에서 보고됨)
2. 데스크톱에서도 확대된 상태에서 홈 버튼을 누르면 같은 흐림이 나타난다.

홈은 책상 그림 전체(`.desk-canvas`)를 `transform: scale(2.22)`로 키워 모니터 속 화면을 보여 준다. 이 요소에 `will-change: transform`이 항상 붙어 있다(`style.css` 91행). [가설/임시] 이 속성이 있으면 브라우저가 확대 전 크기로 그려 둔 그림을 늘려서 보여 주고, 확대가 끝난 뒤에도 확대된 크기로 다시 그리지 않아 글자가 번진다. 이 원인은 코드 읽기로만 추정했고 브라우저에서 재현해 확인하지는 않았다.

데스크톱 증상의 "확대된 상태에서 홈 버튼"은 다음 두 경로 중 어느 쪽인지 대화에서 확정하지 않았다. 두 경로를 모두 재현 대상과 수정 대상으로 삼는다.

- 경로 B: 안쪽 페이지(`about.html`, `portfolio.html`, `guestbook.html`, `game.html`)에서 홈 버튼(`a.home-button`) 또는 "홈으로 돌아가기" 링크를 눌러 홈으로 돌아오는 경로다. `script.js`가 `sessionStorage`에 `return_to_monitor`를 기록하고, `index.html` 머리말의 인라인 스크립트가 `html`에 `instant-zoomed` 클래스를 붙여 애니메이션 없이 확대 상태로 시작한다.
- 경로 C: 홈에서 모니터를 확대한 상태로 모니터 안의 홈 버튼(`index.html` 55행, `href="index.html"`)을 누르는 경로다. 홈에서는 이 링크에 붙은 스크립트 처리기가 없어서 페이지를 그냥 다시 불러오고, 기록이 없으므로 축소된 책상 화면으로 돌아간다.

## 수정할 것

1. 수정 전에 아래 "재현 경로" 네 가지를 헤드리스 Chrome으로 캡처해 어느 경로에서 흐림이 나타나는지 기록한다.
2. `.desk-canvas`가 확대를 마친 뒤에는 브라우저가 확대된 크기로 화면을 다시 그리도록 `will-change: transform`의 상시 적용을 없앤다.
3. 2번만으로 선명해지지 않는 경로가 있으면 그 경로의 원인을 찾아 함께 고친다. 후보는 `instant-zoomed` 해제 시점(`script.js` 40~50행)과 모바일의 `.monitor-scrollable { zoom: 0.8; }`(`style.css` 590~594행)이다.
4. 수정 후 같은 네 경로를 다시 캡처해 수정 전과 비교한다.

### 재현 경로

| 이름 | 화면 조건 | 조작 |
| --- | --- | --- |
| 경로 A-모바일 | 폭 390px, 높이 844px, 기기 배율 3, 모바일 에뮬레이션 | 홈을 열고 모니터 화면을 눌러 확대한 뒤 확대 전환(1.05초)이 끝날 때까지 기다린다. |
| 경로 A-데스크톱 | 폭 1440px, 높이 900px, 기기 배율 1 | 경로 A-모바일과 같은 조작이다. |
| 경로 B | 위 두 화면 조건 각각 | `about.html`을 열고 `a.home-button`을 실제 클릭해 홈으로 돌아온 뒤 `instant-zoomed` 클래스가 사라질 때까지 기다린다. |
| 경로 C | 폭 1440px, 높이 900px, 기기 배율 1 | 홈에서 모니터를 확대한 뒤 모니터 안의 `a.home-button`을 실제 클릭하고, 새로 불러온 화면과 그 화면에서 다시 확대한 화면을 각각 캡처한다. |

## 기대 효과

- 휴대폰에서 홈 모니터를 확대했을 때 탭 글자와 본문 글자가 번지지 않고 또렷하게 보인다.
- 데스크톱에서 안쪽 페이지의 홈 버튼으로 돌아온 홈 화면과, 홈에서 홈 버튼을 누른 뒤의 화면이 처음 확대했을 때와 같은 선명도로 보인다.

## 완료 기준

| 확인 | 방법 |
| --- | --- |
| 상시 `will-change` 제거 | 확대가 끝나 멈춘 상태(`.desk-viewport.is-zoomed`이고 전환이 끝난 뒤)에서 `getComputedStyle(.desk-canvas).willChange`가 `auto`다. 네 경로 모두에서 확인한다. 하나라도 `transform`이면 실패다. |
| 선명도 수치 | 측정 대상은 확대가 끝난 화면 캡처에서 `.tabs-grid` 영역을 잘라 낸 그림의 "가로 방향 이웃 픽셀 밝기 차이의 평균"이다. 조건은 재현 경로 표의 화면 조건과 같고, 같은 경로의 수정 전 캡처와 수정 후 캡처를 한 번씩 비교한다. 수정 후 값이 수정 전 값보다 낮은 경로가 있으면 실패로 보고 원인을 찾는다. 수정 전 캡처에서 흐림이 재현되지 않아 값이 같게 나온 경로는 실패로 보지 않고 "재현 안 됨"으로 수치와 함께 보고만 한다. |
| 육안 비교 | 경로별 수정 전·후 캡처를 직접 열어 탭 글자의 번짐 여부를 문장으로 보고한다. |
| 확대·축소 동작 | 모니터 클릭 확대, "데스크 뷰로 축소" 버튼, ESC 축소, 탭 클릭 시 안쪽 페이지 이동(`warp-in`), 안쪽 페이지에서 홈 복귀 시 애니메이션 없는 확대 상태 시작이 수정 전과 같게 동작한다. |
| 회귀 | `.adesk/verify.json`의 구문 검사(`node --check`)와 `node --test tests/static-site.test.mjs`가 통과한다. |

## 지킬 것

- 확대 배율 `scale(2.22)`, 전환 시간(`--zoom-transition`의 1.05초), `transform-origin: 49.91% 41.5%`, `warp-in`의 `scale(3.4)`는 바꾸지 않는다.
- `prefers-reduced-motion: reduce`에서 전환을 끄는 규칙(`style.css` 808~810행)을 유지한다.
- `sessionStorage` 키 이름 `return_to_monitor`와 `instant-zoomed` 클래스 이름은 바꾸지 않는다.
- 모니터 안 글자 크기 `font-size: clamp(6px, 0.64vw, 10px)`(`style.css` 188행)와 모바일 탭 글자 크기 규칙은 이전 계획(`adk/plans/mobile-tab-font-size.md`)에서 정한 값이므로, 흐림의 원인으로 확인된 경우가 아니면 바꾸지 않는다. `zoom: 0.8`을 바꿔야 한다면 바꾸기 전에 탭과 본문이 모니터 폭을 넘치지 않는지 390px에서 확인하고, 화면 배치가 달라지면 수정하지 말고 그 사실을 보고한다.
- 배경 그림 `images/GPT_Gen.png`(1672×941)가 2.22배로 늘어나 생기는 그림 자체의 거칠음은 이 계획의 범위가 아니다. 그림 파일은 바꾸지 않고, 눈에 띄면 보고만 한다.
- 확대 전환이 눈에 띄게 끊기면 `will-change`를 전환 중에만 붙이고 `transitionend` 뒤에 떼는 방식으로 바꾼다. 이때도 멈춘 상태의 `will-change`는 `auto`여야 한다.
- 헤드리스 Chrome 캡처는 사용자의 실제 휴대폰과 다를 수 있다. 실기기에서 확인하지 못한 사실을 완료 보고에 분명히 적고, 사용자가 실제 휴대폰에서 다시 볼 항목을 남긴다.
- Chrome 실행 파일 경로(`C:\Program Files\Google\Chrome\Application\chrome.exe`)가 없거나 실행에 실패하면 캡처 검증은 "실행하지 못함"으로 사유와 함께 보고하고, 구문 검사와 계산된 스타일 확인이 가능한 범위까지만 진행한다.
- 요청과 무관한 스타일 정리나 리팩터링은 하지 않는다. 커밋은 하지 않는다.

## 단계 1. 흐림 재현, 확대 화면 다시 그리기 수정, 캡처 검증

- 작업: 먼저 `.scratch/noir-remodel/capture.mjs`의 방식(Node 내장 모듈로 로컬 정적 서버를 띄우고 헤드리스 Chrome을 원격 디버깅으로 조작한 뒤 정리)을 참고해 `.scratch/zoom-blur/capture.mjs`를 새로 만든다. 이 도구는 "재현 경로" 표의 네 경로를 실제 클릭으로 수행하고, 확대가 끝난 화면 전체 캡처와 `.tabs-grid` 영역 캡처를 저장하며, `.desk-canvas`의 계산된 `will-change`·`transform` 값과 선명도 수치를 `.scratch/zoom-blur/results.json`에 `before`·`after`로 나누어 기록한다. 소스를 고치기 전에 한 번 실행해 `before`를 남긴다. 그다음 `style.css` 91행의 `will-change: transform;`을 지운다. 다시 실행해 `after`를 남기고 완료 기준 표의 항목을 확인한다. 흐림이 남는 경로가 있으면 "수정할 것" 3번의 후보를 차례로 확인해 그 경로만 고친다. 같은 시도가 두 번 실패하면 임의 수정을 멈추고 원인과 시도 내용을 보고한다. 결정 D1에서 B가 선택된 경우에만 `script.js`에 홈 화면의 홈 버튼 처리기를 추가한다. 마지막으로 새로 만든 `.scratch/zoom-blur/` 파일의 행을 `adk/mapping.adesk.md`에 `## .scratch/zoom-blur` 절로 추가하고, `style.css`와 `script.js` 행의 설명이 달라졌으면 고친다.
- 완료 기준: 완료 기준 표의 다섯 항목을 모두 확인해 결과를 보고한다. 네 경로의 수정 전·후 선명도 수치와 캡처 파일 경로, 흐림이 재현된 경로와 재현되지 않은 경로, 실행하지 못한 검증과 사유를 보고에 포함한다.
- 읽을 파일: style.css, script.js, index.html, about.html, css/pages.css, .scratch/noir-remodel/capture.mjs, .adesk/verify.json, adk/mapping.adesk.md
- 고칠 파일: style.css, script.js, .scratch/zoom-blur/capture.mjs, .scratch/zoom-blur/results.json, adk/mapping.adesk.md
- 지킬 테스트: tests/static-site.test.mjs
- 난이도: standard
- 선행 단계: 없음

## 결정

### D1. 홈에서 확대한 상태로 모니터 안의 홈 버튼을 눌렀을 때의 동작

- A. 지금처럼 페이지를 다시 불러와 축소된 책상 화면으로 돌아가게 두고, 흐림만 고친다 

- 선택: A
## 근거

- `style.css` 76~92행: `.desk-canvas` 정의. 90행 `transition: var(--zoom-transition);`, 91행 `will-change: transform;`.
- `style.css` 30행: `--zoom-transition: transform 1.05s cubic-bezier(0.2, 0.9, 0.1, 1);`.
- `style.css` 105~108행: `.desk-viewport.is-zoomed .desk-canvas { transform: scale(2.22); }`.
- `style.css` 111~128행: `html.instant-zoomed` 규칙. `.desk-canvas`에 `transform: scale(2.22) !important; transition: none !important;`를 건다.
- `style.css` 134~137행: `.desk-viewport.warp-in .desk-canvas`의 `scale(3.4)`와 0.5초 전환.
- `style.css` 188행: `.monitor-screen`의 `font-size: clamp(6px, 0.64vw, 10px);`. 폭 390px에서는 6px, 폭 1440px에서는 약 9.2px이다.
- `style.css` 590~594행: 768px 이하에서 `.monitor-scrollable { zoom: 0.8; }`.
- `style.css` 808~810행: 움직임 줄이기 설정에서 `.desk-canvas` 전환을 끄는 규칙.
- `index.html` 9~14행: `return_to_monitor`가 `true`이면 `html`에 `instant-zoomed`를 붙이는 인라인 스크립트.
- `index.html` 55행: 모니터 안의 홈 버튼 `a.home-button`(`href="index.html"`).
- `script.js` 34~70행 `initWarpTransitions`의 홈 부분: 40~50행에서 `return_to_monitor`를 지우고 `is-zoomed`를 붙인 뒤 약 60밀리초 후 `instant-zoomed`를 뗀다. 53행의 탭 링크 선택자에는 `index.html`이 없어서 홈 화면의 홈 버튼에는 처리기가 붙지 않는다.
- `script.js` 72~99행: 안쪽 페이지(`body.standalone-page`)에서 `a[href*="index.html"]` 클릭 시 `return_to_monitor`를 기록하고 320밀리초 뒤 이동한다.
- `script.js` 105~163행 `initDeskZoom`: 모니터 클릭 확대, 축소 버튼, ESC 축소.
- `about.html` 16행과 105행: 안쪽 페이지의 `a.home-button`과 "홈으로 돌아가기" 링크.
- `.scratch/noir-remodel/capture.mjs`: 화면 크기 `1440×900`과 `390×844`로 헤드리스 Chrome을 조작하는 기존 검증 도구. 로컬 서버가 점으로 시작하는 폴더를 막으므로 새 도구도 프로젝트 루트의 페이지만 불러온다.
- `.adesk/verify.json`: `*.js`와 `tests/*.mjs`에 `node --check`, 전체에 `node --test tests/static-site.test.mjs`를 실행한다.
- 대화 기록(2026-11-11): 이전 답변에서 `will-change: transform`을 원인으로 추정했으나 실기기나 브라우저로 확인하지 못했다고 밝혔다.
