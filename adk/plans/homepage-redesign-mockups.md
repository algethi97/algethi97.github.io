# 홈페이지 리디자인 시안 제작

## 현재 문제

홈페이지 5개 페이지 전체를 새 디자인으로 리모델링하려고 하지만, 아직 디자인 콘셉트가 정해지지 않았다. 사용자가 실제 브라우저에서 비교해 보고 콘셉트를 고를 수 있도록, 세 가지 방향의 HTML 시안(홈, 포트폴리오, 데스크테리어 배경 이미지)이 먼저 필요하다.

## 수정할 것

1. 세 방향의 시안을 각각 독립된 폴더에 만든다.
   - A. 데스크테리어 개선안: 지금의 웜 우드·오렌지 데스크테리어 콘셉트를 다듬은 버전
   - B. 에디토리얼안: 여백이 넓고 밝은 잡지형 포트폴리오
   - C. 터미널안: 어두운 배경의 개발자·터미널 감성
2. 각 시안 폴더에는 새 데스크테리어 배경 이미지(`desk-bg.svg`), 같은 장면을 이미지 생성 AI로 다시 만들 수 있는 한국어·영어 프롬프트(`bg-prompt.md`), 홈 시안(`index.html`), 포트폴리오 시안(`portfolio.html`), 시안 전용 스타일(`style.css`)을 둔다.
3. 귤 캐릭터는 세 시안 모두에서 사이트의 대표 캐릭터로 유지하고, 방향마다 그 시안의 화풍에 맞게 표현한다.
4. 홈 시안은 지금 사이트처럼 "모니터를 클릭하면 확대되고, ESC나 축소 버튼으로 돌아오는" 연출을 유지한다.
5. 세 시안을 한 화면에서 고를 수 있는 비교 페이지와, 데스크톱·모바일 스크린샷을 만든다.

이번 계획은 시안 제작까지만 다룬다. 실제 5개 페이지(`index.html`, `about.html`, `portfolio.html`, `guestbook.html`, `game.html`)와 기존 `style.css`, `css/*.css`, `script.js`는 고치지 않는다. 리모델링은 사용자가 콘셉트를 확정한 뒤 별도 계획으로 진행한다.

## 기대 효과

- 사용자가 세 방향을 실제 브라우저에서 열어 보고, 같은 콘텐츠 기준으로 비교해서 콘셉트를 고를 수 있다.
- 시안의 색·글꼴·간격 값이 CSS 변수로 정리되어 있어, 확정 뒤 리모델링 계획에서 그대로 옮겨 쓸 수 있다.
- 배경 이미지의 모니터 위치를 지금 사이트와 같은 좌표로 맞추므로, 확정된 배경을 실제 사이트에 넣을 때 확대 연출 코드를 다시 측정할 필요가 없다.

## 완료 기준

| 확인 | 방법 |
| --- | --- |
| 시안 파일 | `design/mockups/a-deskterior/`, `design/mockups/b-editorial/`, `design/mockups/c-terminal/` 각각에 `index.html`, `portfolio.html`, `style.css`, `desk-bg.svg`, `bg-prompt.md`가 있다. |
| 귤 캐릭터 | 각 시안의 배경 SVG와 홈 시안 화면 안에 귤 캐릭터가 하나 이상 보인다. 축소·확대 스크린샷에서 확인한다. |
| 확대 연출 | 각 홈 시안에서 모니터 클릭 시 확대되고, ESC와 축소 버튼으로 원래 화면으로 돌아온다. 헤드리스 Chrome 스크린샷으로 축소·확대 두 상태를 확인한다. |
| 모니터 좌표 | 각 `desk-bg.svg`의 모니터 화면 영역이 viewBox `0 0 1672 941` 기준 Left 29.49%, Top 23.91%, Width 40.91%, Height 39.53%에 맞는다. 확대 상태 스크린샷에서 시안 화면 콘텐츠가 그려진 모니터 화면 밖으로 벗어나지 않는다. |
| 콘텐츠 | 홈 시안은 지금 `index.html`의 모니터 안 문구와 4개 바로가기(자기소개, 포트폴리오, 만다린 게임, 방명록)를, 포트폴리오 시안은 지금 `portfolio.html`의 프로젝트 카드 6개 문구를 한국어 그대로 쓴다. |
| 반응형 | 폭 1440px과 390px에서 가로 스크롤이 생기지 않는다. 스크린샷 측정 스크립트가 `document.documentElement.scrollWidth <= window.innerWidth`를 기록한다. |
| 비교 페이지 | `design/mockups/index.html`에서 세 시안의 홈·포트폴리오로 이동할 수 있고, 각 방향의 특징이 한국어로 정리되어 있다. |
| 기존 사이트 보존 | `git status`에서 기존 5개 페이지, `style.css`, `css/`, `script.js`, `game/`, `images/` 변경이 없다. `node --test tests/static-site.test.mjs`가 통과한다. |

