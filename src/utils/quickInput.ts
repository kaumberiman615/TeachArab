import {
  FlashcardItem,
  QuizItem,
  MatchingPair,
  TemplateType,
  QuizChoice,
  TrueFalseItem,
  MemoryCardPair,
  WheelEntry,
} from '../types';

/**
 * Check if a string contains Arabic characters
 */
export function isArabic(text: string): boolean {
  return /[\u0600-\u06FF]/.test(text);
}

/**
 * Parse multi-line raw text (pipe, tab, or comma separated) into flashcards
 */
export function parseQuickFlashcards(rawText: string): FlashcardItem[] {
  const lines = rawText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  const items: FlashcardItem[] = [];

  for (const line of lines) {
    let parts: string[] = [];
    if (line.includes('|')) {
      parts = line.split('|').map(p => p.trim());
    } else if (line.includes('\t')) {
      parts = line.split('\t').map(p => p.trim());
    } else if (line.includes(';')) {
      parts = line.split(';').map(p => p.trim());
    } else {
      parts = [line];
    }

    if (parts.length === 0 || !parts[0]) continue;

    let arabic = '';
    let latin = '';
    let meaning = '';
    let notes = '';

    if (parts.length === 1) {
      if (isArabic(parts[0])) {
        arabic = parts[0];
      } else {
        meaning = parts[0];
      }
    } else if (parts.length === 2) {
      if (isArabic(parts[0])) {
        arabic = parts[0];
        meaning = parts[1];
      } else if (isArabic(parts[1])) {
        arabic = parts[1];
        meaning = parts[0];
      } else {
        latin = parts[0];
        meaning = parts[1];
      }
    } else if (parts.length === 3) {
      if (isArabic(parts[0])) {
        arabic = parts[0];
        latin = parts[1];
        meaning = parts[2];
      } else if (isArabic(parts[1])) {
        latin = parts[0];
        arabic = parts[1];
        meaning = parts[2];
      } else {
        arabic = parts[0];
        latin = parts[1];
        meaning = parts[2];
      }
    } else {
      arabic = parts[0];
      latin = parts[1];
      meaning = parts[2];
      notes = parts.slice(3).join(' | ');
    }

    items.push({
      id: 'fc_' + Math.random().toString(36).substring(2, 9),
      arabic,
      latin,
      meaning,
      notes: notes || undefined
    });
  }

  return items;
}

/**
 * Parse multi-line raw text into quiz items
 * Format: soal | pilihan A | pilihan B | pilihan C | pilihan D [| pilihan E] | huruf jawaban benar [| penjelasan]
 */
