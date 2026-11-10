/**
 * AI Assistant Configuration
 * Central source of truth for model selection, rate limits, allowed tasks, and validation bounds.
 */

// Model Gemini Flash - diletakkan di satu konstanta konfigurasi agar mudah diganti
export const GEMINI_MODEL = 'gemini-3.8-flash';

export const AI_CONFIG = {
  // Model name constant
  MODEL: GEMINI_MODEL,

  // Rate limits per IP: maksimal 10 permintaan per jam dan 30 per hari
  RATE_LIMITS: {
    MAX_HOURLY: 10,
    MAX_DAILY: 30,
    WINDOW_HOUR_MS: 60 * 60 * 1000,
    WINDOW_DAY_MS: 24 * 60 * 60 * 1000,
  },

  // Input validation bounds
  BOUNDS: {
    MIN_COUNT: 1,
    MAX_COUNT: 15,
    DEFAULT_COUNT: 5,
    MAX_TEXT_LENGTH: 3000,
    MAX_TOPIC_LENGTH: 200,
  },

  // Primary task IDs as strictly requested
  ALLOWED_TASKS: [
    'vocab_from_topic',
    'mcq_from_text',
    'truefalse_from_text',
    'fillblank_from_text',
    'sentences_from_topic',
    'words_from_topic',
  ] as const,

  // Legacy task aliases for backwards compatibility
  TASK_ALIASES: {
    vocab_topic: 'vocab_from_topic',
    quiz_text: 'mcq_from_text',
    true_false_text: 'truefalse_from_text',
    fill_blank_text: 'fillblank_from_text',
    sentence_topic: 'sentences_from_topic',
    letter_order_topic: 'words_from_topic',
  } as Record<string, string>,

  // Allowed difficulty levels
  ALLOWED_LEVELS: ['pemula', 'menengah', 'lanjut'] as const,
};

export type AiTaskId = typeof AI_CONFIG.ALLOWED_TASKS[number];
export type AiLevel = typeof AI_CONFIG.ALLOWED_LEVELS[number];
