"use client";

import { useEffect, useState } from "react";
import { IconMessageCircle, IconNews } from "@tabler/icons-react";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  FetchNewsFeed,
  FormatCacheTimestamp,
  NewsArticleLimit,
} from "@/lib/news";
import type { NewsArticle } from "@/lib/types";

const BbcNewsUrl = "https://www.bbc.com/news/world";
const HackerNewsUrl = "https://news.ycombinator.com";

function NewsColumn({
  title,
  titleHref,
  articles,
  updatedAt,
  showComments,
}: {
  title: string;
  titleHref: string;
  articles: NewsArticle[];
  updatedAt: number | null;
  showComments?: boolean;
}) {
  const visibleArticles = articles.slice(0, NewsArticleLimit);

  if (visibleArticles.length === 0) {
    return (
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <NewsColumnHeader
          title={title}
          titleHref={titleHref}
          updatedAt={updatedAt}
        />
        <p className="text-[12px] text-zinc-600">Could not load headlines.</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col">
      <NewsColumnHeader
        title={title}
        titleHref={titleHref}
        updatedAt={updatedAt}
      />
      <ul className="min-h-0 flex-1 space-y-2 overflow-y-auto">
        {visibleArticles.map((article, index) => (
          <li
            key={`${article.url}-${index}`}
            className="grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-x-2"
          >
            <a
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              title={article.title}
              className="min-w-0 truncate text-[13px] leading-snug text-zinc-300 transition hover:text-zinc-100"
            >
              {article.title}
            </a>
            {showComments && article.commentsUrl && (
              <a
                href={article.commentsUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Comments"
                className="inline-flex shrink-0 items-center gap-1 text-[12px] text-zinc-500 transition hover:text-emerald-400"
              >
                <IconMessageCircle size={13} aria-hidden />
              </a>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

function NewsColumnHeader({
  title,
  titleHref,
  updatedAt,
}: {
  title: string;
  titleHref: string;
  updatedAt: number | null;
}) {
  return (
    <div className="mb-3 shrink-0">
      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
        <a
          href={titleHref}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500 transition hover:text-zinc-300"
        >
          {title}
        </a>
        {updatedAt != null && (
          <span className="text-[11px] tabular-nums text-zinc-600">
            Last updated at {FormatCacheTimestamp(updatedAt)}
          </span>
        )}
      </div>
    </div>
  );
}

function NewsColumnSkeleton() {
  return (
    <div className="space-y-3">
      <div className="h-2.5 w-28 animate-pulse rounded bg-white/[0.06]" />
      {Array.from({ length: NewsArticleLimit }).map((_, index) => (
        <div
          key={index}
          className="h-4 animate-pulse rounded bg-white/[0.04]"
          style={{ width: `${88 - index * 6}%` }}
        />
      ))}
    </div>
  );
}

export function NewsFeedWidget() {
  const [WorldArticles, SetWorldArticles] = useState<NewsArticle[]>([]);
  const [TechArticles, SetTechArticles] = useState<NewsArticle[]>([]);
  const [WorldUpdatedAt, SetWorldUpdatedAt] = useState<number | null>(null);
  const [TechUpdatedAt, SetTechUpdatedAt] = useState<number | null>(null);
  const [Loading, SetLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function Load() {
      SetLoading(true);
      const [world, tech] = await Promise.all([
        FetchNewsFeed("world"),
        FetchNewsFeed("hn"),
      ]);

      if (!cancelled) {
        SetWorldArticles(world.articles);
        SetTechArticles(tech.articles);
        SetWorldUpdatedAt(world.updatedAt);
        SetTechUpdatedAt(tech.updatedAt);
        SetLoading(false);
      }
    }

    Load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (Loading) {
    return (
      <div className="flex h-full min-h-0 flex-col gap-6 p-5">
        <NewsColumnSkeleton />
        <NewsColumnSkeleton />
      </div>
    );
  }

  if (WorldArticles.length === 0 && TechArticles.length === 0) {
    return (
      <EmptyState
        icon={<IconNews size={20} />}
        title="No headlines"
        description="Could not load news right now."
      />
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col gap-6 p-5">
      <NewsColumn
        title="BBC news"
        titleHref={BbcNewsUrl}
        articles={WorldArticles}
        updatedAt={WorldUpdatedAt}
      />
      <NewsColumn
        title="Hacker news"
        titleHref={HackerNewsUrl}
        articles={TechArticles}
        updatedAt={TechUpdatedAt}
        showComments
      />
    </div>
  );
}
