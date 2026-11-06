# 정적 사이트 구조 리팩토링

## 현재 문제

빌드 없는 정적 사이트에서 Supabase 설정과 유틸 함수가 `game.js`와 `guestbook.js`에 중복되어 있다. `game.js`(1,077줄)와 `style.css`(2,153줄)는 한 파일에 모든 기능이 몰려 있다. `guestbook.js`는 전역 스코프에 함수를 선언하고, 미사용 이미지·Python 골격과 README 불일치도 남아 있다.

## 수정할 것

1. Supabase 설정·클라이언트 생성, 상대 시간 포맷, 버튼 로딩 처리를 공통 모듈 `common.js` 하나로 모은다.
2. `guestbook.js`를 전역 스코프에서 분리하고(D4에 따라 ES 모듈 또는 IIFE), 중복 코드를 공통 모듈 호출로 바꾼다.
3. `game.js`의 중복 코드를 공통 모듈 호출로 바꾸고, D4가 A이면 보드·판정, 드래그 입력, 사운드, 랭킹, HUD·모달 모듈로 나눈다.
4. `style.css`를 공통 스타일과 페이지별 스타일 파일로 나누고, 쓰이지 않는 규칙(예: 405행 "3칸 분할 네비게이션" 구획)과 불필요한 `!important`를 정리한다.
5. D3에 따라 미사용 이미지 3개와 Python 골격 파일을 삭제한다.
6. README의 버전 표기와 프로젝트 구조 설명을 실제와 맞추고, `adk/mapping.adesk.md`에 파일 행을 채운다.

## 기대 효과

- Supabase 설정을 한 곳에서만 고치면 방명록과 게임 랭킹에 함께 반영된다.
- 게임·방명록 코드가 전역에 노출되지 않아 콘솔에서 점수·상태를 조작하기 어려워진다.
- 기능별로 파일이 나뉘어 수정할 위치를 찾기 쉬워진다.
- 페이지별 CSS 파일로 나뉘어 한 페이지 스타일 수정이 다른 페이지에 번지는 일이 줄어든다.

## 완료 기준

| 확인 | 방법 |
| --- | --- |
| 구문 | 모든 `.js` 파일 구문 검사 통과(`node --check`, ES 모듈 파일은 모듈 모드로 검사) [가설/임시: 모듈 검사 플래그는 설치된 Node 버전에서 확인] |
| 동작 보존 | 로컬 정적 서버에서 다섯 페이지를 열어 네비게이션, 데스크 줌·워프 전환, 복사 토스트, 방명록 목록·작성·더보기, 게임 시작·드래그·점수·랭킹 등록이 리팩토링 전과 같게 동작 |
| 화면 보존 | 다섯 페이지의 데스크톱·모바일 폭 화면이 리팩토링 전과 시각적으로 같음 |
| 콘솔 | 각 페이지 브라우저 콘솔에 새 오류가 없음 |
| 전역 은닉 | 브라우저 콘솔에서 `supabaseClient`, 게임 상태 변수, 방명록 내부 함수에 접근할 수 없음 |
| 검증기 | `C:\adesk\.venv\Scripts\python.exe C:\adesk\scripts\verify_changes.py --root c:\projects\algethi97.github.io --task desk` 통과 |

## 지킬 것

- 화면 디자인과 기능 동작은 바꾸지 않는다(D1 A 기준). 중복 함수라도 페이지마다 동작이 다르면 D5에 따라 처리한다.
  - `setButtonLoading`: 게임은 텍스트를 숨기고(`display: none`), 방명록은 텍스트를 반투명(`opacity: 0.5`)으로 만든다.
  - 상대 시간: 게임 `formatTimeAgo`는 7일 이후 `YYYY.MM.DD`, 방명록 `getRelativeTimeString`은 7일 이후 `YYYY.MM.DD HH:mm`을 쓴다. 방명록은 잘못된 날짜를 빈 문자열로 처리한다.
  - 토스트: 게임은 `#game-toast-container`에 쌓이는 `.game-toast`(3.2초)를 쓰고, 방명록은 `script.js`의 `showToast`(`.toast`, 2.5초, 아이콘 포함)를 쓴다. 두 토스트는 모양이 달라 이 계획에서 하나로 합치지 않는다.
