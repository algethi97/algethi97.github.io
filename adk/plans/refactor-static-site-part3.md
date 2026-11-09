# 정적 사이트 구조 리팩토링 마무리 (스타일 분리 검증·파일 정리·문서 정합)

## 현재 문제

게임 모듈 분할(이전 계획 단계 2)은 커밋 dbefa5f로 끝났다. 그다음 단계인 스타일시트 분리는 작업 트리에 적용만 되어 있고(`style.css` 847줄, `css/pages.css`·`css/guestbook.css`·`css/game.css` 신규, 다섯 HTML에 연결 추가) 화면 동일성 검증, 맵 행, 커밋이 없다. `style.css`에는 `!important` 20개가 남아 있고 죽은 선택자 정리 결과도 보고된 적이 없다. 미사용 이미지 3개와 Python 골격(`pyproject.toml`, `uv.lock`, `.python-version`, `src/algethi97_github_io/__init__.py`)이 그대로 있고, README와 `adk/mapping.adesk.md`는 실제 저장소와 맞지 않는다.

## 수정할 것

1. 작업 트리의 CSS 분리 결과가 기존 화면과 같은지 검증하고, 죽은 선택자와 불필요한 `!important`를 확인된 것만 정리한 뒤 맵에 반영한다.
2. 참조가 없는 이미지 3개와 Python 골격 파일을 삭제한다.
3. README의 버전·구조·프로젝트 수를 실제와 맞추고, 맵에 빠진 추적 파일 행을 채운다.

## 기대 효과

- 한 페이지의 스타일 수정이 다른 페이지로 번지지 않고, 수정할 파일을 찾기 쉽다.
- 저장소에서 쓰지 않는 파일이 사라지고, README와 맵이 실제 구조를 가리킨다.

## 완료 기준

| 확인 | 방법 |
| --- | --- |
| 구문·테스트 | `node --test tests/static-site.test.mjs` 통과 (프로젝트 검증 명령은 `.adesk/verify.json`에서 확인) |
| 화면 보존 | 로컬 정적 서버에서 다섯 페이지의 데스크톱·모바일 폭 화면이 `git stash` 이전 커밋(dbefa5f) 화면과 같음 |
| 콘솔 | 다섯 페이지 콘솔에 새 오류와 404 요청이 없음 |
| 삭제 | 삭제한 파일 이름이 맵·계획서를 제외한 저장소 파일에서 검색되지 않음 |
| 문서 | README 버전·구조·프로젝트 수가 실제와 일치하고, 맵에 추적 파일(`adk/` 제외)이 한 번씩 있음 |
| 검증기 | `C:\adesk\.venv\Scripts\python.exe C:\adesk\scripts\verify_changes.py --root c:\projects\algethi97.github.io --task desk` 통과 |

## 지킬 것

- 화면 디자인과 기능 동작을 바꾸지 않는다. 옮긴 CSS는 선언 순서를 유지해 캐스케이드 결과가 같아야 한다.
- Supabase URL·키 값과 테이블·쿼리 계약은 건드리지 않고, 키 값을 출력하지 않는다.
- 빌드 도구와 `package.json`을 추가하지 않는다. GitHub Pages에 파일을 그대로 올려 동작해야 한다.
- ES 모듈은 `file://`에서 막히므로 로컬 확인은 `python -m http.server`를 백그라운드로 띄우고 끝나면 종료한다.
- Node 24의 `node --check`는 ES 모듈 구문 오류를 놓칠 수 있으므로 모듈 파일은 모듈 모드로 따로 검사한다.
- 로컬 `.venv`와 `adk/` 아래 파일은 건드리지 않는다. 커밋은 사용자가 요청할 때만 한다.
- Windows·macOS의 Chrome, Edge, Safari와 모바일 폭에서 같은 화면이어야 한다.
- 요청 범위 밖 리팩토링을 하지 않고, 내 수정으로 생긴 미사용 코드는 지운다.

## 단계 1. CSS 분리 결과 검증과 정리

- 작업: 작업 트리의 `style.css`와 `css/*.css`를 `git show HEAD:style.css`와 비교해 규칙 누락·중복·순서 변경이 없는지 확인한다. 다섯 HTML과 JS(`script.js`, `guestbook.js`, `game.js`, `game/*.js`)에서 쓰이지 않는 선택자를 검색으로 확인해 지운다(예: "3칸 분할 네비게이션", "우측 3번째 빈 탭" 주변). `!important`는 지워도 화면이 같다고 확인된 것만 지우고 지운 목록과 개수를 보고한다. 로컬 정적 서버에서 다섯 페이지를 데스크톱·모바일 폭으로 이전 커밋과 비교한다(데스크 줌, 페이지 전환, 탭 활성, 게임 타일, 방명록 스켈레톤 포함). `adk/mapping.adesk.md`의 `## .`와 새 `## css` 절에 `style.css`와 `css/` 파일 행을 넣는다.
- 완료 기준: 전후 화면이 같고 콘솔 오류가 없다. 지운 선택자 목록과 `!important` 수를 보고했다. 테스트와 검증기가 통과한다.
- 읽을 파일: style.css, css/pages.css, css/guestbook.css, css/game.css, index.html, about.html, portfolio.html, guestbook.html, game.html, script.js, guestbook.js, game.js, .adesk/verify.json
- 고칠 파일: style.css, css/pages.css, css/guestbook.css, css/game.css, adk/mapping.adesk.md
- 지킬 테스트: tests/static-site.test.mjs
- 난이도: standard
- 선행 단계: 없음

