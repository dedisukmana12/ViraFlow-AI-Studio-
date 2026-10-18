
export interface Scene {
  id: string;
  visualPrompt: string;
  audioScript: string;
  duration: number;
}

export interface VideoProject {
  id: string;
  title: string;
  niche: string;
  hook: string;
  script: Scene[];
  captions: string;
  hashtags: string[];
  status: 'draft' | 'generating' | 'completed' | 'scheduled';
  createdAt: number;
  voiceId?: string;
  audioUrl?: string;
}

export interface ViralIdea {
  title: string;
  hook: string;
  reasoning: string;
  viralScore: number;
}

export enum VoiceName {
  ZEPHYR = 'Zephyr',
  PUCK = 'Puck',
  CHARON = 'Charon',
  KORE = 'Kore',
  FENRIR = 'Fenrir'
}
