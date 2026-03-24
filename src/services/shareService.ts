import html2canvas from 'html2canvas';

/**
 * Captures a DOM element as a PNG and opens the native share sheet to save/share.
 * On iOS this allows saving to Photos or Files.
 * Falls back to direct download on desktop.
 */
export async function captureAndSave(element: HTMLElement): Promise<void> {
  // Temporarily make element visible for html2canvas capture
  const originalStyle = element.parentElement?.style.cssText || '';
  if (element.parentElement) {
    element.parentElement.style.cssText = 'position:fixed;top:0;left:0;z-index:-1;opacity:0;pointer-events:none;';
  }

  try {
    const canvas = await html2canvas(element, {
      backgroundColor: '#4338ca',
      scale: 2,
      logging: false,
      useCORS: true,
      width: element.offsetWidth,
      height: element.offsetHeight,
    });

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, 'image/png')
    );

    if (!blob) return;

    const file = new File([blob], 'wikipath-result.png', { type: 'image/png' });

    // Try native share API (opens iOS share sheet with Save Image option)
    if (navigator.share && navigator.canShare?.({ files: [file] })) {
      try {
        await navigator.share({ files: [file] });
        return;
      } catch {
        // User cancelled or failed, fall through to download
      }
    }

    // Fallback: download
    downloadBlob(blob, 'wikipath-result.png');
  } finally {
    // Restore original positioning
    if (element.parentElement) {
      element.parentElement.style.cssText = originalStyle;
    }
  }
}

/**
 * Shares text via native share sheet (opens Messages, WhatsApp, etc. on mobile).
 * Falls back to clipboard copy on desktop.
 */
export async function shareText(text: string): Promise<boolean> {
  // Try native share API first (opens share sheet on mobile)
  if (navigator.share) {
    try {
      await navigator.share({ text });
      return true;
    } catch {
      // User cancelled - still count as handled
      return true;
    }
  }

  // Fallback: copy to clipboard
  return copyToClipboard(text);
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
