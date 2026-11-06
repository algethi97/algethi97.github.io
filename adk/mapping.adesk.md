# 프로젝트 매핑

AI가 파일을 추가·이동·삭제하면 이 파일의 행도 함께 고친다. 폴더마다 `## <폴더 경로>` 절을 두고 그 폴더의 파일만 적는다. 루트 파일은 `## .` 절에 둔다.

표의 첫 열은 `경로`(백틱으로 감싼 프로젝트 상대 경로), 둘째 열은 `기능`(20자 안팎)이다. 셋째 열부터는 프로젝트가 정한다.

## .

| 경로 | 기능 | 관련 테스트 |
| --- | --- | --- |
| `common.js` | Supabase와 공통 표시 유틸 | `tests/static-site.test.mjs` |
| `guestbook.js` | 방명록 조회·작성 ES 모듈 | `tests/static-site.test.mjs` |
| `guestbook.html` | 방명록 화면과 모듈 로딩 | 로컬 정적 서버 브라우저 확인 |

## tests

| 경로 | 기능 | 관련 대상 |
| --- | --- | --- |
| `tests/static-site.test.mjs` | Node 내장 방명록 회귀 테스트 | `common.js`, `guestbook.js` |

## .adesk

| 경로 | 기능 | 관련 대상 |
| --- | --- | --- |
| `.adesk/verify.json` | 구문·동작 검사 실행 설정 | JavaScript 파일, `tests/static-site.test.mjs` |
