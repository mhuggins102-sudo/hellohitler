import { useState, useCallback, useRef, useEffect } from 'react';
import { searchArticles } from '../services/wikipediaApi';

interface ArticleSearchProps {
  label: string;
  placeholder?: string;
  onSelect: (title: string) => void;
  defaultValue?: string;
}

export function ArticleSearch({ label, placeholder = 'Search Wikipedia...', onSelect, defaultValue = '' }: ArticleSearchProps) {
  const [query, setQuery] = useState(defaultValue);
  const [results, setResults] = useState<Array<{ title: string; snippet: string }>>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [searching, setSearching] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const containerRef = useRef<HTMLDivElement>(null);

  const doSearch = useCallback(async (q: string) => {
    if (!q.trim()) {
      setResults([]);
      return;
    }
    setSearching(true);
    try {
      const res = await searchArticles(q);
      setResults(res);
      setIsOpen(true);
    } finally {
      setSearching(false);
    }
  }, []);

  const handleChange = (value: string) => {
    setQuery(value);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => doSearch(value), 300);
  };

  const handleSelect = (title: string) => {
    setQuery(title);
    setIsOpen(false);
    onSelect(title);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={containerRef} className="relative w-full">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        {label}
      </label>
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => handleChange(e.target.value)}
          onFocus={() => results.length > 0 && setIsOpen(true)}
          placeholder={placeholder}
          className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
        />
        {searching && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
          </div>
        )}
      </div>
      {isOpen && results.length > 0 && (
        <ul className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {results.map((result) => (
            <li key={result.title}>
              <button
                onClick={() => handleSelect(result.title)}
                className="w-full text-left px-4 py-2.5 hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="font-medium text-sm text-gray-900 dark:text-gray-100">
                  {result.title}
                </div>
                <div
                  className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1"
                  dangerouslySetInnerHTML={{ __html: result.snippet }}
                />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