export function parseQuickQuiz(rawText: string): QuizItem[] {
  const lines = rawText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  const items: QuizItem[] = [];

  for (const line of lines) {
    let parts: string[] = [];
    if (line.includes('|')) {
      parts = line.split('|').map(p => p.trim());
    } else if (line.includes('\t')) {
      parts = line.split('\t').map(p => p.trim());
    } else if (line.includes(';')) {
      parts = line.split(';').map(p => p.trim());
    }

    if (parts.length < 3) continue;

    const question = parts[0];
    const isQuestionArabic = isArabic(question);

    let rawChoices: string[] = [];
    let correctIndex = 0;
    let explanation = '';

    // Check last element or second to last element for answer key
    // E.g. parts: [soal, optA, optB, optC, optD, key, explanation?]
    // key can be: A, B, C, D, E, 1, 2, 3, 4, 5
    const isKey = (str: string) => /^[a-e1-5]$/i.test(str.trim());

    let keyIndexInParts = -1;
    for (let i = parts.length - 1; i >= 2; i--) {
      if (isKey(parts[i])) {
        keyIndexInParts = i;
        break;
      }
    }

    if (keyIndexInParts !== -1) {
      rawChoices = parts.slice(1, keyIndexInParts);
      const keyStr = parts[keyIndexInParts].toLowerCase().trim();
      if (keyStr === 'a' || keyStr === '1') correctIndex = 0;
      else if (keyStr === 'b' || keyStr === '2') correctIndex = 1;
      else if (keyStr === 'c' || keyStr === '3') correctIndex = 2;
      else if (keyStr === 'd' || keyStr === '4') correctIndex = 3;
      else if (keyStr === 'e' || keyStr === '5') correctIndex = 4;

      if (keyIndexInParts < parts.length - 1) {
        explanation = parts.slice(keyIndexInParts + 1).join(' | ');
      }
    } else {
      // Standard 4 choices without explicit key, key defaults to A
      rawChoices = parts.slice(1, 5);
      correctIndex = 0;
      if (parts.length > 5) {
        explanation = parts.slice(5).join(' | ');
      }
    }

    // Ensure choices has at least 2 items and at most 5 items
    if (rawChoices.length < 2) {
      rawChoices.push('Pilihan B');
    }
    const finalChoices: QuizChoice[] = rawChoices.slice(0, 5).map(text => ({ text }));

    items.push({
      id: 'quiz_' + Math.random().toString(36).substring(2, 9),
      questionArabic: isQuestionArabic ? question : '',
      questionIndo: !isQuestionArabic ? question : '',
      choices: finalChoices,
      correctIndex: Math.max(0, Math.min(finalChoices.length - 1, correctIndex)),
      explanation: explanation || undefined
    });
  }

  return items;
}

/**
 * Parse multi-line raw text into matching pairs
 * Format: kata Arab | arti
 */
export function parseQuickMatching(rawText: string): MatchingPair[] {
  const lines = rawText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  const items: MatchingPair[] = [];

  for (const line of lines) {
    let parts: string[] = [];
    if (line.includes('|')) {
      parts = line.split('|').map(p => p.trim());
    } else if (line.includes('\t')) {
      parts = line.split('\t').map(p => p.trim());
    } else if (line.includes(';')) {
      parts = line.split(';').map(p => p.trim());
    } else {
      parts = [line];
    }

    if (parts.length === 0 || !parts[0]) continue;

    let arabic = '';
    let latin = '';
    let meaning = '';

    if (parts.length === 1) {
      arabic = parts[0];
      meaning = parts[0];
    } else if (parts.length === 2) {
      if (isArabic(parts[0])) {
        arabic = parts[0];
        meaning = parts[1];
      } else {
        arabic = parts[1];
        meaning = parts[0];
      }
    } else {
      arabic = parts[0];
      latin = parts[1];
      meaning = parts[2];
    }

    items.push({
      id: 'match_' + Math.random().toString(36).substring(2, 9),
      arabic,
      latin: latin || undefined,
      meaning
    });
  }

  return items;
}

/**
 * Parse multi-line raw text into slides
 * Format: judul | isi
 */
export function parseQuickSlide(rawText: string) {
  const lines = rawText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  const items: any[] = [];

  for (const line of lines) {
    let parts: string[] = [];
    if (line.includes('|')) {
      parts = line.split('|').map(p => p.trim());
    } else if (line.includes('\t')) {
      parts = line.split('\t').map(p => p.trim());
    } else {
      parts = [line];
    }

    if (parts.length === 0 || !parts[0]) continue;

    const title = parts[0];
    const content = parts.length > 1 ? parts.slice(1).join('\n') : '';

    items.push({
      id: 'slide_' + Math.random().toString(36).substring(2, 9),
      title,
      content,
      layout: 'text-only',
    });
  }

  return items;
}

/**
 * Parse multi-line raw text into vocab pictures
 * Format: kata Arab | latin | arti
 */
