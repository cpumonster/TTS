// FIX: Removed invalid frontmatter which was causing compilation errors.
import { GoogleGenAI, Modality, Type } from '@google/genai';
import { ANALYTICAL_SSML_PROMPT, KEYWORD_EXTRACTION_PROMPT, CARD_NEWS_FROM_SCRIPT_PROMPT, PODCAST_OPTIMIZATION_PROMPT, IMAGE_PROMPT_GENERATION_FROM_KEYWORDS_PROMPT } from '../constants';
import type { Persona } from '../types';
import { retryWithBackoff } from '../utils/apiRetry';

/**
 * Creates a new GoogleGenAI instance.
 * This is crucial for features that require user-selected API keys (like Veo),
 * ensuring that each request uses the most up-to-date key from the environment.
 */
function getAiClient() {
  // Use v1alpha for Gemini-TTS models
  return new GoogleGenAI({ 
    apiKey: process.env.API_KEY,
    apiVersion: 'v1alpha'  // TTS 모델은 v1alpha에서 지원
  });
}

/**
 * Sanitizes text to remove or replace keywords that might trigger content safety filters,
 * especially in the context of sports analysis. This is a client-side guardrail to improve
 * the reliability of API calls.
 * @param text The input string to sanitize.
 * @returns The sanitized string.
 */
function sanitizeForApi(text: string): string {
    if (!text) return '';
    let sanitizedText = text;
    // Replace terms related to betting with more neutral, analytical language.
    // Using global regex to replace all occurrences for comprehensive cleaning.
    sanitizedText = sanitizedText.replace(/핸디캡/g, '기준점');
    sanitizedText = sanitizedText.replace(/언더오버/g, '총점');
    sanitizedText = sanitizedText.replace(/언오버/g, '총점');
    sanitizedText = sanitizedText.replace(/베팅/g, '분석');
    sanitizedText = sanitizedText.replace(/에디터 픽/g, '주요 관전 포인트');
    return sanitizedText;
}

/**
 * Extracts a JSON object or array from a string, which may be wrapped in markdown code fences.
 * @param text The text response from the API.
 * @returns A parsed JSON object or array.
 * @throws An error if parsing fails.
 */
function parseJsonFromMarkdown(text: string) {
    const match = text.match(/```(json)?\s*([\s\S]*?)\s*```/);
    const jsonString = match ? match[2] : text;
    return JSON.parse(jsonString.trim());
}


/**
 * A robust error handler for Gemini API calls. It checks for specific error signatures
 * and dispatches a custom event or throws a user-friendly message.
 * @param error The error object caught from an API call.
 */
function handleApiError(error: any) {
    const errorMessage = error?.message || 'An unknown error occurred.';
    
    // Check for API key related errors (invalid, expired, not found for model)
    if (errorMessage.includes('API key') || 
        errorMessage.includes('NOT_FOUND') ||
        errorMessage.includes('permission denied') ||
        (error.status && error.status >= 400 && error.status < 500)) {
        
        if (errorMessage.includes('NOT_FOUND')) {
             throw new Error(`API Error: The provided API key may not have the required model enabled or the model name is incorrect.`);
        }
        
        throw new Error(`API request failed. The provided API key may be invalid or lack permissions. Please check your API key configuration.`);
    }

    if (error.status && error.status >= 500) {
        throw new Error('A server error occurred with the Gemini API. This might be a temporary issue. Please try again later.');
    }
    
    // Fallback for other errors
    throw new Error(`An unexpected error occurred: ${errorMessage}`);
}

