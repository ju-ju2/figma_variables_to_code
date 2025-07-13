# ✨ Variables-to-Code Figma Plugin

Figma 스타일과 변수를 SCSS 또는 TypeScript 형식으로 변환하여 GitHub 저장소에 커밋하는 플러그인입니다.

## 🚀 주요 기능

- Figma 스타일(폰트, 색상, 그림자 등)을 SCSS 또는 TypeScript 형식으로 변환 (현재 폰트만 지원)
- Figma 변수(컬렉션 포함)를 SCSS 또는 TypeScript 형식으로 변환
- 변환된 파일을 GitHub 저장소에 커밋
- 브랜치 생성 및 Pull Request 자동화

## 🛠 설치 방법

1. 이 프로젝트를 클론합니다:

   ```bash
   git clone https://github.com/ju-ju2/figma_variables_to_code.git
   cd variables-to-code
   ```

2. 의존성을 설치합니다:

   ```bash
   npm install
   ```

3. 개발 서버를 실행합니다:

   ```bash
   npm run dev
   ```

4. 빌드합니다:

   ```bash
   npm run build
   ```

5. Figma 플러그인으로 로드합니다:

- Figma 앱에서 플러그인 개발 메뉴를 열고, `manifest.json` 파일을 선택하여 플러그인을 로드합니다.
  (plugins -> development -> import plugin from manifest)

## 📦 사용 방법

1. Figma에서 플러그인을 실행합니다.
2. 플러그인 UI에서 다음 정보를 입력합니다:

   - **GitHub Repository URL**
   - **GitHub Access Token** ([깃허브 토큰발급](https://github.com/settings/tokens))
   - **Type**
   - **Commit Title** (기본값: `style: tokens update`)
   - **Base Branch** (기본값: `dev`)

3. "Pull Request" 버튼을 클릭하여 스타일과 변수를 GitHub에 커밋합니다.

## ⚙️ 요구 사항

- Node.js 16 이상
- Figma Desktop App
- GitHub Personal Access Token (저장소 쓰기 권한 필요)

## 📁 주요 구성 파일

```
variables_plugin/
├── src/
│ ├── code/ # Figma와 GitHub API 로직
│ │ ├── styles/
│ │ │ ├── variables.ts # variables로 정의된 토큰을 코드화
│ │ │ ├── localStyles.ts # 스타일로 정의된 토큰을 코드화
│ │ │ └── index.ts # 스타일 path 지정 및 컨텐츠화
│ │ ├── code.ts # 피그마에 화면을 띄움
│ │ ├── github.ts # 깃허브 API 통신 (커밋, 푸시 등)
│ │ ├── listeners.ts # 피그마 메세지 통신
│ │ └── shared.ts # utils
│ └── common/ # 공통 유틸리티
│ │ └── fromPlugin.ts # 피그마 메세지 통신 방식 래핑
│ └── components/ui # shadcn
│ └── constants/ # 상수 정의
│ └── contexts/ # 상태 관리 -> reducer 정의
│ └── types/ # 타입 정의
│ ├── ui/ # 플러그인 UI 코드
│ └──── PullRequest.tsx # 메인 화면
├── dist/ # 빌드 결과물
├── node_modules/ # 외부 라이브러리
├── package.json # 프로젝트 설정 및 의존성
└── vite.config.ts # Vite 설정 파일
```

## 🐞 문제 해결

- **error**: plugins -> development -> show/hide console 에서 로그를 확인하세요.