export function parseQuickVocabPicture(rawText: string) {
  const lines = rawText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  const items: any[] = [];

  for (const line of lines) {
    let parts: string[] = [];
    if (line.includes('|')) {
      parts = line.split('|').map(p => p.trim());
    } else if (line.includes('\t')) {
      parts = line.split('\t').map(p => p.trim());
    } else if (line.includes(';')) {
      parts = line.split(';').map(p => p.trim());
    } else {
      parts = [line];
    }

    if (parts.length === 0 || !parts[0]) continue;

    let arabic = '';
    let latin = '';
    let meaning = '';

    if (parts.length === 1) {
      if (isArabic(parts[0])) {
        arabic = parts[0];
        meaning = parts[0];
      } else {
        meaning = parts[0];
      }
    } else if (parts.length === 2) {
      arabic = parts[0];
      meaning = parts[1];
    } else {
      arabic = parts[0];
      latin = parts[1];
      meaning = parts[2];
    }

    items.push({
      id: 'vocab_' + Math.random().toString(36).substring(2, 9),
      arabic,
      latin: latin || undefined,
      meaning,
    });
  }

  return items;
}

/**
 * Parse multi-line raw text into reading sentences
 * Format: kalimat Arab | terjemah
 */
export function parseQuickReading(rawText: string) {
  const lines = rawText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  const items: any[] = [];

  for (const line of lines) {
    let parts: string[] = [];
    if (line.includes('|')) {
      parts = line.split('|').map(p => p.trim());
    } else if (line.includes('\t')) {
      parts = line.split('\t').map(p => p.trim());
    } else {
      parts = [line];
    }

    if (parts.length === 0 || !parts[0]) continue;

    const arabic = parts[0];
    const translation = parts.length > 1 ? parts.slice(1).join(' | ') : '';

    items.push({
      id: 'sent_' + Math.random().toString(36).substring(2, 9),
      arabic,
      translation,
    });
  }

  return items;
}

/**
 * Parse multi-line raw text into table rows
 * Format: tempel dari Excel/CSV, satu baris satu baris tabel, dipisah | atau tab
 */
export function parseQuickWordTable(rawText: string, columns?: any[]) {
  const lines = rawText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  const items: any[] = [];

  const colIds = columns && columns.length > 0
    ? columns.map(c => c.id)
    : ['col_madhi', 'col_mudhari', 'col_amr', 'col_mashdar', 'col_arti'];

  for (const line of lines) {
    let parts: string[] = [];
    if (line.includes('\t')) {
      parts = line.split('\t').map(p => p.trim());
    } else if (line.includes('|')) {
      parts = line.split('|').map(p => p.trim());
    } else if (line.includes(';')) {
      parts = line.split(';').map(p => p.trim());
    } else {
      parts = [line];
    }

    if (parts.length === 0 || !parts[0]) continue;

    const values: Record<string, string> = {};
    colIds.forEach((colId, idx) => {
      values[colId] = parts[idx] || '';
    });

    items.push({
      id: 'row_' + Math.random().toString(36).substring(2, 9),
      values,
    });
  }

  return items;
}

/**
 * Parse multi-line raw text for True-False
 * Format: pernyataan | B atau S | penjelasan (opsional)
 */
export function parseQuickTrueFalse(rawText: string): TrueFalseItem[] {
  const lines = rawText.split('\n').map((l) => l.trim()).filter((l) => l.length > 0);
  const items: TrueFalseItem[] = [];

  for (const line of lines) {
    let parts: string[] = [];
    if (line.includes('|')) {
      parts = line.split('|').map((p) => p.trim());
    } else if (line.includes('\t')) {
      parts = line.split('\t').map((p) => p.trim());
    } else if (line.includes(';')) {
      parts = line.split(';').map((p) => p.trim());
    } else {
      parts = [line];
    }

    if (parts.length === 0 || !parts[0]) continue;

    const statement = parts[0];
    const answerStr = (parts[1] || 'B').toUpperCase().trim();
    const explanation = parts[2] || '';

    // True indicators: B, BENAR, TRUE, T, 1, ص, صحيح
    const isTrue =
      answerStr === 'B' ||
      answerStr === 'BENAR' ||
      answerStr === 'TRUE' ||
      answerStr === 'T' ||
      answerStr === '1' ||
      answerStr === 'ص' ||
      answerStr.includes('صَحِيح');

    items.push({
      id: 'tf_' + Math.random().toString(36).substring(2, 9),
      statementArabic: statement,
      statementIndo: isArabic(statement) ? '' : statement,
      isTrue,
      explanation: explanation || undefined,
    });
  }

  return items;
}

