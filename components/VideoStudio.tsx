
import React from 'react';
import type { VisualAsset, AudioData } from '../types';
import { AssetType } from '../types';
import { IconImage, IconVideo } from './Icons';

interface VideoStudioProps {
  visualAssets: VisualAsset[];
  audioData: AudioData;
  podcastScript: string;
}

const Timeline: React.FC<{ audioData: AudioData }> = ({ audioData }) => {
    const hasAudio = Object.keys(audioData).length > 0;
    return (
        <div className="w-full bg-gray-800 rounded-lg p-4 space-y-4">
            <h3 className="text-lg font-semibold text-purple-300">Timeline</h3>
            {Object.entries(audioData).map(([personaId, data]) => (
                <div key={personaId} className="flex items-center space-x-2">
                    <span className="w-24 text-sm font-mono text-gray-400">{personaId === 'q' ? 'Q (Audio)' : '지영 (Audio)'}</span>
                    <div className="flex-grow h-12 bg-gray-700 rounded-md flex items-center px-2">
                       <div className="w-full h-8 bg-purple-500 opacity-50 rounded-sm"></div>
                    </div>
                </div>
            ))}
             {!hasAudio && <p className="text-center text-gray-500 text-sm py-4">Generate audio in the Scripting tab to see the timeline.</p>}
            <div className="flex items-center space-x-2">
                <span className="w-24 text-sm font-mono text-gray-400">B-Roll</span>
                <div className="flex-grow h-12 bg-gray-700 rounded-md border-2 border-dashed border-gray-600 flex items-center justify-center">
                    <p className="text-gray-500 text-sm">Drag assets here</p>
                </div>
            </div>
        </div>
    );
}

const AssetLibrary: React.FC<{ assets: VisualAsset[] }> = ({ assets }) => {
    return (
        <div className="bg-gray-800 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-purple-300 mb-4">Asset Library</h3>
            {assets.length === 0 ? (
                <p className="text-center text-gray-500 text-sm py-4">No assets generated yet. Go to the Visuals tab.</p>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {assets.map(asset => (
                        <div key={asset.id} className="group relative aspect-video bg-gray-700 rounded-md overflow-hidden cursor-pointer">
                            {asset.type === AssetType.IMAGE ? (
                                <img src={asset.url} alt={asset.prompt} className="w-full h-full object-cover" />
                            ) : (
                                <video src={asset.url} className="w-full h-full object-cover" />
                            )}
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-2">
                                <div className="text-white">
                                    {asset.type === AssetType.IMAGE ? <IconImage className="w-5 h-5 mb-1" /> : <IconVideo className="w-5 h-5 mb-1" />}
                                    <p className="text-xs line-clamp-2">{asset.prompt}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export const VideoStudio: React.FC<VideoStudioProps> = ({ visualAssets, audioData, podcastScript }) => {
  return (
    <div className="p-4 space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-purple-400 mb-4">Video Production</h2>
        <div className="space-y-6">
            <Timeline audioData={audioData} />
            <AssetLibrary assets={visualAssets} />
        </div>
      </div>
    </div>
  );
};