import { MatchingPair, Draft } from '../../types';

/**
 * Dedicated export helper for matching template
 */
export function generateMatchingQuickText(items: MatchingPair[]): string {
  return items
    .map((item) => `${item.arabic} | ${item.meaning}`)
    .join('\n');
}

export function validateMatchingData(items: MatchingPair[]): { isValid: boolean; message?: string } {
  if (!items || items.length < 2) {
    return {
      isValid: false,
      message: 'Template mencocokkan minimal memerlukan 2 pasangan kata.',
    };
  }

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (!item.arabic.trim()) {
      return {
        isValid: false,
        message: `Pasangan #${i + 1} belum memiliki teks kata Arab.`,
      };
    }
    if (!item.meaning.trim() && !item.mediaImageId) {
      return {
        isValid: false,
        message: `Pasangan #${i + 1} harus memiliki arti teks atau foto gambar.`,
      };
    }
  }

  return { isValid: true };
}
