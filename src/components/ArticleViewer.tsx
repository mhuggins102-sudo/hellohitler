import { useRef, useCallback } from 'react';
import { sanitizeWikiHtml } from '../utils/sanitize';
import { extractArticleTitle, findAnchorElement } from '../utils/linkInterceptor';
import { useGameStore } from '../store/gameStore';
import { LoadingSpinner } from './LoadingSpinner';
import '../styles/wikipedia.css';

export function ArticleViewer() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { currentArticle, loading, navigateTo } = useGameStore();

  const handleClick = useCallback((e: React.MouseEvent) => {
    const anchor = findAnchorElement(e.target);
    if (!anchor) return;

    const href = anchor.getAttribute('href');
    if (!href) return;

    // Always prevent default for any link in wiki content
    e.preventDefault();

    const title = extractArticleTitle(href);
    if (title) {
      navigateTo(title);
      // Scroll to top of article
      containerRef.current?.scrollTo(0, 0);
    }
  }, [navigateTo]);

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
      className="flex-1 overflow-y-auto p-4 md:p-6 relative"
    >
      {loading && (
        <div className="absolute inset-0 bg-white/70 dark:bg-gray-900/70 z-10 flex items-start justify-center pt-20">
          <LoadingSpinner message="Loading next article..." />
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
