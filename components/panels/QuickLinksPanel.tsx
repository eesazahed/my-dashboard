"use client";

import { useState } from "react";
import { IconLink, IconPlus } from "@tabler/icons-react";
import {
  QuickLinkEditorModal,
  type QuickLinkFormState,
} from "@/components/quick-links/QuickLinkEditorModal";
import { QuickLinkTooltip } from "@/components/quick-links/QuickLinkTooltip";
import { useDashboard } from "@/context/DashboardContext";
import { BrandIcon } from "@/components/ui/BrandIcon";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Panel } from "@/components/ui/Panel";
import { generateId } from "@/lib/date-utils";
import { DefaultLinkColor, GetLinkColorTileClasses } from "@/lib/link-colors";
import { ResolveQuickLinkIcon } from "@/lib/quick-link-utils";
import type { QuickLink } from "@/lib/types";

export function QuickLinksPanel() {
  const { quickLinks, setQuickLinks, showToast } = useDashboard();
  const [EditingLink, SetEditingLink] = useState<QuickLink | null>(null);
  const [AddOpen, SetAddOpen] = useState(false);

  const DeleteLink = (id: string) => {
    setQuickLinks((prev) => prev.filter((link) => link.id !== id));
    showToast("Link removed");
  };

  const SaveEdit = (form: QuickLinkFormState) => {
    if (!EditingLink) return;

    setQuickLinks((prev) =>
      prev.map((link) =>
        link.id === EditingLink.id
          ? {
              ...link,
              label: form.label,
              url: form.url,
              icon: form.icon,
              color: form.color,
            }
          : link,
      ),
    );
    SetEditingLink(null);
    showToast("Link updated ✓");
  };

  const SaveAdd = (form: QuickLinkFormState) => {
    setQuickLinks((prev) => [
      ...prev,
      {
        id: generateId(),
        label: form.label.trim(),
        url: form.url.trim(),
        icon: form.icon,
        color: form.color,
      },
    ]);
    SetAddOpen(false);
    showToast("Link added ✓");
  };

  return (
    <>
      <Panel
        fillHeight
        className="h-full"
        title="Quick links"
        subtitle="Bookmarks & socials"
        action={
          <button
            type="button"
            onClick={() => SetAddOpen(true)}
            className="rounded-lg p-1.5 text-zinc-500 transition hover:bg-white/[0.06] hover:text-zinc-200"
            aria-label="Add link"
          >
            <IconPlus size={16} />
          </button>
        }
      >
        {quickLinks.length === 0 ? (
          <EmptyState
            icon={<IconLink size={20} />}
            title="No links yet"
            description="Add a bookmark with +"
            action={
              <Button
                variant="secondary"
                className="text-xs"
                onClick={() => SetAddOpen(true)}
              >
                Add link
              </Button>
            }
          />
        ) : (
          <div className="min-h-0 flex-1 overflow-y-auto pr-0.5">
            <div className="grid grid-cols-4 gap-2">
              {quickLinks.map((link) => {
                const iconName = ResolveQuickLinkIcon(link.url, link.icon);
                const colorClasses = GetLinkColorTileClasses(
                  link.color ?? DefaultLinkColor,
                );

                return (
                  <QuickLinkTooltip
                    key={link.id}
                    link={link}
                    onEdit={() => SetEditingLink(link)}
                    onDelete={() => DeleteLink(link.id)}
                  >
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={link.label}
                      className={`flex aspect-square w-full items-center justify-center rounded-xl border transition ${colorClasses}`}
                    >
                      <BrandIcon name={iconName} size={22} />
                    </a>
                  </QuickLinkTooltip>
                );
              })}
            </div>
          </div>
        )}
      </Panel>

      <QuickLinkEditorModal
        open={EditingLink != null}
        link={EditingLink}
        onClose={() => SetEditingLink(null)}
        onSave={SaveEdit}
      />

      <QuickLinkEditorModal
        open={AddOpen}
        link={null}
        onClose={() => SetAddOpen(false)}
        onSave={SaveAdd}
      />
    </>
  );
}
