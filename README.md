# 리뷰 수집 자동화 서비스

이 프로젝트는 상품 URL을 입력받아 리뷰를 자동으로 수집하는 서비스의 프론트엔드 부분입니다.

## 기능

- 상품 URL 입력 폼
- Make Webhook을 통한 URL 전송
- 성공/실패 상태 표시
- 로딩 상태 표시

## 기술 스택

- React
- TypeScript
- Tailwind CSS
- Vite

## 시작하기

1. 저장소 클론
```bash
git clone [repository-url]
```

2. 의존성 설치
```bash
npm install
```

3. 개발 서버 실행
```bash
npm run dev
```

4. 빌드
```bash
npm run build
```

## 환경 설정

Make Webhook URL을 설정하려면 `src/components/UrlInputForm.tsx` 파일에서 다음 부분을 수정하세요:

```typescript
const response = await fetch('https://hook.us2.make.com/여기에_당신의_웹훅', {
```

## 배포

이 프로젝트는 Vercel을 통해 배포할 수 있습니다. Vercel CLI를 사용하여 배포하거나, GitHub 저장소를 Vercel에 연결하여 자동 배포를 설정할 수 있습니다.
