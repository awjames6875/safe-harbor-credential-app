"use client";

import { useState } from "react";
import FollowUpDialog from "./FollowUpDialog";

const STATUSES = [
  "Not Started",
  "Ready to Submit",
  "Submitted",
  "In Progress",
  "Under Review",
  "Pending Info",
  "Approved",
  "Active",
  "Denied",
  "On Hold",
];

interface PayerApp {
  id: string;
  clinician_name: string;
  payer_name: string;
  payer_type: string;
  phase: number;
  status: string;
  date_submitted: string | null;
  follow_up_date: string | null;
  last_follow_up: string | null;
  approval_date: string | null;
  recredentialing_due: string | null;
  notes: string | null;
}

interface PayerTableProps {
  applications: PayerApp[];
}

export default function PayerTable({ applications }: PayerTableProps) {
  const [filter, setFilter] = useState({ clinician: "", status: "" });
  const [saving, setSaving] = useState<string | null>(null);
  const [selectedPayerApp, setSelectedPayerApp] = useState<PayerApp | null>(null);

  const filtered = applications.filter((app) => {
    if (filter.clinician && !app.clinician_name.toLowerCase().includes(filter.clinician.toLowerCase())) {
      return false;
    }
    if (filter.status && app.status !== filter.status) {
      return false;
    }
    return true;
  });

  async function updateField(id: string, field: string, value: string) {
    setSaving(id);
    try {
      await fetch(`/api/admin/payer/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: value }),
      });
    } catch (err) {
      console.error("Failed to update:", err);
    }
    setSaving(null);
  }

  function downloadCsv(apps: PayerApp[]) {
    const headers = ["Clinician", "Payer", "Type", "Phase", "Status", "Submitted", "Follow-up Date", "Approved Date", "Notes"];
    const escapeCell = (val: string | number | null) => {
      const str = val == null ? "" : String(val);
      return str.includes(",") || str.includes('"') || str.includes("\n")
        ? `"${str.replace(/"/g, '""')}"`
        : str;
    };
    const rows = apps.map((app) => [
      app.clinician_name,
      app.payer_name,
      app.payer_type,
      app.phase,
      app.status,
      app.date_submitted,
      app.follow_up_date,
      app.approval_date,
      app.notes,
    ].map(escapeCell).join(","));
    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "payer-applications.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  function getFollowUpColor(date: string | null): string {
    if (!date) return "";
    const diff = new Date(date).getTime() - Date.now();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    if (days < 0) return "text-red-600 font-medium";
    if (days === 0) return "text-amber-600 font-medium";
    return "";
  }

  return (
    <div>
      {/* Filters */}
      <div className="flex gap-3 mb-4 flex-wrap items-center">
        <input
          type="text"
          placeholder="Filter by clinician..."
          value={filter.clinician}
          onChange={(e) => setFilter((f) => ({ ...f, clinician: e.target.value }))}
          className="border border-slate-200 rounded-lg px-3 py-2 text-sm w-48"
        />
        <select
          value={filter.status}
          onChange={(e) => setFilter((f) => ({ ...f, status: e.target.value }))}
          className="border border-slate-200 rounded-lg px-3 py-2 text-sm"
        >
          <option value="">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <button
          onClick={() => downloadCsv(filtered)}
          className="ml-auto bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm px-3 py-2 rounded-lg transition-colors"
        >
          Export CSV
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto border border-slate-200 rounded-xl">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="text-left p-3 font-medium text-slate-500 sticky top-0 bg-slate-50">Clinician</th>
              <th className="text-left p-3 font-medium text-slate-500">Payer</th>
              <th className="text-left p-3 font-medium text-slate-500">Phase</th>
              <th className="text-left p-3 font-medium text-slate-500">Status</th>
              <th className="text-left p-3 font-medium text-slate-500">Submitted</th>
              <th className="text-left p-3 font-medium text-slate-500">Follow-up</th>
              <th className="text-left p-3 font-medium text-slate-500">Approved</th>
              <th className="text-left p-3 font-medium text-slate-500">Re-cred Due</th>
              <th className="text-left p-3 font-medium text-slate-500">Notes</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((app, i) => (
              <tr
                key={app.id}
                className={`border-b border-slate-100 ${
                  i % 2 === 1 ? "bg-slate-50/50" : "bg-white"
                } ${saving === app.id ? "opacity-60" : ""}`}
              >
                <td className="p-3 font-medium">{app.clinician_name}</td>
                <td className="p-3">
                  <span>{app.payer_name}</span>
                  <span className="text-xs text-slate-400 ml-1">({app.payer_type})</span>
                </td>
                <td className="p-3">{app.phase}</td>
                <td className="p-3">
                  <select
                    value={app.status}
                    onChange={(e) => updateField(app.id, "status", e.target.value)}
                    className="border-0 bg-transparent text-sm p-0 focus:ring-2 focus:ring-blue-500 rounded cursor-pointer"
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </td>
                <td className="p-3 text-slate-500">{app.date_submitted || "—"}</td>
                <td
                  className={`p-3 cursor-pointer hover:underline ${getFollowUpColor(app.follow_up_date)}`}
                  onClick={() => setSelectedPayerApp(app)}
                >
                  {app.follow_up_date || "—"}
                </td>
                <td className="p-3 text-slate-500">{app.approval_date || "—"}</td>
                <td className={`p-3 ${
                  (() => {
                    if (!app.recredentialing_due) return "text-slate-500";
                    const days = Math.ceil((new Date(app.recredentialing_due).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                    if (days <= 60) return "text-red-600 font-medium";
                    if (days <= 180) return "text-amber-600 font-medium";
                    return "text-slate-500";
                  })()
                }`}>
                  {app.recredentialing_due || "—"}
                </td>
                <td className="p-3 text-slate-400 max-w-[150px] truncate">
                  {app.notes || "—"}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={9} className="p-8 text-center text-slate-400">
                  No applications match your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {selectedPayerApp && (
        <FollowUpDialog
          payerAppId={selectedPayerApp.id}
          payerName={selectedPayerApp.payer_name}
          onClose={() => setSelectedPayerApp(null)}
        />
      )}
    </div>
  );
}