## 지킬 것

- 기존 사이트 파일은 고치지 않는다. 시안은 `design/mockups/` 아래에서만 만들고, 기존 이미지와 스타일은 읽기만 한다.
- 시안은 외부 CDN, 웹 폰트 서버, npm 패키지 없이 로컬 파일만으로 열려야 한다. 글꼴은 지금 사이트와 같은 시스템 글꼴 목록(`-apple-system, "Pretendard Variable", Pretendard, "Segoe UI"…`)을 기본으로 하고, 방향 C처럼 고정폭 글꼴이 필요하면 `ui-monospace, "Cascadia Code", Consolas, monospace` 같은 시스템 글꼴만 쓴다.
- 화면에 보이는 문구는 한국어 중심으로 유지한다. 영어는 기술 이름과 프로젝트 이름처럼 지금 사이트에도 영어인 부분만 쓴다.
- 귤 캐릭터는 사이트의 대표 캐릭터로 유지한다. 지금 사이트의 귤은 만다린 게임 타일 그림 `images/mandarin.png`와 탭의 🍊 이모지다. 각 시안은 이 귤을 시안 화풍에 맞게 SVG나 CSS로 다시 그려 배경(예: 책상 위 귤 피규어·스티커)과 홈 화면(예: 인사 문구 옆, 만다린 게임 바로가기)에 넣는다. 방향 A는 따뜻한 일러스트 귤, B는 단순한 선·면 귤, C는 픽셀·ASCII 느낌 귤을 기본안으로 한다. `images/mandarin.png`를 쓸 때는 상대 경로로 읽기만 하고 원본을 고치거나 복사하지 않는다.
- 시안의 확대 연출은 각 `index.html` 안의 짧은 인라인 스크립트로 구현한다. 기존 `script.js`를 불러오지 않는다. 기존 `sessionStorage` 키 `return_to_monitor`는 시안에서 쓰지 않는다.
- 배경 이미지는 래스터 이미지 생성 도구 없이 손으로 쓴 SVG 일러스트로 만든다. 사진 같은 질감은 기대하지 않으며, 구도·색·분위기를 비교하는 용도다. 각 `bg-prompt.md`에는 같은 구도(1672×941, 모니터 화면 위치, 귤 캐릭터 위치 포함)를 이미지 생성 AI로 다시 만들 수 있는 한국어·영어 프롬프트와, 생성 뒤 모니터 좌표가 맞는지 확인하는 방법을 적는다.
- GitHub Pages는 저장소에 커밋된 파일을 모두 공개하므로, `design/` 폴더가 푸시되면 `https://algethi97.github.io/design/mockups/`로 공개된다. 커밋은 사용자가 요청할 때만 하고, 이 사실을 최종 보고에 적는다.
- Windows 11의 Chrome(`C:\Program Files\Google\Chrome\Application\chrome.exe`)과 Node 내장 모듈만으로 스크린샷을 찍는다. Chrome이 없으면 스크린샷 단계는 실패로 처리하지 말고 사유를 보고한다.
- 새 파일은 UTF-8로 저장하고, 저장 뒤 다시 읽어 한글이 깨지지 않았는지 확인한다.

