export interface AiStatusResponse {
  status: 'ai_enabled' | 'ai_disabled';
  aiEnabled: boolean;
  limits: {
    maxHourly: number;
    maxDaily: number;
  };
  quota?: {
    remainingHourly: number;
    remainingDaily: number;
  };
}

export interface GenerateAiRequest {
  task: string;
  templateType: string;
  topic?: string;
  text?: string;
  count: number;
  level: 'pemula' | 'menengah' | 'lanjut';
}

export interface GenerateAiResponse {
  status: string;
  items?: any[];
  count?: number;
  remainingHourly?: number;
  remainingDaily?: number;
  error?: string;
  message?: string;
}

/**
 * Memeriksa status AI dan sisa kuota dari backend
 */
export async function fetchAiStatus(idToken?: string | null): Promise<AiStatusResponse> {
  try {
    const headers: Record<string, string> = {};
    if (idToken) {
      headers['Authorization'] = `Bearer ${idToken}`;
    }

    const response = await fetch('/api/ai-status', { headers });
    if (!response.ok) {
      return {
        status: 'ai_disabled',
        aiEnabled: false,
        limits: { maxHourly: 10, maxDaily: 30 },
      };
    }
    const data = await response.json();
    const isEnabled = Boolean(data.enabled || data.aiEnabled || data.status === 'ai_enabled');

    return {
      status: isEnabled ? 'ai_enabled' : 'ai_disabled',
      aiEnabled: isEnabled,
      limits: data.limits || { maxHourly: 10, maxDaily: 30 },
      quota: data.quota,
    };
  } catch (err) {
    console.warn('[aiService] Gagal memeriksa status AI:', err);
    return {
      status: 'ai_disabled',
      aiEnabled: false,
      limits: { maxHourly: 10, maxDaily: 30 },
    };
  }
}

/**
 * Panggil server-side /api/generate
 */
export async function generateAiContent(
  req: GenerateAiRequest,
  idToken?: string | null
): Promise<GenerateAiResponse> {
  const sanitizedTopic = req.topic ? req.topic.trim().slice(0, 200) : undefined;
  const sanitizedText = req.text ? req.text.trim().slice(0, 3000) : undefined;

  const payload = {
    task: req.task,
    templateType: req.templateType,
    topic: sanitizedTopic,
    text: sanitizedText,
    count: Math.min(Math.max(Number(req.count) || 5, 1), 15),
    level: req.level || 'pemula',
  };

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (idToken) {
    headers['Authorization'] = `Bearer ${idToken}`;
  }

  let response: Response;
  try {
    response = await fetch('/api/generate', {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });
  } catch (netErr) {
    console.error('[aiService] Network error:', netErr);
    throw new Error('Gagal terhubung ke server AI. Periksa koneksi internet Anda dan coba lagi.');
  }

  let data: any;
  try {
    data = await response.json();
  } catch {
    throw new Error('Respons dari server tidak dapat dibaca. Silakan coba lagi.');
  }

  if (response.status === 429) {
    throw new Error(data.message || 'Layanan AI sedang penuh atau batas kuota terlampaui. Silakan coba lagi nanti.');
  }

  if (data.status === 'ai_disabled') {
    throw new Error('Layanan Bantuan AI belum diaktifkan di server (kunci API belum dipasang).');
  }

  if (!response.ok || data.status === 'error') {
    throw new Error(data.message || data.error || 'Terjadi kendala saat memproses materi AI. Silakan coba lagi.');
  }

  return data;
}
