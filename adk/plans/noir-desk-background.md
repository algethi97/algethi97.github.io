# 블랙·레드 실사풍 홈 배경 제작과 적용

## 현재 문제

홈은 블랙·레드 테마로 바뀌었지만 배경은 우드 책상과 오렌지 키캡이 있는 기존 실사풍 그림 `images/GPT_Gen.png`를 그대로 쓴다. 그래서 모니터 안 화면은 종이색·검정·빨강인데 모니터 밖 책상은 따뜻한 나무색이라 색이 어긋난다. 직전 실행(커밋 3a5280d)에서 만든 `images/desk-bg-noir.svg`는 좌표는 정확하지만 손으로 그린 평면 벡터 일러스트라서, TAEKONG님이 원한 `GPT_Gen.png` 같은 사진에 가까운 실사풍 질감(나무결·벽 질감·자연광 그림자·사실적인 소품)이 없다. 그래서 배경 파일을 실사풍 PNG로 다시 만들어야 한다. TAEKONG님이 2026-11-11 대화에서 정한 기준에 따라, 새 PNG의 구도와 소품은 `images/desk-bg-noir.svg`(종이색 벽, 흰 책상, 검은 모니터, 회색 장패드 위 검은 프레임·흰 키캡·빨간 포인트 키보드와 검은 마우스, 왼쪽 검은 테 액자 속 빨간 아치, 오른쪽 책 세 권 중 가운데 빨간 표지)를 따르고, 프롬프트는 그 SVG를 만들 때 쓴 `design/mockups/d-editorial-noir/bg-prompt.md`를 실사풍으로 바꿔 쓴다. `GPT_Gen.png`는 "실사 질감" 수준의 참고일 뿐 구도·소품 기준이 아니다.

## 수정할 것

1. 결정 D1의 방식으로 1672×941 실사풍 블랙·레드 배경 `images/desk-bg-noir.png`를 만든다.
2. 새 PNG의 모니터 화면 내부 사각형이 기존 좌표(x=493.0728, y=224.9931, 폭=684.0152, 높이=371.9773)와 각 변 2px 이내로 맞는지 재고, 어긋나면 정해진 범위 안에서만 전체 이미지를 이동·확대해 맞춘다.
3. 홈 캔버스(`style.css`의 `.desk-canvas`)가 새 PNG를 쓰도록 바꾸고, 관련 주석과 README·맵을 고친다.
4. 1440×900과 390×844에서 축소·확대·ESC·축소 버튼 복귀를 캡처와 측정으로 확인한다.

## 기대 효과

- 홈 첫 화면이 지금과 같은 사진 같은 질감을 유지하면서 `desk-bg-noir.svg`와 같은 구도(종이색 벽, 흰 책상, 검은 모니터, 빨간 포인트 소품)로 바뀌어 모니터 안 화면과 색이 맞는다.
- 모니터 화면 좌표, 확대 중심축, 배율이 그대로라 확대했을 때 화면이 모니터 안에 정확히 들어가는 기존 동작이 유지된다.

## 완료 기준

| 확인 | 방법 |
| --- | --- |
| 배경 파일 | `images/desk-bg-noir.png`가 있고 크기가 1672×941이다 |
| 실사풍 | `.scratch/noir-bg/bg-raster.png`(=최종 PNG 사본)를 열어 나무결 또는 표면 질감, 자연광 그림자, 사실적인 소품이 보이고 평면 벡터 그림처럼 보이지 않는지, 그리고 소품 구성이 `desk-bg-noir.svg`(`.scratch/noir-bg/bg-raster-svg.png`로 보존한 SVG 래스터)와 같은지 눈으로 확인한다. 판단이 애매하면 `status=question`으로 캡처 경로를 보고한다 |
| 화면 좌표 | 화면 내부 사각형 네 경계가 left=493.0728, top=224.9931, right=1177.0880, bottom=596.9704 픽셀과 각 변 2px 이내로 맞는다 [가설/임시: 허용 오차 2px는 이번 계획에서 정한 값] |
| 적용 | `style.css`의 `.desk-canvas` `background-image`가 `images/desk-bg-noir.png`를 가리키고 `images/GPT_Gen.png` 참조가 CSS에 남지 않는다 |
| 확대 배치 | 1440×900, 390×844에서 확대 뒤 `.window-titlebar`와 `.monitor-scrollable`이 `.monitor-screen` 안에 들어가고 가로 스크롤이 없다 |
| 복귀 | ESC와 `.desk-zoomout-btn` 클릭 뒤 `.desk-viewport`에서 `is-zoomed`가 빠진다 |
| 오류 | 캡처 중 페이지 런타임 예외가 0건이다 |
| 기존 테스트 | `node --test tests/static-site.test.mjs` 통과 |

