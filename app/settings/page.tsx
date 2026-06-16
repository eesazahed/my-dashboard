"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import {
  IconArrowLeft,
  IconCheck,
  IconDownload,
  IconPlus,
  IconTrash,
  IconUpload,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Panel } from "@/components/ui/Panel";
import { LatestCommitInfo } from "@/components/settings/LatestCommitInfo";
import { useDashboard } from "@/context/DashboardContext";
import { generateId } from "@/lib/date-utils";

export default function SettingsPage() {
  const router = useRouter();
  const { settings, setSettings, portfolio, setPortfolio, showToast, reloadDashboard } =
    useDashboard();

  const [savedFlash, setSavedFlash] = useState(false);
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [newHolding, setNewHolding] = useState({
    ticker: "",
    shares: "",
    costBasis: "",
  });

  const handleSaveAndExit = () => {
    setSavedFlash(true);
    showToast("Settings saved ✓");
    setTimeout(() => router.push("/"), 500);
  };

  const addHolding = () => {
    const ticker = newHolding.ticker.trim().toUpperCase();
    const shares = parseFloat(newHolding.shares);
    const costBasis = parseFloat(newHolding.costBasis);

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
    setNewHolding({ ticker: "", shares: "", costBasis: "" });
    showToast("Holding added ✓");
  };

  const removeHolding = (id: string) => {
    setPortfolio((prev) => prev.filter((holding) => holding.id !== id));
    showToast("Holding removed");
  };

  const downloadBackup = async () => {
    try {
      const response = await fetch("/api/database");
      if (!response.ok) throw new Error("Export failed");

      const blob = await response.blob();
      const stamp = new Date().toISOString().slice(0, 10);
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `dashboard-backup-${stamp}.db`;
      anchor.click();
      URL.revokeObjectURL(url);
      showToast("Backup downloaded ✓");
    } catch {
      showToast("Backup download failed");
    }
  };

  const importBackup = async (file: File) => {
    if (!file.name.toLowerCase().endsWith(".db") && !file.name.toLowerCase().endsWith(".dbi")) {
      showToast("Please choose a .db backup file");
      return;
    }

    const confirmed = window.confirm(
      "Import replaces all dashboard data with this backup. Continue?",
    );
    if (!confirmed) return;

    setImporting(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/database", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        throw new Error(data.error ?? "Import failed");
      }

      showToast("Backup imported ✓");
      await reloadDashboard();
      router.refresh();
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : "Backup import failed",
      );
    } finally {
      setImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="mx-auto min-h-screen max-w-2xl px-4 pb-28 pt-6">
      <div className="mb-8 flex items-center gap-4">
        <Link
          href="/"
          className="rounded-xl border border-white/10 bg-white/5 p-2.5 text-zinc-300 transition hover:bg-white/10 hover:text-white"
          aria-label="Back to dashboard"
        >
          <IconArrowLeft size={20} />
        </Link>
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-zinc-500">
            Configuration
          </p>
          <h1 className="text-2xl font-semibold text-zinc-50">Settings</h1>
        </div>
      </div>

      <div className="space-y-5">
        <Panel title="Profile" subtitle="Your display name on the dashboard">
          <Input
            label="Display name"
            value={settings.name}
            onChange={(e) =>
              setSettings((prev) => ({ ...prev, name: e.target.value }))
            }
            placeholder="e.g. Eesa"
          />
        </Panel>

        <Panel title="Portfolio" subtitle="Manual holdings · prices refresh hourly">
          {portfolio.length > 0 && (
            <ul className="mb-4 space-y-2">
              {portfolio.map((holding) => (
                <li
                  key={holding.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-white/[0.06] bg-black/20 px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-medium text-zinc-100">
                      {holding.ticker}
                    </p>
                    <p className="text-xs text-zinc-500">
                      {holding.shares} shares @ ${holding.costBasis}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeHolding(holding.id)}
                    className="rounded-lg p-1.5 text-red-400 hover:bg-red-500/10"
                    aria-label={`Remove ${holding.ticker}`}
                  >
                    <IconTrash size={16} />
                  </button>
                </li>
              ))}
            </ul>
          )}
          <div className="space-y-3">
            <Input
              label="Ticker"
              placeholder="AAPL"
              value={newHolding.ticker}
              onChange={(e) =>
                setNewHolding({ ...newHolding, ticker: e.target.value })
              }
            />
            <div className="grid gap-3 sm:grid-cols-2">
              <Input
                label="Shares"
                type="number"
                min={0}
                step="any"
                value={newHolding.shares}
                onChange={(e) =>
                  setNewHolding({ ...newHolding, shares: e.target.value })
                }
              />
              <Input
                label="Buy price"
                type="number"
                min={0}
                step="any"
                value={newHolding.costBasis}
                onChange={(e) =>
                  setNewHolding({ ...newHolding, costBasis: e.target.value })
                }
              />
            </div>
            <Button variant="secondary" onClick={addHolding}>
              <IconPlus size={16} />
              Add holding
            </Button>
          </div>
        </Panel>

        <Panel
          title="Data backup"
          subtitle="Export or restore your full SQLite database"
        >
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button variant="secondary" onClick={downloadBackup}>
              <IconDownload size={16} />
              Download .db backup
            </Button>
            <Button
              variant="secondary"
              disabled={importing}
              onClick={() => fileInputRef.current?.click()}
            >
              <IconUpload size={16} />
              {importing ? "Importing…" : "Import .db backup"}
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".db,.dbi"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void importBackup(file);
              }}
            />
          </div>
        </Panel>

        <Panel title="Repository" subtitle="eesazahed/my-dashboard on GitHub">
          <LatestCommitInfo />
        </Panel>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-white/[0.08] bg-[#141312]">
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-4 px-4 py-4">
          <p className="text-sm text-zinc-500">
            Changes save instantly as you edit
          </p>
          <Button onClick={handleSaveAndExit} className="min-w-[140px]">
            {savedFlash ? (
              <>
                <IconCheck size={16} />
                Saved!
              </>
            ) : (
              "Save & go back"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
