# 홈페이지 D 시안(에디토리얼 블랙·레드) 리모델링

## 현재 문제

실제 사이트는 아직 웜 미니멀(오렌지·우드 톤) 테마와 `images/GPT_Gen.png` 배경을 쓰고 있어, 사용자가 고른 D 시안(종이색 바탕에 검은색·빨간색 포인트)과 모양이 다르다.

D 시안은 `design/mockups/d-editorial-noir/`에 있는 별도 파일이라 실제 홈·소개·포트폴리오·방명록·게임 페이지에는 반영되지 않았다. 사용자는 D 시안의 방향대로 실제 홈페이지를 바꾸기를 원한다.

## 수정할 것

1. 공통 색 변수(`style.css`의 `:root`)를 D 시안의 종이색·검정·빨강 체계로 바꾸고, 공통 부품(모니터 타이틀바, 확대 안내, 축소 버튼, 메뉴, 탭, 버튼, 푸터, 토스트)을 D 시안의 검은 띠·굵은 선·빨간 강조로 다시 꾸민다.
2. 홈 배경을 D 시안의 SVG 배경(검은 모니터, 빨간 액자, 빨간 책, 검은 키보드·마우스, 회색 장패드)으로 바꾼다.
3. 홈(`index.html`)의 히어로·바로가기 카드와 소개(`about.html`)·포트폴리오(`portfolio.html`)를 D 시안의 에디토리얼 배치로 바꾼다. 포트폴리오는 번호 목록형으로 바꾼다.
4. 방명록·게임 페이지의 색을 새 체계에 맞춘다. 게임의 귤 타일 이미지와 판정 동작은 그대로 둔다.
5. 다섯 페이지를 데스크톱·모바일에서 점검하고 README의 테마·배경 설명을 갱신한다.

## 기대 효과

- 방문자가 홈에 들어오면 D 시안과 같은 밝은 책상 배경과 검은 모니터를 보고, 모니터를 클릭하면 같은 확대 연출로 블랙·레드 포인트의 홈 화면을 본다.
- 안쪽 페이지로 이동해도 같은 종이색 바탕, 검은 메뉴 선, 빨간 강조가 이어져 사이트 전체가 한 디자인으로 보인다.
- 기존 기능(확대·축소, 안쪽 페이지 전환과 홈 복귀, 이메일 복사, 방명록 작성, 게임 플레이와 랭킹 등록)은 그대로 동작한다.

## 완료 기준

