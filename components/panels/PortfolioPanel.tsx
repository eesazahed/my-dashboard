"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { IconChartLine, IconPlus } from "@tabler/icons-react";
import { useDashboard } from "@/context/DashboardContext";
import { generateId } from "@/lib/date-utils";
import {
  CalculatePortfolioSummary,
  FetchStockQuotes,
  FormatCacheTimestamp,
} from "@/lib/portfolio";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Input } from "@/components/ui/Input";
import { Panel } from "@/components/ui/Panel";

function FormatCurrency(value: number): string {
  return value.toLocaleString(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  });
}

function FormatSignedCurrency(value: number): string {
  const prefix = value > 0 ? "+" : value < 0 ? "−" : "";
  return `${prefix}${FormatCurrency(Math.abs(value))}`;
}

function FormatSignedPercent(value: number): string {
  const prefix = value > 0 ? "+" : value < 0 ? "−" : "";
  return `${prefix}${Math.abs(value).toFixed(2)}%`;
}

export function PortfolioPanel() {
  const router = useRouter();
  const { portfolio, setPortfolio, showToast } = useDashboard();
  const [QuotesUpdatedAt, SetQuotesUpdatedAt] = useState<number | null>(null);
  const [Loading, SetLoading] = useState(false);
  const [ShowAdd, SetShowAdd] = useState(false);
  const [NewHolding, SetNewHolding] = useState({
    ticker: "",
    shares: "",
    costBasis: "",
  });
  const [QuoteVersion, SetQuoteVersion] = useState(0);

  const tickers = useMemo(
    () => portfolio.map((holding) => holding.ticker),
    [portfolio],
  );

  const [Quotes, SetQuotes] = useState<
    Awaited<ReturnType<typeof FetchStockQuotes>>["quotes"]
  >([]);

  useEffect(() => {
    let cancelled = false;

    async function LoadQuotes() {
      if (tickers.length === 0) {
        SetQuotes([]);
        SetQuotesUpdatedAt(null);
        return;
      }

      SetLoading(true);
      const result = await FetchStockQuotes(tickers);

      if (!cancelled) {
        SetQuotes(result.quotes);
        SetQuotesUpdatedAt(result.updatedAt);
        SetLoading(false);
      }
    }

    LoadQuotes();
    return () => {
      cancelled = true;
    };
  }, [tickers.join(","), QuoteVersion]);

  const summary = useMemo(
    () => CalculatePortfolioSummary(portfolio, Quotes),
    [portfolio, Quotes],
  );

  const addHolding = () => {
    const ticker = NewHolding.ticker.trim().toUpperCase();
    const shares = parseFloat(NewHolding.shares);
    const costBasis = parseFloat(NewHolding.costBasis);

    if (!ticker || !shares || !costBasis) return;

    setPortfolio((prev) => [
      ...prev,
      {
        id: generateId(),
        ticker,
        shares,
        costBasis,
        datePurchased: new Date().toISOString().slice(0, 10),
      },
    ]);
    SetNewHolding({ ticker: "", shares: "", costBasis: "" });
    SetShowAdd(false);
    SetQuoteVersion((prev) => prev + 1);
    showToast("Holding added ✓");
  };

  const removeHolding = (id: string) => {
    setPortfolio((prev) => prev.filter((holding) => holding.id !== id));
    SetQuoteVersion((prev) => prev + 1);
    showToast("Holding removed");
  };

  return (
    <Panel
      fillHeight
      className="h-full"
      title="Portfolio"
      subtitle={
        Loading
          ? "Updating prices…"
          : QuotesUpdatedAt != null
            ? `Last updated at ${FormatCacheTimestamp(QuotesUpdatedAt)}`
            : undefined
      }
      action={
        <button
          type="button"
          onClick={() => SetShowAdd((prev) => !prev)}
          className="rounded-lg p-1.5 text-zinc-500 transition hover:bg-white/[0.06] hover:text-zinc-200"
          aria-label="Add holding"
        >
          <IconPlus size={16} />
        </button>
      }
    >
      <div className="flex min-h-0 flex-1 flex-col">
        {portfolio.length === 0 ? (
          <EmptyState
            icon={<IconChartLine size={20} />}
            title="No holdings yet"
            description="Add stocks to track your portfolio"
            action={
              <Button
                variant="secondary"
                className="text-xs"
                onClick={() => router.push("/settings")}
              >
                Add in Settings
              </Button>
            }
          />
        ) : (
          <>
            <div className="mb-3 shrink-0 space-y-2 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-[11px] uppercase tracking-wider text-zinc-500">
                  Total
                </span>
                <div className="text-right">
                  <p className="text-sm font-semibold tabular-nums text-zinc-100">
                    {FormatCurrency(summary.totalValue)}
                  </p>
                  <p
                    className={`text-[11px] tabular-nums ${
                      summary.totalGainLoss >= 0
                        ? "text-emerald-400/80"
                        : "text-red-400/80"
                    }`}
                  >
                    {FormatSignedCurrency(summary.totalGainLoss)} (
                    {FormatSignedPercent(summary.totalGainLossPercent)})
                  </p>
                </div>
              </div>
              <div className="flex items-baseline justify-between gap-2 border-t border-white/[0.05] pt-2">
                <span className="text-[11px] uppercase tracking-wider text-zinc-500">
                  Today
                </span>
                <div className="text-right">
                  <p
                    className={`text-sm font-semibold tabular-nums ${
                      summary.todayChange >= 0
                        ? "text-emerald-400"
                        : "text-red-400"
                    }`}
                  >
                    {FormatSignedCurrency(summary.todayChange)}
                  </p>
                  <p
                    className={`text-[11px] tabular-nums ${
                      summary.todayChange >= 0
                        ? "text-emerald-400/80"
                        : "text-red-400/80"
                    }`}
                  >
                    {FormatSignedPercent(summary.todayChangePercent)}
                  </p>
                </div>
              </div>
            </div>

            <ul className="min-h-0 flex-1 space-y-2 overflow-y-auto pr-0.5">
              {summary.rows.map((row) => (
                <li
                  key={row.ticker}
                  className="rounded-lg border border-white/[0.05] bg-white/[0.02] px-3 py-2.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-[13px] font-semibold text-zinc-100">
                        {row.ticker}
                      </p>
                      <p className="text-[11px] text-zinc-500">
                        {row.shares} shares @ {FormatCurrency(row.costBasis)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        removeHolding(
                          portfolio.find(
                            (holding) =>
                              holding.ticker.toUpperCase() ===
                              row.ticker.toUpperCase(),
                          )?.id ?? "",
                        )
                      }
                      className="text-[10px] text-zinc-600 transition hover:text-red-400"
                    >
                      Remove
                    </button>
                  </div>
                  <div className="mt-2 flex items-baseline justify-between gap-2 text-[11px] tabular-nums">
                    <span className="text-zinc-400">
                      {FormatCurrency(row.price)}
                    </span>
                    <span
                      className={
                        row.holdingTodayChange >= 0
                          ? "text-emerald-400"
                          : "text-red-400"
                      }
                    >
                      {FormatSignedCurrency(row.holdingTodayChange)} (
                      {FormatSignedPercent(row.changePercent)})
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}

        {ShowAdd && (
          <div className="mt-3 shrink-0 space-y-2 border-t border-white/[0.05] pt-3">
            <Input
              label="Ticker"
              placeholder="AAPL"
              value={NewHolding.ticker}
              onChange={(e) =>
                SetNewHolding({ ...NewHolding, ticker: e.target.value })
              }
            />
            <div className="grid grid-cols-2 gap-2">
              <Input
                label="Shares"
                type="number"
                min={0}
                step="any"
                value={NewHolding.shares}
                onChange={(e) =>
                  SetNewHolding({ ...NewHolding, shares: e.target.value })
                }
              />
              <Input
                label="Buy price"
                type="number"
                min={0}
                step="any"
                value={NewHolding.costBasis}
                onChange={(e) =>
                  SetNewHolding({ ...NewHolding, costBasis: e.target.value })
                }
              />
            </div>
            <Button variant="secondary" className="w-full" onClick={addHolding}>
              Add holding
            </Button>
          </div>
        )}
      </div>
    </Panel>
  );
}
