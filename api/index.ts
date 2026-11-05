import express, { Request, Response } from 'express';
import { AI_CONFIG } from './config.js';
import { verifyAuthToken } from './auth.js';
import { checkRateLimit, recordRateLimitUsage, getRateLimitStatus } from './rateLimiter.js';
import { generateWithGemini } from './generator.js';

const app = express();

app.use(express.json({ limit: '1mb' }));

// Health check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    app: 'Teach Arab',
    message: 'Backend API Teach Arab berjalan normal.',
    timestamp: new Date().toISOString(),
  });
});

// AI Configuration and Quota Status check
app.get('/api/ai/status', async (req: Request, res: Response) => {
  const apiKey = process.env.GEMINI_API_KEY;
  const isEnabled = Boolean(apiKey);

  let quota = {
    remainingHourly: AI_CONFIG.RATE_LIMITS.MAX_HOURLY,
    remainingDaily: AI_CONFIG.RATE_LIMITS.MAX_DAILY,
  };

  const authHeader = req.headers.authorization;
  if (authHeader) {
    const authResult = await verifyAuthToken(authHeader);
    if (authResult.valid && authResult.uid) {
      quota = getRateLimitStatus(authResult.uid);
    }
  }

  res.json({
    status: isEnabled ? 'ai_enabled' : 'ai_disabled',
    aiEnabled: isEnabled,
    limits: {
      maxHourly: AI_CONFIG.RATE_LIMITS.MAX_HOURLY,
      maxDaily: AI_CONFIG.RATE_LIMITS.MAX_DAILY,
    },
    quota,
  });
});

// Main AI Generator Endpoint
app.post('/api/generate', async (req: Request, res: Response) => {
  const apiKey = process.env.GEMINI_API_KEY;

  // 1. If GEMINI_API_KEY is not set, return ai_disabled status
  if (!apiKey) {
    res.status(200).json({
      status: 'ai_disabled',
      error: 'ai_disabled',
      message: 'Layanan Bantuan AI belum diaktifkan karena kunci API server belum dikonfigurasi.',
    });
    return;
  }

  // 2. Authentication: Require Firebase ID token
  const authHeader = req.headers.authorization;
  const authResult = await verifyAuthToken(authHeader);
  if (!authResult.valid || !authResult.uid) {
    res.status(401).json({
      error: 'unauthorized',
      message: authResult.error || 'Fitur Bantuan AI memerlukan login dengan akun Google.',
    });
    return;
  }

  // 3. Rate limiting check per user ID (10/hour, 30/day)
  const rateLimitCheck = checkRateLimit(authResult.uid);
  if (!rateLimitCheck.allowed) {
    res.status(429).json({
      error: 'rate_limit_exceeded',
      message: rateLimitCheck.message,
      remainingHourly: rateLimitCheck.remainingHourly,
      remainingDaily: rateLimitCheck.remainingDaily,
    });
    return;
  }

  // 4. Input validation
  const { task, templateType, topic, text, count, level } = req.body || {};

  if (!task || !AI_CONFIG.ALLOWED_TASKS.includes(task)) {
    res.status(400).json({
      error: 'invalid_task',
      message: 'Tugas AI tidak valid. Pilih salah satu tugas yang didukung.',
    });
    return;
  }

  const contentText = (text || topic || '').trim();
  if (!contentText) {
    res.status(400).json({
      error: 'missing_text',
      message: 'Tema atau teks materi tidak boleh kosong.',
    });
    return;
  }

  if (contentText.length > AI_CONFIG.BOUNDS.MAX_TEXT_LENGTH) {
    res.status(400).json({
      error: 'text_too_long',
      message: `Teks materi maksimal ${AI_CONFIG.BOUNDS.MAX_TEXT_LENGTH} karakter. Teks Anda: ${contentText.length} karakter.`,
    });
    return;
  }

  const itemCount = Number(count);
  if (isNaN(itemCount) || itemCount < AI_CONFIG.BOUNDS.MIN_COUNT || itemCount > AI_CONFIG.BOUNDS.MAX_COUNT) {
    res.status(400).json({
      error: 'invalid_count',
      message: `Jumlah item harus antara ${AI_CONFIG.BOUNDS.MIN_COUNT} sampai ${AI_CONFIG.BOUNDS.MAX_COUNT}.`,
    });
    return;
  }

  // 5. Generate with Gemini
  const genResult = await generateWithGemini({
    task,
    templateType: templateType || '',
    topic,
    text,
    count: itemCount,
    level,
  });

  if (!genResult.success) {
    res.status(genResult.statusCode || 500).json({
      error: genResult.error || 'generate_error',
      message: genResult.error || 'Gagal menghasilkan materi dari AI.',
      remainingHourly: rateLimitCheck.remainingHourly,
      remainingDaily: rateLimitCheck.remainingDaily,
    });
    return;
  }

  // 6. Record rate limit usage on success
  const updatedUsage = recordRateLimitUsage(authResult.uid);

  res.json({
    status: 'success',
    items: genResult.items,
    count: genResult.items?.length || 0,
    remainingHourly: updatedUsage.remainingHourly,
    remainingDaily: updatedUsage.remainingDaily,
  });
});

export default app;
