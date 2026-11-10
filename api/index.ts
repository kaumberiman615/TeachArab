import express, { Request, Response } from 'express';
import { AI_CONFIG, AiTaskId, AiLevel } from './config.js';
import { checkRateLimit, recordRateLimitUsage, getRateLimitStatus } from './rateLimiter.js';
import { generateWithGemini } from './generator.js';

const app = express();

app.use(express.json({ limit: '1mb' }));

/**
 * Ekstraksi alamat IP klien dari header x-forwarded-for atau request socket
 */
function getClientIp(req: Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.length > 0) {
    return forwarded.split(',')[0].trim();
  }
  if (Array.isArray(forwarded) && forwarded.length > 0) {
    return forwarded[0].trim();
  }
  return req.ip || req.socket.remoteAddress || '127.0.0.1';
}

/**
 * 10. Endpoint GET /api/health
 * Pemeriksaan kesehatan layanan backend Teach Arab
 */
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    app: 'Teach Arab',
    message: 'Backend API Teach Arab berjalan normal.',
    timestamp: new Date().toISOString(),
  });
});

/**
 * 9. Endpoint GET /api/ai-status (dan kompatibilitas /api/ai/status)
 * Memeriksa status ketersediaan fitur AI dan sisa kuota per IP klien
 */
const handleAiStatus = (req: Request, res: Response) => {
  const apiKey = process.env.GEMINI_API_KEY;
  const isEnabled = Boolean(apiKey && apiKey.trim().length > 0);
  const clientIp = getClientIp(req);
  const quota = getRateLimitStatus(clientIp);

  res.json({
    status: isEnabled ? 'ai_enabled' : 'ai_disabled',
    enabled: isEnabled,
    model: AI_CONFIG.MODEL,
    limits: {
      maxHourly: AI_CONFIG.RATE_LIMITS.MAX_HOURLY,
      maxDaily: AI_CONFIG.RATE_LIMITS.MAX_DAILY,
    },
    quota: {
      remainingHourly: quota.remainingHourly,
      remainingDaily: quota.remainingDaily,
    },
  });
};

app.get('/api/ai-status', handleAiStatus);
app.get('/api/ai/status', handleAiStatus);

/**
 * Endpoint Utama POST /api/generate
 *
 * Catatan penting:
 * Penghitung batas laju (rate limit) disimpan di memori server per IP klien
 * (maksimal 10 permintaan per jam dan 30 per hari). Penyimpanan in-memory ini
 * tidak persisten di lingkungan serverless atau saat container server restart.
 */
