"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Note {
  id: string;
  note: string;
  created_by: string;
  created_at: string;
}

function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return date.toLocaleDateString();
}

export default function ClinicianNotes({ clinicianId }: { clinicianId: string }) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [newNote, setNewNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch(`/api/admin/clinician-notes?clinician_id=${clinicianId}`)
      .then((res) => res.json())
      .then((data) => setNotes(Array.isArray(data) ? data : []))
      .catch((err) => console.error("Failed to fetch notes:", err))
      .finally(() => setLoading(false));
  }, [clinicianId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!newNote.trim() || submitting) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/clinician-notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clinician_id: clinicianId, note: newNote }),
      });
      const data = await res.json();
      if (res.ok) {
        setNotes((prev) => [data, ...prev]);
        setNewNote("");
      }
    } catch (err) {
      console.error("Failed to add note:", err);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Notes & Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex gap-2 mb-4">
          <textarea
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="Add a note... (e.g., Called CAQH support, clinician sent updated license)"
            className="flex-1 rounded-md border border-slate-200 px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={2}
          />
          <button
            type="submit"
            disabled={!newNote.trim() || submitting}
            className="self-end px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? "Adding..." : "Add"}
          </button>
        </form>

        {loading && <p className="text-sm text-slate-400">Loading notes...</p>}

        {!loading && notes.length === 0 && (
          <p className="text-sm text-slate-400">No notes yet.</p>
        )}

        {notes.length > 0 && (
          <ul className="space-y-3">
            {notes.map((n) => (
              <li key={n.id} className="border-b border-slate-100 pb-3 last:border-0 last:pb-0">
                <p className="text-sm text-slate-800 whitespace-pre-wrap">{n.note}</p>
                <p className="text-xs text-slate-400 mt-1">
                  {n.created_by} &middot; {timeAgo(n.created_at)}
                </p>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
