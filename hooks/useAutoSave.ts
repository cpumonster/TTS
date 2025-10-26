import { useEffect, useRef } from 'react';

const AUTOSAVE_KEY = 'nano-creator-autosave';
const AUTOSAVE_INTERVAL = 10000; // 10초마다 자동 저장

export interface AppState {
  researchData: string;
  podcastScript: string;
  keywords: string[];
  timestamp: number;
}

export const useAutoSave = (state: Omit<AppState, 'timestamp'>) => {
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    // 변경사항이 있을 때마다 저장 예약
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      const stateToSave: AppState = {
        ...state,
        timestamp: Date.now()
      };
      
      try {
        localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(stateToSave));
        console.log('✅ Auto-saved at', new Date().toLocaleTimeString());
      } catch (error) {
        console.error('Failed to auto-save:', error);
      }
    }, AUTOSAVE_INTERVAL);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [state.researchData, state.podcastScript, state.keywords]);
};

export const loadSavedState = (): AppState | null => {
  try {
    const saved = localStorage.getItem(AUTOSAVE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (error) {
    console.error('Failed to load saved state:', error);
  }
  return null;
};

export const clearSavedState = () => {
  try {
    localStorage.removeItem(AUTOSAVE_KEY);
    console.log('🗑️ Cleared saved state');
  } catch (error) {
    console.error('Failed to clear saved state:', error);
  }
};

