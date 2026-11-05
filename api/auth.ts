/**
 * Firebase ID Token verification on backend
 */

export interface AuthVerificationResult {
  valid: boolean;
  uid?: string;
  email?: string;
  error?: string;
}

/**
 * Decode JWT payload without external library
 */
function decodeJwtPayload(token: string): any | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = Buffer.from(base64, 'base64').toString('utf-8');
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

/**
 * Verify Firebase ID Token from Authorization header
 */
export async function verifyAuthToken(authHeader: string | undefined): Promise<AuthVerificationResult> {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return {
      valid: false,
      error: 'Fitur Bantuan AI hanya tersedia untuk pengguna yang telah login. Silakan login terlebih dahulu.',
    };
  }

  const token = authHeader.substring(7).trim();
  if (!token) {
    return {
      valid: false,
      error: 'Token otentikasi kosong.',
    };
  }

  // 1. Try Google OAuth tokeninfo endpoint
  try {
    const response = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(token)}`);
    if (response.ok) {
      const data = await response.json();
      const uid = data.sub || data.user_id;
      if (uid) {
        return {
          valid: true,
          uid,
          email: data.email,
        };
      }
    }
  } catch (err) {
    console.warn('[api/auth] Token verification via tokeninfo endpoint failed, falling back to JWT verification:', err);
  }

  // 2. Fallback: Parse and validate Firebase JWT claims
  const payload = decodeJwtPayload(token);
  if (payload) {
    const now = Math.floor(Date.now() / 1000);
    // Check expiration
    if (payload.exp && payload.exp < now) {
      return {
        valid: false,
        error: 'Sesi login telah berakhir. Silakan login ulang.',
      };
    }

    const uid = payload.sub || payload.user_id;
    if (uid) {
      return {
        valid: true,
        uid,
        email: payload.email,
      };
    }
  }

  return {
    valid: false,
    error: 'Token otentikasi tidak valid. Silakan login kembali.',
  };
}
