# 확대 모니터 상단 탭 고정과 화면 켜짐 줌인 모션

## 현재 문제

홈(index.html)에서 모니터를 확대한 뒤 화면 안을 스크롤하면 상단 탭이 위아래로 떨리고, 맨 위가 아닌 위치에서는 상단 탭이 주소 막대(검은 타이틀바) 쪽으로 살짝 올라가 겹친다. 또한 모니터를 클릭했을 때 데스크 그림이 커지기만 해서 줌인한다는 느낌이 약하다.

원인: 상단 탭 `header.nav-header`가 스크롤 영역 `.monitor-scrollable` 안에서 `position: sticky; top: 0`으로 붙어 있고, 확대는 조상 `.desk-canvas`에 `transform: scale(2.22)`를 거는 방식이다. 확대된 변환 안에서 스크롤 위치와 sticky 위치가 따로 반올림되면서 프레임마다 어긋나 떨림과 겹침이 생긴다. 스크롤이 맨 위일 때는 sticky가 작동하지 않으므로 증상이 없다(사용자 QA 보고와 일치).

## 수정할 것

1. 홈의 상단 탭 `header.nav-header`를 `.monitor-scrollable` 밖으로 옮겨 `.window-titlebar`와 `.monitor-scrollable` 사이의 고정 행으로 만든다. 홈 모니터 안에서는 sticky를 쓰지 않는다.
2. 상단 탭을 옮긴 뒤에도 PC·모바일에서 탭 크기·여백·축소 배율·클릭 가능 여부가 지금과 같도록 `style.css` 선택자를 맞춘다.
3. 사용자가 고른 A안 "화면 켜짐 + 줌"을 구현한다. 줌아웃 상태에서 모니터를 클릭하면 검은 화면 가운데에 흰 가로줄이 번쩍 펴지는 켜짐 연출(약 0.3초)을 보여 준 뒤 기존 확대(`is-zoomed`)를 시작한다.

## 기대 효과

- 확대된 모니터에서 스크롤해도 상단 탭이 움직이지 않고, 주소 막대와 겹치지 않는다.
- 모니터를 클릭하면 꺼진 화면이 켜지는 짧은 연출 뒤에 확대되어 줌인하는 느낌이 분명해진다.
- 서브페이지(about·portfolio·guestbook·game)의 상단 탭은 지금과 똑같이 동작한다.

## 완료 기준

| 확인 | 방법 |
| --- | --- |
| 상단 탭 고정 | 1440x900 창에서 확대 뒤 `.monitor-scrollable`의 scrollTop을 0, 200, 400, 최대값으로 바꿀 때마다 `header.nav-header`의 `getBoundingClientRect().top`이 `.window-titlebar`의 `getBoundingClientRect().bottom`과 0.5px 이내로 같고, 네 값 사이 차이도 0.5px 이내 |
| 탭 크기 유지 | 1440x900·390x844 두 크기에서 확대 상태 캡처를 수정 전 캡처와 비교해 탭 글자 크기·홈 아이콘 크기·탭 줄 높이가 눈에 띄게 달라지지 않음 |
| 켜짐 연출 | 줌아웃 상태에서 모니터 클릭 직후 약 0.15초 시점 캡처에 검은 화면 위 흰 가로줄이 보이고, 약 1.5초 뒤에는 확대가 끝난 상태 |
| 축소 복귀 | ESC와 '데스크 뷰로 축소' 버튼 각각으로 줌아웃되고, 다시 클릭하면 켜짐 연출이 다시 나옴 |
| 서브페이지 복귀 | 서브페이지에서 홈 아이콘으로 돌아왔을 때(`instant-zoomed`) 켜짐 연출·확대 애니메이션 없이 바로 확대 상태로 보임 |
| 회귀 | 동봉 검증기(`--task desk`) 통과, 서브페이지 상단 탭은 스크롤 시 여전히 위에 붙어 있음 |

## 지킬 것

