"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface FollowUpDialogProps {
  payerAppId: string;
  payerName: string;
  onClose: () => void;
}

function defaultNextDate(): string {
  const date = new Date();
  date.setDate(date.getDate() + 14);
  return date.toISOString().split("T")[0];
}

export default function FollowUpDialog({ payerAppId, payerName, onClose }: FollowUpDialogProps) {
  const router = useRouter();
  const [notes, setNotes] = useState("");
  const [contactMethod, setContactMethod] = useState("Phone");
  const [contactPerson, setContactPerson] = useState("");
  const [nextFollowUpDate, setNextFollowUpDate] = useState(defaultNextDate);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch("/api/admin/follow-ups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          payer_application_id: payerAppId,
          notes,
          contact_method: contactMethod,
          contact_person: contactPerson,
          next_follow_up_date: nextFollowUpDate,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        console.error("Failed to log follow-up:", data.error);
        return;
      }

      router.refresh();
      onClose();
    } catch (err) {
      console.error("Failed to log follow-up:", err);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-1">Log Follow-Up</h3>
        <p className="text-sm text-slate-500 mb-4">{payerName}</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Contact Method</label>
            <select
              value={contactMethod}
              onChange={(e) => setContactMethod(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
            >
              <option value="Phone">Phone</option>
              <option value="Email">Email</option>
              <option value="Portal">Portal</option>
              <option value="Fax">Fax</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Contact Person</label>
            <input
              type="text"
              value={contactPerson}
              onChange={(e) => setContactPerson(e.target.value)}
              placeholder="Name of person contacted"
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="What happened on this follow-up..."
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Next Follow-Up Date</label>
            <input
              type="date"
              value={nextFollowUpDate}
              onChange={(e) => setNextFollowUpDate(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {submitting ? "Saving..." : "Log Follow-Up"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
