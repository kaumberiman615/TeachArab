import { sanitizeText } from '../utils/arabic';

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
 * Check AI status and remaining quota from backend
 */
export async function fetchAiStatus(idToken?: string): Promise<AiStatusResponse> {
  try {
    const headers: Record<string, string> = {};
    if (idToken) {
      headers['Authorization'] = `Bearer ${idToken}`;
    }

    const response = await fetch('/api/ai/status', { headers });
    if (!response.ok) {
      return {
        status: 'ai_disabled',
        aiEnabled: false,
        limits: { maxHourly: 10, maxDaily: 30 },
      };
    }
    const data = await response.json();
    return data;
  } catch (err) {
    console.warn('[aiService] Failed to fetch AI status:', err);
    return {
      status: 'ai_disabled',
      aiEnabled: false,
      limits: { maxHourly: 10, maxDaily: 30 },
    };
  }
}

/**
 * Call server-side /api/generate with Firebase ID token
 */
export async function generateAiContent(
  req: GenerateAiRequest,
  idToken: string
): Promise<GenerateAiResponse> {
  const sanitizedTopic = req.topic ? sanitizeText(req.topic).trim() : undefined;
  const sanitizedText = req.text ? sanitizeText(req.text).trim() : undefined;

  const payload = {
    task: req.task,
    templateType: req.templateType,
    topic: sanitizedTopic,
    text: sanitizedText,
    count: Math.min(Math.max(Number(req.count) || 5, 1), 15),
    level: req.level || 'pemula',
  };

  const response = await fetch('/api/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || data.error || 'Gagal memproses permintaan AI.');
  }

  return data;
}
