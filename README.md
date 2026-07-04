# 🏫 snowhillwithmath - EduMaker

에듀메이커(EduMaker)는 코딩 초보자 선생님들과 학생들이 빠르고 간편하게 웹 기반 교육용 애플리케이션을 만들고 배포해 볼 수 있는 Next.js 템플릿(Boilerplate) 프로젝트입니다.

## ✨ 주요 기능 및 특징
- **심플하고 직관적인 UI**: 상단 네비게이션 헤더, 메인 Hero 화면, 하단 푸터로 깔끔하게 구성되어 있습니다.
- **강력한 반응형 지원**: PC, 태블릿, 모바일 기기 모두에서 깨짐 없이 표시됩니다 (Tailwind CSS v4).
- **Vercel 원클릭 배포**: 별도의 복잡한 서버/DB 설정 없이 GitHub과 Vercel을 연결하여 즉시 전 세계에 배포할 수 있습니다.
- **높은 확장성**: `app/page.tsx`와 `app/layout.tsx`를 시작으로 원하는 교육용 기능(예: 퀴즈, 문제집, 타이머 등)을 손쉽게 얹을 수 있습니다.

## 📁 주요 폴더 구조
```text
math/
├── app/                  # 핵심 소스 코드 폴더
│   ├── globals.css       # Tailwind CSS 테마 및 글로벌 스타일
│   ├── layout.tsx        # 헤더, 푸터 등 공통 레이아웃 구성
│   └── page.tsx          # 메인 랜딩 페이지 화면
├── public/               # 이미지, 아이콘 등 정적 파일
├── package.json          # 프로젝트 의존성 라이브러리 및 스크립트 설정
├── tsconfig.json         # TypeScript 설정
└── postcss.config.mjs    # PostCSS 설정
```

## 🚀 로컬 개발 서버 실행 방법

1. 의존성 패키지 설치:
   ```bash
   npm install
   ```

2. 개발 서버 구동:
   ```bash
   npm run dev
   ```

3. 브라우저에서 `http://localhost:3000` 접속하여 확인합니다.

---

제작자: [snowhill0314](https://github.com/snowhill0314-sketch)
