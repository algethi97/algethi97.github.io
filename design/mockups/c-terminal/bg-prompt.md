# 방향 C 터미널 배경 재생성 프롬프트

## 한국어 프롬프트

1672×941 가로 화면에 밤의 개발자 작업 공간을 정면으로 그린다. 짙은 남색 벽과 어두운 책상, 중앙 모니터의 부드러운 민트색 빛, 민트색 백라이트 키보드와 마우스, 왼쪽의 컵과 작은 책 선반, 오른쪽의 달빛이 드는 창과 책 두 권을 배치한다. 책상 뒤쪽 경계는 y=705, 앞쪽 경계는 y=896에 둔다. 화면을 기울이지 않고 수평·수직 직사각형으로 유지한다. 모니터 화면의 왼쪽은 전체 폭의 29.49%, 위쪽은 높이의 23.91%, 폭은 전체의 40.91%, 높이는 전체의 39.53%로 맞춘다. 화면은 #0c141e의 짙은 남색으로 비워 둔다. 글자나 UI를 그리지 않는다. 낮은 주변 조명과 절제된 청록빛 반사를 표현하고 간결한 형태와 음영으로 구성한다.

## English prompt

Create a developer workspace at night, viewed straight on in a 1672×941 landscape frame. Use deep navy walls and a dark desk, a central monitor with a soft mint glow, a mint-backlit keyboard and mouse, a cup and small bookshelf on the left, and a moonlit window and two books on the right. Place the rear desk edge at y=705 and front edge at y=896. Keep the monitor screen perfectly rectangular, with horizontal and vertical edges and no perspective distortion. Its left edge must be at 29.49% of image width, top edge at 23.91% of image height, width at 40.91% of image width, and height at 39.53% of image height. Leave the screen blank in deep navy #0c141e, free of text and UI. Use dim ambient lighting, restrained cyan reflections, simple shapes and soft shading.

## 생성 뒤 좌표 확인 방법

생성한 이미지를 1672×941로 열어 모니터 화면 내부 경계를 측정한다. 기준 사각형은 x=493.0728, y=224.9931, 폭=684.0152, 높이=371.9773 픽셀이다. 오른쪽은 x=1177.0880, 아래쪽은 y=596.9704이다. x와 폭을 1672로, y와 높이를 941로 나누어 29.49%, 23.91%, 40.91%, 39.53%인지 확인한다.

화면 좌표가 다르면 이미지 편집 도구에서 화면과 베젤을 기준 사각형에 맞추고 `desk-bg.svg`와 겹쳐 확인한다. 적용 뒤 1440×900과 390×844에서 모니터를 클릭하고 확대 중심축 49.91%·41.5%와 배율 2.22를 확인한다. 타이틀바와 스크롤 본문은 모니터 화면 안에 들어가야 하며 가로 스크롤 없이 읽을 수 있어야 한다. ESC와 축소 버튼으로 데스크 화면에 돌아오는지 확인한다.

현재 배경 원본은 직접 작성한 SVG이며, 이 프롬프트는 같은 구도를 이미지 생성 AI로 재생성할 때 사용한다.