## 단계 1. 방향 A 데스크테리어 개선안 시안

- 작업: `design/mockups/a-deskterior/`에 배경 SVG, 배경 프롬프트, 홈 시안, 포트폴리오 시안, 시안 전용 스타일을 만든다. 지금 사이트의 웜 우드·오렌지 키캡 감성을 유지하되, 배경은 책상·모니터·키보드·조명·식물 정도로 정돈한 따뜻한 저녁 방 구도로 새로 그린다. 홈 시안은 지금 `index.html`의 구조(데스크 뷰포트 → 16:9 캔버스 → 모니터 화면 → 브라우저 창 타이틀바 → 스크롤 본문)를 따르고, 본문의 소개 문구와 4개 바로가기 카드는 지금 문구를 쓴다. 포트폴리오 시안은 지금 `portfolio.html`처럼 독립 페이지로 만들고 헤더(홈 버튼과 4개 탭)와 프로젝트 카드 6개를 넣는다. 색·글꼴·간격·모서리·그림자는 `style.css` 맨 위 `:root` 변수로 정리한다. 확대 연출은 `index.html` 인라인 스크립트로 모니터 클릭 시 `is-zoomed` 클래스를 붙이고, ESC와 축소 버튼으로 뗀다. 확대 배율과 중심축은 근거 절의 지금 사이트 값을 쓴다. 귤 캐릭터는 따뜻한 일러스트 화풍으로 배경 책상 위와 홈 화면에 넣는다.
- 완료 기준: 다섯 파일이 있고, 헤드리스 Chrome으로 1440×900과 390×844에서 홈 축소·확대 상태와 포트폴리오를 임시 스크린샷(`.scratch/mockup-a/`)으로 찍어 직접 확인했으며, 확대 상태에서 시안 화면이 모니터 영역 안에 들어가고 가로 스크롤이 없다. 실패한 확인이 있으면 사유를 보고한다.
- 읽을 파일: index.html, portfolio.html, style.css, css/pages.css, script.js, images/GPT_Gen.png
- 고칠 파일: design/mockups/a-deskterior/index.html, design/mockups/a-deskterior/portfolio.html, design/mockups/a-deskterior/style.css, design/mockups/a-deskterior/desk-bg.svg, design/mockups/a-deskterior/bg-prompt.md, adk/mapping.adesk.md
- 지킬 테스트: tests/static-site.test.mjs
- 난이도: standard
- 선행 단계: 없음

## 단계 2. 방향 B 에디토리얼안 시안

- 작업: `design/mockups/b-editorial/`에 단계 1과 같은 다섯 파일을 만든다. 밝은 종이색 바탕, 넓은 여백, 큰 제목 타이포그래피, 얇은 구분선, 절제된 강조색 한 가지를 쓰는 잡지형 디자인으로 만든다. 배경 SVG는 낮의 자연광이 드는 밝고 단정한 작업 공간(흰 책상, 얇은 모니터, 책, 액자 정도) 구도로 그린다. 모니터 화면 영역 좌표와 확대 연출 방식, 홈·포트폴리오 콘텐츠, 귤 캐릭터와 배경 프롬프트는 단계 1과 같은 규칙을 따른다. 포트폴리오는 카드 격자 대신 번호가 붙은 목록형이나 큰 썸네일형처럼 잡지 지면 같은 배치를 우선 검토한다.
- 완료 기준: 다섯 파일이 있고, 헤드리스 Chrome으로 1440×900과 390×844에서 홈 축소·확대 상태와 포트폴리오를 임시 스크린샷(`.scratch/mockup-b/`)으로 찍어 직접 확인했으며, 확대 상태에서 시안 화면이 모니터 영역 안에 들어가고 가로 스크롤이 없다. 실패한 확인이 있으면 사유를 보고한다.
- 읽을 파일: index.html, portfolio.html, style.css, css/pages.css, script.js, images/GPT_Gen.png
- 고칠 파일: design/mockups/b-editorial/index.html, design/mockups/b-editorial/portfolio.html, design/mockups/b-editorial/style.css, design/mockups/b-editorial/desk-bg.svg, design/mockups/b-editorial/bg-prompt.md, adk/mapping.adesk.md
- 지킬 테스트: tests/static-site.test.mjs
- 난이도: standard
- 선행 단계: 없음

