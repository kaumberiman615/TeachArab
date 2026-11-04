export type TemplateType =
  | 'flashcard'
  | 'kuis'
  | 'matching'
  | 'mencocokkan'
  | 'slide'
  | 'vocab-picture'
  | 'reading'
  | 'word-table'
  | 'true-false'
  | 'memory'
  | 'wheel'
  | 'letter-order'
  | 'sentence-order';

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

// 1. Flashcard Item
export interface FlashcardItem {
  id: string;
  arabic: string;
  latin: string;
  meaning: string;
  notes?: string;
  mediaImageId?: string;
  mediaAudioId?: string;
}

// 2. Quiz Choice (2 to 5 choices per question)
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

// 3. Matching Item (Pairs)
export interface MatchingPair {
  id: string;
  arabic: string; // Left: Arabic text
  latin?: string;
  meaning: string; // Right: Meaning text or image description
  mediaImageId?: string; // Right: optional image
}

// 4. Slide Item (Slide Materi)
export type SlideLayout = 'text-only' | 'image-left' | 'image-right' | 'image-full' | 'big-title';

export interface SlideItem {
  id: string;
  title: string;
  content: string; // supports multiline, Arabic RTL and Indonesian
  layout: SlideLayout;
  mediaImageId?: string;
  mediaAudioId?: string;
  mediaVideoId?: string;
  youtubeUrl?: string;
  teacherNotes?: string;
}

// 5. Vocab Picture Item (Kosakata Bergambar)
export interface VocabPictureItem {
  id: string;
  arabic: string; // with harakat
  latin?: string;
  meaning: string;
  mediaImageId?: string;
  mediaAudioId?: string;
}

// 6. Reading Sentence Item (Teks Bacaan / Qira'ah)
export interface ReadingSentence {
  id: string;
  arabic: string;
  translation: string;
  mediaAudioId?: string;
}

// 7. Word Table Column & Row (Tabel/Daftar Kata: mufradat, tashrif)
export interface WordTableColumn {
  id: string;
  name: string; // e.g. "Fi'il Madhi", "Fi'il Mudhari'", "Arti"
  isArabic?: boolean; // whether column text is Arabic RTL
}

export interface WordTableRow {
  id: string;
  values: Record<string, string>; // columnId -> cell text
}

// 8. True-False Item (Benar atau Salah)
export interface TrueFalseItem {
  id: string;
  statementArabic: string;
  statementIndo?: string;
  isTrue: boolean; // true = Benar, false = Salah
  explanation?: string;
  mediaImageId?: string;
  mediaAudioId?: string;
}

// 9. Memory Card Pair
export interface MemoryCardPair {
  id: string;
  arabic: string; // Sisi A
  meaning: string; // Sisi B (arti teks)
  mediaImageId?: string; // Sisi B (opsi gambar)
  mediaAudioId?: string; // Sisi B (opsi audio)
}

// 10. Wheel Entry (Roda Acak / Spinner)
export interface WheelEntry {
  id: string;
  text: string; // Arab atau Indonesia
  answerOrExplanation?: string;
  color?: string; // Hex color code
}

// 11. Letter Order Item (Susun Huruf)
export interface LetterOrderItem {
  id: string;
  arabic: string; // Target Arabic word, e.g. "كِتَابٌ"
  meaning: string; // Meaning in Indonesian / hint
  mediaImageId?: string; // Optional image
  mediaAudioId?: string; // Optional audio recording
}

// 12. Sentence Order Item (Susun Kalimat)
export interface SentenceOrderItem {
  id: string;
  sentenceArabic: string; // Target sentence (multiple acceptable orders separated by /)
  translation: string; // Indonesian translation as hint
  mediaAudioId?: string; // Optional audio
}

export type TemplateItem =
  | FlashcardItem
  | QuizItem
  | MatchingPair
  | SlideItem
  | VocabPictureItem
  | ReadingSentence
  | WordTableRow
  | TrueFalseItem
  | MemoryCardPair
  | WheelEntry
  | LetterOrderItem
  | SentenceOrderItem;

export interface DraftSettings {
  // Quiz settings
  timerSeconds?: number; // 0 = off, 10, 15, 30, 45, 60
  shuffleQuestions?: boolean; // Acak urutan soal
  shuffleChoices?: boolean; // Acak urutan pilihan jawaban
  pointsPerQuestion?: number; // Skor per soal (default 10)

  // Matching game settings
  shufflePositions?: boolean; // Acak posisi kiri & kanan
  pairsPerRound?: number; // 0 = semua pasangan, atau 4, 6, 8 pasangan

  // True-False settings
  tfTimerSeconds?: number;
  tfQuestionsPerGame?: number;
  tfPointsPerQuestion?: number;
  tfShuffle?: boolean;

  // Memory Card settings
  memoryPairsPerGame?: number; // 4, 6, 8, 10
  memoryPreviewBriefly?: boolean;
  memoryTimeLimit?: number; // in seconds, 0 = no limit

  // Wheel settings
  wheelMode?: 'students' | 'questions';
  wheelEliminateOnPick?: boolean;
  wheelSound?: boolean;

  // Team mode settings
  teamMode?: boolean;
  teamCount?: number; // 2 to 4
  teamNames?: string[];

  // Flashcard specific
  autoPlayAudio?: boolean;

  // Slide specific
  autoAdvanceSeconds?: number;

  // Vocab Picture specific
  vocabViewMode?: 'grid' | 'single';

  // Reading specific
  fullAudioId?: string;

  // Word table specific
  columns?: WordTableColumn[];

  // Letter Order specific
  letterIgnoreHarakat?: boolean; // Abaikan harakat saat memeriksa
  letterShuffle?: boolean;

  // Sentence Order specific
  sentenceAllowMultipleOrders?: boolean; // Izinkan variasi urutan benar (/)
  sentenceShuffle?: boolean;
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
