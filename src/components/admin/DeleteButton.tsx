"use client";

import { useTransition } from "react";

interface DeleteButtonProps {
  action: () => Promise<void>;
  label?: string;
}

export default function DeleteButton({
  action,
  label = "Delete",
}: DeleteButtonProps) {
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    if (!confirm(`Are you sure you want to delete this item? This cannot be undone.`)) return;
    startTransition(() => action());
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className="rounded px-2 py-1 text-xs text-danger transition-colors hover:bg-danger-muted disabled:opacity-50"
    >
      {isPending ? "Deleting…" : label}
    </button>
  );
}