app.post('/api/generate', async (req: Request, res: Response) => {
  // 1. Cek apakah GEMINI_API_KEY terpasang di server
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim().length === 0) {
    res.status(200).json({
      status: 'ai_disabled',
      enabled: false,
      message: 'Layanan Bantuan AI belum diaktifkan karena kunci API server belum dikonfigurasi.',
    });
    return;
  }

  // 2. Batas laju sederhana per IP klien (maksimal 10/jam dan 30/hari)
  const clientIp = getClientIp(req);
  const rateLimitCheck = checkRateLimit(clientIp);
  if (!rateLimitCheck.allowed) {
    res.status(429).json({
      status: 'error',
      error: 'rate_limit_exceeded',
      message: rateLimitCheck.message || 'Layanan AI sedang penuh, coba lagi nanti.',
      remainingHourly: rateLimitCheck.remainingHourly,
      remainingDaily: rateLimitCheck.remainingDaily,
    });
    return;
  }

  // 3. Validasi ketat input
  const { task, templateType, topic, text, count, level } = req.body || {};

  // Pemetaan alias tugas jika ada input varian lawas
  const effectiveTask = (task && AI_CONFIG.TASK_ALIASES[task] ? AI_CONFIG.TASK_ALIASES[task] : task) as AiTaskId;

  if (!effectiveTask || !AI_CONFIG.ALLOWED_TASKS.includes(effectiveTask)) {
    res.status(400).json({
      status: 'error',
      error: 'invalid_task',
      message: 'Tugas AI tidak valid. Pilih salah satu tugas yang didukung: vocab_from_topic, mcq_from_text, truefalse_from_text, fillblank_from_text, sentences_from_topic, words_from_topic.',
    });
    return;
  }

  // Validasi panjang topik (maksimal 200 karakter)
  if (topic !== undefined && topic !== null) {
    if (typeof topic !== 'string') {
      res.status(400).json({
        status: 'error',
        error: 'invalid_topic_type',
        message: 'Topik materi harus berupa teks string.',
      });
      return;
    }
    if (topic.length > AI_CONFIG.BOUNDS.MAX_TOPIC_LENGTH) {
      res.status(400).json({
        status: 'error',
        error: 'topic_too_long',
        message: `Topik materi maksimal ${AI_CONFIG.BOUNDS.MAX_TOPIC_LENGTH} karakter. Teks Anda: ${topic.length} karakter.`,
      });
      return;
    }
  }

  // Validasi panjang teks rujukan (maksimal 3000 karakter)
  if (text !== undefined && text !== null) {
    if (typeof text !== 'string') {
      res.status(400).json({
        status: 'error',
        error: 'invalid_text_type',
        message: 'Teks materi harus berupa teks string.',
      });
      return;
    }
    if (text.length > AI_CONFIG.BOUNDS.MAX_TEXT_LENGTH) {
      res.status(400).json({
        status: 'error',
        error: 'text_too_long',
        message: `Teks materi maksimal ${AI_CONFIG.BOUNDS.MAX_TEXT_LENGTH} karakter. Teks Anda: ${text.length} karakter.`,
      });
      return;
    }
  }

  // Pastikan salah satu topik atau teks rujukan tidak kosong
  const hasTopic = typeof topic === 'string' && topic.trim().length > 0;
  const hasText = typeof text === 'string' && text.trim().length > 0;

  if (!hasTopic && !hasText) {
    res.status(400).json({
      status: 'error',
      error: 'missing_content',
      message: 'Topik atau teks materi harus diisi.',
    });
    return;
  }

  // Validasi count (harus angka bulat 1 sampai 15)
  const itemCount = Number(count);
  if (!Number.isInteger(itemCount) || itemCount < AI_CONFIG.BOUNDS.MIN_COUNT || itemCount > AI_CONFIG.BOUNDS.MAX_COUNT) {
    res.status(400).json({
      status: 'error',
      error: 'invalid_count',
      message: `Jumlah item (count) harus berupa angka bulat antara ${AI_CONFIG.BOUNDS.MIN_COUNT} sampai ${AI_CONFIG.BOUNDS.MAX_COUNT}.`,
    });
    return;
  }

  // Validasi level (pemula / menengah / lanjut)
  let effectiveLevel: AiLevel = 'pemula';
  if (level !== undefined && level !== null && level !== '') {
    if (typeof level !== 'string' || !AI_CONFIG.ALLOWED_LEVELS.includes(level as AiLevel)) {
      res.status(400).json({
        status: 'error',
        error: 'invalid_level',
        message: 'Tingkat kesulitan (level) tidak valid. Pilihan yang tersedia: pemula, menengah, atau lanjut.',
      });
      return;
    }
    effectiveLevel = level as AiLevel;
  }

  // 4. Proses pembuatan materi dengan Gemini
  const genResult = await generateWithGemini({
    task: effectiveTask,
    templateType: templateType ? String(templateType) : '',
    topic: hasTopic ? topic.trim() : undefined,
    text: hasText ? text.trim() : undefined,
    count: itemCount,
    level: effectiveLevel,
  });

  if (!genResult.success) {
    const statusCode = genResult.statusCode || 500;
    res.status(statusCode).json({
      status: genResult.error === 'ai_disabled' ? 'ai_disabled' : 'error',
      error: genResult.error || 'generate_error',
      message: genResult.error || 'Terjadi kendala saat memproses permintaan AI. Silakan coba beberapa saat lagi.',
      remainingHourly: rateLimitCheck.remainingHourly,
      remainingDaily: rateLimitCheck.remainingDaily,
    });
    return;
  }

  // 5. Catat penggunaan kuota berhasil untuk IP klien
  const updatedUsage = recordRateLimitUsage(clientIp);

  res.json({
    status: 'success',
    items: genResult.items,
    count: genResult.items?.length || 0,
    remainingHourly: updatedUsage.remainingHourly,
    remainingDaily: updatedUsage.remainingDaily,
  });
});

export default app;
