# 🌾 FISA-Agri-Pay · Front-end-admin

> 농업 데이터 기반 **BNPL(Buy Now, Pay Later) 플랫폼**의 관리자(Admin) 전용 프론트엔드 웹 애플리케이션입니다.
> 농업인의 신용 한도 심사, 농자재 상품 관리, 사용자들의 BNPL 결제 및 상환/연체 현황 모니터링 기능을 제공하며, AIOps와 연동되는 관리자 Copilot 기능을 통해 운영 효율성을 높입니다.

![React](https://img.shields.io/badge/React-20232A?style=flat-square&logo=react&logoColor=61DAFB)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat-square&logo=css3&logoColor=white)

---

## 목차

- [프로젝트 개요](#overview)
- [핵심 기능 및 화면 구성](#features)
  - [대시보드 (Dashboard)](#dashboard)
  - [신용 심사 관리 (Limit Review)](#limit)
  - [농자재 상품 관리 (Product)](#product)
  - [주문 및 배송 관리 (Order)](#order)
  - [BNPL 원장 및 현황 (BNPL Ledger)](#bnpl)
  - [관리자 Copilot (Admin Copilot)](#copilot)
- [기술 스택](#tech-stack)
- [디렉터리 구조](#directory)
- [관련 레포지토리](#repositories)

---

<a id="overview"></a>

## 📌 프로젝트 개요

FISA-Agri-Pay 관리자용 프론트엔드는 일반 사용자 웹(`front-end`)과 분리되어, **플랫폼 관리 및 운영**에 특화된 기능을 제공합니다. 

단일 페이지 애플리케이션(SPA)으로 구성되어 있으며, 백엔드의 `service-admin` 모듈(CQRS 기반 조회 최적화 적용) 및 `mcp-aiops-backend` 와 연동되어 대량의 심사/결제 데이터를 효율적으로 렌더링하고 모니터링합니다.

### 핵심 목표

* 한도 신청 내역 확인 및 승인/반려 프로세스 제공
* BNPL 결제 건에 대한 전체 주문 및 배송 상태 추적
* 외상 이용 원장, 자동 상환, 연체 발생 건에 대한 종합 모니터링
* 대규모 카탈로그(농자재 상품) 관리 및 등록
* 챗봇을 통한 운영 보조 및 편의성 강화

---

<a id="features"></a>

## 🔍 핵심 기능 및 화면 구성

<a id="dashboard"></a>

### 1. 대시보드 (Dashboard)

<img width="1267" height="582" alt="1 대시보드" src="https://github.com/user-attachments/assets/bddde934-bdca-4fde-b9bd-bf5cda1e99ad" />

관리자가 접속 시 가장 먼저 확인하는 메인 화면으로, 플랫폼의 전반적인 운영 상태를 요약하여 보여줍니다.

* **Stat Cards**: 총 가입자 수, 누적 결제액, 연체율 등 핵심 지표 요약
* **Revenue Chart**: 기간별 매출/외상 결제 추이 시각화
* **Action Tasks**: 신규 심사 요청, 미처리 주문 등 관리자의 즉각적인 조치가 필요한 작업 알림
* **Recent Orders**: 최근 접수된 BNPL 결제 주문 내역

<a id="limit"></a>

### 2. 신용 심사 관리 (Limit Review)

<img width="1267" height="577" alt="2 한도관리" src="https://github.com/user-attachments/assets/b4305875-4174-48c8-8ab9-ad2e463c6ea2" />

농업인이 대안신용평가를 통해 신청한 한도 심사 내역을 관리합니다.

* 농지 면적, 작물 종류, 보험 가입 여부 등 심사 기반 데이터 조회
* AI 예측 모델이 산정한 권장 한도 확인
* 관리자 권한으로 최종 한도 **승인** 또는 **반려** 처리

<a id="product"></a>

### 3. 농자재 상품 관리 (Product)

<img width="1628" height="505" alt="3 농자재상품관리" src="https://github.com/user-attachments/assets/9eb12051-c2b3-4340-a6b1-23403e61e43b" />

BNPL 결제로 구매할 수 있는 농자재 카탈로그를 관리합니다.

* **상품 목록 (Product List)**: 카테고리별 상품 필터링 및 리스트 조회
* **상품 등록/수정 (Product Form)**: 신규 농자재 상품의 상세 정보, 가격, 재고 등록

<a id="order"></a>

### 4. 주문 및 배송 관리 (Order)

<img width="1197" height="537" alt="4 주문및배송관리" src="https://github.com/user-attachments/assets/3eae62d6-0424-4590-a562-9ccc3ddc1d6a" />

사용자가 승인된 한도 내에서 결제한 주문 건의 상태를 관리합니다.

* 결제 완료된 주문 내역 확인
* 주문 상태(결제완료, 배송준비중, 배송중, 배송완료 등) 변경 및 추적

<a id="bnpl"></a>

### 5. BNPL 원장 및 현황 (BNPL Ledger)

<img width="1272" height="575" alt="5 BNPL원장및현황" src="https://github.com/user-attachments/assets/f017d39b-e1c0-40af-87e6-0c85e4e2ea8a" />

플랫폼의 핵심인 외상 결제 대금과 상환 상태를 모니터링합니다.

* **사용 내역 (Usage Table)**: 개별 농가의 한도 사용 금액, 잔여 한도 조회
* **상태 관리 (Status Page)**: 납부 예정일, 정상 상환 건, 연체 상태 파악
* **요약 통계 (Summary Cards)**: 전체 미수금 및 연체 대금 규모 확인

<a id="copilot"></a>

### 6. 관리자 챗봇(Admin Chatbot)

<img width="1197" height="542" alt="6 관리자챗봇" src="https://github.com/user-attachments/assets/82096469-5433-4a00-b819-a2f63a30e9bb" />

내부 LLM Agent(`mcp-aiops-backend`)와 연동하여 관리자의 플랫폼 운영을 보조하는 대화형 인터페이스입니다.

* 자연어 쿼리를 통한 주요 운영 데이터 검색 지원
* 시스템 상태 및 비정상 지표 감지 시 보조 역할 수행

---

<a id="tech-stack"></a>

## 🛠️ 기술 스택

| 영역 | 스택 |
| --- | --- |
| Library | React 19, React DOM |
| Styling | Vanilla CSS |
| Testing | React Testing Library, Jest |
| Build Tool | Create React App (react-scripts) |

---

<a id="directory"></a>

## 📂 디렉터리 구조

```text
front-end-admin/
├─ public/               # 정적 파일 (index.html, favicon 등)
├─ src/
│  ├─ api/               # 백엔드 API 통신 유틸리티
│  ├─ components/
│  │  ├─ auth/           # 관리자 로그인/인증
│  │  ├─ bnpl/           # BNPL 현황, 필터, 내역 테이블
│  │  ├─ copilot/        # 관리자 Copilot 인터페이스
│  │  ├─ dashboard/      # 메인 대시보드 차트 및 지표
│  │  ├─ limit/          # 신용 한도 심사 상세 조회
│  │  ├─ order/          # 주문 및 배송 관리
│  │  ├─ product/        # 상품 등록 및 카탈로그 조회
│  │  ├─ Sidebar.js      # 좌측 내비게이션 메뉴
│  │  └─ TopBar.js       # 상단 헤더
│  ├─ App.js             # 메인 앱 컴포넌트 및 라우팅
│  ├─ index.js           # React 진입점
│  └─ index.css          # 글로벌 스타일
└─ package.json
```

---

<a id="repositories"></a>

## 🔗 관련 레포지토리

| 레포 | 설명 |
| --- | --- |
| [`back-end`](https://github.com/FISA-Agri-Pay/back-end) | 금융 핵심 도메인 백엔드 |
| [`front-end`](https://github.com/FISA-Agri-Pay/front-end) | 사용자용 웹앱 프론트엔드 |
| [`front-end-admin`](https://github.com/FISA-Agri-Pay/front-end-admin) | 관리자용 웹 프론트엔드 (현재 레포지토리) |
| [`ai-prediction-model`](https://github.com/FISA-Agri-Pay/ai-prediction-model) | 시계열 예측 모델 · 오토스케일링 정책 |
| [`mcp-aiops-backend`](https://github.com/FISA-Agri-Pay/mcp-aiops-backend) | FastMCP 기반 AIOps 백엔드 |
| [`infra`](https://github.com/FISA-Agri-Pay/infra) | Terraform 기반 IaC · 운영 스크립트 |
| [`git-ops`](https://github.com/FISA-Agri-Pay/git-ops) | ArgoCD GitOps 배포 매니페스트 |
