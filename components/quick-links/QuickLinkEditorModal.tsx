"use client";

import { useState } from "react";
import { BrandIcon } from "@/components/ui/BrandIcon";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Select } from "@/components/ui/Select";
import {
  DefaultLinkColor,
  GetLinkColorSwatchClasses,
  LinkColorOptions,
  type LinkColorId,
} from "@/lib/link-colors";
import { ResolveQuickLinkIcon } from "@/lib/quick-link-utils";
import { CuratedBrandIcons, type QuickLink } from "@/lib/types";

export type QuickLinkFormState = {
  label: string;
  url: string;
  icon: string;
  color: LinkColorId;
};

type QuickLinkEditorModalProps = {
  open: boolean;
  link: QuickLink | null;
  onClose: () => void;
  onSave: (form: QuickLinkFormState) => void;
};

export function QuickLinkEditorModal({
  open,
  link,
  onClose,
  onSave,
}: QuickLinkEditorModalProps) {
  const isEditing = link != null;

  return (
    <Modal
      open={open}
      title={isEditing ? "Edit link" : "Add link"}
      onClose={onClose}
    >
      <QuickLinkEditorForm
        key={link?.id ?? "new-link"}
        link={link}
        onSave={onSave}
      />
    </Modal>
  );
}

function QuickLinkEditorForm({
  link,
  onSave,
}: {
  link: QuickLink | null;
  onSave: (form: QuickLinkFormState) => void;
}) {
  const [Form, SetForm] = useState<QuickLinkFormState>({
    label: link?.label ?? "",
    url: link?.url ?? "",
    icon: link?.icon ?? "link",
    color: (link?.color as LinkColorId) ?? DefaultLinkColor,
  });

  const previewIcon = ResolveQuickLinkIcon(Form.url || "https://", Form.icon);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!Form.label.trim() || !Form.url.trim()) return;
    onSave(Form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Label"
        value={Form.label}
        onChange={(e) => SetForm({ ...Form, label: e.target.value })}
        placeholder="GitHub"
        autoFocus
        required
      />
      <Input
        label="URL"
        value={Form.url}
        onChange={(e) => SetForm({ ...Form, url: e.target.value })}
        placeholder="https://github.com/you"
        required
      />
      <Select
        label="Icon"
        value={Form.icon}
        onChange={(e) => SetForm({ ...Form, icon: e.target.value })}
      >
        {CuratedBrandIcons.map((icon) => (
          <option key={icon} value={icon}>
            {icon.replace("brand-", "")}
          </option>
        ))}
      </Select>

      <fieldset>
        <legend className="mb-2 block text-xs font-medium text-zinc-400">
          Color tint
        </legend>
        <div className="flex flex-wrap gap-2">
          {LinkColorOptions.map((option) => (
            <button
              key={option.id}
              type="button"
              title={option.label}
              onClick={() => SetForm({ ...Form, color: option.id })}
              className={`flex size-8 items-center justify-center rounded-lg border transition ${GetLinkColorSwatchClasses(option.id)} ${
                Form.color === option.id
                  ? "border-white/40 ring-2 ring-white/20"
                  : "border-transparent opacity-80 hover:opacity-100"
              }`}
            >
              <BrandIcon name={previewIcon} size={14} className="text-white" />
            </button>
          ))}
        </div>
      </fieldset>

      <Button type="submit" className="w-full">
        {link ? "Save changes" : "Add link"}
      </Button>
    </form>
  );
}
