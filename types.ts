
export interface Persona {
  id: string;
  name: string;
  description: string;
  voiceId: string;
  avatar: string;
}

export interface AudioData {
  [personaId: string]: {
    url: string;
    waveform: number[];
  };
}

export enum AssetType {
  IMAGE = 'image',
  VIDEO = 'video',
}

export interface VisualAsset {
  id: string;
  type: AssetType;
  url: string;
  prompt: string;
}

export interface TimelineItem {
  id: string;
  asset: VisualAsset;
  startTime: number;
  duration: number;
}

// FIX: Added WorkflowStep interface for type safety in constants.
export interface WorkflowStep {
  id: string;
  label: string;
}
