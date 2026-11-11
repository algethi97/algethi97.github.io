# 블랙·레드 홈 배경 제작과 적용

## 현재 문제

홈은 블랙·레드 테마로 바뀌었지만 배경은 우드 책상과 오렌지 키캡이 있는 기존 그림 `images/GPT_Gen.png`를 그대로 쓴다. 지난 리모델링 계획(homepage-noir-remodel)의 D2에서 배경 유지(B)를 골랐기 때문이다. 그래서 모니터 안 화면은 종이색·검정·빨강인데 모니터 밖 책상은 따뜻한 나무색이라 두 화면의 색이 어긋난다. README도 교체 후보 경로 `images/desk-bg-noir.svg`를 "현재 생성하거나 적용하지 않았다"고 적고 있다.

## 수정할 것

1. 시안 D(`design/mockups/d-editorial-noir/index.html`)와 배경 프롬프트(`design/mockups/d-editorial-noir/bg-prompt.md`)의 구도로 사이트용 블랙·레드 배경 파일을 `images/` 아래에 만든다. 만드는 방식은 결정 D1을 따른다.
2. 새 배경의 모니터 화면 내부 사각형이 기존 좌표와 같은지 측정한다.
3. 홈 캔버스(`style.css`의 `.desk-canvas`)가 새 배경을 쓰도록 바꾸고, 관련 주석과 README·맵을 고친다.
4. 1440×900과 390×844에서 축소·확대·ESC·축소 버튼 복귀를 캡처와 측정으로 확인한다.

## 기대 효과

- 홈 첫 화면에서 모니터 밖 책상도 종이색 벽, 흰 책상, 검은 모니터, 빨간 포인트로 보여 모니터 안 화면과 색이 맞는다.
- 모니터 화면 좌표, 확대 중심축, 배율이 그대로라 확대했을 때 화면이 모니터 안에 정확히 들어가는 기존 동작이 유지된다.

## 완료 기준

| 확인 | 방법 |
| --- | --- |
| 배경 파일 | `images/desk-bg-noir.svg`(D1=A·C) 또는 `images/desk-bg-noir.png`(D1=B)가 있고 크기가 1672×941이다 |
| 화면 좌표 | 화면 내부 사각형이 x=493.0728, y=224.9931, 폭=684.0152, 높이=371.9773 픽셀과 각 변 2px 이내로 맞는다 [가설/임시: 허용 오차 2px는 이번 계획에서 정한 값] |
| 적용 | `style.css`의 `.desk-canvas` `background-image`가 새 파일을 가리키고 `images/GPT_Gen.png` 참조가 CSS에 남지 않는다 |
| 확대 배치 | 1440×900, 390×844에서 확대 뒤 `.window-titlebar`와 `.monitor-scrollable`이 `.monitor-screen` 안에 들어가고 가로 스크롤이 없다 |
| 복귀 | ESC와 `.desk-zoomout-btn` 클릭 뒤 `.desk-viewport`에서 `is-zoomed`가 빠진다 |
| 오류 | 캡처 중 페이지 런타임 예외가 0건이다 |
| 기존 테스트 | `node --test tests/static-site.test.mjs` 통과 |

## 지킬 것

- `script.js`와 홈 HTML 구조는 고치지 않는다. 모니터 위치(`left: 29.49%`, `top: 23.91%`, 폭 40.91%, 높이 39.53%), 확대 중심축(`transform-origin: 49.91% 41.5%`), 배율(`scale(2.22)`), 캔버스 비율 1672/941은 바꾸지 않는다.
- 저장 키(`return_to_monitor` 등)와 화면 요소 클래스 이름은 바꾸지 않는다.
- 기존 `images/GPT_Gen.png`와 시안 폴더 `design/mockups/d-editorial-noir/`의 파일은 지우거나 고치지 않는다.
- 배경 안에는 글자나 UI를 그리지 않는다. 모니터 화면 부분은 종이색 `#faf8f4` 계열로 비워 둔다. 화면 위에는 HTML이 겹쳐지기 때문이다.
- 강조색은 장식용 빨강 `#F22A18`과 검정만 쓴다. 배경 안에는 작은 글자가 없으므로 글자용 짙은 빨강 `#c8102e`는 쓰지 않는다.
- 새 파일은 GitHub Pages에서 그대로 열리는 정적 파일이어야 한다. 외부 글꼴·외부 이미지·스크립트를 SVG 안에 넣지 않는다. 브라우저마다 결과가 달라지지 않도록 SVG 필터는 시안에서 이미 쓴 `feGaussianBlur` 수준으로 제한한다.
- 캡처 검증용 스크립트와 결과는 `.scratch/noir-bg/` 아래에만 만들고 Chrome 임시 프로필은 끝나면 지운다.

## 단계 1. 블랙·레드 배경 파일 제작과 좌표 측정