- 서브페이지 네 개의 `header.nav-header` 마크업과 sticky 동작은 바꾸지 않는다. 전역 `.nav-header` 규칙은 그대로 두고 홈 모니터 전용 덮어쓰기(`.monitor-screen .nav-header`)로만 바꾼다.
- 확대 배율 `scale(2.22)`, `transform-origin`, 모니터 좌표(`.monitor-screen`의 left·top·width·height), 배경 이미지는 바꾸지 않는다.
- 직전 대화에서 바꾼 검은 안내 화면(`.monitor-hint-overlay`의 `background: #000`, `.hint-pill`의 `color: #f2efea`)을 유지한다.
- 줌아웃 상태에서는 상단 탭을 포함한 모니터 내부 링크를 누를 수 없어야 한다(지금은 `.monitor-scrollable`의 `pointer-events: none`과 안내 화면이 막고 있음). 옮긴 상단 탭도 같은 규칙을 따른다.
- `prefers-reduced-motion: reduce` 사용자에게는 켜짐 연출을 생략하고 기존처럼 애니메이션 없이 확대한다.
- 흐림(blur) 같은 무거운 효과를 쓰지 않는다. 켜짐 연출은 `transform`·`opacity`만 애니메이션한다.
- 크롬 기준으로 확인하되, sticky·zoom 속성에 의존하지 않으므로 다른 브라우저에서도 같은 구조로 동작해야 한다. 모바일 미디어 쿼리(`max-width: 768px`)의 `zoom: 0.8` 축소는 상단 탭에도 똑같이 적용되어야 한다.
- 요청 밖 리팩터링을 하지 않고, 이번 수정으로 쓰이지 않게 된 선택자는 지운다.

## 단계 1. 상단 탭을 스크롤 영역 밖으로 옮기고 화면 켜짐 줌인 구현

- 작업:
  1. `index.html`: `header.nav-header` 블록 전체(주석 `<!-- 상단 네비게이션 헤더 -->` 포함)를 `.monitor-scrollable` 안에서 꺼내 `.window-titlebar` 바로 뒤, `.monitor-scrollable` 바로 앞에 둔다. 안의 마크업(홈 버튼, 네 탭, id)은 그대로 둔다.
  2. `style.css`: `.monitor-screen .nav-header { position: relative; top: auto; flex-shrink: 0; }`처럼 홈 모니터 안에서만 sticky를 풀고 flex 행으로 고정한다. z-index는 안내 화면(`.monitor-hint-overlay`, z-index 100)보다 낮게 유지해 줌아웃 상태에서 안내 화면이 탭을 덮도록 한다.
  3. `style.css`: 줌아웃 상태에서 옮긴 탭을 누를 수 없도록 `.monitor-screen .nav-header { pointer-events: none; }`와 `.desk-viewport.is-zoomed .monitor-screen .nav-header { pointer-events: auto; }`를 넣고, `html.instant-zoomed .monitor-scrollable` 규칙에 `html.instant-zoomed .monitor-screen .nav-header`를 같이 묶는다.
  4. `style.css`: 상단 탭 크기 규칙의 조상 선택자를 `.monitor-scrollable`에서 `.monitor-screen`으로 바꾼다. 대상은 `@media (min-width: 769px)` 안의 `.monitor-scrollable .nav-inner`·`.home-button`·`.home-icon`·`.tab-item`과 `@media (max-width: 768px)` 안의 `.monitor-scrollable .tab-item`·`.monitor-scrollable .tab-emoji`다. 본문 규칙(`.main-content`·`.page-title`·`.page-subtitle`·`.site-footer`·`.fade-in.visible`)은 그대로 둔다.
  5. `style.css`: `@media (max-width: 768px)`의 `.monitor-scrollable { zoom: 0.8; ... }`과 같은 축소가 상단 탭에도 걸리도록 `.monitor-screen .nav-header { zoom: 0.8; }`를 같은 미디어 쿼리에 추가한다. 같은 쿼리 안의 전역 `.nav-header { overflow: hidden; flex-shrink: 0; }`는 서브페이지에도 쓰이므로 그대로 둔다.
  6. `script.js`의 `initDeskZoom()` 안 `zoomIn()`: 바로 `is-zoomed`를 붙이지 않고 `viewport`에 `powering-on` 클래스를 붙인 뒤 약 300ms 뒤에 `powering-on`을 떼고 `is-zoomed`를 붙인 뒤 기존 토스트를 띄운다. 맨 앞 중복 방지 조건에 `powering-on`도 넣는다. `window.matchMedia('(prefers-reduced-motion: reduce)').matches`이면 켜짐 연출 없이 지금처럼 바로 `is-zoomed`를 붙인다. 타이머 id를 보관해 두고 `zoomOut()`과 ESC에서 켜짐 연출 중이면 타이머를 취소하고 `powering-on`을 뗀다(ESC 조건은 `is-zoomed` 또는 `powering-on`일 때 동작하도록 바꾼다).
  7. `style.css`: 켜짐 연출을 `.monitor-hint-overlay::after`로 만든다. 평소에는 `opacity: 0`, 화면 세로 가운데의 얇은 흰 가로줄(높이 약 2px, 너비 100%, 흰색과 약한 흰색 그림자)로 둔다. `.desk-viewport.powering-on .monitor-hint-overlay::after`에서 `@keyframes`로 약 0.3초 동안 `transform: scaleX(0)→scaleX(1)`로 펴지고, 이어서 `scaleY`를 키우며 `opacity`가 줄어 화면 전체로 번지듯 사라지게 한다. 같은 클래스에서 `.hint-pill`은 `opacity: 0`으로 즉시 숨긴다. `@media (prefers-reduced-motion: reduce)` 블록에 이 애니메이션을 끄는 규칙을 추가한다.
  8. 서브페이지 링크 클릭 경로(`initWarpTransitions()`의 `warp-in`)와 서브페이지 복귀 경로(`instant-zoomed`, `return_to_monitor`)는 켜짐 연출을 거치지 않으므로 바꾸지 않는다. 다만 `html.instant-zoomed`일 때 켜짐 줄이 보이지 않는지 확인한다(안내 화면이 `display: none`이므로 보이지 않아야 함).
  9. `adk/mapping.adesk.md`의 `index.html`·`script.js`·`style.css` 행에 상단 탭을 스크롤 영역 밖 고정 행으로 둔 것과 화면 켜짐 줌인을 반영한다.
