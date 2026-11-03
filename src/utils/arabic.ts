/**
 * Arabic typography & linguistic utilities
 */

// Arabic Harakat (Tashkeel) Unicode regex
export const HARAKAT_REGEX = /[\u064B-\u065F\u0670\u06D6-\u06ED]/g;

/**
 * Remove all diacritical marks (harakat/tashkeel) from Arabic text
 */
export function removeHarakat(text: string): string {
  if (!text) return '';
  return text.replace(HARAKAT_REGEX, '');
}

/**
 * Check if text contains harakat
 */
export function hasHarakat(text: string): boolean {
  if (!text) return false;
  return /[\u064B-\u0652\u0670]/.test(text);
}

/**
 * Web Speech API synthesis for Arabic reading
 */
export function speakArabic(text: string): Promise<void> {
  return new Promise((resolve) => {
    if (!('speechSynthesis' in window)) {
      alert('Browser Anda tidak mendukung Web Speech API (suara otomatis). Silakan gunakan Chrome/Edge/Safari terbaru.');
      resolve();
      return;
    }

    // Cancel any previous speech
    window.speechSynthesis.cancel();

    // Clean text for speech if needed (speech synthesis can read harakat, but strip HTML)
    const cleanText = text.replace(/<[^>]*>/g, '').trim();
    if (!cleanText) {
      resolve();
      return;
    }

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'ar-SA';
    utterance.rate = 0.85; // slightly slower for language learners

    // Find preferred Arabic voice if available
    const voices = window.speechSynthesis.getVoices();
    const arabicVoice = voices.find(v => v.lang.startsWith('ar'));
    if (arabicVoice) {
      utterance.voice = arabicVoice;
    }

    utterance.onend = () => resolve();
    utterance.onerror = (e) => {
      console.warn('SpeechSynthesis error:', e);
      resolve();
    };

    window.speechSynthesis.speak(utterance);
  });
}

/**
 * Sanitize plain string before rendering to prevent XSS attacks
 */
export function sanitizeText(str: string): string {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Keyboard keys organized for Arabic learning
 */
export const ARABIC_KEYBOARD_LAYOUT = {
  letters: [
    ['ض', 'ص', 'ث', 'ق', 'ف', 'غ', 'ع', 'ه', 'خ', 'ح', 'ج', 'د', 'ذ'],
    ['ش', 'س', 'ي', 'ب', 'ل', 'ا', 'ت', 'ن', 'م', 'ك', 'ط', 'ظ'],
    ['ء', 'ئ', 'ؤ', 'ر', 'لا', 'ى', 'ة', 'و', 'ز', 'ظ']
  ],
  harakat: [
    { char: '\u064E', name: 'Fatḥah', label: 'ـَ' },
    { char: '\u064F', name: 'Ḍammah', label: 'ـُ' },
    { char: '\u0650', name: 'Kasrah', label: 'ـِ' },
    { char: '\u0652', name: 'Sukūn', label: 'ـْ' },
    { char: '\u064B', name: 'Tanwīn Fatḥ', label: 'ـً' },
    { char: '\u064C', name: 'Tanwīn Ḍamm', label: 'ـٌ' },
    { char: '\u064D', name: 'Tanwīn Kasr', label: 'ـٍ' },
    { char: '\u0651', name: 'Shaddah', label: 'ـّ' },
    { char: '\u0670', name: 'Alif Khanjariyah', label: 'ـٰ' },
    { char: '\u0653', name: 'Maddah', label: 'ـٓ' },
    { char: '\u0640', name: 'Tatweel', label: 'ـ' },
  ],
  numbers: ['١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩', '٠'],
  punctuation: ['؟', '،', '؛', '.', '!', ':', '«', '»', '(', ')']
};

/**
 * Split an Arabic word into individual letter units with their combining harakat attached.
 * Example: "كِتَابٌ" -> ["كِ", "تَ", "ا", "بٌ"]
 */
export function splitArabicWordLetters(word: string): string[] {
  if (!word) return [];
  const clean = word.trim();
  if (!clean) return [];

  // Try Intl.Segmenter with grapheme granularity (standard in modern browsers)
  if (typeof Intl !== 'undefined' && (Intl as any).Segmenter) {
    try {
      const segmenter = new (Intl as any).Segmenter('ar', { granularity: 'grapheme' });
      const segments: string[] = [];
      for (const seg of segmenter.segment(clean)) {
        const text = seg.segment.trim();
        if (text) {
          segments.push(text);
        }
      }
      if (segments.length > 0) {
        return segments;
      }
    } catch {
      // fallback below
    }
  }

  // Regex fallback: Base letter (or digit/char) followed by 0 or more combining diacritics
  const regex = /[^\u064B-\u065F\u0670\u06D6-\u06ED\s][\u064B-\u065F\u0670\u06D6-\u06ED]*/g;
  const matches = clean.match(regex);
  if (matches && matches.length > 0) {
    return matches;
  }

  return clean.split('').filter((c) => c.trim().length > 0);
}

/**
 * Split an Arabic sentence into words (separated by spaces)
 */
export function splitArabicSentenceWords(sentence: string): string[] {
  if (!sentence) return [];
  return sentence
    .trim()
    .split(/\s+/)
    .map((w) => w.trim())
    .filter((w) => w.length > 0);
}

