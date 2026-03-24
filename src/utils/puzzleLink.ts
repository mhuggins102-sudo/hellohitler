/**
 * Encode/decode puzzle parameters for shareable URLs.
 * Format: base64(encodeURIComponent(start|target))
 */

export function encodePuzzle(start: string, target: string): string {
  return btoa(encodeURIComponent(start + '|' + target));
}

export function decodePuzzle(encoded: string): { start: string; target: string } | null {
  try {
    const decoded = decodeURIComponent(atob(encoded));
    const idx = decoded.indexOf('|');
    if (idx === -1) return null;
    return { start: decoded.slice(0, idx), target: decoded.slice(idx + 1) };
  } catch {
    return null;
  }
}

/**
 * Generate a Firestore-safe puzzle ID from start and target titles.
 */
export function getPuzzleId(start: string, target: string): string {
  return btoa(start + '|' + target)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}
