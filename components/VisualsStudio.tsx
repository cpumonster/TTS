import React, { useState, useCallback } from 'react';
import { extractKeywordsFromScript, generateImage, generateImagePromptsFromKeywords } from '../services/geminiService';
import type { VisualAsset } from '../types';
import { AssetType } from '../types';
import { IconSparkles, IconDownload } from './Icons';
import { downloadImage, downloadAllImagesAsZip, createTimestamp } from '../utils/download';

interface VisualsStudioProps {
  podcastScript: string;
  onAssetsGenerated: (assets: VisualAsset[]) => void;
  onKeywordsGenerated: (keywords: string[]) => void;
  setIsLoading: (loading: boolean) => void;
  setLoadingMessage: (message: string) => void;
  toast: ReturnType<typeof import('../hooks/useToast').useToast>;
}

export const VisualsStudio: React.FC<VisualsStudioProps> = ({ podcastScript, onAssetsGenerated, onKeywordsGenerated, setIsLoading, setLoadingMessage, toast }) => {
  const [keywords, setKeywords] = useState<string[]>([]);
  const [generatedImages, setGeneratedImages] = useState<VisualAsset[]>([]);

  const handleGenerateVisuals = useCallback(async () => {
    if (!podcastScript) {
        toast.warning("먼저 2단계에서 스크립트를 생성해주세요.");
        return;
    }
    setIsLoading(true);
    setGeneratedImages([]);
    setKeywords([]);
    try {
      setLoadingMessage('스크립트에서 키워드를 추출하고 있습니다...');
      const extractedKeywords = await extractKeywordsFromScript(podcastScript);
      setKeywords(extractedKeywords);
      onKeywordsGenerated(extractedKeywords);
      
      setLoadingMessage('이미지 프롬프트를 최적화하고 있습니다...');
      const imagePromptsMap = await generateImagePromptsFromKeywords(extractedKeywords);

      const newAssets: VisualAsset[] = [];
      const promptEntries = Object.entries(imagePromptsMap);

      // 병렬로 이미지 생성 (최대 3개씩)
      const BATCH_SIZE = 3;
      for (let i = 0; i < promptEntries.length; i += BATCH_SIZE) {
        const batch = promptEntries.slice(i, i + BATCH_SIZE);
        setLoadingMessage(`이미지 생성 중 ${i + 1}-${Math.min(i + BATCH_SIZE, promptEntries.length)}/${promptEntries.length}...`);
        
        const batchResults = await Promise.allSettled(
          batch.map(async ([keyword, prompt], batchIndex) => {
            const base64Image = await generateImage(prompt, '16:9', (attempt) => {
              console.log(`Retrying "${keyword}" image (attempt ${attempt})`);
            });
            const imageUrl = `data:image/jpeg;base64,${base64Image}`;
            return {
              id: `img_${Date.now()}_${i + batchIndex}`,
              type: AssetType.IMAGE,
              url: imageUrl,
              prompt: prompt,
              keyword
            };
          })
        );

        batchResults.forEach((result, batchIndex) => {
          if (result.status === 'fulfilled') {
            const { keyword, ...asset } = result.value;
            newAssets.push(asset);
            setGeneratedImages(prev => [...prev, asset]);
          } else {
            const [keyword] = batch[batchIndex];
            console.error(`Failed to generate image for: ${keyword}`, result.reason);
            toast.error(`"${keyword}" 이미지 생성 실패`);
          }
        });
      }
      
      onAssetsGenerated(newAssets);
      toast.success(`${newAssets.length}개의 이미지가 생성되었습니다!`);

    } catch (error) {
      toast.error(error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, [podcastScript, onAssetsGenerated, onKeywordsGenerated, setIsLoading, setLoadingMessage, toast]);
  

  return (
    <div className="p-4 space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-purple-400 mb-2">3. Visual Asset Auto-Generation</h2>
        <p className="text-gray-400 mb-4">대본을 기반으로 핵심 키워드 10개를 추출하고, Nano Banana API를 사용하여 각 키워드에 맞는 B-Roll 이미지를 생성합니다.</p>

        <div className="bg-gray-800/50 p-4 rounded-lg">
             <button 
                onClick={handleGenerateVisuals} 
                disabled={!podcastScript}
                className="w-full flex items-center justify-center px-4 py-2 font-semibold bg-purple-600 rounded-md hover:bg-purple-700 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed">
              <IconSparkles className="w-5 h-5 mr-2" />
              Extract Keywords & Generate Images
            </button>
        </div>
      </div>
      
      {keywords.length > 0 && (
          <div className="animate-fade-in">
            <h3 className="text-xl font-bold text-purple-300 mb-4">Extracted Keywords</h3>
            <div className="bg-gray-800/50 p-4 rounded-lg">
                <div className="flex flex-wrap gap-2">
                    {keywords.map((keyword, index) => (
                        <span key={index} className="bg-purple-500/50 text-purple-200 text-sm font-medium px-3 py-1 rounded-full">
                            {keyword}
                        </span>
                    ))}
                </div>
            </div>
          </div>
      )}

      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-purple-300">Generated Image Gallery</h3>
          {generatedImages.length > 0 && (
            <button
              onClick={() => {
                const images = generatedImages.map((asset, i) => ({
                  url: asset.url,
                  filename: `b-roll-${i + 1}-${createTimestamp()}.jpg`
                }));
                downloadAllImagesAsZip(images);
              }}
              className="flex items-center px-3 py-1 text-sm bg-gray-700 hover:bg-gray-600 rounded-md transition-colors"
              title="모든 이미지 다운로드"
            >
              <IconDownload className="w-4 h-4 mr-1" />
              모두 저장 ({generatedImages.length})
            </button>
          )}
        </div>
         <div className="bg-gray-800/50 p-4 rounded-lg min-h-[200px]">
            {generatedImages.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {generatedImages.map((asset, index) => (
                         <div key={asset.id} className="group relative aspect-video bg-gray-700 rounded-md overflow-hidden">
                            <img src={asset.url} alt={asset.prompt} className="w-full h-full object-cover" />
                             <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-2">
                                <p className="text-xs text-white text-center font-bold mb-2">{asset.prompt}</p>
                                <button
                                  onClick={() => downloadImage(asset.url, `b-roll-${index + 1}-${createTimestamp()}.jpg`)}
                                  className="flex items-center px-2 py-1 text-xs bg-purple-600 hover:bg-purple-700 rounded-md transition-colors"
                                >
                                  <IconDownload className="w-3 h-3 mr-1" />
                                  다운로드
                                </button>
                            </div>
                         </div>
                    ))}
                </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-400">Images will appear here after generation.</p>
              </div>
            )}
          </div>
      </div>
    </div>
  );
};