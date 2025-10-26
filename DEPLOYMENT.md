# 네임칩(Namecheap) 배포 가이드

## 🎉 빌드 완료!

프로젝트가 성공적으로 빌드되었습니다.

### 📦 빌드 결과
- **빌드 폴더**: `dist/`
- **압축 파일**: `TTS-build.zip`
- **총 크기**: ~472KB (JS) + 1.34KB (HTML)

## 🚀 네임칩 배포 방법

### 방법 1: cPanel 파일 관리자 사용 (추천)

1. **네임칩 cPanel에 로그인**
   - Namecheap 대시보드 → 호스팅 → cPanel 접속

2. **파일 관리자 열기**
   - cPanel → 파일 → 파일 관리자

3. **public_html 폴더로 이동**
   - 왼쪽 사이드바에서 `public_html` 클릭

4. **기존 파일 백업 (선택사항)**
   - 기존 파일이 있다면 백업 폴더를 만들어 이동

5. **빌드 파일 업로드**
   - **옵션 A**: ZIP 파일 업로드
     1. `TTS-build.zip` 파일을 업로드
     2. 업로드된 zip 파일 우클릭 → "Extract" 클릭
     3. `dist/` 폴더 안의 모든 파일을 `public_html`로 이동
     4. zip 파일 및 빈 폴더 삭제
   
   - **옵션 B**: 직접 파일 업로드
     1. `dist/` 폴더 안의 모든 파일과 폴더를 선택
     2. `public_html` 폴더에 업로드

6. **파일 구조 확인**
   ```
   public_html/
   ├── index.html
   ├── .htaccess
   ├── _redirects
   └── assets/
       └── index-D8CePvNE.js
   ```

7. **권한 설정 확인**
   - 모든 파일: 644
   - 모든 폴더: 755

### 방법 2: FTP/SFTP 사용

1. **FTP 클라이언트 설치**
   - FileZilla 추천: https://filezilla-project.org/

2. **FTP 접속 정보 확인**
   - 네임칩 대시보드 → 호스팅 → FTP 계정 관리

3. **FTP 연결**
   - Host: `ftp.yourdomain.com` 또는 서버 IP
   - Username: cPanel 사용자명
   - Password: cPanel 비밀번호
   - Port: 21 (FTP) 또는 22 (SFTP)

4. **파일 업로드**
   - 로컬: `/Users/mackbookeya/Documents/TTS/dist/`의 **내용물**
   - 원격: `/public_html/`
   - 모든 파일과 폴더를 드래그 앤 드롭

### 방법 3: Git 자동 배포 (고급)

네임칩이 Git 배포를 지원하는 경우:

1. cPanel → Git Version Control
2. Create → GitHub 리포지토리 연결
3. Deploy 스크립트 설정

## ✅ 배포 확인

1. **브라우저에서 접속**
   - `https://yourdomain.com` 방문

2. **확인 사항**
   - ✅ 페이지가 정상적으로 로드됨
   - ✅ 스타일이 올바르게 적용됨
   - ✅ JavaScript가 작동함
   - ✅ API 키 설정이 필요한 경우 브라우저 콘솔에서 확인

## 🔐 환경 변수 설정

현재 빌드에는 환경 변수가 하드코딩되어 있습니다. 보안을 위해:

1. **로컬 .env.local 파일 확인**
   - `GEMINI_API_KEY` 값 확인

2. **프로덕션 API 키 사용**
   - 개발용과 프로덕션용 API 키를 분리하는 것을 권장
   - Google AI Studio에서 별도의 API 키 생성

3. **재빌드 필요 시**
   ```bash
   # .env.local 파일 수정 후
   npm run build
   # 새로운 dist/ 폴더를 다시 업로드
   ```

## 🔧 문제 해결

### 1. 페이지가 404 에러 발생
- `.htaccess` 파일이 업로드되었는지 확인
- cPanel에서 mod_rewrite가 활성화되어 있는지 확인

### 2. 스타일이 깨짐
- `assets/` 폴더가 올바르게 업로드되었는지 확인
- 브라우저 캐시 삭제 후 재시도

### 3. JavaScript 에러
- 브라우저 콘솔(F12) 확인
- CDN 로딩 문제일 수 있음 (React, Gemini SDK)
- HTTPS 사용 확인

### 4. API 키 오류
- Gemini API 키가 올바른지 확인
- API 키 사용량 제한 확인
- 빌드 시 환경 변수가 제대로 주입되었는지 확인

## 📊 빌드 상세 정보

```
빌드 도구: Vite 6.4.1
React 버전: 19.2.0
빌드 시간: 752ms

파일 크기:
- index.html: 1.34 KB (gzip: 0.60 KB)
- index-D8CePvNE.js: 472.03 KB (gzip: 121.63 KB)
```

## 🔄 업데이트 방법

코드 수정 후 재배포:

```bash
# 1. 변경사항 커밋
git add .
git commit -m "업데이트 내용"
git push

# 2. 재빌드
npm run build

# 3. dist/ 폴더 내용을 네임칩에 다시 업로드
```

## 📞 지원

배포 중 문제가 발생하면:
- 네임칩 지원팀: https://www.namecheap.com/support/
- 프로젝트 GitHub: https://github.com/cpumonster/TTS

## 🎯 다음 단계

- [ ] 커스텀 도메인 설정
- [ ] SSL 인증서 활성화 (무료 Let's Encrypt)
- [ ] 성능 모니터링 설정
- [ ] Google Analytics 추가 (선택사항)

