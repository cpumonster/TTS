import React, { useState, useCallback, useEffect } from 'react';
import type { Persona, AudioData } from '../types';
import { generateAnalyticalScript, generateSpeech, generateConversationSpeech, optimizeScriptForPodcast } from '../services/geminiService';
import { IconSparkles, IconAudio, IconChat, IconDownload } from './Icons';
import { downloadText, downloadAudio, createTimestamp } from '../utils/download';

interface ScriptingStudioProps {
  researchData: string;
  podcastScript: string;
  setPodcastScript: (script: string) => void;
  personas: Persona[];
  audioData: AudioData;
  setAudioData: (data: AudioData) => void;
  setIsLoading: (loading: boolean) => void;
  setLoadingMessage: (message: string) => void;
  toast: ReturnType<typeof import('../hooks/useToast').useToast>;
}

// Helper function to write a string to a DataView
function writeString(view: DataView, offset: number, string: string) {
    for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
    }
}

/**
 * Creates a valid WAV file Blob from raw PCM audio data.
 * The Gemini TTS API returns audio as 1-channel, 24000Hz, 16-bit PCM.
 * @param pcmData The raw PCM audio data as a Uint8Array.
 * @returns A Blob representing a valid WAV file.
 */
function createWavBlob(pcmData: Uint8Array): Blob {
    const sampleRate = 24000;
    const numChannels = 1;
    const bitsPerSample = 16;
    const dataSize = pcmData.length;
    const buffer = new ArrayBuffer(44 + dataSize);
    const view = new DataView(buffer);

    // RIFF chunk descriptor
    writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + dataSize, true); // chunkSize
    writeString(view, 8, 'WAVE');

    // "fmt " sub-chunk
    writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true); // subchunk1Size (16 for PCM)
    view.setUint16(20, 1, true); // audioFormat (1 for PCM)
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * numChannels * (bitsPerSample / 8), true); // byteRate
    view.setUint16(32, numChannels * (bitsPerSample / 8), true); // blockAlign
    view.setUint16(34, bitsPerSample, true);

    // "data" sub-chunk
    writeString(view, 36, 'data');
    view.setUint32(40, dataSize, true);

    // Write PCM data
    new Uint8Array(buffer).set(pcmData, 44);

    return new Blob([buffer], { type: 'audio/wav' });
}


const AudioPlayer: React.FC<{ persona: Persona; audio?: AudioData[string] }> = ({ persona, audio }) => {
  return (
    <div className="bg-gray-800 p-4 rounded-lg flex items-center space-x-4">
      <img src={persona.avatar} alt={persona.name} className="w-12 h-12 rounded-full" />
      <div className="flex-grow">
        <p className="font-semibold">{persona.name}</p>
        {audio ? (
          <audio controls src={audio.url} className="w-full h-8 mt-1" />
        ) : (
          <div className="w-full h-8 mt-1 bg-gray-700 rounded-md flex items-center justify-center">
            <p className="text-xs text-gray-400">Audio not generated</p>
          </div>
        )}
      </div>
    </div>
  );
};

