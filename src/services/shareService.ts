import html2canvas from 'html2canvas';

/**
 * Captures a DOM element as a PNG image and shares via native share sheet,
 * or falls back to download on desktop.
 */
export async function captureAndShare(element: HTMLElement): Promise<void> {
  const canvas = await html2canvas(element, {
    backgroundColor: null,
    scale: 2,
    logging: false,
    useCORS: true,
  });

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, 'image/png')
  );

  if (!blob) return;

  const file = new File([blob], 'wikipath-result.png', { type: 'image/png' });

  // Try native share API first (iOS/Android share sheet)
  if (navigator.share) {
    try {
      // Try sharing with file first
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'WikiPath Result',
        });
        return;
      }
    } catch {
      // User cancelled or share failed, fall through
    }

    // Try text-only share as fallback
    try {
      await navigator.share({
        title: 'WikiPath Result',
        text: 'Check out my WikiPath result!',
      });
      return;
    } catch {
      // Fall through to download
    }
  }

  // Fallback: trigger download (works on desktop and as last resort on mobile)
  downloadBlob(blob, 'wikipath-result.png');
}

/**
 * Captures a DOM element and immediately triggers a save/download.
 * On iOS this will prompt to save to Files or share.
 */
export async function captureAndSave(element: HTMLElement): Promise<void> {
  const canvas = await html2canvas(element, {
    backgroundColor: null,
    scale: 2,
    logging: false,
    useCORS: true,
  });

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, 'image/png')
  );

  if (!blob) return;

  const file = new File([blob], 'wikipath-result.png', { type: 'image/png' });

  // On mobile, try share sheet so user can save to Photos/Files
  if (navigator.share && navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file] });
      return;
    } catch {
      // Fall through to download
    }
  }

  downloadBlob(blob, 'wikipath-result.png');
}

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Copies text to clipboard with fallback.
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback for older browsers
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
