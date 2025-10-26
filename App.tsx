import React, { useState, useCallback, useEffect } from 'react';
import { Header } from './components/Header';
import { WorkflowStep } from './components/WorkflowStep';
import { PersonaSettings } from './components/PersonaSettings';
import { ScriptingStudio } from './components/ScriptingStudio';
import { VisualsStudio } from './components/VisualsStudio';
import { VideoStudio } from './components/VideoStudio';
import { ExpansionStudio } from './components/ExpansionStudio';
import { PlanningStudio } from './components/PlanningStudio';
import { CardNewsStudio } from './components/CardNewsStudio';
import { ToastContainer } from './components/Toast';
import { useToast } from './hooks/useToast';
import { useAutoSave, loadSavedState, clearSavedState } from './hooks/useAutoSave';
import type { Persona, VisualAsset, AudioData } from './types';
import { PERSONAS, WORKFLOW_STEPS } from './constants';
import { IconAsset, IconExpansion, IconPlan, IconScript, IconVideo, IconCardNews, IconSave, IconTrash } from './components/Icons';

const App: React.FC = () => {
  const [activeStep, setActiveStep] = useState<string>('Planning');
  const [personas] = useState<Persona[]>(PERSONAS);
  const [researchData, setResearchData] = useState<string>('');
  const [podcastScript, setPodcastScript] = useState<string>('');
  const [keywords, setKeywords] = useState<string[]>([]);
  const [audioData, setAudioData] = useState<AudioData>({});
  const [visualAssets, setVisualAssets] = useState<VisualAsset[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string>('');
  const [showRestorePrompt, setShowRestorePrompt] = useState<boolean>(false);
  const toast = useToast();
  
  // 자동 저장
  useAutoSave({ researchData, podcastScript, keywords });

  // 앱 시작 시 저장된 상태 확인
  useEffect(() => {
    const savedState = loadSavedState();
    if (savedState && (savedState.researchData || savedState.podcastScript || savedState.keywords.length > 0)) {
      setShowRestorePrompt(true);
    }
  }, []);

  const handleRestore = useCallback(() => {
    const savedState = loadSavedState();
    if (savedState) {
      setResearchData(savedState.researchData);
      setPodcastScript(savedState.podcastScript);
      setKeywords(savedState.keywords);
      const timeAgo = Math.floor((Date.now() - savedState.timestamp) / 60000);
      toast.success(`${timeAgo}분 전 저장된 작업을 복구했습니다.`);
    }
    setShowRestorePrompt(false);
  }, [toast]);

  const handleDiscardRestore = useCallback(() => {
    clearSavedState();
    setShowRestorePrompt(false);
    toast.info('저장된 작업을 삭제했습니다.');
  }, [toast]);

  const handleClearAll = useCallback(() => {
    if (confirm('모든 데이터를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      // Blob URL 메모리 정리
      Object.values(audioData).forEach(audio => {
        if (audio.url.startsWith('blob:')) {
          URL.revokeObjectURL(audio.url);
        }
      });
      visualAssets.forEach(asset => {
        if (asset.url.startsWith('blob:')) {
          URL.revokeObjectURL(asset.url);
        }
      });

      setResearchData('');
      setPodcastScript('');
      setKeywords([]);
      setAudioData({});
      setVisualAssets([]);
      clearSavedState();
      toast.info('모든 데이터가 삭제되었습니다.');
    }
  }, [toast, audioData, visualAssets]);
  
  const handleAddVisualAssets = useCallback((assets: VisualAsset[]) => {
    setVisualAssets(prev => [...prev, ...assets]);
  }, []);

  // 컴포넌트 언마운트 시 Blob URL 정리
  useEffect(() => {
    return () => {
      // Cleanup all blob URLs
      Object.values(audioData).forEach(audio => {
        if (audio.url.startsWith('blob:')) {
          URL.revokeObjectURL(audio.url);
        }
      });
      visualAssets.forEach(asset => {
        if (asset.url.startsWith('blob:')) {
          URL.revokeObjectURL(asset.url);
        }
      });
    };
  }, []);

  const renderActiveStep = () => {
    switch (activeStep) {
      case 'Planning':
        return <PlanningStudio 
          setIsLoading={setIsLoading} 
          setLoadingMessage={setLoadingMessage}
          onResearchComplete={setResearchData}
          toast={toast}
        />;
      case 'Scripting':
        return <ScriptingStudio 
          researchData={researchData}
          podcastScript={podcastScript} 
          setPodcastScript={setPodcastScript} 
          personas={personas}
          audioData={audioData}
          setAudioData={setAudioData}
          setIsLoading={setIsLoading}
          setLoadingMessage={setLoadingMessage}
          toast={toast}
        />;
      case 'Visuals':
        return <VisualsStudio
          podcastScript={podcastScript}
          onAssetsGenerated={handleAddVisualAssets}
          onKeywordsGenerated={setKeywords}
          setIsLoading={setIsLoading}
          setLoadingMessage={setLoadingMessage}
          toast={toast}
        />;
      case 'Video':
        return <VideoStudio 
          visualAssets={visualAssets} 
          audioData={audioData}
          podcastScript={podcastScript}
        />;
      case 'Expansion':
          return <ExpansionStudio setIsLoading={setIsLoading} setLoadingMessage={setLoadingMessage}/>;
      case 'CardNews':
          return <CardNewsStudio
            podcastScript={podcastScript}
            setIsLoading={setIsLoading}
            setLoadingMessage={setLoadingMessage}
            toast={toast}
          />;
      default:
        return null;
    }
  };
  
  const getIconForStep = (stepId: string) => {
    switch (stepId) {
        case 'Planning': return <IconPlan className="w-6 h-6" />;
        case 'Scripting': return <IconScript className="w-6 h-6" />;
        case 'Visuals': return <IconAsset className="w-6 h-6" />;
        case 'Video': return <IconVideo className="w-6 h-6" />;
        case 'Expansion': return <IconExpansion className="w-6 h-6" />;
        case 'CardNews': return <IconCardNews className="w-6 h-6" />;
        default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 flex flex-col font-sans">
      <ToastContainer toasts={toast.toasts} onClose={toast.removeToast} />
      
      {/* 복구 프롬프트 */}
      {showRestorePrompt && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[60]">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md mx-4 border border-purple-500">
            <div className="flex items-center mb-4">
              <IconSave className="w-6 h-6 text-purple-400 mr-3" />
              <h3 className="text-xl font-bold text-white">저장된 작업 발견</h3>
            </div>
            <p className="text-gray-300 mb-6">
              이전에 작업하던 내용이 있습니다. 복구하시겠습니까?
            </p>
            <div className="flex space-x-3">
              <button
                onClick={handleRestore}
                className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-md font-semibold transition-colors"
              >
                복구하기
              </button>
              <button
                onClick={handleDiscardRestore}
                className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md font-semibold transition-colors"
              >
                새로 시작
              </button>
            </div>
          </div>
        </div>
      )}

      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex flex-col items-center justify-center z-50">
          <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-purple-500"></div>
          <p className="text-xl mt-4 text-white">{loadingMessage || 'Processing...'}</p>
        </div>
      )}
      <Header />
      <div className="flex-grow flex">
        <aside className="w-64 bg-gray-900 border-r border-gray-700 p-4 flex flex-col">
            <h2 className="text-lg font-semibold text-purple-400 mb-4">Workflow</h2>
            <nav className="flex flex-col space-y-2">
            {WORKFLOW_STEPS.map((step) => (
                <WorkflowStep
                    key={step.id}
                    icon={getIconForStep(step.id)}
                    label={step.label}
                    isActive={activeStep === step.id}
                    onClick={() => setActiveStep(step.id)}
                />
            ))}
            </nav>
            <div className="mt-auto space-y-4">
              <button
                onClick={handleClearAll}
                className="w-full flex items-center justify-center px-3 py-2 text-sm bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-md transition-colors border border-red-600/50"
                title="모든 데이터 삭제"
              >
                <IconTrash className="w-4 h-4 mr-2" />
                모든 데이터 삭제
              </button>
              <PersonaSettings personas={personas} />
            </div>
        </aside>
        <main className="flex-grow p-6 overflow-auto">
          {renderActiveStep()}
        </main>
      </div>
    </div>
  );
};

export default App;