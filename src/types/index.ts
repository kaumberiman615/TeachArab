export type TemplateType = 'flashcard' | 'kuis' | 'matching' | 'mencocokkan';
export type TemplateCategory = 'materi' | 'game';

export function isMatchingTemplate(type?: string): boolean {
  return type === 'matching' || type === 'mencocokkan';
}

export interface ThemeConfig {
  palette: 'emerald' | 'indigo' | 'amber' | 'rose' | 'teal';
  fontFamily: 'Amiri' | 'Noto Naskh Arabic' | 'Scheherazade New';
  fontSize: 'normal' | 'large' | 'xlarge' | 'xxlarge';
  showHarakat: boolean;
  showLatin: boolean;
  soundEnabled: boolean;
}

export interface MediaItem {
  id: string;
  name: string;
  type: 'image' | 'audio' | 'video';
  mimeType: string;
  blob: Blob;
  size: number;
}

// Flashcard Item
export interface FlashcardItem {
  id: string;
  arabic: string;
  latin: string;
  meaning: string;
  notes?: string;
  mediaImageId?: string;
  mediaAudioId?: string;
}

// Quiz Choice (2 to 5 choices per question)
export interface QuizChoice {
  text: string;
  mediaImageId?: string;
}

// Quiz Item
export interface QuizItem {
  id: string;
  questionArabic: string;
  questionLatin?: string;
  questionIndo?: string;
  choices: QuizChoice[];
  correctIndex: number; // 0 to choices.length - 1
  explanation?: string;
  mediaImageId?: string;
  mediaAudioId?: string;
}

// Matching Item (Pairs)
export interface MatchingPair {
  id: string;
  arabic: string; // Left: Arabic text
  latin?: string;
  meaning: string; // Right: Meaning text or image description
  mediaImageId?: string; // Right: optional image
}

export type TemplateItem = FlashcardItem | QuizItem | MatchingPair;

export interface DraftSettings {
  // Quiz settings
  timerSeconds?: number; // 0 = off, 10, 15, 30, 45, 60
  shuffleQuestions?: boolean; // Acak urutan soal
  shuffleChoices?: boolean; // Acak urutan pilihan jawaban
  pointsPerQuestion?: number; // Skor per soal (default 10)

  // Matching game settings
  shufflePositions?: boolean; // Acak posisi kiri & kanan
  pairsPerRound?: number; // 0 = semua pasangan, atau 4, 6, 8 pasangan

  // Team mode settings
  teamMode?: boolean;
  teamCount?: number; // 2 to 4
  teamNames?: string[];

  // Flashcard specific
  autoPlayAudio?: boolean;
}

export interface Draft {
  id: string;
  title: string;
  description: string;
  templateType: TemplateType;
  theme: ThemeConfig;
  settings: DraftSettings;
  items: any[];
  mediaFiles: Record<string, MediaItem>;
  createdAt: number;
  updatedAt: number;
}

export interface DraftSummary {
  id: string;
  title: string;
  description: string;
  templateType: TemplateType;
  itemCount: number;
  hasMedia: boolean;
  updatedAt: number;
  createdAt: number;
}

export interface CloudProject {
  id: string;
  ownerId: string;
  templateType: TemplateType;
  title: string;
  description?: string;
  content: {
    theme: ThemeConfig;
    settings: DraftSettings;
    items: any[];
    mediaUrls?: Record<string, string>;
  };
  mediaRefs: Record<string, string>; // mediaId -> Firebase Storage Download URL
  createdAt: number;
  updatedAt: number;
  isPublic: boolean;
  shareId: string;
}