- Supabase URL·anon key 값과 테이블·컬럼·쿼리 계약은 바꾸지 않는다. 키 값을 보고나 로그에 출력하지 않는다.
- 빌드 도구와 `package.json`을 추가하지 않는다(D2 A 기준). GitHub Pages에 파일을 그대로 올려 동작해야 한다.
- 네비게이션 마크업은 각 HTML에 그대로 둔다(JS 주입 금지).
- `script.js`는 클래식 스크립트로 두고, 전역 `showToast`를 유지한다. `guestbook.js`가 `window.showToast`를 호출하기 때문이다.
- ES 모듈은 `file://`로 열면 CORS로 막힌다. 로컬 확인은 정적 서버로 하고, 서버는 백그라운드로 실행한 뒤 확인이 끝나면 종료한다(예: `python -m http.server`).
- CDN의 `@supabase/supabase-js@2` 스크립트는 공통·게임·방명록 모듈보다 먼저 실행되어야 한다. 모듈은 지연 실행되므로 클래식 CDN 스크립트 뒤에 두면 순서가 유지된다.
- Windows·macOS 브라우저(Chrome, Edge, Safari)와 모바일 폭에서 같은 동작을 유지한다. 모바일 터치 드래그가 리팩토링 후에도 동작해야 한다.
- 요청 범위 밖의 리팩토링이나 추상화를 하지 않는다. 내 수정으로 생긴 미사용 코드는 지운다.

## 단계 1. 공통 모듈 신설과 방명록 스코프 정리

- 작업: 루트에 `common.js`를 만들어 Supabase 설정, 클라이언트 생성 함수(한 번만 생성해 재사용), 상대 시간 포맷, 버튼 로딩 처리를 둔다. D5가 A이면 상대 시간과 버튼 로딩은 옵션 인자로 게임·방명록의 현재 동작을 각각 재현한다. D4가 A이면 `common.js`를 ES 모듈(`export`)로 만들고 `guestbook.js`를 `import`하는 모듈로 바꾼 뒤 `guestbook.html`의 스크립트 태그를 `type="module"`로 바꾼다. D4가 B이면 `common.js`는 `window.SiteCommon` 한 개만 노출하는 IIFE로 만들고, `guestbook.js`는 IIFE로 감싼다. `guestbook.js`의 `SUPABASE_CONFIG`, 클라이언트 초기화, `getRelativeTimeString`, `setButtonLoading` 중복을 공통 모듈 호출로 바꾼다. `showNotification`은 `script.js`의 `showToast` 호출 래퍼이므로 그대로 둔다. 이 단계에서 `game.js`는 고치지 않는다. 고친 파일의 맵 행을 `adk/mapping.adesk.md`의 `## .` 절에 넣는다.
- 완료 기준: `common.js`, `guestbook.js` 구문 검사 통과. 로컬 정적 서버에서 방명록 목록 로딩, 작성, 쿨다운 배너, 더보기, 상대 시간 표시, 버튼 로딩 표시가 이전과 같다. 콘솔에 새 오류가 없고, 콘솔에서 방명록 내부 함수와 `supabaseClient`에 접근할 수 없다.
- 읽을 파일: guestbook.js, guestbook.html, game.js, script.js
- 고칠 파일: common.js, guestbook.js, guestbook.html, adk/mapping.adesk.md
- 지킬 테스트: 없음
- 난이도: standard
- 선행 단계: 없음

## 단계 2. 게임 코드 중복 제거와 분할

