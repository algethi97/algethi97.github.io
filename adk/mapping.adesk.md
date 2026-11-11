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
| `index.html` | 블랙·레드 홈 화면과 진입점 | 로컬 정적 서버 브라우저 확인 |
| `about.html` | 블랙·레드 프로필·기술 태그·이력 소개 화면 | Chrome 1440·390px 캡처·가로 넘침·이메일 복사·홈 복귀 확인 |
| `portfolio.html` | 원문을 보존한 프로젝트 여섯 개의 01~06 번호 목록 화면 | D 시안 배치·원문 대조와 Chrome 1440·390px 스크롤·홈 복귀 확인 |
| `script.js` | 홈 줌 및 공통 인터랙션 | 로컬 정적 서버 브라우저 확인 |
| `README.md` | 프로젝트 소개 및 구조 | 문서와 실제 파일 대조 |
| `MANDARIN_GAME_PLAN.md` | 만다린 게임 기획 문서 | 해당 없음 |
| `common.js` | Supabase와 공통 표시 유틸 | `tests/static-site.test.mjs` |
| `guestbook.js` | 방명록 조회·작성 ES 모듈 | `tests/static-site.test.mjs` |
| `guestbook.html` | 방명록 화면과 모듈 로딩 | 로컬 정적 서버 브라우저 확인 |
| `game.js` | 게임 상태·수명 주기 진입 모듈 | `tests/static-site.test.mjs` |
| `game.html` | 게임 화면과 모듈 로딩 | 로컬 정적 서버 브라우저 확인 |
| `style.css` | 블랙·레드 공통 테마·확대 재그리기·반응형 | 다섯 페이지 데스크톱·모바일 비교와 홈 확대 정지 will-change auto 확인 |

## css

| 경로 | 기능 | 관련 테스트 |
| --- | --- | --- |
| `css/pages.css` | 에디토리얼 홈·소개 카드·포트폴리오 번호 목록과 90px·36px 번호 열 스타일 | Chrome CSS 구문·소개·포트폴리오 반응형·번호 열·대비 확인 |
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

## .scratch/noir-remodel

| 경로 | 기능 | 관련 테스트 |
| --- | --- | --- |
| `.scratch/noir-remodel/capture.mjs` | 1단계 홈 캡처·배치·동작 검증기 | Node 구문 검사와 로컬 헤드리스 Chrome 실행 |
| `.scratch/noir-remodel/results.json` | 홈 배치·동작·대비 검증 결과 | 모든 passed 값 확인 |
| `.scratch/noir-remodel/home-desk-1440.png` | 데스크톱 축소 홈 캡처 | D 시안과 직접 비교 |
| `.scratch/noir-remodel/home-zoom-1440.png` | 데스크톱 확대 홈 캡처 | 모니터 내부 배치 확인 |
| `.scratch/noir-remodel/home-desk-390.png` | 모바일 축소 홈 캡처 | D 시안과 직접 비교 |
| `.scratch/noir-remodel/home-zoom-390.png` | 모바일 확대 홈 캡처 | 모니터 내부 배치 확인 |
| `.scratch/noir-remodel/home-toast-1440.png` | 데스크톱 이메일 복사 토스트 | 검은 바탕과 빨간 왼쪽 선 확인 |
| `.scratch/noir-remodel/home-toast-390.png` | 모바일 이메일 복사 토스트 | 줄바꿈과 화면 내부 배치 확인 |
| `.scratch/noir-remodel/home-cards-1440.png` | 데스크톱 바로가기 카드 캡처 | 검은 윗선과 두 열 배치 확인 |
| `.scratch/noir-remodel/home-cards-390.png` | 모바일 바로가기 카드 캡처 | 한 열 배치와 스크롤 확인 |
| `.scratch/noir-remodel/home-footer-1440.png` | 데스크톱 푸터 캡처 | 검은 띠와 축약 문구 확인 |
| `.scratch/noir-remodel/home-footer-390.png` | 모바일 푸터 캡처 | 검은 띠와 축약 문구 확인 |
| `.scratch/noir-remodel/step2-original.json` | 2단계 수정 전 소개·포트폴리오 원문 스냅샷 | 실행 없이 현재 마크업의 문구·프로젝트·링크와 대조 |
| `.scratch/noir-remodel/step2-checks.inc` | 승인에 따라 모션 대상과 실제 클릭·토스트 대기를 보완한 2단계 브라우저 검증 본문 | 원문·번호 열·스크롤 표시·복사 예외·홈 복귀 검증 |
| `.scratch/noir-remodel/step2-capture.mjs` | 로컬 서버와 헤드리스 Chrome을 실행·정리하는 2단계 검증기 | Node 구문 검사와 브라우저 42개 검사 중 41개 통과, 기존 WebKit 전용 속성 1건은 Chrome 미지원 |
| `.scratch/noir-remodel/step2-about-1440.png` | 데스크톱 소개 페이지 캡처 | 검은 카드 윗선·프로필·기술 태그 배치 확인 |
| `.scratch/noir-remodel/step2-about-390.png` | 모바일 소개 페이지 캡처 | 프로필 줄바꿈과 가로 넘침 확인 |
| `.scratch/noir-remodel/step2-portfolio-1440.png` | 데스크톱 90px 번호 열 포트폴리오 캡처 | D 시안 번호 목록 배치와 직접 비교 |
| `.scratch/noir-remodel/step2-portfolio-390.png` | 모바일 36px 번호 열 포트폴리오 캡처 | D 시안 번호 목록 배치·줄바꿈과 직접 비교 |
| `.scratch/noir-remodel/step2-portfolio-end-1440.png` | 데스크톱 프로젝트 제목 hover 강조 캡처 | 빨간 제목과 그림자 없는 목록 확인 |
| `.scratch/noir-remodel/step2-portfolio-end-390.png` | 390px 프로젝트 제목 강조 캡처 | 빨간 제목과 화면 내부 배치 확인 |
| `.scratch/noir-remodel/step2-results.json` | 2단계 브라우저 측정과 예외·대비 검사 결과 | 41개 통과와 변경하지 않은 style.css의 WebKit 속성 미지원 1건을 구분 |

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