## 단계 3. 방향 C 터미널안 시안

- 작업: `design/mockups/c-terminal/`에 단계 1과 같은 다섯 파일을 만든다. 어두운 배경, 고정폭 글꼴, 프롬프트(`$`)·커서·명령어 형태의 제목, 형광 계열 강조색 한두 가지를 쓰는 개발자 터미널 감성으로 만든다. 글자 대비는 어두운 배경에서도 본문이 읽히도록 WCAG AA(4.5:1) 이상을 목표로 한다. 배경 SVG는 어두운 밤 방에 모니터 빛과 키보드 백라이트가 비치는 구도로 그린다. 모니터 화면 영역 좌표와 확대 연출 방식, 홈·포트폴리오 콘텐츠, 귤 캐릭터와 배경 프롬프트는 단계 1과 같은 규칙을 따른다. 장식용 깜빡임 애니메이션은 `prefers-reduced-motion: reduce`에서 멈춘다.
- 완료 기준: 다섯 파일이 있고, 헤드리스 Chrome으로 1440×900과 390×844에서 홈 축소·확대 상태와 포트폴리오를 임시 스크린샷(`.scratch/mockup-c/`)으로 찍어 직접 확인했으며, 확대 상태에서 시안 화면이 모니터 영역 안에 들어가고 가로 스크롤이 없다. 실패한 확인이 있으면 사유를 보고한다.
- 읽을 파일: index.html, portfolio.html, style.css, css/pages.css, script.js, images/GPT_Gen.png
- 고칠 파일: design/mockups/c-terminal/index.html, design/mockups/c-terminal/portfolio.html, design/mockups/c-terminal/style.css, design/mockups/c-terminal/desk-bg.svg, design/mockups/c-terminal/bg-prompt.md, adk/mapping.adesk.md
- 지킬 테스트: tests/static-site.test.mjs
- 난이도: standard
- 선행 단계: 없음

## 단계 4. 비교 페이지와 스크린샷 정리

- 작업: `design/mockups/index.html`에 세 시안을 나란히 소개하는 비교 페이지를 만든다. 방향마다 이름, 한 줄 콘셉트, 주요 색 견본(각 시안 `style.css`의 `:root` 값), 홈·포트폴리오 시안 링크, 대표 스크린샷을 넣고, 아래에 비교표(분위기, 가독성, 확대 연출과의 어울림, 리모델링 때 바꿀 양)를 한국어로 적는다. `design/mockups/capture.mjs`에 Node 내장 모듈과 로컬 Chrome DevTools 프로토콜로 스크린샷을 찍는 스크립트를 만든다. 기존 `.scratch/tab-verify/measure.mjs`의 정적 서버·Chrome 실행·종료 처리 방식을 참고하되, 서버가 `design/mockups/` 아래 파일만 제공하게 한다. 세 시안 × (홈 축소, 홈 확대, 포트폴리오) × (1440×900, 390×844) = 18장을 `design/mockups/screenshots/<방향>-<화면>-<폭>.png`로 저장하고, 각 화면의 `scrollWidth`와 `innerWidth`를 `design/mockups/screenshots/results.json`에 기록한다. 마지막으로 단계 1~3의 맵 행이 빠졌으면 채우고, 기존 사이트 파일이 바뀌지 않았는지 `git status`로 확인한 뒤 `node --test tests/static-site.test.mjs`를 실행한다.
- 완료 기준: `node design/mockups/capture.mjs`가 스크린샷 18장과 `results.json`을 만들고, 모든 화면에서 `scrollWidth <= innerWidth`이다. 넘치는 화면이 있으면 해당 시안을 고치지 말고 화면 이름과 수치를 보고한다. 비교 페이지의 링크 6개와 이미지 6장 이상이 실제 파일을 가리킨다. 기존 사이트 파일 변경이 없고 회귀 테스트가 통과한다.
- 읽을 파일: design/mockups/a-deskterior/style.css, design/mockups/b-editorial/style.css, design/mockups/c-terminal/style.css, .scratch/tab-verify/measure.mjs
- 고칠 파일: design/mockups/index.html, design/mockups/capture.mjs, adk/mapping.adesk.md
- 지킬 테스트: tests/static-site.test.mjs
- 난이도: small
- 선행 단계: 1, 2, 3

