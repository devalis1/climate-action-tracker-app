"use client";

import { useEffect, useState } from "react";

import {
  ActionFormFields,
  emptyActionDraft,
  type ActionDraftBase,
} from "@/components/admin/action-form-fields";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";

type ActionFormModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "edit" | "import";
  actionId?: number;
  initialDraft: ActionDraftBase;
  pending?: boolean;
  onSubmit: (draft: ActionDraftBase, actionId?: number) => void | Promise<void>;
};

export function ActionFormModal({
  open,
  onOpenChange,
  mode,
  actionId,
  initialDraft,
  pending = false,
  onSubmit,
}: ActionFormModalProps) {
  const [draft, setDraft] = useState<ActionDraftBase>(initialDraft);

  useEffect(() => {
    if (open) {
      setDraft(initialDraft);
    }
  }, [open, initialDraft]);

  const title = mode === "import" ? "Review imported action" : "Edit initiative";
  const description =
    mode === "import"
      ? "Confirm the parsed fields, then save directly to Postgres."
      : actionId
        ? `Editing record ${actionId}. Changes persist immediately on save.`
        : "Update this initiative.";

  return (
    <Dialog
      description={description}
      footer={
        <>
          <Button
            disabled={pending}
            onClick={() => onOpenChange(false)}
            variant="secondary"
          >
            Cancel
          </Button>
          <Button
            disabled={pending}
            onClick={() => void onSubmit(draft, actionId)}
          >
            {pending ? "Saving…" : "Save to Postgres"}
          </Button>
        </>
      }
      onOpenChange={onOpenChange}
      open={open}
      title={title}
    >
      <ActionFormFields
        draft={draft}
        idPrefix={mode === "import" ? "import-review" : "edit-action"}
        onChange={setDraft}
      />
    </Dialog>
  );
}

export { emptyActionDraft, type ActionDraftBase };