## 지킬 것

- `script.js`와 홈 HTML 구조는 고치지 않는다. 모니터 위치(`left: 29.49%`, `top: 23.91%`, 폭 40.91%, 높이 39.53%), 확대 중심축(`transform-origin: 49.91% 41.5%`), 배율(`scale(2.22)`), 캔버스 비율 1672/941은 바꾸지 않는다.
- 저장 키(`return_to_monitor` 등)와 화면 요소 클래스 이름은 바꾸지 않는다.
- 기존 `images/GPT_Gen.png`, 시안 폴더 `design/mockups/d-editorial-noir/`의 파일, 직전 실행에서 만든 `images/desk-bg-noir.svg`는 지우거나 고치지 않는다. SVG는 미사용 벡터 시안으로 남긴다.
- 배경 안에는 글자나 UI를 그리지 않는다. 모니터 화면 부분은 밝은 종이색 계열(`#faf8f4` 근처)로 비어 있어야 한다. 화면 위에는 HTML이 겹쳐지기 때문이다.
- 강조색은 빨강(`#F22A18` 계열)과 검정만 쓴다. 오렌지·주황 계열 소품이 남으면 실패로 본다.
- 실행 AI는 실사 그림의 내용을 새로 그리지 않는다. 허용되는 이미지 처리는 D1에 적힌 처리(전체 이동·균일 확대·자르기, 또는 D1=B의 색 변환)뿐이다.
- 이미지 처리와 측정은 Python 이미지 라이브러리가 없으므로(ADesk Python·시스템 Python 모두 PIL 없음 확인) Node와 헤드리스 Chrome(`C:\Program Files\Google\Chrome\Application\chrome.exe`)의 canvas로 한다. 새 패키지를 설치하지 않는다.
- 캡처·처리 스크립트와 결과는 `.scratch/noir-bg/` 아래에만 만들고 Chrome 임시 프로필은 끝나면 지운다. 기존 `.scratch/noir-bg/measure.mjs`와 `.scratch/noir-remodel/capture.mjs`는 고치지 않고 복사해 쓴다.
- PNG 용량은 기존 `GPT_Gen.png`(약 2.1MB) 수준을 허용한다. 3MB를 넘으면 크기를 보고만 하고 실패로 보지 않는다 [가설/임시].

## 단계 1. 실사풍 블랙·레드 PNG 준비와 화면 좌표 맞춤

