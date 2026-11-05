import { GoogleGenAI, Type } from '@google/genai';
import { AI_CONFIG, AiTaskId, AiLevel } from './config.js';

export interface GenerateInput {
  task: AiTaskId;
  templateType: string;
  topic?: string;
  text?: string;
  count: number;
  level?: AiLevel;
}

export interface GenerateResult {
  success: boolean;
  items?: any[];
  error?: string;
  statusCode?: number;
}

/**
 * Sanitize a string: trim, remove dangerous characters, limit length
 */
function cleanString(str: any, maxLen = 500): string {
  if (typeof str !== 'string') return '';
  return str.trim().slice(0, maxLen);
}

/**
 * Validate and clean generated items based on task type
 */
function sanitizeGeneratedItems(task: AiTaskId, rawItems: any[], maxCount: number): any[] {
  if (!Array.isArray(rawItems)) return [];

  const cleaned: any[] = [];
  const limit = Math.min(rawItems.length, maxCount);

  for (let i = 0; i < limit; i++) {
    const raw = rawItems[i];
    if (!raw || typeof raw !== 'object') continue;

    if (task === 'vocab_topic') {
      const arabic = cleanString(raw.arabic, 200);
      const latin = cleanString(raw.latin, 200);
      const meaning = cleanString(raw.meaning, 300);
      if (arabic && meaning) {
        cleaned.push({
          id: 'ai_vocab_' + Math.random().toString(36).substring(2, 9),
          arabic,
          latin: latin || undefined,
          meaning,
        });
      }
    } else if (task === 'quiz_text') {
      const questionArabic = cleanString(raw.questionArabic, 300);
      const rawChoices = Array.isArray(raw.choices) ? raw.choices : [];
      const choices = rawChoices.map((c: any) => cleanString(c, 150)).filter(Boolean);
      let correctIndex = typeof raw.correctIndex === 'number' ? raw.correctIndex : 0;
      if (correctIndex < 0 || correctIndex >= choices.length) correctIndex = 0;
      const explanation = cleanString(raw.explanation, 400);

      if (questionArabic && choices.length >= 2) {
        cleaned.push({
          id: 'ai_quiz_' + Math.random().toString(36).substring(2, 9),
          questionArabic,
          choices,
          correctIndex,
          explanation: explanation || undefined,
        });
      }
    } else if (task === 'true_false_text') {
      const statementArabic = cleanString(raw.statementArabic, 300);
      const statementIndo = cleanString(raw.statementIndo, 300);
      const isTrue = Boolean(raw.isTrue);
      const explanation = cleanString(raw.explanation, 400);

      if (statementArabic) {
        cleaned.push({
          id: 'ai_tf_' + Math.random().toString(36).substring(2, 9),
          statementArabic,
          statementIndo: statementIndo || undefined,
          isTrue,
          explanation: explanation || undefined,
        });
      }
    } else if (task === 'fill_blank_text') {
      let question = cleanString(raw.question, 300);
      if (question && !question.includes('___')) {
        question += ' ___';
      }
      const rawAnswers = Array.isArray(raw.answers) ? raw.answers : [raw.answers];
      const answers = rawAnswers.map((a: any) => cleanString(a, 150)).filter(Boolean);
      const explanation = cleanString(raw.explanation, 400);

      if (question && answers.length > 0) {
        cleaned.push({
          id: 'ai_fb_' + Math.random().toString(36).substring(2, 9),
          question,
          answers,
          explanation: explanation || undefined,
          strictHarakat: false,
        });
      }
    } else if (task === 'sentence_topic') {
      const sentenceArabic = cleanString(raw.sentenceArabic, 400);
      const translation = cleanString(raw.translation, 400);

      if (sentenceArabic && translation) {
        cleaned.push({
          id: 'ai_sent_' + Math.random().toString(36).substring(2, 9),
          sentenceArabic,
          translation,
        });
      }
    } else if (task === 'letter_order_topic') {
      const arabic = cleanString(raw.arabic, 100);
      const meaning = cleanString(raw.meaning, 200);

      if (arabic && meaning) {
        cleaned.push({
          id: 'ai_lo_' + Math.random().toString(36).substring(2, 9),
          arabic,
          meaning,
        });
      }
    }
  }

  return cleaned;
}

/**
 * Generate material with Gemini
 */