- 완료 기준: 위 `## 완료 기준` 표의 여섯 항목을 모두 확인한다. 브라우저 확인은 로컬 정적 서버를 백그라운드로 띄우거나 `file://`로 열고, 사용 가능한 브라우저 자동화(Chrome 헤드리스 + DevTools 프로토콜, Playwright 등)로 측정·캡처한다. 상단 탭 위치 수치가 0.5px 기준을 넘으면 실패로 보고 원인을 보고한다. 브라우저 자동화를 쓸 수 없으면 실행하지 못한 항목과 사유를 보고하고 `status=question`으로 멈춘다. 띄운 서버는 끝나면 종료한다.
- 읽을 파일: index.html, style.css, script.js, adk/mapping.adesk.md
- 고칠 파일: index.html, style.css, script.js, adk/mapping.adesk.md
- 지킬 테스트: tests/static-site.test.mjs
- 난이도: standard
- 선행 단계: 없음

## 결정

### D1. 확대할 때 줌인 모션은 어떤 방식으로 하는가

- A. 화면 켜짐 + 줌: 검은 화면에 흰 가로줄이 펴지는 켜짐 연출(약 0.3초) 뒤 기존 확대

- 선택: A
## 근거

- `index.html` 33~151행: `.monitor-screen` 안에 `.monitor-hint-overlay`, `.window-titlebar`, `.monitor-scrollable`이 차례로 있고 `header.nav-header`는 `.monitor-scrollable`의 첫 자식이다.
- `style.css` `.desk-canvas`(76행 부근): `transform-origin: 49.91% 41.5%`, `.desk-viewport.is-zoomed .desk-canvas { transform: scale(2.22); }`(104행 부근).
- `style.css` `.monitor-screen`(175행 부근): `display: flex; flex-direction: column; overflow: hidden;`.
- `style.css` `.monitor-hint-overlay`(193행 부근): `position: absolute; inset: 0; z-index: 100; background: #000;`, 줌인 시 `opacity: 0; visibility: hidden;`.
- `style.css` `.monitor-scrollable`(288행 부근): `pointer-events: none`, 줌인 시 `auto`. `html.instant-zoomed .monitor-scrollable`(125행 부근)도 `auto`.
- `style.css` `.nav-header`(321행 부근): `position: sticky; top: 0; z-index: 50;`. 서브페이지 about·portfolio·guestbook·game.html 13행에서도 같은 클래스를 쓴다.
- `style.css` `@media (max-width: 768px)`(582행 부근): `.monitor-scrollable { zoom: 0.8; }`, `.nav-header { overflow: hidden; flex-shrink: 0; }`, `.monitor-scrollable .tab-item`, `.monitor-scrollable .tab-emoji`.
- `style.css` `@media (min-width: 769px)`(807행 부근): `.monitor-scrollable .nav-inner`·`.home-button`·`.home-icon`·`.tab-item`.
- `style.css` 끝 `@media (prefers-reduced-motion: reduce)`(825행 부근): `.desk-canvas` 전환을 끈다.
- `script.js` `initDeskZoom()`: `zoomIn()`은 `is-zoomed`·`warp-in`이면 무시하고 `is-zoomed`를 붙인 뒤 토스트, `zoomOut()`은 `is-zoomed`·`warp-in`을 떼고 스크롤을 맨 위로 되돌린다. ESC는 `is-zoomed`일 때만 `zoomOut()`을 부른다.
- `script.js` `initWarpTransitions()`: `return_to_monitor` 세션 플래그로 `is-zoomed`를 즉시 붙이고 60ms 뒤 `instant-zoomed`를 뗀다. 서브페이지 링크 클릭 시 `is-zoomed`와 `warp-in`을 붙이고 450ms 뒤 이동한다.
