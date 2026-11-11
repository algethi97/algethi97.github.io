# 프로젝트 매핑

## design/mockups/c-terminal

| 경로 | 기능 | 관련 테스트 |
| --- | --- | --- |
| `design/mockups/c-terminal/index.html` | 방향 C 홈과 확대·축소·이메일 복사 시안 | Chrome 1440·390px 화면과 복사 예외 확인 |
| `design/mockups/c-terminal/portfolio.html` | 방향 C 프로젝트 여섯 카드 시안 | Chrome 1440·390px 반응형과 원문 대조 |
| `design/mockups/c-terminal/style.css` | 터미널 색·글꼴·반응형·움직임 감소 스타일 | 가로 넘침·대비·모션 설정 확인 |
| `design/mockups/c-terminal/desk-bg.svg` | 야간 모니터와 백라이트 키보드 배경 | 화면 좌표와 확대·축소 캡처 확인 |
| `design/mockups/c-terminal/bg-prompt.md` | 방향 C 배경 재생성 한영 프롬프트 | 구도·좌표 확인 방법 대조 |

## .scratch/mockup-c

| 경로 | 기능 | 관련 테스트 |
| --- | --- | --- |
| `.scratch/mockup-c/measure.mjs` | 방향 C 임시 브라우저 측정과 캡처 도구 | Node 내장 모듈과 로컬 헤드리스 Chrome |
| `.scratch/mockup-c/results.json` | 방향 C 화면·콘텐츠·동작 측정 결과 | 1440·390px 확대·축소·복사·모션 확인 |
| `.scratch/mockup-c/desk-1440.png` | 홈 데스크톱 축소 화면 | Chrome 스크린샷 |
| `.scratch/mockup-c/zoom-1440.png` | 홈 데스크톱 확대 화면 | Chrome 스크린샷 |
| `.scratch/mockup-c/portfolio-1440.png` | 포트폴리오 데스크톱 화면 | Chrome 스크린샷 |
| `.scratch/mockup-c/desk-390.png` | 홈 모바일 축소 화면 | Chrome 스크린샷 |
| `.scratch/mockup-c/zoom-390.png` | 홈 모바일 확대 화면 | Chrome 스크린샷 |
| `.scratch/mockup-c/portfolio-390.png` | 포트폴리오 모바일 화면 | Chrome 스크린샷 |
| `.scratch/mockup-c/capture.log` | 방향 C 캡처 실행 기록 | 해당 없음 |
| `.scratch/mockup-c/capture-error.log` | 방향 C 캡처 오류 기록 | 해당 없음 |

AI가 파일을 추가·이동·삭제하면 이 파일의 행도 함께 고친다. 폴더마다 `## <폴더 경로>` 절을 두고 그 폴더의 파일만 적는다. 루트 파일은 `## .` 절에 둔다.

표의 첫 열은 `경로`(백틱으로 감싼 프로젝트 상대 경로), 둘째 열은 `기능`(20자 안팎)이다. 셋째 열부터는 프로젝트가 정한다.

## .

| 경로 | 기능 | 관련 테스트 |
| --- | --- | --- |
| `.gitignore` | Git 추적 제외 규칙 | 해당 없음 |
| `.python-version` | Python 버전 지정 | 해당 없음 |
| `pyproject.toml` | Python 프로젝트 메타데이터 | 해당 없음 |
| `uv.lock` | uv 의존성 잠금 | 해당 없음 |
| `index.html` | 홈 화면과 진입점 | 로컬 정적 서버 브라우저 확인 |
| `about.html` | 자기소개 화면 | 로컬 정적 서버 브라우저 확인 |
| `portfolio.html` | 프로젝트 카드 화면 | 로컬 정적 서버 브라우저 확인 |
| `script.js` | 홈 줌 및 공통 인터랙션 | 로컬 정적 서버 브라우저 확인 |
| `README.md` | 프로젝트 소개 및 구조 | 문서와 실제 파일 대조 |
| `MANDARIN_GAME_PLAN.md` | 만다린 게임 기획 문서 | 해당 없음 |
| `common.js` | Supabase와 공통 표시 유틸 | `tests/static-site.test.mjs` |
| `guestbook.js` | 방명록 조회·작성 ES 모듈 | `tests/static-site.test.mjs` |
| `guestbook.html` | 방명록 화면과 모듈 로딩 | 로컬 정적 서버 브라우저 확인 |
| `game.js` | 게임 상태·수명 주기 진입 모듈 | `tests/static-site.test.mjs` |
| `game.html` | 게임 화면과 모듈 로딩 | 로컬 정적 서버 브라우저 확인 |
| `style.css` | 공통 레이아웃·전환·반응형 스타일 | 다섯 페이지 데스크톱·모바일 브라우저 비교 |

