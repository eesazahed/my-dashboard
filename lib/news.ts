import type { NewsArticle, NewsFeed } from "./types";

const CacheKey = "dashboard:news-cache";
export const NewsCacheTtlMs = 6 * 60 * 60 * 1000;
export const NewsArticleLimit = 10;

type NewsCacheEntry = {
  timestamp: number;
  articles: NewsArticle[];
};

type NewsCache = Record<NewsFeed, NewsCacheEntry>;

export type NewsFeedResult = {
  articles: NewsArticle[];
  updatedAt: number | null;
};

export function GetNewsFeedUpdatedAt(feed: NewsFeed): number | null {
  const entry = ReadCacheEntry(feed);
  return entry?.timestamp ?? null;
}

export function FormatCacheTimestamp(timestamp: number): string {
  const date = new Date(timestamp);
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
}

export async function FetchNewsFeed(feed: NewsFeed): Promise<NewsFeedResult> {
  const cached = ReadCacheEntry(feed);
  const isFresh =
    cached != null &&
    Date.now() - cached.timestamp <= NewsCacheTtlMs &&
    cached.articles.length >= NewsArticleLimit;

  if (isFresh) {
    return { articles: cached.articles, updatedAt: cached.timestamp };
  }

  try {
    const response = await fetch(
      `/api/news?feed=${encodeURIComponent(feed)}`,
    );
    if (!response.ok) {
      return FallbackResult(cached);
    }

    const data = (await response.json()) as { articles: NewsArticle[] };
    const articles = data.articles ?? [];

    if (articles.length > 0) {
      WriteCache(feed, articles);
      return { articles, updatedAt: Date.now() };
    }

    return FallbackResult(cached);
  } catch {
    return FallbackResult(cached);
  }
}

function FallbackResult(entry: NewsCacheEntry | null): NewsFeedResult {
  if (!entry) return { articles: [], updatedAt: null };
  return { articles: entry.articles, updatedAt: entry.timestamp };
}

function ReadCacheEntry(feed: NewsFeed): NewsCacheEntry | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(CacheKey);
    if (!raw) return null;
    const cache = JSON.parse(raw) as NewsCache;
    return cache[feed] ?? null;
  } catch {
    return null;
  }
}

function WriteCache(feed: NewsFeed, articles: NewsArticle[]): void {
  try {
    const existing = ReadFullCache();
    const cache = {
      ...existing,
      [feed]: {
        timestamp: Date.now(),
        articles,
      },
    };
    localStorage.setItem(CacheKey, JSON.stringify(cache));
  } catch {
    /* quota exceeded */
  }
}

function ReadFullCache(): Partial<NewsCache> {
  try {
    const raw = localStorage.getItem(CacheKey);
    if (!raw) return {};
    return JSON.parse(raw) as Partial<NewsCache>;
  } catch {
    return {};
  }
}
