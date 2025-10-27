# API 연결 문제 해결 가이드

## 🔴 발생한 에러

```
POST https://generativelanguage.googleapis.com/v1alpha/models/gemini-2.5-pro:generateContent 
net::ERR_CONNECTION_CLOSED
```

## 🎯 해결 방법

### 1️⃣ 새로운 빌드 파일 업로드 (필수)

index.css 404 에러가 수정된 새로운 빌드를 업로드하세요:

```bash
# 로컬에서 이미 생성됨
TTS-build.zip (120KB)
```

**네임칩 업로드 방법:**
1. cPanel → 파일 관리자
2. `public_html` 폴더의 기존 파일 모두 삭제
3. `TTS-build.zip` 업로드
4. 압축 해제
5. `dist/` 폴더 안의 파일들을 `public_html`로 이동

### 2️⃣ API 연결 실패 원인

#### 원인 A: 환경 변수 미주입 ❌

**확인 방법:**
배포된 사이트에서 브라우저 콘솔(F12):
```javascript
// 콘솔에 입력
console.log(typeof process !== 'undefined' ? 'process 존재' : 'process 없음');
```

만약 "process 없음"이 나오면 → 환경 변수가 빌드에 포함되지 않은 것

**해결:**
```bash
# 로컬에서 다시 빌드
./build-with-env.sh
```

#### 원인 B: CORS 정책 위반 🔒

Gemini API는 브라우저에서 직접 호출을 **지원**하지만, 일부 네트워크 환경에서 차단될 수 있습니다.

**확인 방법:**
브라우저 콘솔에서 에러 메시지 확인:
- `ERR_CONNECTION_CLOSED` → 네트워크/방화벽 문제
- `CORS error` → CORS 정책 문제
- `401 Unauthorized` → API 키 문제

#### 원인 C: API 키 문제 🔑

**확인 사항:**

1. **API 키 유효성**
   - https://aistudio.google.com/app/apikey 접속
   - 기존 키가 활성화되어 있는지 확인
   - 필요시 새 키 발급

2. **API 키 할당량**
   - 무료 할당량 초과 여부 확인
   - https://console.cloud.google.com/apis/dashboard

3. **API 키가 빌드에 포함되었는지**
   ```bash
   # .env.local 파일 확인
   cat .env.local
   # GEMINI_API_KEY=실제_키_값 이 있어야 함
   ```

#### 원인 D: 네트워크/방화벽 🌐

일부 호스팅 제공업체나 방화벽이 Google API 호출을 차단할 수 있습니다.

**테스트 방법:**
```javascript
// 브라우저 콘솔에서
fetch('https://generativelanguage.googleapis.com/v1alpha/models', {
  headers: { 'x-goog-api-key': 'YOUR_API_KEY' }
})
.then(r => console.log('연결 성공:', r.status))
.catch(e => console.error('연결 실패:', e));
```

### 3️⃣ 권장 해결 방법

#### 옵션 1: 로컬 테스트 (즉시)

```bash
cd /Users/mackbookeya/Documents/TTS
npm run dev
```

http://localhost:3000 에서 API가 정상 작동하는지 확인

#### 옵션 2: 다른 호스팅 시도 (빠름)

네임칩이 아닌 다른 호스팅에서 테스트:

**Vercel (추천)**
```bash
# Vercel CLI 설치
npm i -g vercel

# 배포
cd /Users/mackbookeya/Documents/TTS
vercel

# 환경 변수 설정
vercel env add GEMINI_API_KEY
# API 키 입력

# 재배포
vercel --prod
```

**Netlify**
```bash
# Netlify CLI 설치
npm i -g netlify-cli

# 배포
cd /Users/mackbookeya/Documents/TTS
netlify deploy --prod --dir=dist

# 환경 변수는 Netlify 대시보드에서 설정
```

#### 옵션 3: 백엔드 프록시 사용 (보안 최고) 🔐

API 키를 프론트엔드에 노출하지 않는 가장 안전한 방법:

**간단한 Cloudflare Worker 프록시:**

```javascript
// worker.js
export default {
  async fetch(request) {
    const GEMINI_API_KEY = 'YOUR_API_KEY'; // Workers 환경 변수에 저장
    
    // CORS 헤더 추가
    const headers = new Headers({
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Content-Type': 'application/json'
    });
    
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers });
    }
    
    const body = await request.json();
    
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1alpha/models/${body.model}:generateContent`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': GEMINI_API_KEY
        },
        body: JSON.stringify(body.data)
      }
    );
    
    const data = await response.json();
    return new Response(JSON.stringify(data), { headers });
  }
};
```

**앱 코드 수정:**
```typescript
// geminiService.ts 수정
const PROXY_URL = 'https://your-worker.workers.dev';

async function callGeminiViaProxy(model: string, data: any) {
  const response = await fetch(PROXY_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model, data })
  });
  return response.json();
}
```

### 4️⃣ 빠른 진단 체크리스트

```bash
# 1. 로컬에서 작동하는가?
npm run dev
# → localhost:3000에서 테스트

# 2. API 키가 유효한가?
# → AI Studio에서 확인

# 3. 환경 변수가 설정되었는가?
cat .env.local
# → GEMINI_API_KEY 확인

# 4. 빌드가 제대로 되었는가?
./build-with-env.sh
# → 에러 없이 완료되어야 함

# 5. 네트워크 연결이 되는가?
curl https://generativelanguage.googleapis.com/v1alpha/models
# → 응답이 와야 함
```

## ⚠️ 보안 경고

**현재 구조의 문제점:**
- API 키가 JavaScript 파일에 하드코딩됨
- 누구나 브라우저 개발자 도구로 확인 가능
- API 키 유출 위험

**권장 사항:**
1. **프로덕션에서는 백엔드 프록시 사용** (옵션 3)
2. **API 키 제한 설정**
   - AI Studio → API 키 설정 → 도메인 제한
   - HTTP Referrer 제한 추가
3. **사용량 모니터링**
   - 예상치 못한 사용량 급증 확인
   - 알림 설정

## 🆘 여전히 안 되나요?

다음 정보를 확인해주세요:

1. **브라우저 콘솔 스크린샷** (F12 → Console)
2. **네트워크 탭 에러 상세** (F12 → Network → 실패한 요청 클릭)
3. **로컬 개발 환경 작동 여부** (`npm run dev`)
4. **배포 URL**

## 📚 추가 자료

- [Gemini API 문서](https://ai.google.dev/docs)
- [Vite 환경 변수 가이드](https://vitejs.dev/guide/env-and-mode.html)
- [CORS 문제 해결](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)
- [Cloudflare Workers 시작하기](https://developers.cloudflare.com/workers/)