## css

| 경로 | 기능 | 관련 테스트 |
| --- | --- | --- |
| `css/pages.css` | 홈·소개·포트폴리오 전용 스타일 | 세 페이지 데스크톱·모바일 브라우저 비교 |
| `css/guestbook.css` | 방명록 폼·목록·로딩 스타일 | 방명록 데스크톱·모바일 브라우저 비교 |
| `css/game.css` | 게임 보드·HUD·랭킹 스타일 | 게임 데스크톱·모바일 브라우저 비교 |

## game

| 경로 | 기능 | 관련 테스트 |
| --- | --- | --- |
| `game/board.js` | 타일 생성·선택·합계 판정 | `tests/static-site.test.mjs` |
| `game/input.js` | 마우스·터치 드래그 선택 | `tests/static-site.test.mjs` |
| `game/sound.js` | Web Audio 효과음 | `tests/static-site.test.mjs` |
| `game/ranking.js` | Top 5 조회·점수 등록 | `tests/static-site.test.mjs` |
| `game/ui.js` | HUD·모달·게임 토스트 | `tests/static-site.test.mjs` |

## tests

| 경로 | 기능 | 관련 대상 |
| --- | --- | --- |
| `tests/static-site.test.mjs` | Node 내장 방명록·게임 회귀 테스트 | `common.js`, `guestbook.js`, `game.js`, `game/*.js` |

## .adesk

| 경로 | 기능 | 관련 대상 |
| --- | --- | --- |
| `.adesk/verify.json` | 구문·동작 검사 실행 설정 | JavaScript 파일, `tests/static-site.test.mjs` |

## images

| 경로 | 기능 | 관련 테스트 |
| --- | --- | --- |
| `images/GPT_Gen.png` | 데스크테리어 배경 이미지 | 홈 화면 브라우저 확인 |
| `images/mandarin.png` | 게임 감귤 타일 이미지 | 게임 화면 브라우저 확인 |
| `images/mandarin_slice_bg.png` | 보존 중인 감귤 이미지 | 해당 없음 |

## src/algethi97_github_io

| 경로 | 기능 | 관련 테스트 |
| --- | --- | --- |
| `src/algethi97_github_io/__init__.py` | Python 패키지 골격 | 해당 없음 |

## design/mockups/a-deskterior

| 경로 | 기능 | 관련 테스트 |
| --- | --- | --- |
| `design/mockups/a-deskterior/index.html` | 방향 A 홈과 확대·축소·이메일 복사 시안 | Chrome 1440·390px 확대·축소 확인 |
| `design/mockups/a-deskterior/portfolio.html` | 방향 A 프로젝트 여섯 카드 시안 | Chrome 1440·390px 반응형 확인 |
| `design/mockups/a-deskterior/style.css` | 방향 A 디자인 변수와 전용 스타일 | 홈·포트폴리오 가로 넘침 측정 |
| `design/mockups/a-deskterior/desk-bg.svg` | 우드 책상과 하드커버 책 배경 | 화면 좌표 및 축소·확대 스크린샷 확인 |
| `design/mockups/a-deskterior/bg-prompt.md` | 배경 재생성 한영 프롬프트 | 구도·좌표 확인 방법 대조 |

## design/mockups/b-editorial

| 경로 | 기능 | 관련 테스트 |
| --- | --- | --- |
| `design/mockups/b-editorial/index.html` | 방향 B 홈과 모니터 확대·축소 및 이메일 복사 시안 | Chrome 1440·390px 확대·축소와 복사 동작 확인 |
| `design/mockups/b-editorial/portfolio.html` | 방향 B 프로젝트 여섯 개의 번호 목록형 시안 | Chrome 1440·390px 반응형과 원문 대조 |
| `design/mockups/b-editorial/style.css` | 종이색·청록색 변수와 에디토리얼 전용 스타일 | 홈·포트폴리오 가로 넘침과 화면 내부 배치 측정 |
| `design/mockups/b-editorial/desk-bg.svg` | 자연광·흰 책상·모니터·책·액자 배경 | 모니터 좌표와 축소·확대 스크린샷 확인 |
| `design/mockups/b-editorial/bg-prompt.md` | 방향 B 배경 재생성 한영 프롬프트와 좌표 확인 방법 | 승인된 구도·좌표·중심축 대조 |

## .scratch/mockup-b

