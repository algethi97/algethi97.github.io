# 🖥️ algethi97.github.io | Personal Deskterior Space

> **감각적인 공간과 사용자 경험을 탐구하는 algethi97의 포트폴리오 & 인터랙티브 웹 플랫폼입니다.**  
> 16:9 데스크테리어 캔버스와 종이색·검정·빨강의 에디토리얼 블랙·레드(Editorial Noir) 디자인, 시네마틱 줌인 인터랙션, 실시간 방명록 및 Supabase 연동 웹 퍼즐 게임을 제공합니다.

- **라이브 사이트**: [https://algethi97.github.io](https://algethi97.github.io)
- **최신 버전**: `v1.6.1`

---

## ✨ 핵심 기능 및 페이지 구성

### 1. 🖥️ 메인 데스크테리어 뷰포트 (`index.html`)
- **16:9 비율 데스크테리어 캔버스**: 기존 우드 책상·오렌지 키캡 일러스트 배경(`images/GPT_Gen.png`)을 유지하고, 모니터 안 화면에 블랙·레드 테마를 적용했습니다.
- **시네마틱 모니터 줌인**: 모니터 화면 클릭 시 부드럽게 확대(`scale 2.22`)되며 브라우저 속으로 빨려 들어가는 시네마틱 워프(Warp-in) 전환
- **ESC / 줌아웃 복귀 버튼**: 모니터 뷰에서 전체 방 뷰로 직관적인 전환 가능
- **바로가기 카드 그리드**: 자기소개, 포트폴리오, 만다린 게임, 방명록으로 빠르게 이동할 수 있는 미니멀 카드 섹션

### 2. 👤 자기소개 (`about.html`)
- 공간과 코드를 잇는 시각을 지닌 개발자 스토리
- 보유 기술 스택(Core Stack) 및 협업 철학 소개

### 3. 💼 프로젝트 포트폴리오 (`portfolio.html`)
엄선된 6개의 주요 프로젝트를 01~06 번호 목록으로 소개하며, 각 저장소 및 게임 플레이 링크를 제공합니다:
1. **🌐 Personal Portfolio Website**: HTML5, CSS3, JavaScript만을 활용하여 구현한 데스크테리어 반응형 웹사이트
2. **🛡️ SafeJeonse (세이프전세)**: 공공데이터(실거래가 8종·건축물대장·공시가격) 실시간 교차 검증 및 매물 탐색부터 계약, 거주, 만기·퇴거까지 8 Core Moments 임대차 전 생애주기를 보호하는 청년 주거 안심 통합 플랫폼 (`Python`, `Streamlit`, `SQLite`, `Pandas`, `Folium`, `Plotly`, `OpenAI API`)
3. **🍊 만다린 게임 (Mandarin Puzzle)**: 사과게임(Fruit Box)을 모티브로 제작한 17×10 드래그 웹 퍼즐 게임. Web Audio API 기반 Pop 사운드 신디사이저, 120초 타이머, Supabase Cloud DB 연동 실시간 Top 5 명예의 전당 (`HTML5`, `CSS3`, `JavaScript`, `Web Audio API`, `Supabase`)
4. **⚾ KBO 야구 AI 브리핑 & 구장 기상 분석**: 네이버 스포츠 뉴스 크롤링, OpenAI LLM 심층 보고서 자동 생성, 기상청 API 연동 11개 구장 실시간 기상 및 우천 취소 지수 분석 데스크톱 플랫폼 (`Python`, `pywebview`, `OpenAI API`, `Pandas`)
5. **🏠 NaJakHome - 풀스택 반응형 웹 서비스**: FastAPI & ngrok 기반 풀스택 웹 플랫폼. 비동기 실시간 방명록(SQLite/허니팟), 개인정보 보호 사진 갤러리(EXIF GPS 위치 영구 삭제 & 2048px 리사이징), 원클릭 런처 (`Python`, `FastAPI`, `SQLite`, `Pillow`, `ngrok`)
6. **🌊 Ocean AI Chat - 오션 테마 Streamlit 챗봇**: Streamlit과 OpenAI 최신 모델(GPT-5.6)을 연동한 감성 오션 테마 챗봇. 해수면↔심해 어비스 원클릭 테마 전환, 20개 S자 곡선 상승 기포 파티클, API 키 세션 메모리 전용 격리 보안, SQLite 멀티세션 FIFO 관리 (`Python`, `Streamlit`, `OpenAI API`, `SQLite`, `Glassmorphism`)

### 4. 🍊 만다린 게임 (`game.html`, `game.js`)
- **과일 상자(Fruit Box) 모티브**: 17열 × 10행(총 170개) 감귤 타일에서 드래그한 영역 내 숫자의 합이 **10**이 되면 귤이 터지는 중독성 퍼즐
- **Web Audio API 오디오 신디사이저**: 외부 음원 로딩 지연 없는 브라우저 내장 합성 사운드로 청량한 톡! 터지는 'Pop' 효과음 및 화음 재생 (🔊/🔇 음소거 토글 지원)
- **사이드 Top 5 명예의 전당**: Supabase Cloud DB(`mandarin-game_scores`)와 실시간 연동되어 상위 5위 기록을 실시간 노출
- **5중 보안 체계**: IIFE 스코프 은닉(콘솔 치팅 차단), `textContent` 기반 XSS 원천 차단, 봇 스팸 차단 허니팟 필드, 중복/도배 방지 쿨다운, Supabase RLS 무결성 제약(점수 0~220점 상한, 수정/삭제 원천 차단)

### 5. 📝 실시간 방명록 (`guestbook.html`, `guestbook.js`)
- **Supabase Cloud 연동**: 실시간 방문자 메시지 작성 및 페이징 조회
- **안심 방명록 보안**: 스팸 방지 허니팟(Honeypot), 30초 쿨다운(도배 방지), XSS 방어 처리

---

## 🎨 테마와 배경

- 다섯 페이지는 종이색 `#faf8f4`, 검정 `#111111`, 장식용 빨강 `#f22a18`을 사용합니다. 작은 빨간 글자는 대비를 확보한 짙은 빨강 `#c8102e`를 사용합니다.
- 현재 홈 배경은 승인된 배경 유지 결정(D2=B)에 따라 `images/GPT_Gen.png`를 계속 사용합니다. 게임의 귤 이미지·보드·선택 영역·합계 10 판정 표시는 기존 색을 유지합니다.
- 블랙·레드 배경 시안은 [design/mockups/d-editorial-noir/desk-bg.svg](design/mockups/d-editorial-noir/desk-bg.svg)에 있습니다. 교체 후보 경로인 `images/desk-bg-noir.svg`는 현재 생성하거나 적용하지 않았습니다.
- 배경 재생성 프롬프트와 모니터 좌표 확인 방법은 [design/mockups/d-editorial-noir/bg-prompt.md](design/mockups/d-editorial-noir/bg-prompt.md)에 있습니다.

---

## 📁 프로젝트 구조

```plaintext
algethi97.github.io/
├── index.html                 # 메인 홈 (16:9 데스크테리어 캔버스 & 모니터 뷰)
├── about.html                 # 자기소개 페이지
├── portfolio.html             # 프로젝트 포트폴리오 (01~06 번호 목록)
├── guestbook.html             # 실시간 방명록 페이지
├── game.html                  # 만다린 퍼즐 웹게임 페이지
├── script.js                  # 공통 인터랙션 (데스크 줌인/줌아웃, 시네마틱 워프)
├── common.js                  # Supabase 클라이언트 및 공통 표시 유틸
├── guestbook.js               # 방명록 Supabase 통신 및 렌더링 모듈
├── game.js                    # 만다린 게임 상태 및 생명주기 진입 모듈
├── game/                      # 보드·입력·사운드·랭킹·UI 모듈
├── style.css                  # 종이색·블랙·레드 공통 테마와 줌·반응형 스타일
├── css/                       # 페이지별 스타일시트
├── tests/                     # Node 내장 회귀 테스트
├── pyproject.toml, uv.lock    # Python 프로젝트 및 uv 잠금 파일
├── .python-version, src/      # Python 버전 및 패키지 골격
├── MANDARIN_GAME_PLAN.md      # 만다린 게임 종합 기획/설계 문서
├── design/mockups/d-editorial-noir/ # 블랙·레드 시안과 배경 재생성 프롬프트
├── images/                    # 비주얼 에셋 디렉토리
│   ├── GPT_Gen.png            # 현재 홈에 사용하는 데스크테리어 배경
│   ├── mandarin.png           # 만다린 퍼즐 귤 일러스트
│   └── mandarin_slice_bg.png  # 보존 중인 감귤 이미지
└── README.md                  # 프로젝트 종합 가이드 문서
```

---

## 🛠️ 기술 스택

- **Frontend**: HTML5, CSS3 (Modern Grid, Flexbox, Keyframe Animations), Vanilla JavaScript (ES6+, Web Audio API)
- **Backend / Database**: Supabase Cloud (PostgreSQL, Row Level Security)
- **Hosting / Deploy**: GitHub Pages (자동 배포)

---

## 📜 버전 이력 (Changelog)

### `v1.6.1` (2026-11-09)
- **Refactor**: 공통 유틸리티, 게임 모듈과 페이지별 스타일시트를 분리하고 회귀 테스트를 정리했습니다.
- **Docs**: 프로젝트 구조와 파일 맵을 현재 저장소에 맞췄습니다.

### `v1.6.0` (2026-10-06)
- **Feature**: 포트폴리오 신규 프로젝트 `SafeJeonse (세이프전세)` 추가 및 노출 순서 재정렬
  - `SafeJeonse (세이프전세) - 청년 임대차 전주기 솔루션` 프로젝트 카드 및 저장소 연동 추가
  - 포트폴리오 6개 프로젝트 정렬 순서 조정 (포트폴리오 페이지 ➔ 세이프전세 ➔ 만다린 게임 ➔ KBO 야구 브리핑 ➔ NaJakHome ➔ Ocean AI Chat)
- **Docs**: `README.md` 프로젝트 목록 및 버전 정보 갱신

### `v1.5.0` (2026-09-17)
- **Feature**: 포트폴리오 신규 프로젝트 3종 추가 및 개편
  - `NaJakHome - 풀스택 반응형 웹 서비스` (FastAPI & ngrok) 카드 추가
  - `만다린 게임 (Mandarin Puzzle)` 플레이 연동 카드 추가
  - `Ocean AI Chat - 오션 테마 Streamlit 챗봇` 카드 추가
- **Docs**: `README.md` 프로젝트 종합 가이드 및 아키텍처 명세 구축

### `v1.4.1` (2026-09-16)
- **Style**: 만다린 타일 귤 일러스트 크기 확대(`scale 1.35`) 및 숫자 밸런스(`translateY(5%)`, `1.0rem`) 최적화

### `v1.4.0` (2026-09-16)
- **Feature**: '사과게임' 모티브 만다린 웹 퍼즐 게임(`game.html`, `game.js`) 개발
- **Feature**: Web Audio API 기반 청량한 귤 Pop 효과음 신디사이저 및 음소거 토글 구현
- **Feature**: Supabase Cloud 연동 사이드 Top 5 명예의 전당 실시간 랭킹 시스템 구축
- **Security**: IIFE 스코프 은닉, `textContent` XSS 차단, 봇 허니팟 필드, Supabase RLS 5중 보안 체계 적용
- **UI/UX**: 사이트 전체 상단 4탭 네비게이션 확장 및 홈 화면 바로가기 카드 연동

### `v1.3.1` (2026-09-16)
- **Style**: 모니터 줌인 배율(`scale 2.22`) 및 중심축(`Y 41.5%`) 미세 조정

### `v1.3.0` (2026-09-16)
- **Feature**: Supabase 연동 방명록 페이지 구현 및 RLS·XSS·도배 방지 보안 적용

### `v1.2.1` (2026-09-16)
- **Feature**: 데스크 뷰 줌인 클릭 범위를 모니터 화면으로 한정 및 커서 스타일 개선

### `v1.0.0` (2026-09-15)
- **Launch**: 데스크테리어 웜 미니멀리스트 개인 포트폴리오 웹사이트 최초 릴리즈

