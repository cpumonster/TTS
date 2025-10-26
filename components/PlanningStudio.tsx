

import React, { useState, useCallback } from 'react';
import { IconSparkles } from './Icons';
import { performResearch } from '../services/geminiService';

interface PlanningStudioProps {
  setIsLoading: (loading: boolean) => void;
  setLoadingMessage: (message: string) => void;
  onResearchComplete: (data: string) => void;
  toast: ReturnType<typeof import('../hooks/useToast').useToast>;
}

export const PlanningStudio: React.FC<PlanningStudioProps> = ({ setIsLoading, setLoadingMessage, onResearchComplete, toast }) => {
  const [researchTopic, setResearchTopic] = useState<string>("KBL 현대모비스와 LG 5차전 경기 분석");
  const [researchInstructions, setResearchInstructions] = useState<string>("제공된 경기 기록 데이터를 기반으로, 각 팀의 승리 요인과 패배 요인을 분석하고, 시리즈의 전체적인 흐름을 요약해줘.");
  const [rawData, setRawData] = useState<string>(`경기일시	홈팀 : 원정팀	종합	핸디캡
(홈)	핸디캡
결과	언더
오버	언/오버 결과
25.04.28(월)	울산 현대모비스 74 : 76 창원 LG	150	-2.5	패	154.5	언더
25.04.26(토)	창원 LG 84 : 75 울산 현대모비스	159	-4.5	승	151.5	오버
25.04.24(목)	창원 LG 67 : 64 울산 현대모비스	131	-3.5	패	152.5	언더
25.04.05(토)	울산 현대모비스 76 : 83 창원 LG	159	+2.5	패	155.5	오버
25.03.14(금)	창원 LG 84 : 81 울산 현대모비스	165	-2.5	승	153.5	오버`);
  const [researchResult, setResearchResult] = useState<string>('');
  const [sources, setSources] = useState<{web: {uri: string; title: string}}[]>([]);
  const [analyzeNews, setAnalyzeNews] = useState<boolean>(false);

  const handleStartAnalysis = useCallback(async () => {
    if (!researchTopic.trim()) {
      toast.warning('분석 주제를 입력해주세요.');
      return;
    }
    setIsLoading(true);
    setLoadingMessage(analyzeNews ? 'Gemini가 데이터와 최신 뉴스를 분석하고 있습니다...' : 'Gemini가 데이터를 분석하고 있습니다...');
    setResearchResult('');
    setSources([]);
    try {
      const result = await performResearch(researchTopic, researchInstructions, rawData, analyzeNews);
      setResearchResult(result.text);
      const webSources = result.sources.filter(s => s.web);
      setSources(webSources);
      onResearchComplete(result.text);
      toast.success('분석이 완료되었습니다!');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, [researchTopic, researchInstructions, rawData, analyzeNews, setIsLoading, setLoadingMessage, onResearchComplete, toast]);

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold text-purple-400 mb-2">1. Planning & Data Analysis</h2>
      <p className="text-gray-400 mb-8">분석할 주제와 지침을 입력하고, 원본 데이터를 제공하여 사실 기반의 분석 리포트를 생성합니다.</p>
      
      <div className="bg-gray-800/50 p-6 rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <label className="block text-sm font-semibold mb-2">분석 주제</label>
                <textarea 
                    value={researchTopic}
                    onChange={(e) => setResearchTopic(e.target.value)}
                    className="w-full bg-transparent border border-gray-600 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono text-sm"
                    placeholder="e.g., 'KBL 현대모비스와 LG 경기'"
                    rows={2}
                />
            </div>
            <div>
                <label className="block text-sm font-semibold mb-2">분석 지침</label>
                <textarea 
                    value={researchInstructions}
                    onChange={(e) => setResearchInstructions(e.target.value)}
                    className="w-full bg-transparent border border-gray-600 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono text-sm"
                    placeholder="e.g., '선수별 스탯, 최근 5경기 트렌드 포함'"
                    rows={2}
                />
            </div>
        </div>
        <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-semibold">분석할 데이터 (선택 사항)</label>
                <div className="flex items-center space-x-2 cursor-pointer" onClick={() => setAnalyzeNews(!analyzeNews)}>
                    <span className={`text-sm font-medium transition-colors ${analyzeNews ? 'text-purple-400' : 'text-gray-400'}`}>최근 뉴스 기사 분석 추가</span>
                    <button
                        aria-checked={analyzeNews}
                        role="switch"
                        className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-purple-500 ${analyzeNews ? 'bg-purple-600' : 'bg-gray-600'}`}
                    >
                        <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${analyzeNews ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                </div>
            </div>
            <textarea 
                value={rawData}
                onChange={(e) => setRawData(e.target.value)}
                className="w-full bg-transparent border border-gray-600 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono text-sm"
                placeholder="여기에 분석할 원본 데이터를 붙여넣으세요. (e.g., 경기 기록, 스탯 표 등) 비워두면 Google 검색을 사용합니다."
                rows={8}
            />
        </div>
        <button 
          onClick={handleStartAnalysis}
          className="mt-4 px-6 py-2 font-semibold bg-purple-600 rounded-md hover:bg-purple-700 transition-colors w-full md:w-auto flex items-center justify-center"
        >
            <IconSparkles className="w-5 h-5 mr-2" />
            Start Analysis
        </button>
      </div>

      {(researchResult || sources.length > 0) && (
        <div className="mt-8 bg-gray-900/50 p-6 rounded-lg animate-fade-in">
            <h3 className="text-xl font-semibold mb-4 text-purple-300">Analysis Report</h3>
            {researchResult && (
                <div className="bg-gray-800 p-4 rounded-md">
                   <pre className="whitespace-pre-wrap font-sans text-gray-200">{researchResult}</pre>
                </div>
            )}
            {sources.length > 0 && (
                <div className="mt-4">
                    <h4 className="font-semibold text-purple-400 mb-2">Sources (from Google Search)</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                        {sources.map((source, index) => (
                            <li key={index}>
                                <a href={source.web.uri} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
                                    {source.web.title || source.web.uri}
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
      )}
    </div>
  );
};