- 작업: `game.js`의 `SUPABASE_CONFIG`, 클라이언트 초기화, `formatTimeAgo`, `setButtonLoading`을 단계 1의 공통 모듈 호출로 바꾼다. 게임 전용 `showToast`와 `debounce`는 게임 안에 남긴다. D4가 A이면 `game.js`를 진입 모듈로 남기고 `game/` 폴더에 보드·판정(`game/board.js`), 드래그 입력(`game/input.js`), 사운드(`game/sound.js`), 랭킹(`game/ranking.js`), HUD·모달·토스트(`game/ui.js`)를 나눈다. 모듈 사이의 공유 상태는 전역(`window`)에 두지 않는다. `game.html`의 `game.js` 스크립트 태그를 `type="module"`로 바꾼다. 분할 경계는 실제 코드의 의존 관계를 읽고 정하며, 한 모듈이 너무 작아지면 이웃 모듈과 합쳐도 된다. D4가 B이면 분할하지 않고 중복 제거만 하며, IIFE 구조를 유지한다. 고치거나 새로 만든 파일의 맵 행을 `adk/mapping.adesk.md`의 해당 폴더 절(`## .`, `## game`)에 넣는다.
- 완료 기준: 모든 게임 관련 `.js` 파일 구문 검사 통과. 로컬 정적 서버에서 게임 시작 오버레이, 마우스·터치 드래그 선택, 합계 10 판정과 팝 애니메이션, 실패 흔들림, 타이머 게이지, 점수, 사운드, 종료 모달, 랭킹 조회·등록, 내 최근 점수 카드가 이전과 같다. 콘솔에 새 오류가 없고, 콘솔에서 게임 상태 변수와 `supabaseClient`에 접근할 수 없다.
- 읽을 파일: game.js, game.html, common.js, MANDARIN_GAME_PLAN.md
- 고칠 파일: game.js, game.html, game/board.js, game/input.js, game/sound.js, game/ranking.js, game/ui.js, adk/mapping.adesk.md
- 지킬 테스트: 없음
- 난이도: complex
- 선행 단계: 1

## 단계 3. 스타일시트 분리와 죽은 규칙 정리

- 작업: `style.css`를 공통 스타일(토큰, 리셋, 데스크·모니터, 워프 전환, 네비게이션, 버튼, 토스트, 반응형 공통)로 남기고, 페이지별 규칙을 `css/pages.css`(홈·About·포트폴리오), `css/guestbook.css`, `css/game.css`로 옮긴다. 각 HTML은 `style.css` 뒤에 필요한 페이지 CSS만 연결한다. 옮길 때 선언 순서를 유지해 캐스케이드 결과가 바뀌지 않게 한다. 다섯 HTML과 JS에서 쓰이지 않는 선택자(예: 405행 "3칸 분할 네비게이션", 445행 "우측 3번째 빈 탭")를 검색으로 확인한 뒤 지운다. `!important`는 지워도 화면이 같다고 확인된 것만 지운다. 고치거나 새로 만든 파일의 맵 행을 `adk/mapping.adesk.md`의 해당 폴더 절(`## .`, `## css`)에 넣는다.
- 완료 기준: 다섯 페이지의 데스크톱·모바일 폭 화면이 리팩토링 전 화면과 같다(전후 스크린샷 비교). 데스크 줌 인·아웃, 페이지 전환 페이드, 탭 활성 표시, 게임 타일·애니메이션, 방명록 스켈레톤이 이전과 같다. 지운 선택자 목록과 지운 `!important` 수를 보고한다.
- 읽을 파일: style.css, index.html, about.html, portfolio.html, guestbook.html, game.html, script.js, guestbook.js, game.js
- 고칠 파일: style.css, css/pages.css, css/guestbook.css, css/game.css, index.html, about.html, portfolio.html, guestbook.html, game.html, adk/mapping.adesk.md
- 지킬 테스트: 없음
- 난이도: standard
- 선행 단계: 2

## 단계 4. 미사용 파일 정리

- 작업: 삭제 전에 다섯 HTML, 모든 JS·CSS, README에서 대상 파일 이름을 다시 검색해 참조가 없는지 확인한다. D3가 A이면 `images/2222.png`, `images/Gemini_Generated_Image_913j29913j29913j.png`, `images/mandarin_slice_bg.png`와 Python 골격(`pyproject.toml`, `uv.lock`, `.python-version`, `src/algethi97_github_io/__init__.py`)을 삭제하고, `.gitignore`에서 Python 전용 항목만 정리한다. D3가 B이면 이미지 3개만 삭제한다. D3가 C이면 아무것도 지우지 않고 이 단계를 변경 없이 완료한다. 참조가 하나라도 발견되면 그 파일은 지우지 않고 보고한다. 로컬 `.venv` 폴더는 git 추적 대상이 아니므로 건드리지 않는다.
- 완료 기준: 삭제한 파일 이름이 저장소의 어떤 파일에서도 검색되지 않는다(맵과 계획서 제외). 다섯 페이지에서 이미지 깨짐과 404 요청이 없다.
- 읽을 파일: .gitignore, README.md, index.html, about.html, portfolio.html, guestbook.html, game.html
- 고칠 파일: images/2222.png, images/Gemini_Generated_Image_913j29913j29913j.png, images/mandarin_slice_bg.png, pyproject.toml, uv.lock, .python-version, src/algethi97_github_io/__init__.py, .gitignore
- 지킬 테스트: 없음
- 난이도: mechanical
- 선행 단계: 3

