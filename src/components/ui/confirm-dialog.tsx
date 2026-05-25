"use client";

import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";

type ConfirmDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  pending?: boolean;
  onConfirm: () => void | Promise<void>;
};

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  pending = false,
  onConfirm,
}: ConfirmDialogProps) {
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
            {cancelLabel}
          </Button>
          <Button
            disabled={pending}
            onClick={() => void onConfirm()}
            variant="destructive"
          >
            {pending ? "Working…" : confirmLabel}
          </Button>
        </>
      }
      onOpenChange={onOpenChange}
      open={open}
      title={title}
    />
  );
}
