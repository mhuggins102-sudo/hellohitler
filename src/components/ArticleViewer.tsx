import { useRef, useCallback } from 'react';
import { sanitizeWikiHtml } from '../utils/sanitize';
import { extractArticleTitle, findAnchorElement } from '../utils/linkInterceptor';
import { isCountryRelated } from '../utils/countryBlocklist';
import { useGameStore } from '../store/gameStore';
import { LoadingSpinner } from './LoadingSpinner';
import '../styles/wikipedia.css';

export function ArticleViewer() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { currentArticle, loading, navigateTo, hardMode } = useGameStore();

  const hardModeActive = hardMode;

  const handleClick = useCallback((e: React.MouseEvent) => {
    const anchor = findAnchorElement(e.target);
    if (!anchor) return;

    const href = anchor.getAttribute('href');
    if (!href) return;

    // Always prevent default for any link in wiki content
    e.preventDefault();

    const title = extractArticleTitle(href);
    if (title) {
      // Hard mode: block country-related articles
      if (hardModeActive && isCountryRelated(title)) {
        // Brief visual feedback - flash the link red
        anchor.style.color = '#ef4444';
        anchor.style.textDecoration = 'line-through';
        setTimeout(() => {
          anchor.style.color = '';
          anchor.style.textDecoration = '';
        }, 800);
        return;
      }

      navigateTo(title);
      // Scroll to top of article
      containerRef.current?.scrollTo(0, 0);
    }
  }, [navigateTo, hardModeActive]);

  if (loading && !currentArticle) {
    return <LoadingSpinner message="Fetching article..." />;
  }

  if (!currentArticle) {
    return null;
  }

  const sanitizedHtml = sanitizeWikiHtml(currentArticle.html);

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-6 relative"
    >
      {loading && (
        <div className="absolute inset-0 bg-white/70 dark:bg-gray-900/70 z-10 flex items-start justify-center pt-20">
          <LoadingSpinner message="Loading next article..." />
        </div>
      )}

      {/* Hard mode indicator */}
      {hardModeActive && (
        <div className="mb-3 px-3 py-1.5 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-xs text-red-600 dark:text-red-400 inline-flex items-center gap-1.5">
          <span>💀</span> Hard Mode — geographic articles blocked
        </div>
      )}

      <div
        className="wiki-content max-w-none"
        onClick={handleClick}
        dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
      />
    </div>
  );
}
