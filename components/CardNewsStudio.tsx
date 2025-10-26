import React, { useState, useCallback } from 'react';
import { generateCardNewsFromScript, generateImage, CardNews } from '../services/geminiService';
import { IconSparkles, IconDownload } from './Icons';
import { downloadImage, downloadAllImagesAsZip, downloadJSON, createTimestamp } from '../utils/download';

interface CardNewsStudioProps {
  podcastScript: string;
  setIsLoading: (loading: boolean) => void;
  setLoadingMessage: (message: string) => void;
  toast: ReturnType<typeof import('../hooks/useToast').useToast>;
}

interface GeneratedCard extends CardNews {
  imageUrl: string;
  generationFailed?: boolean;
}

const Card: React.FC<{ card: GeneratedCard, index: number }> = ({ card, index }) => (
    <div className="bg-gray-800 rounded-lg overflow-hidden aspect-[9/16] flex flex-col group relative">
        <div className="relative h-1/2">
            <img src={card.imageUrl} alt={card.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/30"></div>
            <span className="absolute top-2 right-2 bg-purple-600 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center">{index + 1}</span>
        </div>
        <div className="p-4 flex flex-col justify-center flex-grow">
            <h4 className="text-lg font-bold text-purple-300">{card.title}</h4>
            <p className="text-sm text-gray-300 mt-2">{card.content}</p>
        </div>
         <div className="absolute inset-0 bg-black/70 p-4 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center">
            <p className="text-xs text-white text-center mb-3">
                {card.generationFailed 
                    ? "Image generation failed for this card."
                    : `Image Prompt: ${card.image_prompt}`
                }
            </p>
            {!card.generationFailed && (
              <button
                onClick={() => downloadImage(card.imageUrl, `card-${index + 1}-${createTimestamp()}.jpg`)}
                className="flex items-center px-2 py-1 text-xs bg-purple-600 hover:bg-purple-700 rounded-md transition-colors"
              >
                <IconDownload className="w-3 h-3 mr-1" />
                다운로드
              </button>
            )}
        </div>
    </div>
);


export const CardNewsStudio: React.FC<CardNewsStudioProps> = ({ podcastScript, setIsLoading, setLoadingMessage, toast }) => {
  const [generatedCards, setGeneratedCards] = useState<GeneratedCard[]>([]);

  const handleGenerate = useCallback(async () => {
    if (!podcastScript || podcastScript.trim().length === 0) {
        toast.warning("먼저 2단계에서 스크립트를 생성해주세요.");
        return;
    }
    setIsLoading(true);
    setLoadingMessage('스크립트 내용을 기반으로 전문가형 카드뉴스를 생성하고 있습니다...');
    setGeneratedCards([]);
    try {
        const content = await generateCardNewsFromScript(podcastScript);
        
        const newCards: GeneratedCard[] = [];
        for (let i = 0; i < content.cards.length; i++) {
            const cardData = content.cards[i];
            setLoadingMessage(`카드 ${i + 1}/${content.cards.length} 이미지를 생성하고 있습니다...`);
            try {
                const base64Image = await generateImage(cardData.image_prompt, '9:16');
                const imageUrl = `data:image/jpeg;base64,${base64Image}`;
                newCards.push({ ...cardData, imageUrl, generationFailed: false });
                setGeneratedCards([...newCards]); // Update UI incrementally
            } catch(e) {
                 console.error(`Failed to generate image for card: ${cardData.title}`, e);
                 toast.error(`카드 "${cardData.title}" 이미지 생성 실패`);
                 newCards.push({ ...cardData, imageUrl: 'https://picsum.photos/seed/placeholder/360/640', generationFailed: true });
                 setGeneratedCards([...newCards]);
            }
        }
        toast.success(`${newCards.length}장의 카드뉴스가 생성되었습니다!`);

    } catch (error) {
      toast.error(error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, [podcastScript, setIsLoading, setLoadingMessage, toast]);

  return (
    <div className="p-4 space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-purple-400 mb-2">6. Content Expansion (Card News)</h2>
        <p className="text-gray-400 mb-4">경기 분석 스크립트 내용을 기반으로 전문가형 카드뉴스를 생성합니다. HSO(Hook-Story-Offer) 프레임워크를 적용하여 핵심 데이터와 인사이트를 10장의 임팩트 있는 카드로 제작합니다.</p>

        <div className="bg-gray-800/50 p-4 rounded-lg">
             <button 
                onClick={handleGenerate} 
                disabled={!podcastScript || podcastScript.trim().length === 0}
                className="w-full flex items-center justify-center px-4 py-2 font-semibold bg-purple-600 rounded-md hover:bg-purple-700 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed">
              <IconSparkles className="w-5 h-5 mr-2" />
              스크립트 기반 전문가형 카드뉴스 생성
            </button>
        </div>
      </div>
      
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-purple-300">Generated Card News</h3>
          {generatedCards.length > 0 && (
            <div className="flex space-x-2">
              <button
                onClick={() => downloadJSON(generatedCards, `cardnews-data-${createTimestamp()}.json`)}
                className="flex items-center px-3 py-1 text-sm bg-gray-700 hover:bg-gray-600 rounded-md transition-colors"
                title="카드뉴스 데이터 다운로드"
              >
                <IconDownload className="w-4 h-4 mr-1" />
                JSON
              </button>
              <button
                onClick={() => {
                  const images = generatedCards.map((card, i) => ({
                    url: card.imageUrl,
                    filename: `card-${i + 1}-${createTimestamp()}.jpg`
                  }));
                  downloadAllImagesAsZip(images);
                }}
                className="flex items-center px-3 py-1 text-sm bg-gray-700 hover:bg-gray-600 rounded-md transition-colors"
                title="모든 이미지 다운로드"
              >
                <IconDownload className="w-4 h-4 mr-1" />
                모든 이미지 ({generatedCards.length})
              </button>
            </div>
          )}
        </div>
         <div className="bg-gray-800/50 p-4 rounded-lg min-h-[200px]">
            {generatedCards.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {generatedCards.map((card, index) => (
                        <Card key={index} card={card} index={index} />
                    ))}
                </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-400">Card news will appear here after generation.</p>
              </div>
            )}
          </div>
      </div>
    </div>
  );
};