| 경로 | 기능 | 관련 테스트 |
| --- | --- | --- |
| `.scratch/mockup-b/measure.mjs` | 방향 B 임시 브라우저 측정과 캡처 도구 | Node 내장 모듈과 로컬 헤드리스 Chrome |
| `.scratch/mockup-b/results.json` | 방향 B 화면·콘텐츠·복사·확대 측정 결과 | 1440·390px 화면과 동작 확인 |
| `.scratch/mockup-b/desk-1440.png` | 홈 데스크톱 축소 화면 | Chrome 스크린샷 |
| `.scratch/mockup-b/zoom-1440.png` | 홈 데스크톱 확대 화면 | Chrome 스크린샷 |
| `.scratch/mockup-b/portfolio-1440.png` | 포트폴리오 데스크톱 화면 | Chrome 스크린샷 |
| `.scratch/mockup-b/desk-390.png` | 홈 모바일 축소 화면 | Chrome 스크린샷 |
| `.scratch/mockup-b/zoom-390.png` | 홈 모바일 확대 화면 | Chrome 스크린샷 |
| `.scratch/mockup-b/portfolio-390.png` | 포트폴리오 모바일 화면 | Chrome 스크린샷 |
| `.scratch/mockup-b/capture.log` | 방향 B 캡처 실행 기록 | 해당 없음 |
| `.scratch/mockup-b/capture-error.log` | 방향 B 캡처 오류 기록 | 해당 없음 |

## .scratch

| 경로 | 기능 | 관련 테스트 |
| --- | --- | --- |
| `.scratch/server.log` | 정적 서버 출력 기록 | 해당 없음 |
| `.scratch/server_err.log` | 정적 서버 오류 기록 | 해당 없음 |

## .scratch/mockup-a

| 경로 | 기능 | 관련 테스트 |
| --- | --- | --- |
| `.scratch/mockup-a/measure.mjs` | 방향 A 임시 화면·동작 측정 | 로컬 Chrome와 Node 내장 모듈 |
| `.scratch/mockup-a/results.json` | 방향 A 폭별 측정 결과 | 1440·390px 화면과 확대·축소 |
| `.scratch/mockup-a/capture.log` | 방향 A 캡처 실행 기록 | 해당 없음 |
| `.scratch/mockup-a/capture-error.log` | 방향 A 캡처 오류 기록 | 해당 없음 |
| `.scratch/mockup-a/desk-1440.png` | 홈 데스크톱 축소 화면 | Chrome 스크린샷 |
| `.scratch/mockup-a/zoom-1440.png` | 홈 데스크톱 확대 화면 | Chrome 스크린샷 |
| `.scratch/mockup-a/portfolio-1440.png` | 포트폴리오 데스크톱 화면 | Chrome 스크린샷 |
| `.scratch/mockup-a/desk-390.png` | 홈 모바일 축소 화면 | Chrome 스크린샷 |
| `.scratch/mockup-a/zoom-390.png` | 홈 모바일 확대 화면 | Chrome 스크린샷 |
| `.scratch/mockup-a/portfolio-390.png` | 포트폴리오 모바일 화면 | Chrome 스크린샷 |

## .scratch/016f3889a084453c9ef53e52cacfd375/verify

| 경로 | 기능 | 관련 테스트 |
| --- | --- | --- |
| `.scratch/016f3889a084453c9ef53e52cacfd375/verify/javascript-syntax.log` | 구문 검사 실행 기록 | 해당 없음 |
| `.scratch/016f3889a084453c9ef53e52cacfd375/verify/static-site-tests.log` | 회귀 테스트 실행 기록 | 해당 없음 |

## .scratch/tab-verify

| 경로 | 기능 | 관련 테스트 |
| --- | --- | --- |
| `.scratch/tab-verify/measure.mjs` | 폭별 탭 렌더링 측정 | 로컬 Chrome DevTools 측정 |
| `.scratch/tab-verify/results-before.json` | 수정 전 측정 수치 | 최초 15개 화면 조건 |
| `.scratch/tab-verify/results.json` | 수정 후 측정 수치 | 최종 15개 화면 조건 |
| `.scratch/tab-verify/about-360.png` | 소개 360px 렌더링 | Chrome 스크린샷 |
| `.scratch/tab-verify/about-400.png` | 소개 400px 렌더링 | Chrome 스크린샷 |
| `.scratch/tab-verify/about-700.png` | 소개 700px 렌더링 | Chrome 스크린샷 |
| `.scratch/tab-verify/portfolio-360.png` | 포트폴리오 360px 렌더링 | Chrome 스크린샷 |
| `.scratch/tab-verify/portfolio-400.png` | 포트폴리오 400px 렌더링 | Chrome 스크린샷 |
| `.scratch/tab-verify/portfolio-700.png` | 포트폴리오 700px 렌더링 | Chrome 스크린샷 |
| `.scratch/tab-verify/guestbook-360.png` | 방명록 360px 렌더링 | Chrome 스크린샷 |
| `.scratch/tab-verify/guestbook-400.png` | 방명록 400px 렌더링 | Chrome 스크린샷 |
| `.scratch/tab-verify/guestbook-700.png` | 방명록 700px 렌더링 | Chrome 스크린샷 |
| `.scratch/tab-verify/game-360.png` | 게임 360px 렌더링 | Chrome 스크린샷 |
| `.scratch/tab-verify/game-400.png` | 게임 400px 렌더링 | Chrome 스크린샷 |
| `.scratch/tab-verify/game-700.png` | 게임 700px 렌더링 | Chrome 스크린샷 |
| `.scratch/tab-verify/index-360.png` | 홈 확대 360px 렌더링 | Chrome 스크린샷 |
| `.scratch/tab-verify/index-400.png` | 홈 확대 400px 렌더링 | Chrome 스크린샷 |
| `.scratch/tab-verify/index-700.png` | 홈 확대 700px 렌더링 | Chrome 스크린샷 |

