/**
 * Google Cloud Text-to-Speech 서비스
 * 
 * 사용 전 설정:
 * 1. Google Cloud Console에서 프로젝트 생성
 * 2. Text-to-Speech API 활성화
 * 3. API 키 또는 서비스 계정 키 발급
 * 4. .env.local에 GOOGLE_CLOUD_API_KEY 추가
 */

interface GoogleCloudTTSRequest {
  input: {
    text: string;
  };
  voice: {
    languageCode: string;
    name?: string;
    ssmlGender?: 'MALE' | 'FEMALE' | 'NEUTRAL';
  };
  audioConfig: {
    audioEncoding: 'LINEAR16' | 'MP3';
    pitch?: number;
    speakingRate?: number;
  };
}

interface GoogleCloudTTSResponse {
  audioContent: string;
}

/**
 * Google Cloud TTS API를 사용하여 음성 합성
 */
export async function synthesizeSpeechGoogleCloud(
  text: string,
  voiceConfig: {
    languageCode?: string;
    name?: string;
    gender?: 'MALE' | 'FEMALE' | 'NEUTRAL';
    pitch?: number;
    speakingRate?: number;
  } = {}
): Promise<string> {
  // Google Cloud API 키 우선, 없으면 Gemini API 키 사용
  const apiKey = process.env.GOOGLE_CLOUD_API_KEY || process.env.GEMINI_API_KEY || process.env.API_KEY;
  
  if (!apiKey) {
    throw new Error('API 키가 설정되지 않았습니다. .env.local 파일을 확인해주세요.');
  }

  console.warn('🔑 Using API key:', apiKey.substring(0, 20) + '...');

  const request: GoogleCloudTTSRequest = {
    input: { text },
    voice: {
      languageCode: voiceConfig.languageCode || 'ko-KR',
      name: voiceConfig.name,
      ssmlGender: voiceConfig.gender || 'NEUTRAL'
    },
    audioConfig: {
      audioEncoding: 'LINEAR16',
      pitch: voiceConfig.pitch || 0,
      speakingRate: voiceConfig.speakingRate || 1.0
    }
  };

  try {
    console.warn('🌐 TTS API Request:', {
      url: 'https://texttospeech.googleapis.com/v1/text:synthesize',
      voice: request.voice,
      textLength: text.length
    });

    const response = await fetch(
      `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request)
      }
    );

    console.warn('📡 TTS API Response status:', response.status);

    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ TTS API Error Response:', errorData);
      
      // 403 Forbidden 상세 분석
      if (response.status === 403) {
        const message = errorData.error?.message || '';
        
        if (message.includes('blocked')) {
          throw new Error(
            '⚠️ Text-to-Speech API가 차단되었습니다.\n\n' +
            '해결 방법:\n' +
            '1. Google Cloud Console에서 Text-to-Speech API를 활성화하세요\n' +
            '2. API 키 제한 설정을 확인하세요 (HTTP 리퍼러, IP 제한 등)\n' +
            '3. API 키 제한에서 "Text-to-Speech API"를 허용 목록에 추가하세요\n\n' +
            `원본 에러: ${message}`
          );
        }
      }
      
      throw new Error(
        errorData.error?.message || 
        `Google Cloud TTS API 오류 (${response.status})`
      );
    }

    const data: GoogleCloudTTSResponse = await response.json();
    return data.audioContent;

  } catch (error) {
    console.error('Google Cloud TTS Error:', error);
    throw error;
  }
}

/**
 * 사용 가능한 한국어 음성 목록
 */
export const KOREAN_VOICES = {
  // 남성 음성
  MALE_A: { name: 'ko-KR-Neural2-C', gender: 'MALE' as const, description: '남성 음성 A' },
  MALE_B: { name: 'ko-KR-Wavenet-C', gender: 'MALE' as const, description: '남성 음성 B' },
  
  // 여성 음성
  FEMALE_A: { name: 'ko-KR-Neural2-A', gender: 'FEMALE' as const, description: '여성 음성 A' },
  FEMALE_B: { name: 'ko-KR-Wavenet-A', gender: 'FEMALE' as const, description: '여성 음성 B' },
  
  // 중성 음성
  NEUTRAL: { name: 'ko-KR-Standard-A', gender: 'NEUTRAL' as const, description: '중성 음성' },
};

/**
 * 다중 화자 대화를 위한 TTS 생성
 * 스크립트에서 "Q:", "지영:" 등의 화자를 자동 감지하여 각기 다른 목소리로 합성
 */
export async function synthesizeConversation(
  script: string,
  speakerVoices: {
    [speaker: string]: {
      name: string;
      gender: 'MALE' | 'FEMALE' | 'NEUTRAL';
    };
  }
): Promise<Blob[]> {
  // 스크립트를 화자별로 분리
  const lines = script.split('\n');
  const audioSegments: Blob[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // 화자 감지 (예: "Q:", "지영:")
    const match = trimmed.match(/^([^:]+):\s*(.+)$/);
    if (!match) continue;

    const [, speaker, text] = match;
    const voiceConfig = speakerVoices[speaker.trim()] || speakerVoices['default'];

    if (!voiceConfig) continue;

    // 음성 합성
    const audioBase64 = await synthesizeSpeechGoogleCloud(text, {
      languageCode: 'ko-KR',
      ...voiceConfig
    });

    // Base64를 Blob으로 변환
    const audioData = Uint8Array.from(atob(audioBase64), c => c.charCodeAt(0));
    const blob = new Blob([audioData], { type: 'audio/wav' });
    audioSegments.push(blob);
  }

  return audioSegments;
}

