import DOMPurify from 'dompurify';

export function sanitizeWikiHtml(html: string): string {
  // Configure DOMPurify to allow safe HTML tags and attributes
  const clean = DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      'a', 'abbr', 'b', 'bdi', 'bdo', 'blockquote', 'br', 'caption',
      'cite', 'code', 'col', 'colgroup', 'dd', 'del', 'details', 'dfn',
      'div', 'dl', 'dt', 'em', 'figcaption', 'figure', 'h1', 'h2', 'h3',
      'h4', 'h5', 'h6', 'hr', 'i', 'img', 'ins', 'kbd', 'li', 'mark',
      'ol', 'p', 'pre', 'q', 'rp', 'rt', 'ruby', 's', 'samp', 'small',
      'span', 'strong', 'sub', 'summary', 'sup', 'table', 'tbody', 'td',
      'tfoot', 'th', 'thead', 'time', 'tr', 'u', 'ul', 'var', 'wbr',
    ],
    ALLOWED_ATTR: [
      'href', 'title', 'class', 'id', 'src', 'alt', 'width', 'height',
      'colspan', 'rowspan', 'scope', 'dir', 'lang', 'style',
    ],
    ALLOW_DATA_ATTR: false,
  });

  // Post-process the HTML to fix Wikipedia-specific issues
  const template = document.createElement('div');
  template.innerHTML = clean;

  // Remove edit section links
  template.querySelectorAll('.mw-editsection').forEach(el => el.remove());

  // Remove "stub" notices and other maintenance templates
  template.querySelectorAll('.ambox, .tmbox, .ombox, .cmbox, .fmbox, .dmbox').forEach(el => el.remove());

  // Remove navigation boxes at bottom
  template.querySelectorAll('.navbox, .navbox-inner').forEach(el => el.remove());

  // Remove "See also" style boxes that clutter the view
  template.querySelectorAll('.sistersitebox, .side-box').forEach(el => el.remove());

  // Remove metadata / hidden categories
  template.querySelectorAll('.metadata, .catlinks').forEach(el => el.remove());

  // Make all images point to Wikipedia
  template.querySelectorAll('img').forEach(img => {
    const src = img.getAttribute('src');
    if (src && src.startsWith('//')) {
      img.setAttribute('src', 'https:' + src);
    } else if (src && src.startsWith('/')) {
      img.setAttribute('src', 'https://en.wikipedia.org' + src);
    }
  });

  return template.innerHTML;
}