/**
 * Parse multi-line raw text for Memory Card
 * Format: kata Arab | arti
 */
export function parseQuickMemory(rawText: string): MemoryCardPair[] {
  const lines = rawText.split('\n').map((l) => l.trim()).filter((l) => l.length > 0);
  const items: MemoryCardPair[] = [];

  for (const line of lines) {
    let parts: string[] = [];
    if (line.includes('|')) {
      parts = line.split('|').map((p) => p.trim());
    } else if (line.includes('\t')) {
      parts = line.split('\t').map((p) => p.trim());
    } else if (line.includes(';')) {
      parts = line.split(';').map((p) => p.trim());
    } else {
      parts = [line];
    }

    if (parts.length === 0 || !parts[0]) continue;

    let arabic = parts[0];
    let meaning = parts[1] || parts[0];

    // Auto-swap if first part is Latin and second part is Arabic
    if (!isArabic(arabic) && isArabic(meaning)) {
      const temp = arabic;
      arabic = meaning;
      meaning = temp;
    }

    items.push({
      id: 'mem_' + Math.random().toString(36).substring(2, 9),
      arabic,
      meaning,
    });
  }

  return items;
}

/**
 * Parse multi-line raw text for Wheel
 * Format: teks | jawaban atau penjelasan (opsional)
 */
export function parseQuickWheel(rawText: string): WheelEntry[] {
  const lines = rawText.split('\n').map((l) => l.trim()).filter((l) => l.length > 0);
  const items: WheelEntry[] = [];
  const colors = [
    '#059669',
    '#4f46e5',
    '#d97706',
    '#dc2626',
    '#0891b2',
    '#7c3aed',
    '#ea580c',
    '#0d9488',
    '#2563eb',
    '#db2777',
  ];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    let parts: string[] = [];
    if (line.includes('|')) {
      parts = line.split('|').map((p) => p.trim());
    } else if (line.includes('\t')) {
      parts = line.split('\t').map((p) => p.trim());
    } else if (line.includes(';')) {
      parts = line.split(';').map((p) => p.trim());
    } else {
      parts = [line];
    }

    if (parts.length === 0 || !parts[0]) continue;

    items.push({
      id: 'wh_' + Math.random().toString(36).substring(2, 9),
      text: parts[0],
      answerOrExplanation: parts[1] || undefined,
      color: colors[i % colors.length],
    });
  }

  return items;
}

export function parseQuickInput(type: string, rawText: string, extra?: any) {
  if (type === 'flashcard') {
    return parseQuickFlashcards(rawText);
  }
  if (type === 'kuis') {
    return parseQuickQuiz(rawText);
  }
  if (type === 'matching' || type === 'mencocokkan') {
    return parseQuickMatching(rawText);
  }
  if (type === 'slide') {
    return parseQuickSlide(rawText);
  }
  if (type === 'vocab-picture') {
    return parseQuickVocabPicture(rawText);
  }
  if (type === 'reading') {
    return parseQuickReading(rawText);
  }
  if (type === 'word-table') {
    return parseQuickWordTable(rawText, extra?.columns);
  }
  if (type === 'true-false') {
    return parseQuickTrueFalse(rawText);
  }
  if (type === 'memory') {
    return parseQuickMemory(rawText);
  }
  if (type === 'wheel') {
    return parseQuickWheel(rawText);
  }
  return [];
}

