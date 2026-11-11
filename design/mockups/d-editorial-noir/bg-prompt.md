# 방향 D 에디토리얼 블랙·레드 배경 재생성 프롬프트

B 에디토리얼안의 구도를 그대로 쓰고 소품 색만 검은색과 빨간색 포인트로 바꾼다.

## 한국어 프롬프트

1672×941 가로 화면에서 낮의 자연광이 드는 밝고 단정한 작업 공간을 정면으로 그린다. 밝은 종이색 벽, 흰 책상, 중앙의 얇은 검은색 모니터와 검은 받침대, 검은 프레임에 흰 키캡을 얹고 Esc·Enter 키와 프레임 윗선만 빨간색인 키보드, 흰 휠이 달린 검은 마우스, 키보드와 마우스를 함께 받치는 모서리가 둥근 회색(#BABABA) 장패드, 왼쪽의 검은 테 액자 속 빨간 아치형 추상화, 오른쪽의 정돈한 책 세 권(가운데 한 권은 빨간 표지)을 배치한다. 여백을 넉넉하게 두고 부드러운 창빛과 강조색은 선명한 빨간색(#F22A18) 한 가지와 검은색만 사용한다. 책상 뒤쪽 경계는 y=705, 상판 앞쪽 경계는 y=896에 둔다. 수평·수직인 모니터 화면의 왼쪽은 전체 폭의 29.49%, 위쪽은 높이의 23.91%, 폭은 전체의 40.91%, 높이는 전체의 39.53%로 맞춘다. 화면은 밝은 종이색으로 비워 둔다. 글자나 UI를 그리지 않는다. 카메라는 기울이지 않고 모니터 화면에 원근 왜곡을 적용하지 않는다. 잡지 지면과 어울리는 간결한 형태와 부드러운 음영으로 표현한다.

## English prompt

Create a bright, tidy workspace in daylight, viewed straight on in a 1672×941 landscape frame. Use a pale paper wall, a white desk, a thin black monitor on a black stand in the center, a keyboard with a black frame, white keycaps, and red accents on the Esc and Enter keys and the top edge of the frame, a black mouse with a white scroll wheel, a rounded gray (#BABABA) desk mat beneath both the keyboard and mouse, a black-framed print with a red arch shape on the left, and three neatly stacked books on the right with the middle one in a red cover. Leave generous negative space, with soft window light and only black and one vivid red accent (#F22A18). Place the rear desk edge at y=705 and its front edge at y=896. Keep the monitor screen perfectly rectangular with horizontal and vertical edges. Its left edge must be at 29.49% of image width, its top edge at 23.91% of image height, its width at 40.91% of image width, and its height at 39.53% of image height. Leave the screen blank in pale paper white, free of text and UI. Keep the camera level with no perspective distortion on the screen. Use simple shapes and soft shading suited to an editorial portfolio.

## 생성 뒤 좌표 확인 방법

생성한 이미지를 1672×941로 열어 모니터 화면 내부의 경계를 측정한다. 기준 사각형은 x=493.0728, y=224.9931, 폭=684.0152, 높이=371.9773 픽셀이다. 오른쪽은 x=1177.0880, 아래쪽은 y=596.9704이다. x와 폭을 1672로, y와 높이를 941로 나누어 29.49%, 23.91%, 40.91%, 39.53%인지 확인한다.

생성한 화면 좌표가 다르면 이미지 편집 도구에서 화면과 베젤을 기준 사각형에 맞추고 `desk-bg.svg`와 겹쳐 확인한다. 시안에 적용한 뒤 1440×900과 390×844에서 모니터를 클릭한다. 확대 중심축 49.91%·41.5%와 배율 2.22에서 타이틀바와 스크롤 본문이 모니터 화면 안에 들어오는지 확인한다. 가로 스크롤 없이 본문을 읽을 수 있어야 하며, ESC와 축소 버튼으로 데스크 화면에 돌아와야 한다.

현재 배경 원본은 직접 작성한 SVG이며, 이 프롬프트는 같은 구도를 이미지 생성 AI로 재생성할 때 사용한다.
