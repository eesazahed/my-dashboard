"use client";

import { useEffect, useState } from "react";

const GithubRepo = "eesazahed/my-dashboard";
const CommitsApiUrl = `https://api.github.com/repos/${GithubRepo}/commits?per_page=1`;

type GithubCommitResponse = Array<{
  sha: string;
  commit: {
    author: {
      date: string;
    };
  };
}>;

function FormatTimeAgo(dateString: string): string {
  const now = Date.now();
  const then = new Date(dateString).getTime();
  const diff = (now - then) / 1000;

  if (diff < 60) return `${Math.floor(diff)}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export function LatestCommitInfo() {
  const [hash, setHash] = useState<string | null>(null);
  const [sha, setSha] = useState<string | null>(null);
  const [relative, setRelative] = useState<string | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function LoadLatestCommit() {
      try {
        const response = await fetch(CommitsApiUrl);
        if (!response.ok) throw new Error("Failed to fetch commit");

        const commits = (await response.json()) as GithubCommitResponse;
        const commit = commits[0];
        if (!commit || cancelled) return;

        setSha(commit.sha);
        setHash(commit.sha.substring(0, 7));
        setRelative(FormatTimeAgo(commit.commit.author.date));
      } catch {
        if (!cancelled) setError(true);
      }
    }

    LoadLatestCommit();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <p className="text-[12px] text-zinc-500">
      Latest commit:{" "}
      {error ? (
        <span className="text-zinc-600">could not load</span>
      ) : hash && sha && relative ? (
        <>
          <a
            href={`https://github.com/${GithubRepo}/commit/${sha}`}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-zinc-400 transition hover:text-zinc-200"
          >
            {hash}
          </a>{" "}
          <span className="tabular-nums text-zinc-600">({relative})</span>
        </>
      ) : (
        <span className="text-zinc-600">loading…</span>
      )}
    </p>
  );
}
