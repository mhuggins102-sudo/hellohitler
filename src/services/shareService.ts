import type { GameMode } from '../types/game';
import { getDailyPuzzleNumber, getPuzzleNumberForDate, getTodayString } from '../utils/seededRandom';

/**
 * Draws the share card image directly on a Canvas element.
 * No html2canvas dependency - works reliably on all platforms including iOS.
 */
function drawShareCard(
  canvas: HTMLCanvasElement,
  steps: number,
  mode: GameMode,
  pathTitles: string[],
  targetTitle: string,
  dailyDate?: string | null,
): void {
  const ctx = canvas.getContext('2d')!;
  const w = 800;
  const h = 400 + Math.max(0, pathTitles.length - 3) * 36;
  canvas.width = w;
  canvas.height = h;

  // Background gradient
  const grad = ctx.createLinearGradient(0, 0, w, h);
  grad.addColorStop(0, '#2563eb'); // blue-600
  grad.addColorStop(1, '#7c3aed'); // purple-600
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  // Rounded corners clip (visual polish)
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  // Header: "WikiPath"
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 36px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('WikiPath', w / 2, 50);

  // Subheader: mode
  const dateStr = dailyDate || getTodayString();
  const puzzleNumber = mode === 'daily' ? getPuzzleNumberForDate(dateStr) : getDailyPuzzleNumber();
  const subtitle = mode === 'daily'
    ? `Daily #${puzzleNumber}`
    : mode === 'classic' ? 'Classic Mode' : 'Free Play';
  ctx.fillStyle = '#93c5fd'; // blue-200ish
  ctx.font = '18px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText(subtitle, w / 2, 78);

  // Steps count
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 72px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText(String(steps), w / 2, 155);

  ctx.fillStyle = '#93c5fd';
  ctx.font = '18px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText(steps === 1 ? 'step' : 'steps', w / 2, 180);

  // Path visualization box
  const boxX = 40;
  const boxY = 200;
  const boxW = w - 80;
  const lineHeight = 32;
  const boxH = Math.max(80, pathTitles.length * lineHeight + 24);

  ctx.fillStyle = 'rgba(255,255,255,0.1)';
  ctx.beginPath();
  ctx.roundRect(boxX, boxY, boxW, boxH, 16);
  ctx.fill();

  // Path entries
  ctx.textAlign = 'left';
  pathTitles.forEach((title, i) => {
    const y = boxY + 28 + i * lineHeight;
    // Index
    ctx.fillStyle = '#93c5fd';
    ctx.font = '14px monospace';
    const label = i === 0 ? '▸' : String(i);
    ctx.fillText(label, boxX + 16, y);

    // Title
    if (i === pathTitles.length - 1) {
      ctx.fillStyle = '#fde047'; // yellow
      ctx.font = 'bold 16px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    } else if (i === 0) {
      ctx.fillStyle = '#86efac'; // green
      ctx.font = '16px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    } else {
      ctx.fillStyle = 'rgba(255,255,255,0.9)';
      ctx.font = '16px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    }

    // Truncate long titles
    const maxWidth = boxW - 60;
    let displayTitle = title;
    while (ctx.measureText(displayTitle).width > maxWidth && displayTitle.length > 3) {
      displayTitle = displayTitle.slice(0, -4) + '...';
    }
    ctx.fillText(displayTitle, boxX + 40, y);
  });

  // Target line at bottom
  const targetY = boxY + boxH + 36;
  ctx.textAlign = 'center';
  ctx.fillStyle = '#93c5fd';
  ctx.font = '16px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  if (targetTitle) {
    ctx.fillText('Target: ', w / 2 - ctx.measureText(targetTitle).width / 2 - 30, targetY);
    ctx.fillStyle = '#fde047';
    ctx.font = 'bold 16px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText(targetTitle, w / 2 + 20, targetY);
  }
}

/**
 * Generates share card as a PNG blob using Canvas API directly.
 * No html2canvas - works reliably everywhere including iOS Safari.
 */
export async function generateShareImage(
  steps: number,
  mode: GameMode,
  pathTitles: string[],
  targetTitle: string,
  dailyDate?: string | null,
): Promise<Blob | null> {
  const canvas = document.createElement('canvas');
  drawShareCard(canvas, steps, mode, pathTitles, targetTitle, dailyDate);

  return new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, 'image/png')
  );
}

/**
 * Generates a share image and opens the native share sheet / saves it.
 */
export async function captureAndSave(
  steps: number,
  mode: GameMode,
  pathTitles: string[],
  targetTitle: string,
  dailyDate?: string | null,
): Promise<void> {
  const blob = await generateShareImage(steps, mode, pathTitles, targetTitle, dailyDate);
  if (!blob) return;

  const file = new File([blob], 'wikipath-result.png', { type: 'image/png' });

  // Try native share API (opens iOS share sheet)
  if (navigator.share && navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file] });
      return;
    } catch {
      // User cancelled or failed, fall through
    }
  }

  // Fallback: download
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'wikipath-result.png';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  // On iOS, also open in new tab since download attr is ignored
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  if (isIOS) {
    window.open(url, '_blank');
  } else {
    setTimeout(() => URL.revokeObjectURL(url), 5000);
  }
}

/**
 * Shares text via native share sheet (opens Messages, WhatsApp, etc. on mobile).
 * Falls back to clipboard copy on desktop.
 */
export async function shareText(text: string): Promise<boolean> {
  if (navigator.share) {
    try {
      await navigator.share({ text });
      return true;
    } catch {
      return true;
    }
  }
  return copyToClipboard(text);
}

/**
 * Copies text to clipboard with fallback.
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    const success = document.execCommand('copy');
    document.body.removeChild(textarea);
    return success;
  }
}