- 작업: 가장 먼저 기존 SVG 래스터 `.scratch/noir-bg/bg-raster.png`를 `.scratch/noir-bg/bg-raster-svg.png`로 복사해 보존한다(이후 `bg-raster.png`는 최종 PNG 사본으로 덮어쓰기 때문이다). 이미 `bg-raster-svg.png`가 있으면 덮어쓰지 않는다. 그다음 `## 근거`의 좌표와 `.scratch/noir-bg/measure.mjs`의 Chrome 실행·래스터 스캔 방식(화면 축의 25%·50%·75% 지점에서 종이색과 베젤색 중 가까운 색으로 분류해 경계를 찾는 방식)을 읽는다. 그다음 결정 D1에 따라 진행한다.
  - D1=A이면 TAEKONG님이 이미지 생성 AI로 만든 원본이 `images/desk-bg-noir-source.png`에 있는지 확인한다. 없으면 아무것도 고치지 않고 `status=question`으로 "`## 근거`의 프롬프트로 만든 실사 이미지를 `images/desk-bg-noir-source.png`에 두어 달라"고 보고한 뒤 멈춘다. 있으면 원본은 고치지 않고 `.scratch/noir-bg/fit.mjs`를 만들어 다음을 한다. (1) 원본을 Chrome canvas에 1672×941로 균일 비율 맞춤(가로세로 비율이 다르면 가운데 기준으로 자름)한다. (2) 화면 내부 네 경계를 measure.mjs와 같은 스캔으로 잰다. 단 실사 이미지라 화면색이 정확히 `#faf8f4`가 아니므로, 화면 중심 픽셀 주변 평균색을 화면색으로, 화면 경계 바깥 6px 지점 평균색을 베젤색으로 삼아 분류한다. (3) 네 변이 모두 2px 이내면 그대로 `images/desk-bg-noir.png`로 저장한다. (4) 어긋나면 가로 배율 sx=684.0152/측정폭, 세로 배율 sy=371.9773/측정높이를 구한다. |sx−sy|/sx가 1% 이하이고 두 배율이 0.95~1.08 범위이면 평균 배율로 균일 확대하고 화면 왼쪽 위가 (493.0728, 224.9931)에 오도록 이동해 1672×941로 다시 그린다. 이때 캔버스 가장자리에 원본이 덮지 못한 빈 영역이 생기면 안 된다. 빈 영역이 생기거나 배율 조건을 벗어나면 PNG를 저장하지 않고 `status=question`으로 측정 경계·배율·빈 영역 크기를 보고하고 멈춘다. (5) 화면이 기울었거나(좌우 높이 차 3px 초과) 화면 안에 글자·UI가 보이면 저장하지 않고 `status=question`으로 보고한다.
  - D1=B이면 `.scratch/noir-bg/recolor.mjs`를 만들어 `images/GPT_Gen.png`를 Chrome canvas에 그린 뒤 픽셀 색만 바꿔 `images/desk-bg-noir.png`로 저장한다. 원본 구도와 좌표는 그대로라 이동·확대는 하지 않는다. 색 변환 기준은 다음과 같다. 벽(밝고 따뜻한 베이지)은 채도를 크게 낮춰 밝은 종이색(`#ece9e4` 근처)으로, 나무 책상·선반·액자 테·펜꽂이(채도 있는 갈색, 명도 중간 이하)는 채도를 낮추고 어둡게 해 짙은 차콜·검정 계열로, 키보드 오렌지 키캡(채도 높은 주황)은 색상만 빨강 `#F22A18` 계열로 옮긴다. 화면 내부 사각형 안쪽은 바꾸지 않거나 종이색으로 맞춘다. 명암(밝기 차이)은 유지해 나무결·그림자 질감이 남게 한다. 결과에 갈색·주황 얼룩, 띠 모양 경계, 색 번짐이 눈에 띄면 기준을 한 번 조정한다. 두 번째에도 눈에 띄면 `status=question`으로 캡처 경로와 문제 부위를 보고하고 멈춘다.
