/**
 * AI Assistant Configuration
 * Central source of truth for rate limits, allowed tasks, and validation bounds.
 */

export const AI_CONFIG = {
  // Rate limits per user
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
  },

  // Supported task IDs and descriptions
  ALLOWED_TASKS: [
    'vocab_topic',
    'quiz_text',
    'true_false_text',
    'fill_blank_text',
    'sentence_topic',
    'letter_order_topic',
  ] as const,

  // Allowed difficulty levels
  ALLOWED_LEVELS: ['pemula', 'menengah', 'lanjut'] as const,
};

export type AiTaskId = typeof AI_CONFIG.ALLOWED_TASKS[number];
export type AiLevel = typeof AI_CONFIG.ALLOWED_LEVELS[number];
