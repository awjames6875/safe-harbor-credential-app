import { createClient } from "@/lib/supabase/server";
import { calculateAlerts } from "@/lib/alerts";
import { AlertTriangle, CheckCircle } from "lucide-react";

export default async function AlertsPage() {
  const supabase = await createClient();

  const [cliniciansResult, clinicResult] = await Promise.all([
    supabase.from("clinicians").select("id, first_name, last_name, license_expiry, malpractice_end, caqh_last_attest"),
    supabase.from("clinic").select("odmhsas_expiry, malpractice_expiry").single(),
  ]);

  const alerts = calculateAlerts(
    cliniciansResult.data ?? [],
    clinicResult.data
  );

  const critical = alerts.filter((a) => a.type === "critical");
  const warnings = alerts.filter((a) => a.type === "warning");
  const reminders = alerts.filter((a) => a.type === "reminder");

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Alerts</h1>
        <p className="text-slate-500 mt-1">
          {alerts.length} active alert{alerts.length !== 1 ? "s" : ""}
        </p>
      </div>

      {alerts.length === 0 && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-8 text-center">
          <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-3" />
          <p className="font-medium text-emerald-800">All clear!</p>
          <p className="text-sm text-emerald-600 mt-1">
            No expiring credentials or pending actions.
          </p>
        </div>
      )}

      {critical.length > 0 && (
        <div>
          <h2 className="text-sm font-medium text-red-700 uppercase tracking-wide mb-3">
            Critical ({critical.length})
          </h2>
          <div className="space-y-2">
            {critical.map((alert, i) => (
              <div
                key={i}
                className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3"
              >
                <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-red-800">{alert.message}</p>
                  <p className="text-xs text-red-600 mt-0.5">{alert.actionRequired}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {warnings.length > 0 && (
        <div>
          <h2 className="text-sm font-medium text-amber-700 uppercase tracking-wide mb-3">
            Warnings ({warnings.length})
          </h2>
          <div className="space-y-2">
            {warnings.map((alert, i) => (
              <div
                key={i}
                className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3"
              >
                <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-amber-800">{alert.message}</p>
                  <p className="text-xs text-amber-600 mt-0.5">{alert.actionRequired}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {reminders.length > 0 && (
        <div>
          <h2 className="text-sm font-medium text-sky-700 uppercase tracking-wide mb-3">
            Reminders ({reminders.length})
          </h2>
          <div className="space-y-2">
            {reminders.map((alert, i) => (
              <div
                key={i}
                className="bg-sky-50 border border-sky-200 rounded-lg p-4 flex items-start gap-3"
              >
                <AlertTriangle className="w-4 h-4 text-sky-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-sky-800">{alert.message}</p>
                  <p className="text-xs text-sky-600 mt-0.5">{alert.actionRequired}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
