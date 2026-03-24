// Namespaces to skip - these aren't regular article links
const SKIP_NAMESPACES = [
  'File:', 'Special:', 'Help:', 'Wikipedia:', 'Template:',
  'Category:', 'Portal:', 'Talk:', 'User:', 'Module:',
  'MediaWiki:', 'Draft:', 'TimedText:', 'WP:',
];

/**
 * Extracts a Wikipedia article title from an anchor element's href.
 * Returns null if the link is not a valid article link.
 */
export function extractArticleTitle(href: string): string | null {
  if (!href) return null;

  // Only handle /wiki/ links
  const wikiMatch = href.match(/\/wiki\/([^#?]+)/);
  if (!wikiMatch) return null;

  const rawTitle = decodeURIComponent(wikiMatch[1].replace(/_/g, ' '));

  // Skip namespace pages
  for (const ns of SKIP_NAMESPACES) {
    if (rawTitle.startsWith(ns)) return null;
  }

  return rawTitle;
}

/**
 * Finds the closest <a> ancestor (or self) of a clicked element.
 */
export function findAnchorElement(target: EventTarget | null): HTMLAnchorElement | null {
  let el = target as HTMLElement | null;
  while (el) {
    if (el.tagName === 'A') return el as HTMLAnchorElement;
    el = el.parentElement;
  }
  return null;
}