## 결정

### D1. 데스크테리어 배경 이미지를 어떻게 만드는가

- A. 실행 AI가 SVG 일러스트로 직접 그리고, 같은 구도를 이미지 생성 AI로 다시 만들 수 있도록 각 시안 폴더에 한국어·영어 프롬프트(`bg-prompt.md`)도 함께 남긴다 
- 필수

- 선택: A
### D2. 시안 폴더를 어디에 두는가

- A. `design/mockups/`에 두고, 커밋 여부는 사용자가 정한다. 푸시하면 공개 주소로 열 수 있다 

- 선택: A
## 근거

- 지금 홈의 16:9 캔버스는 `style.css` 77~95행의 `.desk-canvas`에 있다. 기준 이미지는 `images/GPT_Gen.png`(1672×941)이고 `aspect-ratio: 1672 / 941`을 쓴다. 확대 중심축은 X 49.91%, Y 43.62%이다.
- 확대 배율은 `style.css` 107~114행의 `scale(2.22)`이고, 모니터 속으로 들어가는 전환은 136~137행의 `scale(3.4)`이다.
- 모니터 화면 좌표는 `style.css` 178~180행 주석 기준 Left 29.49%, Top 23.91%, Width 40.91%, Height 39.53%이다.
- 확대·축소 동작은 `script.js` 110~160행의 `zoomIn`·`zoomOut`, 모니터 클릭, 축소 버튼, ESC 처리에 있다. 안쪽 페이지에서 돌아올 때의 즉시 확대는 `script.js` 40~47행과 `index.html` 9~13행의 `return_to_monitor` 처리이며, 시안에서는 쓰지 않는다.
- 지금 반응형 구간은 `style.css` 612행 `@media (max-width: 768px)`와 856행 `@media (max-width: 640px)`이다.
- 포트폴리오 페이지는 `body.standalone-page` 독립 페이지이며, 헤더는 홈 버튼과 `tabs-grid four-tabs` 4개 탭(자기소개, 포트폴리오, 방명록, 만다린 게임)으로 되어 있다. 프로젝트 카드는 6개다.
- 기존 스크린샷 측정 예시는 `.scratch/tab-verify/measure.mjs`이다. Node `http` 정적 서버와 `--headless=new --remote-debugging-port=0`으로 실행한 로컬 Chrome을 쓴다.
- 프로젝트 검증 설정 `.adesk/verify.json`은 `*.js`·`tests/*.mjs` 구문 검사와 `node --test tests/static-site.test.mjs`를 실행한다. 회귀 테스트는 방명록·게임 로직만 확인하므로, 디자인은 스크린샷으로 확인한다.
- 귤 캐릭터 유지와 D1·D2 권장안은 2026-11-11 대화에서 사용자가 확정했다.
- 리모델링 계획은 사용자가 콘셉트를 확정한 뒤 따로 쓴다. 그때 디자인 토큰 교체, 공통 레이아웃, 페이지별 적용, 게임·방명록 화면 회귀 확인 순서로 나눈다. [가설/임시]
