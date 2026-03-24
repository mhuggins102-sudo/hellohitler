import { WIKIPEDIA_API_BASE } from '../utils/constants';
import type { WikiParseResponse, WikiRandomResponse, WikiSearchResponse } from '../types/wikipedia';

function buildUrl(params: Record<string, string>): string {
  const url = new URL(WIKIPEDIA_API_BASE);
  url.searchParams.set('format', 'json');
  url.searchParams.set('origin', '*');
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }
  return url.toString();
}

export async function fetchArticle(title: string): Promise<{
  title: string;
  displayTitle: string;
  html: string;
} | null> {
  const url = buildUrl({
    action: 'parse',
    page: title,
    prop: 'text|displaytitle',
    redirects: '1',
  });

  const response = await fetch(url);
  const data: WikiParseResponse = await response.json();

  if (!data.parse) return null;

  return {
    title: data.parse.title,
    displayTitle: data.parse.displaytitle,
    html: data.parse.text['*'],
  };
}

export async function fetchRandomArticle(): Promise<{ title: string } | null> {
  const url = buildUrl({
    action: 'query',
    list: 'random',
    rnnamespace: '0',
    rnlimit: '1',
  });

  const response = await fetch(url);
  const data: WikiRandomResponse = await response.json();

  if (!data.query?.random?.length) return null;

  return { title: data.query.random[0].title };
}

export async function searchArticles(query: string): Promise<Array<{
  title: string;
  snippet: string;
}>> {
  if (!query.trim()) return [];

  const url = buildUrl({
    action: 'query',
    list: 'search',
    srsearch: query,
    srlimit: '8',
    srprop: 'snippet',
  });

  const response = await fetch(url);
  const data: WikiSearchResponse = await response.json();

  if (!data.query?.search) return [];

  return data.query.search.map(item => ({
    title: item.title,
    snippet: item.snippet,
  }));
}