## design/mockups

| 경로 | 기능 | 관련 테스트 |
| --- | --- | --- |
| `design/mockups/index.html` | 세 방향 시안과 대표 화면 비교 | 링크·이미지 파일과 1440·390px 확인 |
| `design/mockups/capture.mjs` | 로컬 Chrome 18화면 캡처 | Node 구문·캡처·가로 넘침 측정 |

## design/mockups/screenshots

| 경로 | 기능 | 관련 테스트 |
| --- | --- | --- |
| `design/mockups/screenshots/a-deskterior-desk-1440.png` | A 홈 축소 1440px 화면 | Chrome 캡처와 가로 넘침 측정 |
| `design/mockups/screenshots/a-deskterior-zoom-1440.png` | A 홈 확대 1440px 화면 | Chrome 캡처와 가로 넘침 측정 |
| `design/mockups/screenshots/a-deskterior-portfolio-1440.png` | A 포트폴리오 1440px 화면 | Chrome 캡처와 가로 넘침 측정 |
| `design/mockups/screenshots/a-deskterior-desk-390.png` | A 홈 축소 390px 화면 | Chrome 캡처와 가로 넘침 측정 |
| `design/mockups/screenshots/a-deskterior-zoom-390.png` | A 홈 확대 390px 화면 | Chrome 캡처와 가로 넘침 측정 |
| `design/mockups/screenshots/a-deskterior-portfolio-390.png` | A 포트폴리오 390px 화면 | Chrome 캡처와 가로 넘침 측정 |
| `design/mockups/screenshots/b-editorial-desk-1440.png` | B 홈 축소 1440px 화면 | Chrome 캡처와 가로 넘침 측정 |
| `design/mockups/screenshots/b-editorial-zoom-1440.png` | B 홈 확대 1440px 화면 | Chrome 캡처와 가로 넘침 측정 |
| `design/mockups/screenshots/b-editorial-portfolio-1440.png` | B 포트폴리오 1440px 화면 | Chrome 캡처와 가로 넘침 측정 |
| `design/mockups/screenshots/b-editorial-desk-390.png` | B 홈 축소 390px 화면 | Chrome 캡처와 가로 넘침 측정 |
| `design/mockups/screenshots/b-editorial-zoom-390.png` | B 홈 확대 390px 화면 | Chrome 캡처와 가로 넘침 측정 |
| `design/mockups/screenshots/b-editorial-portfolio-390.png` | B 포트폴리오 390px 화면 | Chrome 캡처와 가로 넘침 측정 |
| `design/mockups/screenshots/c-terminal-desk-1440.png` | C 홈 축소 1440px 화면 | Chrome 캡처와 가로 넘침 측정 |
| `design/mockups/screenshots/c-terminal-zoom-1440.png` | C 홈 확대 1440px 화면 | Chrome 캡처와 가로 넘침 측정 |
| `design/mockups/screenshots/c-terminal-portfolio-1440.png` | C 포트폴리오 1440px 화면 | Chrome 캡처와 가로 넘침 측정 |
| `design/mockups/screenshots/c-terminal-desk-390.png` | C 홈 축소 390px 화면 | Chrome 캡처와 가로 넘침 측정 |
| `design/mockups/screenshots/c-terminal-zoom-390.png` | C 홈 확대 390px 화면 | Chrome 캡처와 가로 넘침 측정 |
| `design/mockups/screenshots/c-terminal-portfolio-390.png` | C 포트폴리오 390px 화면 | Chrome 캡처와 가로 넘침 측정 |
| `design/mockups/screenshots/results.json` | 18화면 폭과 넘침 측정 결과 | scrollWidth와 innerWidth 대조 |