## design/mockups/d-editorial-noir

| 경로 | 기능 | 관련 테스트 |
| --- | --- | --- |
| `design/mockups/d-editorial-noir/index.html` | 방향 D(B 기반 블랙·레드) 홈과 모니터 확대·축소 및 이메일 복사 시안 | Chrome 1440·390px 확대·축소와 복사 동작 확인 |
| `design/mockups/d-editorial-noir/portfolio.html` | 방향 D 프로젝트 여섯 개의 번호 목록형 시안 | Chrome 1440·390px 반응형과 원문 대조 |
| `design/mockups/d-editorial-noir/style.css` | 종이색·검정·빨강 변수와 굵은 선·검은 띠 강조 스타일 | 홈·포트폴리오 가로 넘침과 화면 내부 배치 측정 |
| `design/mockups/d-editorial-noir/desk-bg.svg` | 검은 모니터·빨간 액자·빨간 책이 있는 밝은 작업 공간 배경 | 모니터 좌표와 축소·확대 스크린샷 확인 |
| `design/mockups/d-editorial-noir/bg-prompt.md` | 방향 D 배경 재생성 한영 프롬프트와 좌표 확인 방법 | 승인된 구도·좌표·중심축 대조 |

## design/mockups

| 경로 | 기능 | 관련 테스트 |
| --- | --- | --- |
| `design/mockups/index.html` | 네 방향 시안과 대표 화면 비교 | 링크·이미지 파일과 1440·390px 확인 |
| `design/mockups/capture.mjs` | 로컬 Chrome 24화면 캡처 | Node 구문·캡처·가로 넘침 측정 |

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
| `design/mockups/screenshots/d-editorial-noir-desk-1440.png` | D 홈 축소 1440px 화면 | Chrome 캡처와 가로 넘침 측정 |
| `design/mockups/screenshots/d-editorial-noir-zoom-1440.png` | D 홈 확대 1440px 화면 | Chrome 캡처와 가로 넘침 측정 |
| `design/mockups/screenshots/d-editorial-noir-portfolio-1440.png` | D 포트폴리오 1440px 화면 | Chrome 캡처와 가로 넘침 측정 |
| `design/mockups/screenshots/d-editorial-noir-desk-390.png` | D 홈 축소 390px 화면 | Chrome 캡처와 가로 넘침 측정 |
| `design/mockups/screenshots/d-editorial-noir-zoom-390.png` | D 홈 확대 390px 화면 | Chrome 캡처와 가로 넘침 측정 |
| `design/mockups/screenshots/d-editorial-noir-portfolio-390.png` | D 포트폴리오 390px 화면 | Chrome 캡처와 가로 넘침 측정 |
| `design/mockups/screenshots/results.json` | 24화면 폭과 넘침 측정 결과 | scrollWidth와 innerWidth 대조 |

