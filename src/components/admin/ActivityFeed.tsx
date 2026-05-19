import { getRecentActivity, type ActivityEntry } from "@/lib/firebase/firestore";

const ACTION_LABELS = {
  create: "Created",
  update: "Updated",
  delete: "Deleted",
} as const;

function actionBadgeClass(action: string): string {
  if (action === "create") return "shrink-0 rounded px-1.5 py-0.5 text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
  if (action === "delete") return "shrink-0 rounded px-1.5 py-0.5 text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
  return "shrink-0 rounded px-1.5 py-0.5 text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
}

function formatRelativeTime(createdAt: ActivityEntry["createdAt"]): string {
  if (!createdAt) return "just now";
  const diffMs = Date.now() - createdAt.seconds * 1000;
  const diffMins = Math.floor(diffMs / 60_000);
  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

export default async function ActivityFeed() {
  const entries = await getRecentActivity();

  if (entries.length === 0) {
    return <p className="text-muted-foreground text-sm">No recent activity.</p>;
  }

  return (
    <ul className="space-y-3">
      {entries.map((entry) => (
        <li key={entry.id} className="flex items-start gap-3 text-sm">
          <span className={actionBadgeClass(entry.action)}>
            {ACTION_LABELS[entry.action as keyof typeof ACTION_LABELS] ?? entry.action}
          </span>
          <span className="flex-1">
            <span className="font-medium text-foreground">{entry.label}</span>
            <span className="text-muted-foreground"> in {entry.collection}</span>
          </span>
          <span className="text-muted-foreground shrink-0 text-xs">
            {formatRelativeTime(entry.createdAt)}
          </span>
        </li>
      ))}
    </ul>
  );
}
