# 프로젝트 매핑

AI가 파일을 추가·이동·삭제하면 이 파일의 행도 함께 고친다. 폴더마다 `## <폴더 경로>` 절을 두고 그 폴더의 파일만 적는다. 루트 파일은 `## .` 절에 둔다.

표의 첫 열은 `경로`(백틱으로 감싼 프로젝트 상대 경로), 둘째 열은 `기능`(20자 안팎)이다. 셋째 열부터는 프로젝트가 정한다.

## .

| 경로 | 기능 | 관련 테스트 |
| --- | --- | --- |
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