- 작업: 결정 D1에 따라 배경 파일을 만든다. 공통으로 먼저 `design/mockups/d-editorial-noir/bg-prompt.md`의 구도(종이색 벽, 흰 책상, 검은 모니터와 받침대, 검은 프레임·흰 키캡·빨간 Esc·Enter·프레임 윗선의 키보드, 흰 휠의 검은 마우스, 키보드와 마우스를 함께 받치는 회색 `#BABABA` 장패드, 왼쪽의 검은 테 액자 속 빨간 아치형 추상화, 오른쪽 책 세 권 중 가운데 빨간 표지)와 좌표(책상 뒤쪽 경계 y=705, 앞쪽 경계 y=896, 화면 내부 사각형 x=493.0728, y=224.9931, 폭=684.0152, 높이=371.9773)를 읽는다. 그리고 `design/mockups/d-editorial-noir/desk-bg.svg`를 읽는다.
  - D1=A이면 시안 SVG를 출발점으로 `images/desk-bg-noir.svg`를 새로 만든다. 화면 내부 `<rect x="493.0728" y="224.9931" width="684.0152" height="371.9773">`과 베젤 `<rect x="484" y="216" width="702" height="390">`의 좌표는 그대로 둔다. 세부만 보강한다. 보강 대상은 창빛 띠의 부드러운 그라데이션, 모니터·받침대·키보드·마우스·책·액자 아래의 접지 그림자, 베젤 안쪽 하이라이트, 책 표지 측면 음영, 장패드 가장자리 음영, 벽과 책상 경계의 부드러운 음영이다. 색은 지킬 것의 강조색 규칙을 따른다. 파일 크기는 [가설/임시] 60KB 이하를 목표로 하고, 넘으면 크기와 이유를 보고한다.
  - D1=B이면 TAEKONG님이 bg-prompt.md의 프롬프트로 만든 PNG가 `images/desk-bg-noir.png`에 있는지 먼저 확인한다. 파일이 없으면 아무것도 고치지 않고 `status=question`으로 "생성한 PNG를 `images/desk-bg-noir.png`에 두어 달라"고 보고한 뒤 멈춘다. 파일이 있으면 크기가 1672×941인지 확인한다. 다르면 `status=question`으로 실제 크기를 보고하고 멈춘다. 실행 AI는 PNG의 그림 내용을 다시 그리지 않는다.
  - D1=C이면 `design/mockups/d-editorial-noir/desk-bg.svg`의 내용을 바꾸지 않고 `images/desk-bg-noir.svg`로 복사한다.
- 좌표 측정: `.scratch/noir-bg/measure.mjs`(또는 같은 폴더의 Python 스크립트)를 만들어 화면 내부 사각형의 네 경계를 잰다. SVG는 해당 `<rect>` 속성 값을 읽고, 헤드리스 Chrome으로 1672×941 래스터를 만든 뒤 화면 색(`#faf8f4` 계열)과 베젤 색(`#141414` 계열)의 경계를 행·열 스캔으로 잰다. PNG는 같은 스캔을 그대로 적용한다. 측정 결과를 `.scratch/noir-bg/measure.json`에 encoding="utf-8"로 저장한다. 어느 한 변이라도 기준과 2px보다 크게 어긋나면 D1=A·C에서는 SVG 좌표를 기준값으로 고치고 다시 잰다. D1=B에서는 PNG를 편집하지 않고 `status=question`으로 네 경계의 실제 값과 차이를 보고하고 멈춘다.
- 완료 기준: 배경 파일이 존재하고 크기가 1672×941이며, `measure.json`에 네 경계 차이가 모두 2px 이내로 기록되어 있다. 1672×941 래스터 캡처 `.scratch/noir-bg/bg-raster.png`를 열어 화면 부분에 글자나 UI가 없고 위 소품이 모두 보이는지 확인한다. D1=A이면 `xmllint --noout` 또는 Node의 XML 파서로 SVG 구문을 확인하고, 도구가 없으면 Chrome 래스터가 오류 없이 그려진 것으로 대신하며 그 사실을 보고한다.
- 읽을 파일: design/mockups/d-editorial-noir/bg-prompt.md, design/mockups/d-editorial-noir/desk-bg.svg, design/mockups/d-editorial-noir/style.css, .scratch/noir-remodel/capture.mjs
- 고칠 파일: images/desk-bg-noir.svg, adk/mapping.adesk.md
- 지킬 테스트: tests/static-site.test.mjs
- 난이도: standard
- 선행 단계: 없음

## 단계 2. 홈 배경 교체와 확대·축소 검증, README 정리