## 단계 2. 미사용 파일 정리

- 작업: 삭제 전에 다섯 HTML, 모든 JS·CSS, README에서 대상 이름을 다시 검색해 참조가 없는지 확인한다. 참조가 없으면 `images/2222.png`, `images/Gemini_Generated_Image_913j29913j29913j.png`, `images/mandarin_slice_bg.png`, `pyproject.toml`, `uv.lock`, `.python-version`, `src/algethi97_github_io/__init__.py`를 삭제하고 `.gitignore`에서 Python 전용 항목만 정리한다. 참조가 하나라도 있으면 그 파일은 지우지 않고 보고한다. 빈 `src/` 폴더가 남으면 함께 정리한다.
- 완료 기준: 삭제한 이름이 맵·계획서 밖 어떤 파일에서도 검색되지 않는다. 다섯 페이지에서 이미지 깨짐과 404 요청이 없다. 테스트가 통과한다.
- 읽을 파일: .gitignore, README.md, index.html, about.html, portfolio.html, guestbook.html, game.html
- 고칠 파일: images/2222.png, images/Gemini_Generated_Image_913j29913j29913j.png, images/mandarin_slice_bg.png, pyproject.toml, uv.lock, .python-version, src/algethi97_github_io/__init__.py, .gitignore
- 지킬 테스트: tests/static-site.test.mjs
- 난이도: mechanical
- 선행 단계: 1

## 단계 3. README 정합성과 맵 정리

- 작업: README 최신 버전 표기(현재 `v1.6.0`, 2026-10-06)를 `git log`와 버전 이력에 대조하고, 이번 리팩토링을 패치 버전으로 이력에 추가한다 [가설/임시: 버전 번호는 실행 시 `git log`로 확인]. 프로젝트 구조 설명을 `common.js`, `game/`, `css/`, `tests/`, 삭제 반영 상태로 고치고, 포트폴리오 프로젝트 수를 `portfolio.html` 실제 카드 수와 맞춘다. `adk/mapping.adesk.md`에 행이 없는 추적 파일(`index.html`, `about.html`, `portfolio.html`, `script.js`, `README.md`, `MANDARIN_GAME_PLAN.md`, `images/` 파일 등)의 행을 폴더 절에 채우고, 삭제된 파일 행이 남지 않게 한다.
- 완료 기준: README 버전·구조·프로젝트 수가 실제와 일치한다. 맵에 `adk/`를 제외한 git 추적 파일이 한 번씩 있고 없는 파일의 행이 없다. 검증기가 통과한다.
- 읽을 파일: README.md, portfolio.html, adk/mapping.adesk.md
- 고칠 파일: README.md, adk/mapping.adesk.md
- 지킬 테스트: tests/static-site.test.mjs
- 난이도: small
- 선행 단계: 2

## 결정

### D1. 작업 트리의 CSS 분리 결과를 어떻게 다루는가

- A. 그대로 유지하고 단계 1에서 검증·정리한다 
- 필수

- 선택: A
### D2. `!important`를 얼마나 정리하는가

- A. 지워도 화면이 같다고 확인된 것만 지운다 

- 선택: A
## 근거

- 이전 계획서 `refactor-static-site-part2.md`는 작업 트리에서 삭제되어 있다(커밋 dbefa5f에 마지막 내용이 있다). 그 계획의 단계 1~2는 커밋 d84193d, 5313442/dbefa5f로 끝났다.
- 조회 결과: `style.css` 847줄, `css/game.css` 919줄, `css/guestbook.css` 242줄, `css/pages.css` 149줄. 다섯 HTML 모두 `style.css` 뒤에 페이지 CSS 한 줄이 추가되어 있다. 원본 `style.css`는 2,153줄이었다.
- 현재 맵에는 `common.js`, `guestbook.*`, `game.*`, `game/`, `tests/`, `.adesk/` 행만 있다.
- 이전 확정 결정(범위: 구조만, 도구: 빌드 없음, 삭제: 미사용 이미지 3개와 Python 골격 모두, 분할: ES 모듈, 유틸: 옵션으로 현재 동작 유지)은 이 계획에도 그대로 적용한다.