- 좌표 측정: 공통으로 `.scratch/noir-bg/measure.mjs`를 `.scratch/noir-bg/measure-png.mjs`로 복사해 원본 경로를 `images/desk-bg-noir.png`로 바꾸고 SVG 전용 검사(`<rect>` 속성·베젤 좌표·XML 파싱·필터 검사)는 빼며, 위 (2)의 실사용 색 분류를 쓴다. 최종 PNG의 크기와 네 경계를 재 `.scratch/noir-bg/measure-png.json`에 encoding="utf-8"로 저장하고, 최종 PNG 사본을 `.scratch/noir-bg/bg-raster.png`로 덮어쓴다. 기존 `measure.json`은 SVG 기록이므로 그대로 둔다.
- 완료 기준: `images/desk-bg-noir.png`가 1672×941이고, `measure-png.json`에 네 경계 차이가 모두 2px 이내로 기록되어 있다. `bg-raster.png`를 열어 실사풍 질감이 있고, `bg-raster-svg.png`와 소품 구성·배치가 같으며(액자·책·키보드·마우스·장패드의 위치가 크게 다르면 `status=question`으로 보고), 화면 부분에 글자·UI가 없고, 오렌지·주황이 남지 않았으며, 강조색이 빨강과 검정뿐인지 확인한다. `GPT_Gen.png`와 `desk-bg-noir.svg`의 SHA256이 작업 전과 같다. `node --test tests/static-site.test.mjs`가 통과한다.
- 읽을 파일: .scratch/noir-bg/measure.mjs, .scratch/noir-bg/measure.json, design/mockups/d-editorial-noir/bg-prompt.md, images/desk-bg-noir.svg, .scratch/noir-bg/bg-raster.png
- 고칠 파일: images/desk-bg-noir.png, adk/mapping.adesk.md
- 지킬 테스트: tests/static-site.test.mjs
- 난이도: standard
- 선행 단계: 없음

## 단계 2. 홈 배경 교체와 확대·축소 검증, README 정리

- 작업: `style.css` 75~90행의 `.desk-canvas`에서 `background-image: url('images/GPT_Gen.png');`를 `url('images/desk-bg-noir.png')`로 바꾼다. 같은 블록과 177행 근처의 `GPT_Gen.png 기준`·`GPT_Gen.png 측정`·`GPT_Gen.png 속 정밀 모니터 화면 좌표` 주석을 새 파일 이름으로 고치되, 수치는 바꾸지 않는다. 캔버스 밖 여백 색 `--bg-desk`(13행, 현재 `#ebe8e3`)는 새 PNG의 맨 아래 가장자리 평균색과 눈에 띄게 다를 때만 그 색으로 맞추고, 바꿨으면 이전 값과 새 값을 보고한다. README 14행의 기능 설명과 44~49행의 「테마와 배경」 절을 실사풍 블랙·레드 배경 `images/desk-bg-noir.png`를 쓴다는 내용으로 고친다. 기존 `GPT_Gen.png`는 보존 중인 이전 데스크테리어 배경, `desk-bg-noir.svg`는 미사용 벡터 시안이라고 적는다. 75행 근처 구조도에 `desk-bg-noir.png` 행을 넣고 `GPT_Gen.png` 설명을 "보존 중인 이전 데스크테리어 배경"으로 바꾼다. D1=A였다면 `desk-bg-noir-source.png`도 "생성 원본"으로 구조도에 넣는다. 맵에서 `images/GPT_Gen.png` 행을 같은 뜻으로, `images/desk-bg-noir.svg` 행을 "미사용 벡터 시안"으로 고치고 `style.css`·`README.md` 행을 갱신한다.
- 검증: `.scratch/noir-remodel/capture.mjs`를 `.scratch/noir-bg/capture.mjs`로 복사해 출력 폴더만 `.scratch/noir-bg`로 바꾸고, 홈 축소·확대 캡처, 화면 내부 포함 측정, 가로 넘침, 이메일 복사 알림, ESC, 축소 버튼, 런타임 예외 항목을 그대로 실행한다. 원본 `.scratch/noir-remodel/capture.mjs`는 고치지 않는다. 결과를 `.scratch/noir-bg/results.json`에 저장하고 모든 `passed`가 true인지 확인한다. 이어서 `node --test tests/static-site.test.mjs`를 실행한다. 캡처 `home-desk-1440.png`와 `.scratch/noir-bg/bg-raster.png`를 비교해 배경이 잘리거나 늘어나지 않았는지, 확대 화면의 HTML 화면 가장자리가 PNG 속 베젤 안쪽과 어긋나 보이지 않는지 눈으로 확인한다.
- 완료 기준: `results.json`의 모든 항목이 통과하고, 1440×900과 390×844의 축소·확대 캡처 네 장에서 새 실사풍 배경이 보이며, 확대 화면의 타이틀바와 본문이 모니터 화면 안에 있다. `style.css`에 `GPT_Gen.png` 참조가 없고 `node --test tests/static-site.test.mjs`가 통과한다. README와 맵이 실제 파일 경로와 맞는다.
- 읽을 파일: style.css, index.html, README.md, .scratch/noir-remodel/capture.mjs, .scratch/noir-bg/measure-png.json
- 고칠 파일: style.css, README.md, adk/mapping.adesk.md
- 지킬 테스트: tests/static-site.test.mjs
- 난이도: small
- 선행 단계: 1