- 작업: `style.css` 75~90행의 `.desk-canvas`에서 `background-image: url('images/GPT_Gen.png');`를 단계 1에서 만든 파일(`images/desk-bg-noir.svg` 또는 `images/desk-bg-noir.png`)로 바꾼다. 같은 블록과 177행 근처의 `GPT_Gen.png 기준`·`GPT_Gen.png 측정`·`GPT_Gen.png 속 정밀 모니터 화면 좌표` 주석을 새 파일 이름으로 고치되, 수치는 바꾸지 않는다. 캔버스 밖 여백 색 `--bg-desk`(13행, 현재 `#ebe8e3`)는 새 배경의 벽 아래쪽 색(시안 SVG 기준 `#e8e5e0`)과 눈에 띄게 다를 때만 그 색으로 맞춘다. 바꿨으면 이전 값과 새 값을 보고한다. README 44~49행의 「테마와 배경」 절은 새 배경을 쓴다는 내용으로 고친다. 기존 `GPT_Gen.png`는 보존 파일이라고 적고, 75행 근처 구조도에 새 배경 파일 행을 넣고 `GPT_Gen.png` 설명을 "보존 중인 이전 데스크테리어 배경"으로 바꾼다. 맵에서 `images/GPT_Gen.png` 행 설명을 같은 뜻으로 고치고, 단계 1에서 넣은 새 배경 행과 `style.css`·`README.md` 행을 갱신한다.
- 검증: `.scratch/noir-remodel/capture.mjs`를 `.scratch/noir-bg/capture.mjs`로 복사해 출력 폴더만 `.scratch/noir-bg`로 바꾸고, 홈 축소·확대 캡처, 화면 내부 포함 측정, 가로 넘침, 이메일 복사 알림, ESC, 축소 버튼, 런타임 예외 항목을 그대로 실행한다. 원본 `.scratch/noir-remodel/capture.mjs`는 고치지 않는다. 결과를 `.scratch/noir-bg/results.json`에 저장하고 모든 `passed`가 true인지 확인한다. 이어서 `node --test tests/static-site.test.mjs`를 실행한다. 캡처 `home-desk-1440.png`와 `.scratch/noir-bg/bg-raster.png`를 비교해 배경이 잘리거나 늘어나지 않았는지 눈으로 확인한다.
- 완료 기준: `results.json`의 모든 항목이 통과하고, 1440×900과 390×844의 축소·확대 캡처 네 장에서 새 배경이 보이며, 확대 화면의 타이틀바와 본문이 모니터 화면 안에 있다. `style.css`에 `GPT_Gen.png` 참조가 없고 `node --test tests/static-site.test.mjs`가 통과한다. README와 맵이 실제 파일 경로와 맞는다.
- 읽을 파일: style.css, index.html, README.md, .scratch/noir-remodel/capture.mjs, .scratch/noir-bg/measure.json
- 고칠 파일: style.css, README.md, adk/mapping.adesk.md
- 지킬 테스트: tests/static-site.test.mjs
- 난이도: small
- 선행 단계: 1

## 결정

### D1. 배경 파일을 어떤 방식으로 만드는가

- A. 실행 AI가 시안 SVG를 출발점으로 음영·그림자·하이라이트를 보강한 새 SVG `images/desk-bg-noir.svg`를 만든다 
- 필수

- 선택: A
## 근거

- 현재 홈 배경 참조 위치: `style.css` 83행 `background-image: url('images/GPT_Gen.png');`, 75·88·177행 주석. 다른 HTML·JS에는 `GPT_Gen` 참조가 없다(검색 확인).
- 모니터 좌표·중심축: `style.css` 89행 `transform-origin: 49.91% 41.5%`, 177행 주석의 Left 29.49%, Top 23.91%, Width 40.91%, Height 39.53%. 시안 D `design/mockups/d-editorial-noir/style.css` 40~48행도 같은 값이다.
- 여백 색: `style.css` 13행 `--bg-desk: #ebe8e3;`, 44·72행에서 사용.
- 기존 배경 크기: `images/GPT_Gen.png`는 1672×941 PNG(약 2.1MB). 시안 SVG `design/mockups/d-editorial-noir/desk-bg.svg`는 1672×941 viewBox이며 약 5.8KB이고 화면 내부 `<rect x="493.0728" y="224.9931" width="684.0152" height="371.9773">`을 가진다.
- 재사용할 검증기: `.scratch/noir-remodel/capture.mjs`는 로컬 정적 서버와 헤드리스 Chrome(`C:\Program Files\Google\Chrome\Application\chrome.exe`)으로 1440×900·390×844에서 홈 축소·확대 캡처, `.monitor-screen` 안의 `.window-titlebar`·`.monitor-scrollable` 포함 여부, 가로 넘침, 복사 알림, ESC·축소 버튼 복귀, reduced-motion, 런타임 예외를 측정한다. 서버는 `.svg`·`.png`를 제공한다.
- README 44~49행은 D2=B로 기존 배경을 유지했고 교체 후보 경로 `images/desk-bg-noir.svg`를 아직 만들지 않았다고 적고 있다.
- D1 비교: A는 실행 AI만으로 끝나고 좌표가 정확하며 파일이 작다. 손으로 그린 벡터라 사진 같은 질감은 없다. B는 그림 품질이 가장 높을 수 있지만 TAEKONG님의 생성 작업이 필요하다. 이미지 생성 AI는 좌표를 정확히 맞추지 못하는 경우가 많아 [가설/임시] 측정 단계에서 멈출 수 있다. PNG 용량도 기존처럼 2MB 안팎이 될 수 있다 [가설/임시]. C는 가장 빠르지만 시안 그대로라 그림자·음영이 단순하다.