const ConversationPlayer: React.FC<{ audio?: AudioData[string] }> = ({ audio }) => {
    return (
      <div className="bg-gray-800 p-4 rounded-lg border border-purple-500/50">
        <div className="flex items-center space-x-4">
          <div className="bg-purple-500 rounded-full p-3">
            <IconChat className="w-6 h-6 text-white" />
          </div>
          <div className="flex-grow">
            <div className="flex items-center justify-between">
              <p className="font-semibold text-purple-300">Full Conversation (Podcast)</p>
              {audio && (
                <button
                  onClick={() => downloadAudio(audio.url, `podcast-${createTimestamp()}.wav`)}
                  className="flex items-center px-2 py-1 text-xs bg-purple-600 hover:bg-purple-700 rounded-md transition-colors"
                  title="오디오 다운로드"
                >
                  <IconDownload className="w-3 h-3 mr-1" />
                  다운로드
                </button>
              )}
            </div>
            {audio ? (
              <audio controls src={audio.url} className="w-full h-8 mt-1" />
            ) : (
              <div className="w-full h-8 mt-1 bg-gray-700 rounded-md flex items-center justify-center">
                <p className="text-xs text-gray-400">Generate speech to listen</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

export const ScriptingStudio: React.FC<ScriptingStudioProps> = ({
  researchData, podcastScript, setPodcastScript, personas, audioData, setAudioData, setIsLoading, setLoadingMessage, toast
}) => {
  const [conversationAudio, setConversationAudio] = useState<AudioData[string] | null>(null);
  const [editableScript, setEditableScript] = useState<string>('');
  
  useEffect(() => {
    setEditableScript(podcastScript);
  }, [podcastScript]);

  const handleGenerateScript = useCallback(async () => {
    if (!researchData) {
        toast.warning("먼저 1단계에서 리서치를 완료해주세요.");
        return;
    }
    setIsLoading(true);
    setLoadingMessage('TTS 스크립트를 생성하고 있습니다...');
    try {
      const optimized = await generateAnalyticalScript(researchData);
      setPodcastScript(optimized);
      setEditableScript(optimized);
      toast.success('스크립트가 생성되었습니다!');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, [researchData, setPodcastScript, setIsLoading, setLoadingMessage, toast]);

  const handleOptimizeScript = useCallback(async () => {
    if (!editableScript) {
        toast.warning("먼저 스크립트를 생성해주세요.");
        return;
    }
    setIsLoading(true);
    setLoadingMessage('팟캐스트 전달에 최적화하고 있습니다...');
    try {
        const optimized = await optimizeScriptForPodcast(editableScript, (attempt) => {
          setLoadingMessage(`최적화 재시도 중... (${attempt}번째 시도)`);
        });
        setEditableScript(optimized);
        toast.success('스크립트 최적화가 완료되었습니다!');
    } catch (error) {
        toast.error(error instanceof Error ? error.message : '최적화 중 오류가 발생했습니다.');
    } finally {
        setIsLoading(false);
    }
  }, [editableScript, setIsLoading, setLoadingMessage, toast]);

  const handleGenerateAudio = useCallback(async () => {
    if (!editableScript) {
        toast.warning("먼저 스크립트를 생성해주세요.");
        return;
    }
    
    console.warn('🎤 =========================');
    console.warn('🎙️ GEMINI TTS GENERATION');
    console.warn('=========================');
    console.warn('Using: Gemini API (generateContent)');
    console.warn('Model: gemini-2.5-flash-preview-tts');
    console.warn('Script length:', editableScript.length);
    
    setIsLoading(true);
    setLoadingMessage('Gemini TTS로 음성을 생성하고 있습니다...');
    setConversationAudio(null);
    setAudioData({});
    
    try {
      // 전체 대화 음성 생성 (multiSpeakerVoiceConfig 사용)
      setLoadingMessage('전체 대화 트랙을 생성하고 있습니다...');
      
      try {
        console.warn('🎙️ Step 1/3: Generating multi-speaker conversation...');
        const conversationBase64 = await generateConversationSpeech(editableScript, personas, (attempt) => {
          setLoadingMessage(`대화 트랙 재시도 중... (${attempt}번째 시도)`);
        });
        
        if (conversationBase64) {
          const rawPcmData = Uint8Array.from(atob(conversationBase64), c => c.charCodeAt(0));
          const audioBlob = createWavBlob(rawPcmData);
          const audioUrl = URL.createObjectURL(audioBlob);
          setConversationAudio({ url: audioUrl, waveform: [] });
          console.warn('✅ Conversation audio created');
        }
        
        // API 과부하 방지를 위한 대기 시간 (Flash는 빠르므로 짧게)
        console.warn('⏳ Waiting 2 seconds to avoid API overload...');
        await new Promise(resolve => setTimeout(resolve, 2000));
        
      } catch (e) {
        const errorMessage = e instanceof Error ? e.message : '알 수 없는 오류가 발생했습니다.';
        console.error('❌ Failed to generate conversation audio', e);
        toast.error(`대화 음성 생성 실패: ${errorMessage}`);
      }

      // 개별 화자 음성 생성 (순차적으로)
      const newAudioData: AudioData = {};
      let hasErrors = false;
      
      for (let i = 0; i < personas.length; i++) {
        const persona = personas[i];
        setLoadingMessage(`${persona.name} 개별 음성을 생성하고 있습니다... (${i + 1}/${personas.length})`);
        
        try {
          console.warn(`🎤 Step ${i + 2}/3: Generating speech for ${persona.name}...`);
          const base64Audio = await generateSpeech(editableScript, persona, (attempt) => {
            setLoadingMessage(`${persona.name} 재시도 중... (${attempt}번째 시도)`);
          });
          
          if (base64Audio) {
            const rawPcmData = Uint8Array.from(atob(base64Audio), c => c.charCodeAt(0));
            const audioBlob = createWavBlob(rawPcmData);
            const audioUrl = URL.createObjectURL(audioBlob);
            newAudioData[persona.id] = { url: audioUrl, waveform: [] };
            console.warn(`✅ Individual audio created for ${persona.name}`);
          }
          
          // 다음 요청 전 대기 (마지막 persona가 아닌 경우) - Flash는 빠르므로 짧게
          if (i < personas.length - 1) {
            console.warn('⏳ Waiting 1 second before next request...');
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
          
        } catch (e) {
          const errorMessage = e instanceof Error ? e.message : '알 수 없는 오류가 발생했습니다.';
          toast.error(`${persona.name} 음성 생성 실패: ${errorMessage}`);
          console.error(`Failed to generate audio for ${persona.name}`, e);
          hasErrors = true;
        }
      }
      
      setAudioData(newAudioData);

      console.warn('=========================');
      console.warn('✅ Audio generation completed');
      console.warn('=========================');

      if (!hasErrors) {
        toast.success('모든 오디오가 성공적으로 생성되었습니다!');
      }

    } catch (error) {
      toast.error(error instanceof Error ? error.message : '오디오 생성 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, [editableScript, personas, setAudioData, setIsLoading, setLoadingMessage, toast]);

  // 전체 대화 음성 생성 (Multi-speaker) - 별도 버튼
  const handleGenerateConversation = useCallback(async () => {
    if (!editableScript) {
        toast.warning("먼저 스크립트를 생성해주세요.");
        return;
    }
    
    console.warn('🎙️ =========================');
    console.warn('🎙️ MULTI-SPEAKER GENERATION');
    console.warn('=========================');
    console.warn('Model: gemini-2.5-flash-preview-tts (안정성 우선)');
    console.warn('Script length:', editableScript.length);
    console.warn('⚠️ Note: Multi-speaker는 Flash 모델을 사용합니다 (Pro 모델은 불안정).');
    
    setIsLoading(true);
    setLoadingMessage('Flash 모델로 전체 대화 트랙을 생성하고 있습니다... (최대 8분 소요)');
    setConversationAudio(null);
    
    try {
      const conversationBase64 = await generateConversationSpeech(editableScript, personas, (attempt) => {
        setLoadingMessage(`대화 트랙 재시도 중... (${attempt}번째 시도)`);
      });
      
      if (conversationBase64) {
        const rawPcmData = Uint8Array.from(atob(conversationBase64), c => c.charCodeAt(0));
        const audioBlob = createWavBlob(rawPcmData);
        const audioUrl = URL.createObjectURL(audioBlob);
        setConversationAudio({ url: audioUrl, waveform: [] });
        console.warn('✅ Multi-speaker conversation created');
        toast.success('전체 대화 음성이 성공적으로 생성되었습니다!');
      }
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : '알 수 없는 오류가 발생했습니다.';
      console.error('❌ Failed to generate conversation audio', e);
      toast.error(`대화 음성 생성 실패: ${errorMessage}`);
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  }, [editableScript, personas, setIsLoading, setLoadingMessage, toast]);

  // Q (스피커1) 음성 생성 - 개별 버튼
  const handleGenerateQVoice = useCallback(async () => {
    if (!editableScript) {
        toast.warning("먼저 스크립트를 생성해주세요.");
        return;
    }
    
    const qPersona = personas.find(p => p.id === 'q');
    if (!qPersona) {
        toast.error("Q 분석가 설정을 찾을 수 없습니다.");
        return;
    }
    
    // Q의 대사만 추출
    const lines = editableScript.split('\n');
    const qLines: string[] = [];
    let isQSpeaking = false;
    
    for (const line of lines) {
      if (line.startsWith('Q:') || line.startsWith('Q (Analyst):')) {
        isQSpeaking = true;
        // 화자 레이블과 따옴표 제거하고 대사만 추가
        const dialogue = line
          .replace(/^Q(\s*\(Analyst\))?:\s*/, '')
          .replace(/^["']|["']$/g, '') // 시작과 끝의 따옴표 제거
          .trim();
        if (dialogue) qLines.push(dialogue);
      } else if (line.startsWith('지영:') || line.startsWith('지영 (Host):')) {
        isQSpeaking = false;
      } else if (isQSpeaking && line.trim()) {
        // 연속된 Q의 대사 (여러 줄에 걸친 경우)
        qLines.push(line.trim());
      }
    }
    
    const qOnlyScript = qLines.join(' '); // 개행 대신 공백으로 연결 (더 자연스러운 흐름)
    
    if (!qOnlyScript || qOnlyScript.trim().length === 0) {
        toast.error("Q의 대사를 찾을 수 없습니다. 스크립트를 확인해주세요.");
        console.error('No Q dialogues found in script');
        return;
    }
    
    console.warn('🎤 =========================');
    console.warn('🎤 Q (ANALYST) VOICE GENERATION');
    console.warn('=========================');
    console.warn('Model: gemini-2.5-flash-preview-tts');
    console.warn('Speaker:', qPersona.name);
    console.warn('Voice:', qPersona.voiceId);
    console.warn('Original script length:', editableScript.length);
    console.warn('Q-only script length:', qOnlyScript.length);
    console.warn('Q lines count:', qLines.length);
    console.warn('✅ Note: 감정 태그 포함 (자연스러운 음성)');
    console.warn('Q script preview (first 300 chars):', qOnlyScript.substring(0, 300));
    
    setIsLoading(true);
    setLoadingMessage('Q 분석가 음성을 생성하고 있습니다...');
    
    try {
      const base64Audio = await generateSpeech(qOnlyScript, qPersona, (attempt) => {
        setLoadingMessage(`Q 음성 재시도 중... (${attempt}번째 시도)`);
      });
      
      if (base64Audio) {
        const rawPcmData = Uint8Array.from(atob(base64Audio), c => c.charCodeAt(0));
        const audioBlob = createWavBlob(rawPcmData);
        const audioUrl = URL.createObjectURL(audioBlob);
        setAudioData(prev => ({ ...prev, q: { url: audioUrl, waveform: [] } }));
        console.warn('✅ Successfully generated Q voice');
        toast.success("Q 분석가 음성이 성공적으로 생성되었습니다!");
      } else {
        throw new Error('No audio data received');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';
      console.error('Q voice generation error:', error);
      toast.error(`Q 음성 생성 실패: ${errorMessage}`);
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  }, [editableScript, personas, setAudioData, setIsLoading, setLoadingMessage, toast]);

  // 지영 (스피커2) 음성 생성 - 개별 버튼
  const handleGenerateJiyoungVoice = useCallback(async () => {
    if (!editableScript) {
        toast.warning("먼저 스크립트를 생성해주세요.");
        return;
    }
    
    const jiyoungPersona = personas.find(p => p.id === 'jiyoung');
    if (!jiyoungPersona) {
        toast.error("지영 호스트 설정을 찾을 수 없습니다.");
        return;
    }
    
    // 지영의 대사만 추출
    const lines = editableScript.split('\n');
    const jiyoungLines: string[] = [];
    let isJiyoungSpeaking = false;
    
    for (const line of lines) {
      if (line.startsWith('지영:') || line.startsWith('지영 (Host):')) {
        isJiyoungSpeaking = true;
        // 화자 레이블과 따옴표 제거하고 대사만 추가
        const dialogue = line
          .replace(/^지영(\s*\(Host\))?:\s*/, '')
          .replace(/^["']|["']$/g, '') // 시작과 끝의 따옴표 제거
          .trim();
        if (dialogue) jiyoungLines.push(dialogue);
      } else if (line.startsWith('Q:') || line.startsWith('Q (Analyst):')) {
        isJiyoungSpeaking = false;
      } else if (isJiyoungSpeaking && line.trim()) {
        // 연속된 지영의 대사 (여러 줄에 걸친 경우)
        jiyoungLines.push(line.trim());
      }
    }
    
    const jiyoungOnlyScript = jiyoungLines.join(' '); // 개행 대신 공백으로 연결 (더 자연스러운 흐름)
    
    if (!jiyoungOnlyScript || jiyoungOnlyScript.trim().length === 0) {
        toast.error("지영의 대사를 찾을 수 없습니다. 스크립트를 확인해주세요.");
        console.error('No 지영 dialogues found in script');
        return;
    }
    
    console.warn('🎤 =========================');
    console.warn('🎤 지영 (HOST) VOICE GENERATION');
    console.warn('=========================');
    console.warn('Model: gemini-2.5-flash-preview-tts');
    console.warn('Speaker:', jiyoungPersona.name);
    console.warn('Voice:', jiyoungPersona.voiceId);
    console.warn('Original script length:', editableScript.length);
    console.warn('지영-only script length:', jiyoungOnlyScript.length);
    console.warn('지영 lines count:', jiyoungLines.length);
    console.warn('✅ Note: 감정 태그 포함 (자연스러운 음성)');
    console.warn('지영 script preview (first 300 chars):', jiyoungOnlyScript.substring(0, 300));
    
    setIsLoading(true);
    setLoadingMessage('지영 호스트 음성을 생성하고 있습니다...');
    
    try {
      const base64Audio = await generateSpeech(jiyoungOnlyScript, jiyoungPersona, (attempt) => {
        setLoadingMessage(`지영 음성 재시도 중... (${attempt}번째 시도)`);
      });
      
      if (base64Audio) {
        const rawPcmData = Uint8Array.from(atob(base64Audio), c => c.charCodeAt(0));
        const audioBlob = createWavBlob(rawPcmData);
        const audioUrl = URL.createObjectURL(audioBlob);
        setAudioData(prev => ({ ...prev, jiyoung: { url: audioUrl, waveform: [] } }));
        console.warn('✅ Successfully generated 지영 voice');
        toast.success("지영 호스트 음성이 성공적으로 생성되었습니다!");
      } else {
        throw new Error('No audio data received');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';
      console.error('지영 voice generation error:', error);
      toast.error(`지영 음성 생성 실패: ${errorMessage}`);
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  }, [editableScript, personas, setAudioData, setIsLoading, setLoadingMessage, toast]);

  return (
    <div className="space-y-6 h-full">
        <div>
            <h2 className="text-2xl font-bold text-purple-400 mb-2">2. Script Generation & Refinement</h2>
            <p className="text-gray-400 mb-4">리서치 데이터를 바탕으로 전문가 수준의 3분 분석 팟캐스트 TTS Pro 최적화 대본을 생성합니다.</p>
        </div>

        <div className="bg-gray-800/50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Research Data</h3>
            <div className="max-h-32 overflow-y-auto bg-gray-900/50 p-2 rounded-md border border-gray-700">
                <pre className="whitespace-pre-wrap text-sm text-gray-300 font-sans">
                    {researchData || "No research data from Step 1."}
                </pre>
            </div>
            <button 
                onClick={handleGenerateScript} 
                disabled={!researchData}
                className="mt-4 w-full flex items-center justify-center px-4 py-2 font-semibold bg-purple-600 rounded-md hover:bg-purple-700 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"
            >
                <IconSparkles className="w-5 h-5 mr-2" />
                Generate Analytical TTS Script
            </button>
        </div>
    
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-purple-400">TTS Pro Script Editor</h3>
            {editableScript && (
              <button
                onClick={() => downloadText(editableScript, `script-${createTimestamp()}.txt`)}
                className="flex items-center px-3 py-1 text-sm bg-gray-700 hover:bg-gray-600 rounded-md transition-colors"
                title="스크립트 다운로드"
              >
                <IconDownload className="w-4 h-4 mr-1" />
                스크립트 저장
              </button>
            )}
          </div>
          <div className="flex-grow flex flex-col bg-gray-800/50 p-4 rounded-lg">
            <textarea
              value={editableScript}
              onChange={(e) => setEditableScript(e.target.value)}
              className="w-full flex-grow bg-transparent border border-gray-600 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono text-sm"
              placeholder="Your Gemini TTS Pro optimized script will appear here..."
              rows={10}
            />
             <div className="flex flex-col sm:flex-row gap-2 mt-4">
                <button onClick={handleOptimizeScript} disabled={!editableScript} className="flex-1 flex items-center justify-center px-4 py-2 font-semibold bg-blue-600 rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed">
                  <IconSparkles className="w-5 h-5 mr-2" />
                  Optimize for Podcast Delivery
                </button>
                <button onClick={handleGenerateConversation} disabled={!editableScript} className="flex-1 flex items-center justify-center px-4 py-2 font-semibold bg-purple-600 rounded-md hover:bg-purple-700 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed" title="Flash 모델로 Multi-speaker 전체 대화를 하나의 오디오로 생성 (최대 8분 소요)">
                  <IconAudio className="w-5 h-5 mr-2" />
                  Full Conversation (Flash/안정)
                </button>
                <button onClick={handleGenerateQVoice} disabled={!editableScript || audioData.q} className="flex-1 flex items-center justify-center px-4 py-2 font-semibold bg-blue-600 rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed" title={audioData.q ? "Q 음성이 이미 생성되었습니다" : "Q 분석가 음성만 개별 생성"}>
                  <IconAudio className="w-5 h-5 mr-2" />
                  Q Voice (Flash)
                </button>
                <button onClick={handleGenerateJiyoungVoice} disabled={!editableScript || audioData.jiyoung} className="flex-1 flex items-center justify-center px-4 py-2 font-semibold bg-green-600 rounded-md hover:bg-green-700 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed" title={audioData.jiyoung ? "지영 음성이 이미 생성되었습니다" : "지영 호스트 음성만 개별 생성"}>
                  <IconAudio className="w-5 h-5 mr-2" />
                  지영 Voice (Flash)
                </button>
             </div>
          </div>
        </div>

        <div className="space-y-4">
            <h3 className="text-xl font-bold text-purple-400">Audio Tracks</h3>
            <ConversationPlayer audio={conversationAudio} />
            {personas.map(p => <AudioPlayer key={p.id} persona={p} audio={audioData[p.id]} />)}
        </div>
      </div>
    </div>
  );
};