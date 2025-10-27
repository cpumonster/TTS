# API 키 보안 설정 가이드

## 🔐 Google API 키 도메인 제한 설정

API 키가 JavaScript에 노출되더라도, **HTTP Referrer 제한**을 설정하면 지정된 도메인에서만 API 호출이 가능합니다.

### 📋 설정 방법

#### 1단계: Google AI Studio 접속
1. https://aistudio.google.com/app/apikey 접속
2. 사용 중인 API 키 찾기

#### 2단계: API 키 제한 설정
1. API 키 옆의 **⚙️ (설정 아이콘)** 또는 **"Edit"** 클릭
2. **"Application restrictions"** 섹션으로 이동
3. **"HTTP referrers (websites)"** 선택

#### 3단계: 허용할 도메인 추가

**옵션 A: 특정 도메인만 허용 (프로덕션)**
```
https://yourdomain.com/*
https://www.yourdomain.com/*
```

**옵션 B: 로컬 개발 + 프로덕션**
```
http://localhost:3000/*
http://localhost:3001/*
https://yourdomain.com/*
https://www.yourdomain.com/*
```

**옵션 C: 네임칩 + Vercel (다중 배포)**
```
http://localhost:3000/*
https://yourdomain.com/*
https://your-app.vercel.app/*
```

#### 4단계: API 제한 설정 (선택사항)
**"API restrictions"** 섹션:
- **"Restrict key"** 선택
- **Generative Language API** 체크
- 다른 API는 체크 해제

#### 5단계: 저장
- **"Save"** 클릭
- 변경사항이 적용되기까지 몇 분 소요될 수 있음

---

## 🛡️ 보안 강화 팁

### 1️⃣ 도메인 와일드카드 사용
```
# ✅ 좋은 예
https://yourdomain.com/*

# ❌ 나쁜 예 (너무 광범위)
*
https://*/*
```

### 2️⃣ 프로토콜 명시
```
# ✅ HTTPS 강제
https://yourdomain.com/*

# ⚠️ HTTP 허용 (로컬 개발용)
http://localhost:3000/*
```

### 3️⃣ 사용량 모니터링
1. https://console.cloud.google.com/apis/dashboard 접속
2. **Generative Language API** 클릭
3. **Quotas & System Limits** 확인
4. **Metrics** 탭에서 일일 사용량 확인

### 4️⃣ 할당량 제한 설정
1. Google Cloud Console → APIs & Services → Quotas
2. **Generative Language API** 선택
3. 일일 요청 수 제한 설정
   - 예: 1,000 requests/day (무료 티어 보호)

### 5️⃣ API 키 정기 교체
- 3-6개월마다 새 API 키 발급
- 이전 키는 비활성화

---

## 🚨 보안 위험 시나리오

### ❌ 제한 없는 API 키
```javascript
// 누구나 개발자 도구에서 API 키를 추출하여
// 자신의 프로젝트에서 무단 사용 가능
const apiKey = "AIzaSy...";  // 노출된 키
```

**위험:**
- 무제한 요청으로 할당량 초과
- 예상치 못한 과금 (유료 전환 시)
- API 키 남용

### ✅ 도메인 제한 설정 시
```
Restrictions:
- HTTP Referrer: https://yourdomain.com/*
```

**결과:**
- 다른 도메인에서 API 키를 복사해도 작동하지 않음
- `403 Forbidden` 에러 발생
- 본인의 도메인에서만 호출 가능

---

## 📊 설정 확인 방법

### 테스트 1: 정상 작동 확인
1. 본인의 배포된 사이트 접속
2. F12 → Console 열기
3. 기능 테스트 (예: Start Analysis)
4. ✅ 정상 작동하면 성공!

### 테스트 2: 제한 작동 확인
1. 다른 도메인 또는 로컬 HTML 파일에서 API 키 사용
2. 다음 에러가 나타나야 함:
```
403 Forbidden: API key not valid. Please pass a valid API key.
or
Requests from referer <blocked> are blocked.
```

### 테스트 3: 브라우저 콘솔에서 직접 테스트
```javascript
// 본인 도메인에서 실행
fetch('https://generativelanguage.googleapis.com/v1alpha/models/gemini-2.5-pro:generateContent', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-goog-api-key': 'YOUR_API_KEY'
  },
  body: JSON.stringify({
    contents: [{ parts: [{ text: 'Hello' }] }]
  })
})
.then(r => r.json())
.then(d => console.log('✅ 성공:', d))
.catch(e => console.error('❌ 실패:', e));
```

---

## 🌐 배포 플랫폼별 설정

### Vercel
```
허용할 Referrer:
https://your-project.vercel.app/*
https://your-custom-domain.com/*
```

### Netlify
```
https://your-site.netlify.app/*
https://your-custom-domain.com/*
```

### 네임칩 (cPanel)
```
https://yourdomain.com/*
https://www.yourdomain.com/*
```

### GitHub Pages
```
https://username.github.io/repository-name/*
```

---

## 💡 추가 보안 권장사항

### 1. 개발용 / 프로덕션용 API 키 분리
```bash
# .env.local (개발용)
GEMINI_API_KEY=AIza...dev-key

# 프로덕션 환경 변수 (호스팅 플랫폼에서 설정)
GEMINI_API_KEY=AIza...prod-key
```

**개발용 키 제한:**
- `http://localhost:*/*`

**프로덕션용 키 제한:**
- `https://yourdomain.com/*`

### 2. 에러 처리
API 호출 실패 시 사용자에게 명확한 메시지:
```javascript
if (error.status === 403) {
  throw new Error('API 접근이 거부되었습니다. 도메인 제한을 확인하세요.');
}
```

### 3. 로그 모니터링
정기적으로 API 사용 로그 확인:
- Google Cloud Console → Logs Explorer
- 비정상적인 트래픽 감지

---

## 📚 참고 자료

- [Google AI Studio API Keys](https://aistudio.google.com/app/apikey)
- [API Key Restrictions](https://cloud.google.com/docs/authentication/api-keys#api_key_restrictions)
- [Generative AI API Documentation](https://ai.google.dev/docs)

---

## ❓ 자주 묻는 질문

**Q: 도메인 제한 설정 후 로컬에서 개발할 수 없나요?**
A: `http://localhost:3000/*`를 추가하면 로컬 개발도 가능합니다.

**Q: 여러 도메인에서 사용하려면?**
A: 각 도메인을 모두 추가하면 됩니다. (줄바꿈으로 구분)

**Q: 제한 설정이 즉시 적용되나요?**
A: 변경 후 최대 5분 정도 소요될 수 있습니다.

**Q: API 키가 여전히 코드에 노출되는데 안전한가요?**
A: 네! 도메인 제한이 있으면 다른 곳에서 사용할 수 없어 안전합니다.

**Q: 무료 할당량은 얼마나 되나요?**
A: Gemini API 무료 티어는 분당 60 요청, 일일 1,500 요청입니다. (2025년 기준)