export async function performResearch(
    topic: string, 
    instructions: string, 
    rawData: string, 
    analyzeNews: boolean,
    onRetry?: (attempt: number) => void
): Promise<{ text: string, sources: any[] }> {
    const ai = getAiClient();
    
    return retryWithBackoff(async () => {
        try {
        // Sanitize all inputs as a precaution against safety filters.
        const cleanTopic = sanitizeForApi(topic);
        const cleanInstructions = sanitizeForApi(instructions);
        const cleanRawData = sanitizeForApi(rawData);

        const newsInstruction = analyzeNews
            ? `
[ADDITIONAL INSTRUCTIONS - NEWS ANALYSIS]
Use Google Search to find recent news (within the last 2 weeks from the game date) to supplement your analysis. Focus on player conditions, injuries, team issues, tactical changes, roster updates, and any other relevant factors that might not be in the raw data. A primary source to check is https://m.sports.naver.com/, but you can use other reliable sports news sites as well. Integrate these findings into your final report and clearly indicate which information came from recent news.`
            : "";

        const finalPrompt = `You are a professional sports data analyst.
        Your task is to objectively analyze the provided information based on the user's instructions and topic.
        Your output must be a factual, statistical report. Do not include any form of advice, predictions, or subjective opinions.

        [TOPIC]
        ${cleanTopic}

        [INSTRUCTIONS]
        ${cleanInstructions}
        ${newsInstruction}

        [RAW DATA FOR ANALYSIS]
        \`\`\`
        ${cleanRawData || "No raw data provided. Rely primarily on your web search capabilities."}
        \`\`\`
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: finalPrompt,
            config: (!rawData.trim() || analyzeNews) ? { tools: [{ googleSearch: {} }] } : undefined,
        });

        return {
            text: response.text,
            sources: response.candidates?.[0]?.groundingMetadata?.groundingChunks || []
        };
        } catch (error) {
            handleApiError(error);
            throw error;
        }
    }, {
        maxRetries: 2,
        timeout: 90000, // 90초
        onRetry: (attempt, error) => {
            console.log(`Retrying research API (attempt ${attempt})...`);
            onRetry?.(attempt);
        }
    });
}

export async function generateAnalyticalScript(researchData: string): Promise<string> {
  const ai = getAiClient();
  
  const prompt = `${ANALYTICAL_SSML_PROMPT}\n\n--- RESEARCH DATA ---\n\n${researchData}`;
  
  // 프롬프트 길이 분석
  const promptLength = prompt.length;
  const estimatedTokens = Math.ceil(promptLength / 4);
  
  console.warn('🔍 =========================');
  console.warn('📊 SCRIPT GENERATION DEBUG');
  console.warn('=========================');
  console.warn(`Total characters: ${promptLength.toLocaleString()}`);
  console.warn(`Estimated tokens: ~${estimatedTokens.toLocaleString()}`);
  console.warn(`Research data: ${researchData.length.toLocaleString()} chars`);
  console.warn(`Prompt template: ${ANALYTICAL_SSML_PROMPT.length.toLocaleString()} chars`);
  
  // 토큰 제한 체크 (Gemini 2.5 Pro는 약 32k 토큰)
  if (estimatedTokens > 30000) {
    const errorMsg = `프롬프트가 너무 깁니다 (${estimatedTokens.toLocaleString()} 토큰). 리서치 데이터를 줄여주세요.`;
    console.error('❌', errorMsg);
    throw new Error(errorMsg);
  }
  
  try {
    console.warn('🚀 Calling Gemini API...');
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-pro',
      contents: prompt,
    });
    console.warn('✅ API call successful!');
    console.warn('=========================');
    return response.text;
  } catch (error: any) {
    // 상세한 에러 정보
    console.error('❌ =========================');
    console.error('ERROR DETAILS:');
    console.error('=========================');
    console.error('Error object:', error);
    console.error('Message:', error?.message);
    console.error('Status:', error?.status);
    console.error('Status Text:', error?.statusText);
    console.error('Response:', error?.response);
    
    // 에러 원인 분석
    if (error?.message) {
      console.error('📝 Error message:', error.message);
    }
    
    // 전체 에러 객체를 문자열로 출력
    try {
      console.error('🔍 Full error JSON:', JSON.stringify(error, null, 2));
    } catch (e) {
      console.error('Cannot stringify error');
    }
    console.error('=========================');
    
    handleApiError(error);
    throw error;
  }
}

export async function optimizeScriptForPodcast(baseScript: string, onRetry?: (attempt: number) => void): Promise<string> {
    const ai = getAiClient();
    
    console.warn('🔧 Optimizing script for Gemini-TTS...');
    console.warn('Model: gemini-2.5-pro');
    console.warn(`Script length: ${baseScript.length} chars`);
    
    return retryWithBackoff(async () => {
        const prompt = `${PODCAST_OPTIMIZATION_PROMPT}\n\n--- SCRIPT TO OPTIMIZE ---\n\n${baseScript}`;
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: prompt,
        });
        return response.text;
    }, {
        maxRetries: 2,
        timeout: 300000, // 300초 (5분) - 스크립트 최적화
        backoff: 3000,
        onRetry: (attempt, error) => {
            console.warn(`🔄 Retrying optimization (attempt ${attempt})...`);
            onRetry?.(attempt);
        }
    });
}

export async function generateSpeech(script: string, persona: Persona, onRetry?: (attempt: number) => void): Promise<string> {
    const ai = getAiClient();
    
    return retryWithBackoff(async () => {
        const cleanScript = sanitizeForApi(script);
        
        console.warn('  🎤 API Call: Generating speech...');
        console.warn(`     Model: gemini-2.5-flash-preview-tts (안정성 우선)`);
        console.warn(`     Voice: ${persona.voiceId}`);
        console.warn(`     Text: ${cleanScript.length} chars`);
        console.warn('  ⚠️ Note: Pro 모델 500 에러로 인해 Flash 사용 중');
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-preview-tts',
            contents: [{ parts: [{ text: cleanScript }] }],
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: { voiceName: persona.voiceId },
                    },
                },
            },
        });
        
        // 응답 구조 디버깅
        console.warn('  📦 Response structure:', {
            hasResponse: !!response,
            hasCandidates: !!response?.candidates,
            candidatesLength: response?.candidates?.length,
            hasContent: !!response?.candidates?.[0]?.content,
            hasParts: !!response?.candidates?.[0]?.content?.parts,
            partsLength: response?.candidates?.[0]?.content?.parts?.length,
            hasInlineData: !!response?.candidates?.[0]?.content?.parts?.[0]?.inlineData,
            hasData: !!response?.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data
        });
        
        const audioData = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (!audioData) {
            console.error('  ❌ No audio data found in response');
            console.error('  Full response (first 500 chars):', JSON.stringify(response, null, 2).substring(0, 500));
            throw new Error('No audio data in response - check console for details');
        }
        
        console.warn(`  ✅ Got audio data: ${audioData.length} bytes`);
        return audioData;
    }, {
        maxRetries: 3,
        timeout: 360000, // 360초 (6분) - 개별 음성 충분한 시간
        backoff: 3000, // 3초
        onRetry: (attempt, error) => {
            console.warn(`🔄 Retrying speech generation for ${persona.voiceId} (attempt ${attempt})...`);
            onRetry?.(attempt);
        }
    });
}

export async function generateConversationSpeech(script: string, personas: Persona[], onRetry?: (attempt: number) => void): Promise<string> {
    const ai = getAiClient();
    
    return retryWithBackoff(async () => {
        try {
            const cleanScript = sanitizeForApi(script);

            const speakerConfigs = personas.map(p => ({
                speaker: p.name.split(' ')[0], // Use first name like 'Q' or '지영'
                voiceConfig: {
                    prebuiltVoiceConfig: { voiceName: p.voiceId }
                }
            }));

            console.warn('🎙️ Generating multi-speaker conversation...');
            console.warn('Model: gemini-2.5-flash-preview-tts (Multi-speaker 안정성)');
            console.warn('API Version: v1alpha');
            console.warn('Speakers:', speakerConfigs.map(s => s.speaker).join(', '));
            console.warn('Script length:', cleanScript.length);
            console.warn('⚠️ Note: Multi-speaker는 Flash 모델이 더 안정적입니다.');

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash-preview-tts', // Flash 모델 (Multi-speaker 안정성)
                contents: [{ parts: [{ text: cleanScript }] }],
                config: {
                    responseModalities: [Modality.AUDIO],
                    speechConfig: {
                        multiSpeakerVoiceConfig: {
                            speakerVoiceConfigs: speakerConfigs
                        }
                    }
                }
            });

            console.warn('✅ Multi-speaker audio generated successfully');
            return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || '';
        } catch (error) {
            console.error('❌ Error generating conversation speech:', error);
            console.error('Full error:', error);
            handleApiError(error);
            throw error;
        }
    }, {
        maxRetries: 3,
        timeout: 480000, // 480초 (8분) - Full Conversation을 위한 충분한 시간
        backoff: 5000, // 5초 - 더 긴 대기 시간
        onRetry: (attempt, error) => {
            console.warn(`🔄 Retrying multi-speaker generation (attempt ${attempt})...`);
            onRetry?.(attempt);
        }
    });
}


export async function extractKeywordsFromScript(script: string): Promise<string[]> {
    const ai = getAiClient();
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: `${KEYWORD_EXTRACTION_PROMPT}\n\n--- SCRIPT ---\n${script}`,
             config: {
                responseMimeType: "application/json",
            }
        });
        
        const keywords = parseJsonFromMarkdown(response.text);
        
        if (Array.isArray(keywords) && keywords.every(p => typeof p === 'string')) {
            return keywords.slice(0, 10); // Ensure only 10 keywords
        } else {
            throw new Error("API returned data in an unexpected format for keywords.");
        }
    } catch (error) {
       handleApiError(error);
       throw error;
    }
}

export async function generateImagePromptsFromKeywords(keywords: string[]): Promise<Record<string, string>> {
    const ai = getAiClient();
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: `${IMAGE_PROMPT_GENERATION_FROM_KEYWORDS_PROMPT}\n\n--- Input Keywords ---\n${JSON.stringify(keywords)}`,
            config: {
                responseMimeType: "application/json",
            }
        });

        const promptsMap = parseJsonFromMarkdown(response.text);

        if (typeof promptsMap === 'object' && promptsMap !== null && !Array.isArray(promptsMap)) {
            return promptsMap;
        } else {
            throw new Error("API returned data in an unexpected format for image prompts.");
        }
    } catch (error) {
        handleApiError(error);
        throw error;
    }
}


export async function generateImage(
    prompt: string, 
    aspectRatio: '16:9' | '9:16' = '16:9',
    onRetry?: (attempt: number) => void
): Promise<string> {
    const ai = getAiClient();
    
    return retryWithBackoff(async () => {
        try {
            const finalPrompt = `${sanitizeForApi(prompt)}, ${aspectRatio} aspect ratio`;

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash-image',
                contents: {
                    parts: [{ text: finalPrompt }],
                },
                config: {
                    responseModalities: [Modality.IMAGE],
                },
            });

            for (const part of response.candidates[0].content.parts) {
                if (part.inlineData) {
                    return part.inlineData.data;
                }
            }
            
            throw new Error("No image data received from Nano Banana API.");

        } catch (error) {
            handleApiError(error);
            throw error;
        }
    }, {
        maxRetries: 3,
        timeout: 60000, // 60초
        backoff: 2000, // 2초
        onRetry: (attempt, error) => {
            console.log(`Retrying image generation (attempt ${attempt})...`);
            onRetry?.(attempt);
        }
    });
}
export interface CardNews {
  title: string;
  content: string;
  image_prompt: string;
}

export async function generateCardNewsFromScript(podcastScript: string): Promise<{ cards: CardNews[] }> {
    const ai = getAiClient();
    
    return retryWithBackoff(async () => {
        try {
            // 스크립트가 너무 길면 요약
            const scriptToUse = podcastScript.length > 10000 
                ? podcastScript.substring(0, 10000) + "\n\n[... 스크립트 중략 ...]"
                : podcastScript;
            
            console.warn('📰 Generating card news from script...');
            console.warn('Script length:', podcastScript.length);
            
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-pro',
                contents: `${CARD_NEWS_FROM_SCRIPT_PROMPT}\n\n--- PODCAST SCRIPT ---\n${scriptToUse}`,
                config: {
                    responseMimeType: "application/json",
                }
            });

            const parsed = parseJsonFromMarkdown(response.text);

            if (parsed && Array.isArray(parsed.cards)) {
                console.warn(`✅ Generated ${parsed.cards.length} card news items`);
                return parsed;
            } else {
                throw new Error("API returned data in an unexpected format for card news.");
            }
        } catch(error) {
            handleApiError(error);
            throw error;
        }
    }, {
        maxRetries: 2,
        timeout: 60000, // 60초
        backoff: 3000,
    });
}