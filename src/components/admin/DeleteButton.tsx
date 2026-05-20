"use client";

import { useTransition, useState } from "react";

interface DeleteButtonProps {
  action: () => Promise<void>;
  label?: string;
}

export default function DeleteButton({
  action,
  label = "Delete",
}: DeleteButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [showModal, setShowModal] = useState(false);

  function handleConfirm() {
    setShowModal(false);
    startTransition(() => action());
  }

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        disabled={isPending}
        className="rounded px-2 py-1 text-xs text-danger transition-colors hover:bg-danger-muted disabled:opacity-50"
      >
        {isPending ? "Deleting…" : label}
      </button>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowModal(false)}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-modal-title"
            className="relative z-10 w-full max-w-sm rounded-lg border border-border bg-card p-6 shadow-xl"
          >
            <h2 id="delete-modal-title" className="text-base font-semibold text-foreground">
              Delete this item?
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              This cannot be undone.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="rounded-md px-4 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                className="rounded-md bg-danger px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-danger/90"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