| 확인 | 방법 |
| --- | --- |
| 기존 JS 동작 유지 | `node --test tests/static-site.test.mjs` 9개 통과, 고친 JS가 있으면 `node --check` 통과 |
| 다섯 페이지 디자인 반영 | 로컬 헤드리스 Chrome으로 `index.html`(축소·확대), `about.html`, `portfolio.html`, `guestbook.html`, `game.html`을 1440×900과 390×844에서 캡처해 직접 열어 확인 |
| 가로 넘침 없음 | 위 캡처 화면마다 `document.documentElement.scrollWidth <= window.innerWidth` 측정. 하나라도 넘치면 해당 단계 실패로 보고 고친다 |
| 글자 대비 | 종이색(#faf8f4) 바탕 위 작은 빨간 글자는 대비 4.5:1 이상인 색을 쓴다(D1 결정에 따름). 계산값을 보고에 적는다 |
| 홈 확대 좌표 유지 | 1440×900·390×844에서 모니터 클릭 뒤 타이틀바와 스크롤 본문이 모니터 화면 안에 들어오는지 캡처로 확인 |

## 지킬 것

- `design/mockups/` 아래 시안 파일과 스크린샷은 고치지 않는다. 읽기만 한다.
- 저장 키는 바꾸지 않는다: `sessionStorage`의 `return_to_monitor`, `localStorage`의 `guestbook_cooldown_target`, `mandarin_player_nickname`, `mandarin_muted`.
- 방명록·게임 HTML의 요소 `id`와 JS가 쓰는 클래스(`desk-viewport`, `desk-canvas`, `monitor-screen`, `monitor-hint-overlay`, `desk-zoomout-btn`, `monitor-scrollable`, `screen-warp-overlay`, `is-zoomed`, `warp-in`, `instant-zoomed`, `standalone-page`, `page-entering`, `page-leaving`, `toast-container`, `toast`, `show`, `fade-in`, `visible`, `tab-item`, `empty-tab`, `copy-badge`, `project-card`, `quick-link-card`, `hero-section`, `page-header`, `card`)는 유지한다.
- `script.js`, `common.js`, `guestbook.js`, `game.js`, `game/*.js`는 고치지 않는다. 디자인 변경은 HTML 마크업과 CSS로만 한다. 꼭 고쳐야 하면 멈추고 `status=question`으로 이유를 보고한다.
- Supabase 테이블 이름·조회 형식과 CDN 스크립트 주소는 바꾸지 않는다.
- 파일은 지우지 않는다. `images/GPT_Gen.png`도 남겨 둔다(D2에서 B를 고르면 계속 쓴다). 예외는 사용자가 2026-11-11에 승인한 4단계 임시 Chrome 프로필 폴더 `.scratch/noir-remodel/step4-chrome-profile-jLb3uY` 하나뿐이다.
- 모니터 화면 좌표(left 29.49%, top 23.91%, width 40.91%, height 39.53%), 확대 중심축(49.91% 41.5%), 배율 2.22는 바꾸지 않는다. D 시안 배경도 같은 좌표로 그려져 있다.
- 기존 모바일 탭 글자 크기 규칙(`style.css`의 `@media (max-width: 768px)`·`@media (max-width: 640px)`)은 크기를 유지하고 색만 바꾼다.
- 키보드 포커스 표시(`:focus-visible`)를 없애지 않는다. `prefers-reduced-motion`에서 확대 전환을 끄는 D 시안 규칙을 반영한다.
- GitHub Pages 정적 사이트이므로 빌드 도구·패키지를 추가하지 않는다. Windows와 macOS 브라우저 모두에서 보이도록 시스템 글꼴 목록(`-apple-system, "Pretendard Variable", Pretendard, "Segoe UI", Roboto, Arial, sans-serif`)을 유지한다.
- 캡처·측정용 임시 스크립트와 결과는 `.scratch/noir-remodel/`에 둔다. 개발 서버를 포그라운드로 띄우지 말고, 헤드리스 Chrome이 끝나면 프로세스가 남지 않게 한다.

## 단계 1. 공통 테마와 홈 화면

- 작업:
  - `style.css`의 `:root`(4~33행) 색 변수 값을 D 시안 체계로 바꾼다. 기존 변수 이름(`--bg-main`, `--surface-card`, `--border-color`, `--text-main`, `--text-sub`, `--text-muted`, `--accent-orange`, `--accent-orange-light`, `--accent-orange-hover`, `--window-bg`, `--window-bar` 등)은 `css/game.css`·`css/guestbook.css`·`css/pages.css`가 쓰므로 이름을 지우지 말고 값만 바꾼다. 새 변수 `--paper: #faf8f4`, `--ink: #141414`, `--black: #111111`, `--muted: #5c5856`, `--line: #dcd8d2`, `--accent`(D1 결정의 장식용 빨강), `--accent-text`(D1 결정의 글자용 빨강)를 추가하고, `--accent-orange` 계열은 새 빨강 값을 가리키게 한다.
  - D 시안 `style.css`의 블랙·레드 규칙을 실제 공통 부품에 옮긴다: 모니터 타이틀바를 검은 띠와 빨간 네모 + `algethi97.github.io` 글자로 바꾸고(`index.html`의 `window-dots`·`window-url` 마크업을 D 시안처럼 단순화), 확대 안내 문구에 빨간 밑줄, 축소 버튼은 검은 바탕·마우스 올리면 빨강, 메뉴 아래 3px 검은 선, 현재 탭은 빨간 글자와 밑줄, `.btn`은 검은 글자와 빨간 밑줄, 푸터는 검은 띠, 토스트는 검은 바탕에 빨간 왼쪽 선으로 한다.
  - `style.css`의 `.desk-canvas` 배경(85행 `url('images/GPT_Gen.png')`)을 D2 결정에 따라 바꾼다. A이면 `design/mockups/d-editorial-noir/desk-bg.svg`를 `images/desk-bg-noir.svg`로 복사해 쓴다. `.desk-viewport` 바탕색은 D 시안의 `#ebe8e3`로 맞춘다. 줌아웃 상태 모니터를 검게 칠하는 규칙(194행 이후 주석 "꺼진 모니터 액정")은 D 시안처럼 종이색 반투명 안내 화면과 어울리게 고친다.
  - `css/pages.css`의 홈 관련 규칙(`.hero-section`, `.hero-tag`, `.home-links-grid`, `.quick-link-card h2`, `.copy-badge`)을 D 시안처럼 바꾼다: 검은 라벨 `ARCHITECT & DEVELOPER`, 굵은 검정 제목과 아래 빨간 막대, 이메일 버튼은 빨간 글자·2px 밑줄, 카드 위 2px 검은 선, 히어로 아래 1px 검은 선. 히어로를 가운데 정렬에서 D 시안처럼 왼쪽 정렬로 바꾼다.
  - `index.html`의 인라인 `style` 속성(바로가기 카드 설명 `<p>`, 이메일 버튼 감싼 `<div>`, 타이틀바의 `width: 36px` 칸)을 CSS 클래스로 옮긴다. 푸터 문구는 `© 2026 algethi97.`로 바꾼다. 탭·카드의 이모지와 문구, 링크 대상(`about.html` 등 루트 상대 경로)은 그대로 둔다.
  - 모니터 안 글자 크기는 D 시안의 `.monitor-scrollable ...` 규칙(확대 전 화면 기준)을 참고해 기존 크기와 비교한 뒤, 타이틀·본문이 모니터 안에서 잘리지 않는 쪽으로 맞춘다.
  - `prefers-reduced-motion: reduce`에서 `.desk-canvas` 전환을 끄는 규칙을 추가한다.
  - 맵 `## .`·`## css`·`## images` 절에서 고친 파일 행의 기능 설명을 새 테마에 맞게 고치고, `images/desk-bg-noir.svg` 행을 `## images` 절에 추가한다.
- 완료 기준: `node --test tests/static-site.test.mjs` 9개 통과. `.scratch/noir-remodel/`의 임시 캡처 스크립트로 `index.html` 축소·확대 화면을 1440×900·390×844에서 찍어 직접 열어 보고 D 시안 스크린샷(`design/mockups/screenshots/d-editorial-noir-desk-1440.png`, `d-editorial-noir-zoom-1440.png`, `d-editorial-noir-zoom-390.png`)과 같은 색·배치인지 확인한다. 네 화면 모두 가로 넘침이 없고, 확대 화면에서 타이틀바와 본문이 모니터 안에 있다. 이메일 복사 버튼 클릭 시 토스트가 새 스타일로 뜬다(헤드리스에서 클립보드 권한이 없으면 실패 토스트가 떠도 스타일만 확인하고 그 사실을 보고한다).
- 읽을 파일: style.css, css/pages.css, index.html, script.js, design/mockups/d-editorial-noir/index.html, design/mockups/d-editorial-noir/style.css, design/mockups/d-editorial-noir/desk-bg.svg, design/mockups/capture.mjs, adk/mapping.adesk.md
- 고칠 파일: style.css, css/pages.css, index.html, images/desk-bg-noir.svg, adk/mapping.adesk.md
- 지킬 테스트: tests/static-site.test.mjs
- 난이도: standard
- 선행 단계: 없음

## 단계 2. 소개·포트폴리오 페이지

- 작업:
  - `portfolio.html`을 D3 결정에 따라 바꾼다. A이면 `div.portfolio-grid` 안의 `div.project-card`(썸네일 이모지 `div.project-thumbnail` 포함) 여섯 개를 D 시안 `portfolio.html`처럼 `ol.project-list > li.project-card > article.project-body` 번호 목록으로 바꾸고 썸네일 이모지를 뺀다. 프로젝트 제목·설명·기술 태그·링크 주소는 현재 `portfolio.html`의 원문을 그대로 쓴다(D 시안의 상대 경로 `../../../game.html`은 `game.html`로 되돌린다). `script.js`의 `initScrollAnimation`이 `.project-card`에 페이드인을 거므로 `project-card` 클래스는 `li`에 유지한다. 인라인 `style`(태그 묶음 `margin-top`, 버튼 `margin-top`)은 CSS로 옮긴다.
  - `css/pages.css`에 D 시안의 `.page-header`(아래 3px 검은 선), `.project-list`, `.project-card`(번호 열 90px, 모바일 36px), `.project-card::before`(빨간 두 자리 번호), `.project-body h3`(검정, 마우스 올리면 빨강), `.skill-tag`(검은 1px 테두리) 규칙을 옮긴다. A를 골라 더 이상 쓰지 않는 `.portfolio-grid`, `.project-thumbnail` 규칙은 지운다. `style.css`의 `.project-card` 기본 카드 규칙(533~549행 부근)과 겹치면 `css/pages.css` 쪽이 이기도록 선택자를 맞추되 `style.css`는 이 단계에서 고치지 않는다. 꼭 고쳐야 하면 `status=question`으로 보고한다.
  - `about.html`의 프로필·기술 태그·카드(`.profile-section`, `.profile-avatar`, `.skills-tags`, `.skill-tag`, `.card`)를 새 체계에 맞춘다: 카드 그림자와 둥근 모서리를 줄이고 위쪽 2px 검은 선, 제목 검정, 강조는 빨강. 문구와 링크는 바꾸지 않는다.
  - 두 페이지의 현재 탭(`tab-item active`)과 홈 버튼이 단계 1의 공통 스타일로 보이는지 확인한다.
  - 맵 `## .`·`## css` 절의 `about.html`, `portfolio.html`, `css/pages.css` 행 설명을 갱신한다.
- 완료 기준: `node --test tests/static-site.test.mjs` 9개 통과. `about.html`과 `portfolio.html`을 1440×900·390×844에서 캡처해 직접 열어 보고, 포트폴리오가 D 시안 스크린샷(`design/mockups/screenshots/d-editorial-noir-portfolio-1440.png`, `d-editorial-noir-portfolio-390.png`)과 같은 번호 목록 배치인지 확인한다. 네 화면 모두 가로 넘침이 없다. 프로젝트 여섯 개의 제목·설명·태그·링크가 변경 전 `portfolio.html`과 같은지 `git diff`로 대조한다.
- 읽을 파일: about.html, portfolio.html, css/pages.css, style.css, script.js, design/mockups/d-editorial-noir/portfolio.html, design/mockups/d-editorial-noir/style.css, adk/mapping.adesk.md
- 고칠 파일: about.html, portfolio.html, css/pages.css, adk/mapping.adesk.md
- 지킬 테스트: tests/static-site.test.mjs
- 난이도: standard
- 선행 단계: 1

## 단계 3. 방명록·게임 색 정리

- 작업:
  - 단계 1에서 공통 변수 값이 바뀌었으므로 `css/guestbook.css`와 `css/game.css`가 새 체계에서 어떻게 보이는지 먼저 캡처해 본다.
  - `css/guestbook.css`: 폼·목록 카드·로딩·쿨다운 배너의 하드코딩 색(약 6곳)을 공통 변수로 바꾸고, 카드는 둥근 모서리·그림자를 줄여 위쪽 검은 선 중심으로, 작성 버튼(`.btn-primary`)은 D4 결정의 버튼 색으로 맞춘다. 오류·경고 표시는 읽을 수 있는 대비를 유지한다.
  - `css/game.css`: D4 결정에 따라 범위를 정한다. A이면 HUD·버튼·랭킹 목록·모달·토스트의 테두리와 강조색만 검정·빨강으로 바꾸고, 보드 바탕·귤 타일·선택 상자·합계 10 강조(`is-ten`)·흔들림 같은 게임 판정 표시 색은 그대로 둔다. 하드코딩 색 약 38곳 가운데 바꾼 곳을 보고에 적는다.
  - `guestbook.html`·`game.html`은 인라인 `style`이 새 색과 충돌할 때만 고친다. 요소 `id`, 폼 구조, 스크립트 로딩 순서는 바꾸지 않는다.
  - 맵 `## .`·`## css` 절의 고친 파일 행 설명을 갱신한다.
- 완료 기준: `node --test tests/static-site.test.mjs` 9개 통과. `guestbook.html`과 `game.html`을 1440×900·390×844에서 캡처해 직접 열어 보고 메뉴·푸터·카드·버튼이 단계 1·2 페이지와 같은 체계인지, 게임 보드와 귤 타일이 바뀌기 전과 같은지 확인한다. 게임은 시작 오버레이 화면과 시작 버튼을 누른 뒤 화면을 각각 캡처한다(Supabase 연결이 안 되면 랭킹 영역 오류 상태로 캡처하고 그 사실을 보고한다). 네 화면 모두 가로 넘침이 없다.
- 읽을 파일: css/guestbook.css, css/game.css, guestbook.html, game.html, style.css, adk/mapping.adesk.md
- 고칠 파일: css/guestbook.css, css/game.css, guestbook.html, game.html, adk/mapping.adesk.md
- 지킬 테스트: tests/static-site.test.mjs
- 난이도: standard
- 선행 단계: 1

## 단계 4. 전체 점검과 README 갱신

- 작업:
  - 다섯 페이지를 1440×900·390×844에서 다시 캡처한다(홈은 축소·확대 두 장). 총 12장을 `.scratch/noir-remodel/`에 저장하고 직접 열어 확인한다.
  - 페이지 사이 이동을 확인한다: 홈 모니터 확대 → 탭 클릭 시 확대 전환 뒤 안쪽 페이지 이동 → 안쪽 페이지 홈 버튼 클릭 시 홈이 확대 상태로 바로 보이는지(`return_to_monitor` 흐름). ESC로 데스크 화면에 돌아오는지 확인한다.
  - 1~3단계에서 생긴 색·간격 불일치(예: 페이지마다 다른 빨강, 남은 오렌지색)를 찾아 해당 CSS에서 고친다. `grep -n "ea580c\|c2410c\|fff7ed\|78350f" style.css css/*.css *.html`로 남은 옛 오렌지·우드 색을 확인하고, 게임 판정 표시처럼 일부러 남긴 것은 보고에 적는다.
  - `README.md`의 테마 설명과 파일 구조(65행 `GPT_Gen.png` 설명 부근)에 새 배경 `images/desk-bg-noir.svg`와 블랙·레드 테마를 반영한다. 배경 재생성 프롬프트는 `design/mockups/d-editorial-noir/bg-prompt.md`에 있다고 적는다.
  - 맵 `## .` 절의 `README.md` 행과 이 단계에서 고친 파일 행을 갱신한다.
  - (사용자 승인 2026-11-11, 검사 보완 1) 임시 검사 스크립트 `.scratch/noir-remodel/step4-capture.mjs`의 비활성 버튼 검사(`disabled-primary-button`)는 버튼을 비활성으로 바꾼 뒤 CSS 전환이 끝날 때까지 기다린 다음 그림자를 다시 읽는다. 기대값은 그대로 `disabled=true`, `cursor=not-allowed`, `box-shadow=none`이며 기대값을 낮추지 않는다. 전환이 끝난 뒤에도 그림자가 `none`이 아니면 검사 문제가 아니라 CSS 문제이므로 해당 CSS를 고치거나 `status=question`으로 보고한다.
  - (사용자 승인 2026-11-11, 검사 보완 2) 같은 스크립트의 프로세스 종료 검사(`temporary-processes-stopped`)는 `exitCode` 값만 보지 않고, Chrome 프로세스의 종료 이벤트(`exit` 또는 `close`)를 기다린 뒤 해당 PID의 프로세스가 실제로 없는지 확인해 판정한다. 로컬 서버가 닫혔는지 확인하는 조건은 그대로 둔다.
  - (2026-11-11 변경, 임시 폴더 정리) 실행 AI는 임시 Chrome 프로필 폴더를 삭제하지 않는다. `step4-chrome-profile-jLb3uY` 삭제는 실행 환경의 자동 승인 정책에 세 차례 `blocked by policy`로 막혔으므로 다시 시도하지 않고, 다른 셸·도구·스크립트로 우회하지도 않는다. 대신 루트 `.gitignore`의 맨 끝에 `.scratch/noir-remodel/step4-chrome-profile-*/` 한 줄을 주석과 함께 추가해 두 프로필 폴더(약 107MB씩)가 실수로 커밋되지 않게 한다. 다른 `.gitignore` 줄은 고치지 않는다.
  - `.scratch/noir-remodel/step4-cleanup.json`에 세 번째 차단 결과, 실행 AI가 삭제를 맡지 않기로 바뀐 사실, 현재 남은 프로필 폴더의 경로·파일 수·바이트를 다시 측정해 기록한다. 실행 시점에 사용자가 이미 폴더를 지웠다면 지워진 사실만 기록한다.
  - 보고 끝에 사용자가 직접 실행할 삭제 명령을 안내한다: 두 폴더를 쓰는 Chrome 프로세스가 없는지 확인한 뒤 PowerShell에서 `Remove-Item -LiteralPath 'C:\Projects\algethi97.github.io\.scratch\noir-remodel\step4-chrome-profile-jLb3uY' -Recurse -Force`(필요하면 `step4-chrome-profile-K5funl`도 같은 방식)를 실행한다. 이 명령을 실행 AI가 대신 실행하지 않는다.
  - 사이트 파일이나 `step4-capture.mjs`에 추가 변경이 없으면 Chrome 검사를 다시 돌리지 않는다. 새 프로필 폴더가 또 생기지 않게 하기 위해서다. 캡처 12장, 로그, 결과 파일과 그 밖의 파일은 지우지 않는다.
- 완료 기준: `node --test tests/static-site.test.mjs` 9개 통과, 동봉 검증기(`--task desk`) 통과. 12장 캡처 모두 가로 넘침이 없고, 페이지 이동·홈 복귀·ESC 동작을 확인한 결과를 보고한다(이전 실행의 `step4-results.json` 결과를 근거로 쓰고, 재실행하지 않았으면 그렇게 적는다). 남은 옛 오렌지색 목록과 남긴 이유를 보고한다. `git status --porcelain`에 `step4-chrome-profile-` 경로가 더 이상 나오지 않는다. `step4-cleanup.json`에 남은 폴더 현황이 기록되어 있고, 사용자용 삭제 안내가 보고에 있다. 프로필 폴더가 남아 있어도 이 단계의 실패로 보지 않는다.
- 읽을 파일: README.md, .gitignore, style.css, css/pages.css, css/guestbook.css, css/game.css, index.html, about.html, portfolio.html, guestbook.html, game.html, script.js, .scratch/noir-remodel/step4-capture.mjs, .scratch/noir-remodel/step4-results.json, .scratch/noir-remodel/step4-cleanup.json, adk/mapping.adesk.md
- 고칠 파일: .gitignore, .scratch/noir-remodel/step4-cleanup.json, README.md, style.css, css/pages.css, css/guestbook.css, css/game.css, index.html, about.html, portfolio.html, guestbook.html, game.html, adk/mapping.adesk.md
- 지킬 테스트: tests/static-site.test.mjs
- 난이도: small
- 선행 단계: 2, 3

## 재개 조건

- 사용자 요청(2026-11-11, 15:13 재요청): ADesk가 4단계 후속 실행을 Codex `gpt-6.1-sol`, 추론 강도 `xhigh`로 시작하도록 지정한다. 직전 재개는 추론 강도 `max`로 시작되어 사용자가 취소했으며, 그 시도에서는 파일 변경이 없었다. `max`로 실행하지 않는다. 이는 실행 모델 요청이며, 이 문서 저장만으로 실제 모델이 전환되었다고 판단하지 않는다. 실행 AI는 앱이 전달한 모델 정보를 확인하고 확인할 수 없으면 미확인으로 보고한다. 다른 모델로 임의 대체하거나 전역 Codex 설정을 바꾸지 않는다.
- 1~3단계 완료 결과와 4단계의 기존 구현·검사 보완(README, CSS, `step4-capture.mjs`, 캡처 12장, `step4-results.json`)을 보존한다. 이전 시도의 변경을 버리거나 커밋을 되돌리지 않는다.
- 4단계는 프로필 폴더 삭제만 남은 상태에서 세 번째 시도(2026-11-11)도 같은 `Remove-Item` 명령이 통과되지 않아 실패했다. 같은 오류가 반복되었으므로 삭제 책임을 실행 AI에서 사용자로 옮긴다. 실행 AI는 위 4단계 작업대로 `.gitignore` 추가, 정리 기록 갱신, 맵 행 갱신, 테스트 9개와 `--task desk` 검증만 진행한다.
- 브라우저 검사 73개 통과는 이전 실행 결과이며, 다시 실행하지 않았다면 재검증한 결과로 표현하지 않는다.

## 결정

### D1. 빨간색을 어떻게 쓰는가

- A. 장식(제목 아래 막대, 밑줄, 번호, 액자·책 배경)은 시안의 선명한 빨강 #F22A18, 작은 글자(이메일 버튼, 현재 탭, 링크 글자)는 대비 4.5:1을 넘는 짙은 빨강 #c8102e를 쓴다 
- 필수

- 선택: A
### D2. 홈 배경 그림을 무엇으로 하는가

- B. 배경은 기존 `images/GPT_Gen.png`를 그대로 두고 화면 안 디자인만 바꾼다. 나중에 `bg-prompt.md`로 그림을 새로 만들면 교체한다
- 필수

- 선택: B
### D3. 포트폴리오 배치를 어떻게 하는가

- A. D 시안처럼 썸네일 이모지를 빼고 01~06 번호 목록형으로 바꾼다 
- 필수

- 선택: A
### D4. 게임 페이지를 어디까지 바꾸는가

- A. 메뉴·HUD·버튼·랭킹·모달은 블랙·레드로 바꾸고, 귤 타일·보드·합계 10 강조 같은 게임 판정 표시는 지금 색을 유지한다 

- 선택: A
## 근거

- 현재 공통 색 변수: `style.css` 4~33행 `:root`(`--accent-orange: #ea580c` 등). 변수 사용 횟수: `css/game.css`는 `--accent-orange` 13회·`--border-color` 12회, `css/guestbook.css`는 `--accent-orange` 9회, `css/pages.css`는 `--accent-orange` 5회. 하드코딩 색은 `css/game.css` 38줄, `css/guestbook.css` 6줄.
- 현재 배경: `style.css` 85행 `background-image: url('images/GPT_Gen.png')`. 모니터 좌표는 `style.css` 178~193행 `.monitor-screen`, 확대 배율은 107~111행 `scale(2.22)`, 중심축은 92행 `transform-origin: 49.91% 41.5%`. D 시안 `style.css`도 같은 값(`left: 29.49%; top: 23.91%; width: 40.91%; height: 39.53%`, `scale(2.22)`)을 쓴다.
- 타이틀바: `style.css` 281~317행(`.window-titlebar`, `.window-dots`, `.dot-*`, `.window-url`), `index.html`의 `window-titlebar` 블록. D 시안은 `<div class="window-titlebar" aria-hidden="true">algethi97.github.io</div>`와 `::before` 빨간 네모를 쓴다.
- 메뉴·탭: `style.css` 350~451행(`.nav-header`, `.nav-inner`, `.home-button`, `.tabs-grid`, `.tab-item`, `.tab-item.active`), 모바일 규칙 612행 `@media (max-width: 768px)`, 856행 `@media (max-width: 640px)`, 852행 `.tabs-grid.four-tabs`.
- 푸터·토스트: `style.css` 551행 `.site-footer`, 575~610행 `.toast-container`, `.toast`, `.toast.show`.
- 홈·소개·포트폴리오 전용 규칙: `css/pages.css`의 `.hero-section`(7행), `.hero-tag`(17행), `.home-links-grid`(32행), `.quick-link-card h2`(38행), `.profile-section`(45행), `.profile-avatar`(52행), `.skills-tags`(66행), `.skill-tag`(73행), `.copy-badge`(91행), `.portfolio-grid`(115행), `.project-thumbnail`(121행), `.project-body`(131행).
- JS가 기대는 클래스: `script.js`의 `initWarpTransitions`(34행, `sessionStorage` `return_to_monitor`, `is-zoomed`, `warp-in`, `standalone-page`, `page-entering`, `page-leaving`), `initDeskZoom`(105행, `.desk-canvas`, `.monitor-hint-overlay`, `.desk-zoomout-btn`, `.monitor-scrollable`, `.monitor-screen` 클릭, ESC), `showToast`(170행, `.toast-container`, `.toast`, `show`), `initCopyFeature`(200행, `data-copy`·`data-message`), `initScrollAnimation`(237행, `.card, .project-card, .quick-link-card, .hero-section, .page-header`에 `fade-in`·`visible`). `index.html`의 `<head>` 인라인 스크립트가 `instant-zoomed`를 붙인다.
- 테스트 범위: `tests/static-site.test.mjs`는 `common.js`, `guestbook.js`, `game.js`, `game/*.js`를 가짜 DOM으로 검사하며 HTML·CSS는 읽지 않는다. 그래서 디자인 변경은 브라우저 캡처로 확인해야 한다. 검증 설정은 `.adesk/verify.json`(JS 구문 검사와 위 테스트).
- 캡처 참고: `design/mockups/capture.mjs`가 로컬 Chrome으로 24화면을 찍고 가로 넘침을 잰다. 실제 사이트용 캡처는 이 방식을 참고해 `.scratch/noir-remodel/`에 새 스크립트로 만든다.
- 대비 계산(상대 휘도 공식, 이 계획 작성 중 계산): 종이색 #faf8f4 대비 #F22A18은 약 3.9:1, #c8102e는 약 5.5:1. 흰 글자 대비 #F22A18 바탕은 약 4.1:1이라 작은 흰 글자 버튼 바탕으로는 기준에 못 미친다.
- D 시안의 장식 빨강은 `design/mockups/d-editorial-noir/style.css`의 `--accent: #F22A18`이다. D 첫 보고에는 #c8102e를 썼다고 적혀 있으나 이후 #F22A18로 바뀌었다.
