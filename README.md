<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Nano Creator - AI 스포츠 콘텐츠 제작 스튜디오

스포츠 분석 콘텐츠를 위한 올인원 AI 스튜디오입니다. Gemini 2.5 Pro, Gemini TTS (Pro/Flash 하이브리드), Nano Banana를 활용하여 데이터 분석부터 팟캐스트, 비주얼, 카드뉴스까지 자동 생성합니다.

View your app in AI Studio: https://ai.studio/apps/drive/1ulUMzTnUSGtitkgQsTSoNMNpqLf8Nzva

## ✨ 주요 기능

### 📊 1단계: 기획 및 데이터 분석
- 경기 데이터 분석 및 리포트 생성
- Google Search 통합으로 **최근 2주 내** 뉴스 자동 분석
- 출처 URL 자동 추출
- **지원 스포츠**: 🏀 농구, ⚽ 축구, ⚾ 야구, 🏐 배구

### 📝 2단계: 스크립트 및 오디오
- 전문가 수준의 6분 팟캐스트 대본 자동 생성
- TTS 최적화 (Gemini-TTS 네이티브 태그)
- **하이브리드 TTS** 다중 화자 음성 합성
  - Individual Voices: Pro 모델 (최고 품질)
  - Full Conversation: Flash 모델 (안정성)
  - Q 분석가: Puck 음성
  - 지영 호스트: Achernar 음성
- 개별 및 전체 대화 오디오 생성

### 🖼️ 3단계: 비주얼 자동 생성
- 대본에서 핵심 키워드 10개 자동 추출
- AI 기반 이미지 프롬프트 최적화
- Nano Banana로 B-Roll 이미지 생성
- **병렬 처리**로 빠른 생성 (최대 3개씩)

### 📰 6단계: 카드뉴스 생성
- HSO (Hook-Story-Offer) 프레임워크 적용
- 인스타그램용 10장 카드뉴스 자동 생성
- 세로 비율(9:16) 이미지 자동 생성

## 🚀 프로덕션 레벨 개선사항

### ✅ 완료된 개선사항

1. **환경 변수 보안**
   - `.env.local` 파일로 API 키 관리
   - `.gitignore`에 환경 변수 파일 추가
   - `.env.example` 템플릿 제공

2. **Toast 알림 시스템**
   - `alert()` 대체
   - 성공/오류/경고/정보 메시지 지원
   - 자동 닫힘 및 수동 닫기 기능

3. **자동 저장 기능**
   - LocalStorage 기반 10초마다 자동 저장
   - 앱 재시작 시 작업 복구 프롬프트
   - 모든 데이터 삭제 기능

4. **다운로드 기능**
   - 스크립트 (.txt)
   - 오디오 (.wav)
   - 이미지 (개별 및 일괄 다운로드)
   - 카드뉴스 데이터 (.json)

5. **API 안정성**
   - 타임아웃 설정 (60-90초)
   - 자동 재시도 로직 (최대 3회)
   - 지수 백오프 전략
   - 상세한 에러 처리

6. **메모리 최적화**
   - Blob URL 자동 정리
   - 컴포넌트 언마운트 시 메모리 해제
   - 병렬 이미지 생성으로 성능 향상

## 📋 설치 및 실행

