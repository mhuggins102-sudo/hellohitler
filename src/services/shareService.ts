/**
 * Captures a DOM element as a PNG and opens the native share sheet to save/share.
 * On iOS this allows saving to Photos or Files.
 * Falls back to opening image in new tab on desktop.
 */
export async function captureAndSave(element: HTMLElement): Promise<void> {
  // html2canvas requires the element to be visible and laid out.
  // Move the parent on-screen but visually behind everything.
  const parent = element.parentElement;
  const originalParentStyle = parent?.getAttribute('style') || '';

  if (parent) {
    parent.setAttribute('style',
      'position:fixed !important; top:0 !important; left:0 !important; z-index:99999 !important; pointer-events:none !important;'
    );
  }

  // Force a layout reflow so html2canvas sees correct dimensions
  void element.offsetHeight;

  try {
    // Dynamically import html2canvas to avoid issues
    const html2canvas = (await import('html2canvas')).default;

    const canvas = await html2canvas(element, {
      backgroundColor: '#4338ca',
      scale: 2,
      logging: false,
      useCORS: true,
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
        // User cancelled or failed, fall through
      }
    }

    // Fallback: open image in new tab (works on iOS where <a download> doesn't)
    const url = URL.createObjectURL(blob);

    // Try download link first (desktop browsers)
    const a = document.createElement('a');
    a.href = url;
    a.download = 'wikipath-result.png';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    // On iOS Safari, the download attribute is ignored, so also open in new tab
    // so user can long-press to save
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    if (isIOS) {
      window.open(url, '_blank');
    } else {
      // Clean up after a delay on non-iOS
      setTimeout(() => URL.revokeObjectURL(url), 5000);
    }
  } finally {
    // Restore original positioning
    if (parent) {
      if (originalParentStyle) {
        parent.setAttribute('style', originalParentStyle);
      } else {
        parent.removeAttribute('style');
      }
    }
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
      // User cancelled
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
