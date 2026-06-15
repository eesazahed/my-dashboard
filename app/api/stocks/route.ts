import { NextResponse } from "next/server";

type ChartMeta = {
  symbol?: string;
  regularMarketPrice?: number;
  chartPreviousClose?: number;
};

async function FetchTickerQuote(ticker: string) {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(ticker)}?interval=1d&range=1d`;

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
      },
      next: { revalidate: 3600 },
    });

    if (!response.ok) return null;

    const data = (await response.json()) as {
      chart?: { result?: Array<{ meta?: ChartMeta }> };
    };

    const meta = data.chart?.result?.[0]?.meta;
    if (!meta?.symbol || meta.regularMarketPrice == null) return null;

    const price = meta.regularMarketPrice;
    const previousClose = meta.chartPreviousClose ?? price;
    const change = price - previousClose;
    const changePercent =
      previousClose > 0 ? (change / previousClose) * 100 : 0;

    return {
      ticker: meta.symbol.toUpperCase(),
      price,
      change,
      changePercent,
    };
  } catch {
    return null;
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const tickersParam = searchParams.get("tickers") ?? "";
  const tickers = tickersParam
    .split(",")
    .map((ticker) => ticker.trim().toUpperCase())
    .filter(Boolean);

  if (tickers.length === 0) {
    return NextResponse.json({ quotes: [] });
  }

  try {
    const results = await Promise.all(tickers.map(FetchTickerQuote));
    const quotes = results.filter(
      (quote): quote is NonNullable<typeof quote> => quote != null,
    );

    return NextResponse.json({ quotes });
  } catch {
    return NextResponse.json({ quotes: [] }, { status: 500 });
  }
}