## .scratch/zoom-blur

| 경로 | 기능 | 관련 테스트 |
| --- | --- | --- |
| `.scratch/zoom-blur/capture.mjs` | 홈 확대 흐림 재현·비교 도구 | Node 구문 검사와 Chrome 실제 클릭·계산 스타일·선명도 비교 |
| `.scratch/zoom-blur/results.json` | 수정 전·후 화면·동작·선명도 결과 | 모바일 배율 3·데스크톱 배율 1의 다섯 확대 표본과 C 경로 축소 화면 확인 |
| `.scratch/zoom-blur/before.log` | 수정 전 캡처 실행 기록 | 수정 전 결과 JSON과 대조 |
| `.scratch/zoom-blur/before-error.log` | 수정 전 캡처 오류 기록 | 실행 오류 여부 확인 |
| `.scratch/zoom-blur/after.log` | 수정 후 캡처 실행 기록 | 수정 후 결과 JSON과 대조 |
| `.scratch/zoom-blur/after-error.log` | 수정 후 캡처 오류 기록 | 실행 오류 여부 확인 |
| `.scratch/zoom-blur/before-a-mobile.png` | 수정 전 A 모바일 확대 화면 | 390×844·배율 3 전체 화면 비교 |
| `.scratch/zoom-blur/before-a-mobile-tabs.png` | 수정 전 A 모바일 탭 영역 | 원본 픽셀 선명도 측정과 육안 비교 |
| `.scratch/zoom-blur/after-a-mobile.png` | 수정 후 A 모바일 확대 화면 | 390×844·배율 3 전체 화면 비교 |
| `.scratch/zoom-blur/after-a-mobile-tabs.png` | 수정 후 A 모바일 탭 영역 | 원본 픽셀 선명도 측정과 육안 비교 |
| `.scratch/zoom-blur/before-a-desktop.png` | 수정 전 A 데스크톱 확대 화면 | 1440×900·배율 1 전체 화면 비교 |
| `.scratch/zoom-blur/before-a-desktop-tabs.png` | 수정 전 A 데스크톱 탭 영역 | 원본 픽셀 선명도 측정과 육안 비교 |
| `.scratch/zoom-blur/after-a-desktop.png` | 수정 후 A 데스크톱 확대 화면 | 1440×900·배율 1 전체 화면 비교 |
| `.scratch/zoom-blur/after-a-desktop-tabs.png` | 수정 후 A 데스크톱 탭 영역 | 원본 픽셀 선명도 측정과 육안 비교 |
| `.scratch/zoom-blur/before-b-mobile.png` | 수정 전 B 모바일 홈 복귀 화면 | 소개 페이지 홈 버튼 실제 클릭 결과 비교 |
| `.scratch/zoom-blur/before-b-mobile-tabs.png` | 수정 전 B 모바일 복귀 탭 영역 | 원본 픽셀 선명도 측정과 육안 비교 |
| `.scratch/zoom-blur/after-b-mobile.png` | 수정 후 B 모바일 홈 복귀 화면 | 소개 페이지 홈 버튼 실제 클릭 결과 비교 |
| `.scratch/zoom-blur/after-b-mobile-tabs.png` | 수정 후 B 모바일 복귀 탭 영역 | 원본 픽셀 선명도 측정과 육안 비교 |
| `.scratch/zoom-blur/before-b-desktop.png` | 수정 전 B 데스크톱 홈 복귀 화면 | 소개 페이지 홈 버튼 실제 클릭 결과 비교 |
| `.scratch/zoom-blur/before-b-desktop-tabs.png` | 수정 전 B 데스크톱 복귀 탭 영역 | 원본 픽셀 선명도 측정과 육안 비교 |
| `.scratch/zoom-blur/after-b-desktop.png` | 수정 후 B 데스크톱 홈 복귀 화면 | 소개 페이지 홈 버튼 실제 클릭 결과 비교 |
| `.scratch/zoom-blur/after-b-desktop-tabs.png` | 수정 후 B 데스크톱 복귀 탭 영역 | 원본 픽셀 선명도 측정과 육안 비교 |
| `.scratch/zoom-blur/before-c-desktop-reloaded-desk.png` | 수정 전 C 홈 버튼 뒤 축소 화면 | 결정 A의 새 문서·축소 상태 유지 확인 |
| `.scratch/zoom-blur/before-c-desktop-reloaded-desk-tabs.png` | 수정 전 C 축소 화면 탭 영역 | 확대 선명도 비교에서 제외하는 보조 캡처 |
| `.scratch/zoom-blur/after-c-desktop-reloaded-desk.png` | 수정 후 C 홈 버튼 뒤 축소 화면 | 결정 A의 새 문서·축소 상태 유지 확인 |
| `.scratch/zoom-blur/after-c-desktop-reloaded-desk-tabs.png` | 수정 후 C 축소 화면 탭 영역 | 확대 선명도 비교에서 제외하는 보조 캡처 |
| `.scratch/zoom-blur/before-c-desktop-rezoom.png` | 수정 전 C 재확대 화면 | 홈 버튼 재로딩 후 다시 확대하여 비교 |
| `.scratch/zoom-blur/before-c-desktop-rezoom-tabs.png` | 수정 전 C 재확대 탭 영역 | 원본 픽셀 선명도 측정과 육안 비교 |
| `.scratch/zoom-blur/after-c-desktop-rezoom.png` | 수정 후 C 재확대 화면 | 홈 버튼 재로딩 후 다시 확대하여 비교 |
| `.scratch/zoom-blur/after-c-desktop-rezoom-tabs.png` | 수정 후 C 재확대 탭 영역 | 원본 픽셀 선명도 측정과 육안 비교 |
| `.scratch/zoom-blur/diagnostic-body-before.png` | 첫 수정 뒤 남은 본문 흐림 | 홈 fade-in 합성 힌트 원인 확인 |
| `.scratch/zoom-blur/diagnostic-body-after.png` | 런타임 힌트 해제 뒤 본문 | 소스 수정 전 같은 화면의 선명도 육안 비교 |
| `.scratch/zoom-blur/attempt1-after.log` | 첫 수정 검증 실행 기록 | 탭 개선과 본문 잔여 흐림의 진행 근거 |
| `.scratch/zoom-blur/attempt1-after-error.log` | 첫 수정 검증 오류 기록 | 실행 오류 여부 확인 |
| `.scratch/zoom-blur/attempt1-after-a-mobile.png` | 첫 수정 A 모바일 확대 화면 | 최종 수정 전 증거 보존 |
| `.scratch/zoom-blur/attempt1-after-a-mobile-tabs.png` | 첫 수정 A 모바일 탭 영역 | 첫 수정 선명도 측정 근거 보존 |
| `.scratch/zoom-blur/attempt1-after-a-desktop.png` | 첫 수정 A 데스크톱 확대 화면 | 본문 잔여 흐림과 최종 결과 비교 |
| `.scratch/zoom-blur/attempt1-after-a-desktop-tabs.png` | 첫 수정 A 데스크톱 탭 영역 | 첫 수정 선명도 측정 근거 보존 |
| `.scratch/zoom-blur/attempt1-after-b-mobile.png` | 첫 수정 B 모바일 홈 복귀 | 최종 수정 전 증거 보존 |
| `.scratch/zoom-blur/attempt1-after-b-mobile-tabs.png` | 첫 수정 B 모바일 복귀 탭 | 첫 수정 선명도 측정 근거 보존 |
| `.scratch/zoom-blur/attempt1-after-b-desktop.png` | 첫 수정 B 데스크톱 홈 복귀 | 최종 수정 전 증거 보존 |
| `.scratch/zoom-blur/attempt1-after-b-desktop-tabs.png` | 첫 수정 B 데스크톱 복귀 탭 | 첫 수정 선명도 측정 근거 보존 |
| `.scratch/zoom-blur/attempt1-after-c-desktop-reloaded-desk.png` | 첫 수정 C 홈 버튼 뒤 축소 | 결정 A 유지 확인 근거 보존 |
| `.scratch/zoom-blur/attempt1-after-c-desktop-reloaded-desk-tabs.png` | 첫 수정 C 축소 화면 탭 | 확대 선명도 비교 대상 밖 보조 증거 |
| `.scratch/zoom-blur/attempt1-after-c-desktop-rezoom.png` | 첫 수정 C 재확대 화면 | 본문 잔여 흐림과 최종 결과 비교 |
| `.scratch/zoom-blur/attempt1-after-c-desktop-rezoom-tabs.png` | 첫 수정 C 재확대 탭 영역 | 첫 수정 선명도 측정 근거 보존 |