## 단계 5. README 정합성과 맵 정리

- 작업: README의 버전 표기를 `git log`의 버전 표기, README 버전 이력과 대조해 맞추고, 이번 리팩토링을 버전 이력에 패치 버전으로 추가한다 [가설/임시: 현재 최신 버전이 v1.6.0인지 v1.5.0인지는 실행 시 확인]. 프로젝트 구조 설명을 실제 파일(공통 모듈, `game/`, `css/`, 삭제된 파일 반영)과 맞추고, 포트폴리오 프로젝트 수를 `portfolio.html`의 실제 카드 수와 맞춘다. `adk/mapping.adesk.md`에 아직 행이 없는 추적 파일(`index.html`, `about.html`, `portfolio.html`, `script.js`, `README.md`, `MANDARIN_GAME_PLAN.md`, `images/GPT_Gen.png`, `images/mandarin.png` 등)의 행을 해당 폴더 절에 채우고, 삭제된 파일의 행이 남아 있지 않게 한다.
- 완료 기준: README의 버전, 구조, 프로젝트 수가 실제 저장소와 일치한다. 맵에 git 추적 파일(`adk/` 제외)이 모두 한 번씩 있고 없는 파일의 행이 없다. 검증기 `verify_changes.py --task desk` 통과.
- 읽을 파일: README.md, portfolio.html, adk/mapping.adesk.md
- 고칠 파일: README.md, adk/mapping.adesk.md
- 지킬 테스트: 없음
- 난이도: small
- 선행 단계: 4

## 결정

### D1. 리팩토링 범위를 어디까지 하는가

- A. 동작과 디자인은 그대로 두고 구조만 정리한다 
- 필수

- 선택: A
### D2. 빌드 도구를 들이는가

- A. 빌드 없는 순수 정적 사이트를 유지한다 
- 필수

- 선택: A
### D3. 미사용 파일을 지우는가

- A. 미사용 이미지 3개와 Python 골격을 모두 지운다 
- 필수

- 선택: A
### D4. 게임·방명록 스크립트를 어떤 방식으로 분리하는가

- A. 빌드 없이 브라우저 ES 모듈로 나눈다. 전역 은닉이 유지되지만 로컬에서는 정적 서버로만 열린다 
- 필수

- 선택: A
### D5. 페이지마다 동작이 다른 중복 유틸을 어떻게 합치는가

- A. 공통 함수에 옵션을 두어 게임·방명록의 현재 동작을 각각 그대로 유지한다 
- 필수

- 선택: A
## 근거

- 중복 위치: `game.js` 10행 `SUPABASE_CONFIG`, 170행 `createClient`, 1013행 `setButtonLoading`, 1028행 `showToast`, 1050행 `formatTimeAgo`. `guestbook.js` 6행 `SUPABASE_CONFIG`, 26행 `createClient`, 365행 `getRelativeTimeString`, 384행 `setButtonLoading`, 400행 `showNotification`. `script.js` 170행 전역 `showToast`.
- 스크립트 로딩: `game.html`은 267행 Supabase CDN, 269행 `script.js`, 271행 `game.js` 순서다. `guestbook.html`은 157행 CDN, 159행 `script.js`, 161행 `guestbook.js` 순서다. 다섯 HTML 모두 7행에서 `style.css`만 연결한다.
- HTML에 인라인 이벤트 속성(`onclick=` 등)이 없어, 스크립트를 모듈이나 IIFE로 감싸도 HTML이 전역 함수를 직접 부르는 곳은 없다.
- `style.css` 구획: 405행 "3칸 분할 네비게이션 그리드", 445행 "우측 3번째 빈 탭", 454행 홈, 553행 About·포트폴리오, 876행 방명록, 1220행 게임, 1224행 "4칸 분할 네비게이션 그리드".
- 로컬에 Node.js가 설치되어 있어(`C:\Program Files\nodejs\node`) 구문 검사에 쓸 수 있다.