## 결정

### D1. 실사풍 PNG를 어떤 방식으로 만드는가

- A. TAEKONG님이 `images/desk-bg-noir.svg`의 래스터(`.scratch/noir-bg/bg-raster.png`, 1단계 시작 뒤에는 `bg-raster-svg.png`)를 이미지 생성 AI(예: ChatGPT 이미지 편집)에 첨부하고 `## 근거`의 프롬프트(`bg-prompt.md`의 실사풍판)로 같은 구도의 블랙·레드 실사 이미지를 만들어 `images/desk-bg-noir-source.png`에 둔다. 실행 AI는 크기 맞춤·좌표 측정·허용 범위 내 이동·확대만 한다 
- 필수

- 선택: A
## 근거

- 직전 결과: 커밋 3a5280d의 `images/desk-bg-noir.svg`(9,433바이트)는 화면 경계 오차 0.088px로 좌표는 맞지만 평면 벡터 일러스트다. TAEKONG님이 2026-11-11 대화에서 `GPT_Gen.png` 같은 실사풍을 원한다고 했다.
- 기존 실사 배경 `images/GPT_Gen.png`: 1672×941, 약 2.1MB. 구도는 왼쪽 화분·나무 액자 두 개, 중앙 검은 모니터와 은색 받침대, 짙은 펠트 장패드 위 오렌지 포인트 키보드와 검은 마우스, 오른쪽 나무 펜꽂이·책 더미, 오른쪽 위 나무 선반과 카메라·덩굴 화분, 왼쪽 위 창빛 그림자, 짙은 나무 책상이다(이미지 열람 확인).
- 이미지 처리 도구: ADesk Python(`runtime/python.exe`)과 시스템 Python 모두 `import PIL` 실패를 확인했다. `.scratch/noir-bg/measure.mjs`는 Node에서 Chrome을 CDP로 띄워 canvas로 PNG를 읽고 화면 경계를 스캔하며, 끝나면 `.scratch/noir-bg/chrome-profile-*` 임시 프로필을 지운다.
- 현재 홈 배경 참조 위치: `style.css` 83행 `background-image: url('images/GPT_Gen.png');`, 75·88·177행 주석. README 14·47·48·75행이 배경을 설명한다.
- 모니터 좌표·중심축: `style.css` 89행 `transform-origin: 49.91% 41.5%`, 177행 주석의 Left 29.49%, Top 23.91%, Width 40.91%, Height 39.53%. 픽셀 기준 화면 내부 사각형은 x=493.0728, y=224.9931, 폭=684.0152, 높이=371.9773(오른쪽 1177.0880, 아래 596.9704)이다.
- 재사용할 검증기: `.scratch/noir-remodel/capture.mjs`는 1440×900·390×844에서 홈 축소·확대 캡처, `.monitor-screen` 안의 `.window-titlebar`·`.monitor-scrollable` 포함 여부, 가로 넘침, 복사 알림, ESC·축소 버튼 복귀, 런타임 예외를 측정한다.
- D1 비교: A는 새 사진 수준 품질과 블랙·레드 소품(검은 테 액자의 빨간 그림, 빨간 표지 책 등)을 얻을 수 있다. 원본을 첨부해 편집하면 구도가 유지될 가능성이 높지만 생성 AI가 화면 위치를 몇 픽셀~수십 픽셀 옮길 수 있어 [가설/임시] 1단계가 질문으로 멈추고 재생성이 필요할 수 있다. B는 좌표 오차가 0이고 사람 작업이 없지만, 구도와 소품이 기존 그대로이고 같은 색상대(벽 베이지와 나무 갈색)를 밝기로만 구분하므로 경계가 어색할 수 있다 [가설/임시].
- 구도 기준(2026-11-11 TAEKONG님 지정): `images/desk-bg-noir.svg`가 생성할 이미지의 근거이고, `design/mockups/d-editorial-noir/bg-prompt.md`는 그 그림을 만들 때 쓴 프롬프트다. bg-prompt.md는 "간결한 형태와 부드러운 음영"을 요구해 평면 그림이 나오므로, 아래 프롬프트는 그 구도·색·좌표 문장을 그대로 두고 표현 문장만 실사 사진풍으로 바꾼 것이다. 이미지 생성 AI는 SVG를 첨부할 수 없는 경우가 많아 Chrome 래스터 PNG(`.scratch/noir-bg/bg-raster.png`, 1672×941)를 첨부한다.
- D1=A용 프롬프트(SVG 래스터를 첨부한 이미지 편집 요청):
  - 한국어: "첨부한 그림을 같은 카메라 위치, 구도, 해상도(1672×941)로 실사 사진처럼 다시 만들어 주세요. 모니터 위치와 크기, 소품의 위치와 크기는 정확히 그대로 둡니다. 낮의 자연광이 드는 밝고 단정한 작업 공간을 정면에서 찍은 사진입니다. 밝은 종이색 벽(미세한 벽 질감), 흰 책상(사실적인 상판 질감과 접지 그림자), 중앙의 얇은 검은색 모니터와 검은 받침대, 검은 프레임에 흰 키캡을 얹고 Esc·Enter 키와 프레임 윗선만 빨간색인 키보드, 흰 휠이 달린 검은 마우스, 키보드와 마우스를 함께 받치는 모서리가 둥근 회색 펠트 장패드, 왼쪽의 검은 테 액자 속 빨간 아치형 추상화, 오른쪽의 정돈한 책 세 권(가운데 한 권은 빨간 표지)을 그대로 배치합니다. 왼쪽 위에서 들어오는 부드러운 창빛과 그림자, 사실적인 재질과 반사를 넣어 주세요. 강조색은 선명한 빨간색(#F22A18) 한 가지와 검은색만 사용하고 나무색·주황색은 쓰지 않습니다. 모니터 화면은 수평·수직인 직사각형으로, 글자나 UI 없이 밝은 종이색으로 비워 둡니다. 카메라는 기울이지 않고 화면에 원근 왜곡을 넣지 않습니다. 일러스트나 벡터 그림 느낌이 아닌 실제 사진처럼 만들어 주세요."
  - English: "Recreate the attached image as a photorealistic photograph with the same camera position, composition, and 1672×941 resolution. Keep the monitor and every prop at exactly the same position and size. It is a straight-on photo of a bright, tidy workspace in daylight: a pale paper-white wall with subtle texture, a white desk with a realistic surface and contact shadows, a thin black monitor on a black stand in the center, a keyboard with a black frame, white keycaps, and red accents only on the Esc and Enter keys and the top edge of the frame, a black mouse with a white scroll wheel, a rounded gray felt desk mat beneath both, a black-framed print with a red arch shape on the left, and three neatly stacked books on the right with the middle one in a red cover. Add soft window light from the upper left with natural shadows, realistic materials, and reflections. Use only one vivid red (#F22A18) and black as accents, with no wood or orange tones. Keep the monitor screen a perfectly rectangular, level, blank pale paper-white area with no text or UI and no perspective distortion. It must look like a real photograph, not an illustration or vector graphic."
