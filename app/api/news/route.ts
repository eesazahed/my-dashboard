import { NextResponse } from "next/server";
import { NewsArticleLimit } from "@/lib/news";

const WorldRssUrl = "https://feeds.bbci.co.uk/news/world/rss.xml";

type HnItem = {
  id: number;
  title?: string;
  url?: string;
};

async function FetchHnArticles(limit: number) {
  const idsResponse = await fetch(
    "https://hacker-news.firebaseio.com/v0/topstories.json",
    { next: { revalidate: 900 } },
  );

  if (!idsResponse.ok) {
    return [];
  }

  const ids = (await idsResponse.json()) as number[];
  const candidateIds = ids.slice(0, limit * 3);

  const items = await Promise.all(
    candidateIds.map(async (id) => {
      try {
        const response = await fetch(
          `https://hacker-news.firebaseio.com/v0/item/${id}.json`,
          { next: { revalidate: 900 } },
        );
        if (!response.ok) return null;
        return (await response.json()) as HnItem;
      } catch {
        return null;
      }
    }),
  );

  return items
    .filter((item): item is HnItem => item != null && Boolean(item.title))
    .slice(0, limit)
    .map((item) => ({
      title: item.title!,
      source: "Hacker News",
      url: item.url ?? `https://news.ycombinator.com/item?id=${item.id}`,
      commentsUrl: `https://news.ycombinator.com/item?id=${item.id}`,
    }));
}

async function FetchWorldArticles(limit: number) {
  const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(WorldRssUrl)}`;
  const response = await fetch(apiUrl, { next: { revalidate: 1800 } });

  if (!response.ok) {
    return [];
  }

  const data = (await response.json()) as {
    items?: Array<{ title: string; link: string; author?: string }>;
  };

  return (data.items ?? []).slice(0, limit).map((item) => ({
    title: item.title,
    source: item.author ?? "BBC News",
    url: item.link,
  }));
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const feed = searchParams.get("feed") ?? "world";

  try {
    const articles =
      feed === "hn"
        ? await FetchHnArticles(NewsArticleLimit)
        : await FetchWorldArticles(NewsArticleLimit);

    return NextResponse.json({ articles });
  } catch {
    return NextResponse.json({ articles: [] }, { status: 500 });
  }
}
