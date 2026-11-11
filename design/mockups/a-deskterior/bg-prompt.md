# 방향 A의 데스크테리어 배경 재생성 프롬프트

## 한국어 프롬프트

1672×941 가로 화면의 따뜻한 저녁 방을 정면에서 본 데스크테리어 일러스트를 그린다. 크림색 회벽과 월넛·웜 우드 책상을 배경으로 하고, 책상 위에는 중앙의 짙은 회갈색 모니터, 아이보리·오렌지 키캡의 작은 키보드와 마우스, 왼쪽의 은은한 크림색 갓 조명, 오른쪽의 테라코타 화분과 잎이 넓은 식물만 정돈해 배치한다. 색은 크림, 꿀빛 나무색, 차분한 올리브와 구운 오렌지를 쓴다. 부드러운 음영과 둥근 윤곽의 따뜻한 일러스트로 표현한다. 카메라는 기울거나 원근 왜곡되지 않으며 모니터 화면은 수평·수직인 직사각형이다. 빈 모니터 화면의 왼쪽은 전체 폭의 29.49%, 위쪽은 전체 높이의 23.91%, 폭은 전체의 40.91%, 높이는 전체의 39.53%로 정확히 맞춘다. 화면에 글자나 UI를 넣지 않고 밝은 크림색으로 비워 둔다. 모니터 오른쪽 책상 위에는 하드커버 책 세 권을 가로로 쌓는다. 위쪽 책은 짙은 회색, 아래 두 권은 크림·베이지 표지와 밝은 종이 단면으로 그린다. 책 더미는 대략 x=1174~1303, y=623~696에 놓고 책 아래 그림자는 y=698을 중심으로 뒤쪽 경계 y=705 위에 둔다. 책상 상판의 뒤쪽 경계는 y=705이며 앞쪽 경계는 y=895이다. 배경을 단순하게 유지하고 책상과 모니터를 중심으로 넉넉하게 여백을 남긴다.

## English prompt

Create a warm, softly shaded deskterior illustration viewed straight on in a 1672×941 landscape frame, set in a quiet room at dusk. Use a cream plaster wall and a warm walnut desk. Arrange a dark taupe monitor in the center, a compact keyboard with ivory and orange keycaps and a mouse below it, a softly glowing cream-shade lamp on the left, and a leafy plant in a terracotta pot on the right. Use cream, honey wood, muted olive, and burnt orange with rounded contours. Keep the camera level and the monitor screen rectangular, with horizontal and vertical edges and no perspective distortion. The empty screen must start at exactly 29.49% of image width and 23.91% of image height, measuring 40.91% of image width and 39.53% of image height. Fill the screen with pale cream and leave it free of text or UI. On the desk just to the right of the monitor, stack three hardcover books horizontally. Use a dark gray cover for the top book and cream and beige covers with visible pale page edges below. Place the stack approximately at x=1174–1303 and y=623–696, with its shadow centered at y=698 above the rear boundary at y=705. Place the desk's rear edge at y=705 and its front edge at y=895. Keep the composition uncluttered and leave generous wall space around the monitor.

## 생성 뒤 좌표 확인 방법

생성한 이미지를 이미지 편집 도구에서 1672×941 크기로 열고, 모니터의 화면 내부 경계를 측정한다. 기준 사각형은 왼쪽 x=493.0728, 위쪽 y=224.9931, 폭=684.0152, 높이=371.9773 픽셀이다. 오른쪽 경계는 x=1177.0880이고 아래쪽 경계는 y=596.9704이다. 좌표를 전체 폭과 높이로 나누어 각각 29.49%, 23.91%, 40.91%, 39.53%인지 확인한다.

생성 도구가 좌표를 정확하게 재현하지 못하면 이미지 편집 도구에서 모니터의 빈 화면과 베젤을 기준 사각형에 맞추어 보정한다. 현재 시안의 `desk-bg.svg`와 같은 구도로 겹쳐 비교한다. 시안에 적용한 뒤 1440×900과 390×844에서 모니터를 클릭하고, 2.22배 확대 및 중심축 49.91%·41.5% 상태에서 타이틀바와 스크롤 본문이 모니터 화면 경계 안에 들어오는지 확인한다. ESC와 축소 버튼으로 복귀하고 하드커버 책 세 권과 y=705 위의 그림자가 오른쪽 책상에 보이는지도 확인한다.

현재 시안의 배경은 직접 작성한 SVG이다. 위 프롬프트를 사용한 래스터 이미지 재생성은 이번 단계의 산출물에 포함되지 않는다.