### Prerequisites
- Node.js (v16 이상)
- **Gemini API Key** ([발급받기](https://aistudio.google.com/app/apikey))

### 설치

```bash
# 의존성 설치
npm install

# 환경 변수 설정
cp .env.example .env.local
# .env.local 파일을 열어 GEMINI_API_KEY를 설정하세요
```

### Gemini API 키 발급

1. **[Google AI Studio](https://aistudio.google.com/app/apikey)** 접속
2. **"Get API key"** 또는 **"API 키 발급"** 클릭
3. 생성된 API 키를 `.env.local` 파일에 추가:

```bash
GEMINI_API_KEY=발급받은_API_키
```

> **중요**: Gemini-TTS는 **Gemini API**를 사용합니다. 일반 Google Cloud Text-to-Speech API와는 다릅니다.
> 
> 자세한 내용: [Gemini-TTS 문서](https://cloud.google.com/text-to-speech/docs/gemini-tts?hl=ko)

### 실행

```bash
# 개발 서버 시작
npm run dev

# 빌드
npm run build

# 빌드 결과 미리보기
npm run preview
```

앱이 http://localhost:3000 에서 실행됩니다.

## 🏗️ 프로젝트 구조

```
TTS/
├── components/          # React 컴포넌트
│   ├── PlanningStudio.tsx
│   ├── ScriptingStudio.tsx
│   ├── VisualsStudio.tsx
│   ├── CardNewsStudio.tsx
│   ├── Toast.tsx
│   └── ...
├── services/           # API 서비스
│   └── geminiService.ts
├── hooks/              # 커스텀 훅
│   ├── useToast.ts
│   └── useAutoSave.ts
├── utils/              # 유틸리티 함수
│   ├── download.ts
│   └── apiRetry.ts
├── constants.ts        # AI 프롬프트 정의
├── types.ts           # TypeScript 타입
└── App.tsx            # 메인 앱
```

## 🎯 워크플로우

1. **기획**: 경기 데이터 입력 → 최근 2주 뉴스 분석 → AI 분석 리포트 생성
2. **스크립트**: 리포트 기반 팟캐스트 대본 생성 → TTS 최적화
3. **오디오**: 다중 화자 음성 합성 (에이전트Q & 지영 호스트)
4. **비주얼**: 키워드 추출 → 이미지 생성
5. **카드뉴스**: 스크립트 기반 전문가형 경기 분석 카드뉴스 (HSO 프레임워크)

## 📊 사용되는 AI 모델 & API

- **Gemini 2.5 Pro**: 텍스트 생성, 분석, 추론
- **Gemini 2.5 Flash Preview TTS**: 모든 음성 합성 - **임시** (Pro 모델 500 에러로 인해)
- **Gemini 2.5 Flash Image (Nano Banana)**: 이미지 생성
- **Google Search**: 실시간 뉴스 분석

### ⏱️ API 타임아웃 설정
- Full Conversation: 최대 8분
- Q Voice 개별: 최대 6분
- 지영 Voice 개별: 최대 6분
- 스크립트 최적화: 최대 5분

### 🎤 Gemini-TTS 특징

Gemini-TTS는 **Gemini API의 `generateContent`**를 통해 사용하는 최신 음성 합성 기술입니다:

> **⚠️ 임시 변경 사항 (Pro 모델 500 에러)**: 
> - **Q Voice (개별)**: `gemini-2.5-flash-preview-tts` - Q의 대사만 추출하여 생성
> - **지영 Voice (개별)**: `gemini-2.5-flash-preview-tts` - 지영의 대사만 추출하여 생성
> - **Multi-speaker (전체 대화)**: `gemini-2.5-flash-preview-tts` - 전체 스크립트를 대화형으로 생성
> - **Pro 모델 복구 시**: 개별 음성들을 `gemini-2.5-pro-preview-tts`로 복원 예정
> 
> **💡 안정성 개선**: 
> - 각 스피커를 완전히 독립된 버튼으로 분리
> - 개별 음성은 해당 화자의 대사만 추출 (감정 태그 포함)
> - Full Conversation은 Multi-speaker 모드로 전체 대화 처리
> - 모든 TTS에서 감정 태그 유지 ([confident], [excited] 등)

> **⚠️ Multi-speaker 주의사항**: Flash 모델을 사용하여 안정성을 확보했지만, 여전히 2-3분이 소요됩니다. 최고 품질과 안정성을 위해서는 개별 음성 생성을 권장합니다.

- ✅ **자연스러운 한국어 음성** (Puck, Achernar 등)
- ✅ **다중 화자 대화** 자동 인식 (`Q:`, `지영:`)
- ✅ **감정 표현 태그**: `[confident]`, `[excited]`, `[thoughtful]` 등
- ✅ **일시중지 제어**: `[short pause]`, `[medium pause]`, `[long pause]`
- ✅ **SSML 태그**: `<break>`, `<emphasis>` 등

> **참고**: 일반 Gemini API 키로 바로 사용 가능합니다. 별도의 Google Cloud 설정이 필요하지 않습니다.

## 🔧 기술 스택

- **Frontend**: React 19, TypeScript
- **Build Tool**: Vite
- **AI SDK**: @google/genai
- **Styling**: Tailwind CSS

## 📝 라이센스

이 프로젝트는 AI Studio에서 생성되었습니다.

## 🤝 기여

문제점이나 개선사항이 있으시면 Issue를 등록해주세요.
