import React from 'react';
import { IconVideo, IconShorts, IconChat } from './Icons';

interface ExpansionStudioProps {
  setIsLoading: (loading: boolean) => void;
  setLoadingMessage: (message: string) => void;
}

const FeatureCard: React.FC<{ icon: React.ReactNode; title: string; description: string }> = ({ icon, title, description }) => (
    <div className="bg-gray-800/50 p-6 rounded-lg flex flex-col items-center text-center h-full">
        <div className="text-purple-400 mb-4">{icon}</div>
        <h3 className="font-semibold text-lg mb-2">{title}</h3>
        <p className="text-sm text-gray-400">{description}</p>
    </div>
);

export const ExpansionStudio: React.FC<ExpansionStudioProps> = ({ setIsLoading, setLoadingMessage }) => {
  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold text-purple-400 mb-2">5. Content Expansion (Shorts)</h2>
      <p className="text-gray-400 mb-8">완성된 영상의 핵심 하이라이트를 분석하여 여러 개의 YouTube 숏폼 콘텐츠를 자동으로 생성합니다.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FeatureCard 
            icon={<IconVideo className="w-12 h-12" />}
            title="Video Understanding"
            description="AI가 최종 영상을 분석하여 핵심 순간, 주제, 하이라이트를 식별합니다."
          />
          <FeatureCard 
            icon={<IconShorts className="w-12 h-12" />}
            title="Automatic Shorts Creation"
            description="식별된 핵심 순간들로부터 즉시 여러 개의 YouTube 숏폼 클립을 생성합니다."
          />
          <FeatureCard 
            icon={<IconChat className="w-12 h-12" />}
            title="Conversational Assistant"
            description="음성 명령을 사용하여 영상 성과에 대해 질문하고 더 많은 콘텐츠를 생성합니다 (Gemini Live)."
          />
      </div>

      <div className="mt-8 bg-gray-800/50 p-6 rounded-lg">
        <h3 className="text-xl font-semibold mb-4">Analyze Your Latest Video</h3>
        <div className="flex items-center justify-center h-32 border-2 border-dashed border-gray-600 rounded-lg">
            <p className="text-gray-500">Video preview would appear here</p>
        </div>
        <button className="mt-4 px-6 py-2 font-semibold bg-purple-600 rounded-md hover:bg-purple-700 transition-colors w-full md:w-auto">
            Analyze and Create Shorts
        </button>
        <p className="text-xs text-gray-500 mt-2">Note: This feature is a placeholder in the current version.</p>
      </div>
    </div>
  );
};
