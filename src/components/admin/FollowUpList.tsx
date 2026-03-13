"use client";

import { useEffect, useState } from "react";

interface FollowUp {
  id: string;
  due_date: string;
  payer_applications: {
    payer_name: string;
    clinicians: {
      first_name: string;
      last_name: string;
    } | null;
  } | null;
}

export default function FollowUpList() {
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/follow-ups")
      .then((res) => res.json())
      .then((data) => setFollowUps(Array.isArray(data) ? data : []))
      .catch((err) => console.error("Failed to fetch follow-ups:", err))
      .finally(() => setLoading(false));
  }, []);

  function daysOverdue(dueDate: string): number {
    const due = new Date(dueDate + "T00:00:00");
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return Math.floor((today.getTime() - due.getTime()) / (1000 * 60 * 60 * 24));
  }

  if (loading) {
    return <p className="text-sm text-slate-400">Loading follow-ups...</p>;
  }

  if (followUps.length === 0) {
    return (
      <p className="text-sm text-green-600 font-medium">
        All caught up — no follow-ups due today.
      </p>
    );
  }

  return (
    <ul className="space-y-2">
      {followUps.map((fu) => {
        const overdue = daysOverdue(fu.due_date);
        const payerApp = fu.payer_applications;
        const clinicianName = payerApp?.clinicians
          ? `${payerApp.clinicians.first_name} ${payerApp.clinicians.last_name}`
          : "Unknown";

        return (
          <li key={fu.id} className="flex items-center justify-between text-sm">
            <div>
              <span className="font-medium text-slate-800">
                {payerApp?.payer_name ?? "Unknown Payer"}
              </span>
              <span className="text-slate-400 ml-2">({clinicianName})</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-500">{fu.due_date}</span>
              {overdue > 0 && (
                <span className="text-xs font-medium text-red-600">
                  {overdue}d overdue
                </span>
              )}
              {overdue === 0 && (
                <span className="text-xs font-medium text-amber-600">Due today</span>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