export async function generateWithGemini(input: GenerateInput): Promise<GenerateResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return {
      success: false,
      statusCode: 200,
      error: 'ai_disabled',
    };
  }

  // 1. Validate task
  if (!AI_CONFIG.ALLOWED_TASKS.includes(input.task)) {
    return {
      success: false,
      statusCode: 400,
      error: 'Jenis tugas AI tidak didukung.',
    };
  }

  // 2. Validate topic or text
  const sourceText = (input.text || input.topic || '').trim();
  if (!sourceText) {
    return {
      success: false,
      statusCode: 400,
      error: 'Tema atau teks materi tidak boleh kosong.',
    };
  }

  if (sourceText.length > AI_CONFIG.BOUNDS.MAX_TEXT_LENGTH) {
    return {
      success: false,
      statusCode: 400,
      error: `Teks materi terlalu panjang (maksimal ${AI_CONFIG.BOUNDS.MAX_TEXT_LENGTH} karakter).`,
    };
  }

  // 3. Validate count
  const count = Math.min(
    Math.max(Number(input.count) || AI_CONFIG.BOUNDS.DEFAULT_COUNT, AI_CONFIG.BOUNDS.MIN_COUNT),
    AI_CONFIG.BOUNDS.MAX_COUNT
  );

  const level = input.level || 'pemula';
  const levelLabel =
    level === 'lanjut'
      ? 'tingkat lanjut (mutaqaddim/advanced)'
      : level === 'menengah'
      ? 'tingkat menengah (mutawassith/intermediate)'
      : 'tingkat pemula (mubtadi/beginner)';

  // 4. Initialize GenAI client with required User-Agent
  const ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });

  const systemInstruction = `Anda adalah asisten pakar kurikulum dan pembelajaran Bahasa Arab (Fusha) untuk guru sekolah.
Tugas Anda adalah menghasilkan materi ajar yang pedagogis, akurat, dan langsung dapat digunakan di kelas.
ATURAN UTAMA:
1. Semua kata/kalimat bahasa Arab WAJIB ragam Fusha dan WAJIB DIBERI HARAKAT LENGKAP DAN JELAS (fathah, kasrah, dhammah, sukun, syaddah/tasydid, tanwin).
2. Terjemahan bahasa Indonesia harus alami, tepat konteks, dan mudah dipahami siswa.
3. Sesuaikan dengan tingkat: ${levelLabel}.
4. Hasilkan HANYA data JSON valid sesuai skema yang diminta, tanpa pembungkus markdown atau komentar teks.`;

  let prompt = '';
  let responseSchema: any = null;

  switch (input.task) {
    case 'vocab_topic':
      prompt = `Buatkan tepat ${count} kosakata bahasa Arab (fusha berharakat lengkap, transliterasi latin, dan artinya dalam bahasa Indonesia) tentang tema: "${sourceText}". Tingkat: ${levelLabel}.`;
      responseSchema = {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            arabic: { type: Type.STRING, description: 'Kata bahasa Arab dengan harakat lengkap' },
            latin: { type: Type.STRING, description: 'Transliterasi latin, contoh: Kitaabun' },
            meaning: { type: Type.STRING, description: 'Arti dalam bahasa Indonesia' },
          },
          required: ['arabic', 'latin', 'meaning'],
        },
      };
      break;

    case 'quiz_text':
      prompt = `Berdasarkan teks materi berikut, buatkan tepat ${count} soal kuis pilihan ganda yang mendidik untuk menguji pemahaman kosakata atau isi teks.
Tiap soal memiliki pertanyaan (bahasa Arab berharakat atau bahasa Indonesia), 3 sampai 4 pilihan jawaban yang masuk akal, indeks kunci jawaban yang benar (0-based index), dan penjelasan ringkas.
Tingkat: ${levelLabel}.
Teks materi:
"""
${sourceText}
"""`;
      responseSchema = {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            questionArabic: { type: Type.STRING, description: 'Pertanyaan kuis' },
            choices: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: '3 atau 4 pilihan jawaban',
            },
            correctIndex: { type: Type.INTEGER, description: 'Indeks jawaban yang benar (0 sampai choices.length - 1)' },
            explanation: { type: Type.STRING, description: 'Penjelasan ringkas jawaban yang benar' },
          },
          required: ['questionArabic', 'choices', 'correctIndex', 'explanation'],
        },
      };
      break;

    case 'true_false_text':
      prompt = `Berdasarkan teks/tema berikut, buatkan tepat ${count} pernyataan Benar atau Salah (kombinasikan ada yang Benar dan ada yang Salah secara seimbang).
Tiap pernyataan mencakup teks pernyataan bahasa Arab berharakat lengkap, terjemah Indonesia, kunci isTrue (true jika pernyataan benar, false jika pernyataan salah), dan penjelasan koreksi jika salah.
Tingkat: ${levelLabel}.
Materi:
"""
${sourceText}
"""`;
      responseSchema = {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            statementArabic: { type: Type.STRING, description: 'Pernyataan bahasa Arab berharakat lengkap' },
            statementIndo: { type: Type.STRING, description: 'Terjemahan pernyataan dalam bahasa Indonesia' },
            isTrue: { type: Type.BOOLEAN, description: 'True bila pernyataan benar, false bila salah' },
            explanation: { type: Type.STRING, description: 'Penjelasan fakta yang benar' },
          },
          required: ['statementArabic', 'statementIndo', 'isTrue', 'explanation'],
        },
      };
      break;

    case 'fill_blank_text':
      prompt = `Berdasarkan teks/tema berikut, buatkan tepat ${count} kalimat rumpang untuk latihan isian singkat.
Tandai bagian yang harus diisi siswa menggunakan tanda "___" persis di dalam kalimat bahasa Arab berharakat. Berikan daftar kunci jawaban yang benar (jawaban utama dengan harakat dan alternatif tanpa harakat), serta penjelasan atau terjemahan kalimat.
Tingkat: ${levelLabel}.
Materi:
"""
${sourceText}
"""`;
      responseSchema = {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            question: { type: Type.STRING, description: 'Kalimat bahasa Arab berharakat dengan tanda ___' },
            answers: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Kunci jawaban yang diterima',
            },
            explanation: { type: Type.STRING, description: 'Terjemahan atau penjelasan kalimat' },
          },
          required: ['question', 'answers', 'explanation'],
        },
      };
      break;

    case 'sentence_topic':
      prompt = `Buatkan tepat ${count} kalimat bahasa Arab (fusha berharakat lengkap) dan terjemahan bahasa Indonesianya tentang tema/konteks: "${sourceText}".
Kalimat harus terstruktur baik dengan tata bahasa (nahwu/sharaf) yang shahih dan cocok untuk latihan susun kalimat atau bacaan siswa.
Tingkat: ${levelLabel}.`;
      responseSchema = {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            sentenceArabic: { type: Type.STRING, description: 'Kalimat bahasa Arab berharakat lengkap' },
            translation: { type: Type.STRING, description: 'Terjemahan bahasa Indonesia' },
          },
          required: ['sentenceArabic', 'translation'],
        },
      };
      break;

    case 'letter_order_topic':
      prompt = `Buatkan tepat ${count} kosakata bahasa Arab (fusha berharakat lengkap) dan artinya dalam bahasa Indonesia untuk permainan susun huruf bertema: "${sourceText}".
Pilih kata yang memiliki 3 sampai 6 huruf agar seru disusun oleh siswa.
Tingkat: ${levelLabel}.`;
      responseSchema = {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            arabic: { type: Type.STRING, description: 'Satu kata bahasa Arab berharakat lengkap' },
            meaning: { type: Type.STRING, description: 'Arti kata dalam bahasa Indonesia' },
          },
          required: ['arabic', 'meaning'],
        },
      };
      break;
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema,
      },
    });

    const textOutput = response.text || '[]';
    let parsed: any;
    try {
      parsed = JSON.parse(textOutput);
    } catch {
      // In case wrapped in markdown backticks
      const cleanJson = textOutput.replace(/```json/gi, '').replace(/```/g, '').trim();
      parsed = JSON.parse(cleanJson);
    }

    const cleanedItems = sanitizeGeneratedItems(input.task, parsed, count);

    if (cleanedItems.length === 0) {
      return {
        success: false,
        statusCode: 502,
        error: 'Model AI tidak menghasilkan item materi yang valid. Silakan coba sesuaikan tema atau teks.',
      };
    }

    return {
      success: true,
      items: cleanedItems,
    };
  } catch (error: any) {
    console.error('[api/generator] Gemini API error:', error);

    // Handle 429 Quota Exceeded
    const status = error?.status || error?.statusCode;
    const msg = error?.message || '';
    if (status === 429 || msg.includes('429') || msg.includes('RESOURCE_EXHAUSTED')) {
      return {
        success: false,
        statusCode: 429,
        error: 'Layanan AI sedang penuh, coba lagi nanti.',
      };
    }

    // Permission denied or invalid key
    if (status === 403 || msg.includes('API_KEY_INVALID') || msg.includes('PERMISSION_DENIED')) {
      return {
        success: false,
        statusCode: 403,
        error: 'Kunci GEMINI_API_KEY tidak valid atau izin ditolak.',
      };
    }

    return {
      success: false,
      statusCode: 500,
      error: 'Terjadi kesalahan saat memproses materi dengan AI: ' + (error?.message || 'Gagal memanggil model'),
    };
  }
}
