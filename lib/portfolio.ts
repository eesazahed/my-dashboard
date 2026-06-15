export type StockQuote = {
  ticker: string;
  price: number;
  change: number;
  changePercent: number;
};

export type StockQuotesResult = {
  quotes: StockQuote[];
  updatedAt: number | null;
};

const CacheKey = "dashboard:stock-prices-cache";
export const StockCacheTtlMs = 60 * 60 * 1000;

type StockCacheEntry = {
  timestamp: number;
  tickersKey: string;
  quotes: StockQuote[];
};

function BuildTickersKey(tickers: string[]): string {
  return tickers
    .map((ticker) => ticker.trim().toUpperCase())
    .filter(Boolean)
    .sort()
    .join(",");
}

export function FormatCacheTimestamp(timestamp: number): string {
  const date = new Date(timestamp);
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
}

export async function FetchStockQuotes(
  tickers: string[],
): Promise<StockQuotesResult> {
  const normalized = tickers
    .map((ticker) => ticker.trim().toUpperCase())
    .filter(Boolean);

  if (normalized.length === 0) {
    return { quotes: [], updatedAt: null };
  }

  const tickersKey = BuildTickersKey(normalized);
  const cached = ReadCache(tickersKey);
  const isFresh =
    cached != null && Date.now() - cached.timestamp <= StockCacheTtlMs;

  if (isFresh) {
    return { quotes: cached.quotes, updatedAt: cached.timestamp };
  }

  try {
    const response = await fetch(
      `/api/stocks?tickers=${encodeURIComponent(normalized.join(","))}`,
    );
    if (!response.ok) {
      return FallbackResult(cached);
    }

    const data = (await response.json()) as { quotes: StockQuote[] };
    const quotes = data.quotes ?? [];

    if (quotes.length > 0) {
      WriteCache(tickersKey, quotes);
      return { quotes, updatedAt: Date.now() };
    }

    return FallbackResult(cached);
  } catch {
    return FallbackResult(cached);
  }
}

function FallbackResult(entry: StockCacheEntry | null): StockQuotesResult {
  if (!entry) return { quotes: [], updatedAt: null };
  return { quotes: entry.quotes, updatedAt: entry.timestamp };
}

function ReadCache(tickersKey: string): StockCacheEntry | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(CacheKey);
    if (!raw) return null;
    const cache = JSON.parse(raw) as StockCacheEntry;
    if (cache.tickersKey !== tickersKey) return null;
    return cache;
  } catch {
    return null;
  }
}

function WriteCache(tickersKey: string, quotes: StockQuote[]): void {
  try {
    const cache: StockCacheEntry = {
      timestamp: Date.now(),
      tickersKey,
      quotes,
    };
    localStorage.setItem(CacheKey, JSON.stringify(cache));
  } catch {
    /* quota exceeded */
  }
}

export function CalculatePortfolioSummary(
  holdings: Array<{ shares: number; costBasis: number; ticker: string }>,
  quotes: StockQuote[],
) {
  const quoteMap = new Map(
    quotes.map((quote) => [quote.ticker.toUpperCase(), quote]),
  );

  let totalValue = 0;
  let totalCost = 0;
  let todayChange = 0;

  const rows = holdings.map((holding) => {
    const quote = quoteMap.get(holding.ticker.toUpperCase());
    const price = quote?.price ?? 0;
    const change = quote?.change ?? 0;
    const changePercent = quote?.changePercent ?? 0;
    const currentValue = holding.shares * price;
    const costValue = holding.shares * holding.costBasis;
    const gainLoss = currentValue - costValue;
    const gainLossPercent =
      costValue > 0 ? (gainLoss / costValue) * 100 : 0;
    const holdingTodayChange = holding.shares * change;

    totalValue += currentValue;
    totalCost += costValue;
    todayChange += holdingTodayChange;

    return {
      ...holding,
      price,
      change,
      changePercent,
      currentValue,
      costValue,
      gainLoss,
      gainLossPercent,
      holdingTodayChange,
    };
  });

  const totalGainLoss = totalValue - totalCost;
  const totalGainLossPercent =
    totalCost > 0 ? (totalGainLoss / totalCost) * 100 : 0;
  const todayChangePercent =
    totalValue > 0 ? (todayChange / (totalValue - todayChange)) * 100 : 0;

  return {
    rows,
    totalValue,
    totalCost,
    totalGainLoss,
    totalGainLossPercent,
    todayChange,
    todayChangePercent,
  };
}
