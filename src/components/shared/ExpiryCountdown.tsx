function getDaysUntil(dateStr: string | null): number | null {
  if (!dateStr) return null;
  const target = new Date(dateStr);
  const now = new Date();
  const diffMs = target.getTime() - now.getTime();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

export default function ExpiryCountdown({
  date,
  label,
}: {
  date: string | null;
  label?: string;
}) {
  const days = getDaysUntil(date);

  if (days === null) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-slate-100 text-slate-400">
        {label ? `${label}: ` : ""}No date
      </span>
    );
  }

  if (days < 0) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-red-500 text-white">
        {label ? `${label}: ` : ""}EXPIRED
      </span>
    );
  }

  if (days <= 30) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-red-100 text-red-700">
        {label ? `${label}: ` : ""}{days}d
      </span>
    );
  }

  if (days <= 90) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-amber-100 text-amber-700">
        {label ? `${label}: ` : ""}{days}d
      </span>
    );
  }

  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-emerald-100 text-emerald-700">
      {label ? `${label}: ` : ""}{days}d
    </span>
  );
}
