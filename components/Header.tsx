
import React from 'react';
import { IconLogo } from './Icons';

export const Header: React.FC = () => {
  return (
    <header className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700 p-4 flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <IconLogo className="w-8 h-8 text-purple-400" />
        <h1 className="text-xl font-bold tracking-wider">
          Nano Creator <span className="text-sm font-light text-purple-400">Project: Nano Banana</span>
        </h1>
      </div>
      <div className="flex items-center space-x-4">
        <button className="px-4 py-2 text-sm font-semibold bg-purple-600 rounded-md hover:bg-purple-700 transition-colors">
          Export Project
        </button>
      </div>
    </header>
  );
};
