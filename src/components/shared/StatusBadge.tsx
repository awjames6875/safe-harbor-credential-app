const STATUS_COLORS: Record<string, string> = {
  "Not Started": "bg-slate-100 text-slate-600",
  "Ready to Submit": "bg-sky-100 text-sky-700",
  "Submitted": "bg-blue-100 text-blue-700",
  "In Progress": "bg-violet-100 text-violet-700",
  "Under Review": "bg-amber-100 text-amber-700",
  "Pending Info": "bg-orange-100 text-orange-700",
  "Approved": "bg-emerald-100 text-emerald-700",
  "Active": "bg-emerald-500 text-white",
  "Denied": "bg-red-100 text-red-700",
  "On Hold": "bg-slate-200 text-slate-600",
  intake_complete: "bg-blue-100 text-blue-700",
};

export default function StatusBadge({ status }: { status: string }) {
  const colors = STATUS_COLORS[status] || "bg-slate-100 text-slate-600";
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors}`}
    >
      {status}
    </span>
  );
}
