import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, FileCheck, AlertTriangle, Clock } from "lucide-react";
import ClinicianCard from "@/components/admin/ClinicianCard";
import ClinicStatusBar from "@/components/admin/ClinicStatusBar";
import AlertBanner from "@/components/admin/AlertBanner";
import FollowUpList from "@/components/admin/FollowUpList";
import { calculateAlerts } from "@/lib/alerts";
import { calculateNextActions } from "@/lib/nextActions";
import PhaseProgress from "@/components/admin/PhaseProgress";
import InviteUserButton from "@/components/admin/InviteUserButton";

export default async function AdminDashboard() {
  const supabase = await createClient();

  const [cliniciansResult, payerAppsResult, clinicResult, stepsResult] = await Promise.all([
    supabase.from("clinicians").select("*"),
    supabase.from("payer_applications").select("clinician_id, status, follow_up_date, date_submitted, clinician_name, payer_name, recredentialing_due, id"),
    supabase.from("clinic").select("*").single(),
    supabase.from("credentialing_steps").select("phase, is_completed"),
  ]);

  const clinicians = cliniciansResult.data ?? [];
  const payerApps = payerAppsResult.data ?? [];
  const clinic = clinicResult.data;
  const credentialingSteps = stepsResult.data ?? [];

  const alerts = calculateAlerts(clinicians, clinic, undefined, payerApps);
  const alertCount = alerts.length;
  const nextActions = calculateNextActions(alerts, payerApps, clinicians);

  const payerStats = new Map<string, { total: number; approved: number }>();
  for (const app of payerApps) {
    const existing = payerStats.get(app.clinician_id) || { total: 0, approved: 0 };
    existing.total++;
    if (app.status === "Approved" || app.status === "Active") existing.approved++;
    payerStats.set(app.clinician_id, existing);
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Dashboard</h1>
        <p className="text-slate-500 mt-1">Overview of your credentialing progress</p>
      </div>
      <InviteUserButton />

      <AlertBanner alerts={alerts} />

      {clinic && (
        <ClinicStatusBar
          npi={clinic.npi_type2}
          ein={clinic.ein}
          odmhsasLicense={clinic.odmhsas_license}
          odmhsasExpiry={clinic.odmhsas_expiry}
          malpracticeExpiry={clinic.malpractice_expiry}
        />
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Clinicians</CardTitle>
            <Users className="w-4 h-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clinicians.length}</div>
            <p className="text-xs text-slate-500 mt-1">Total enrolled</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Payer Applications</CardTitle>
            <FileCheck className="w-4 h-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{payerApps.length}</div>
            <p className="text-xs text-slate-500 mt-1">Across all payers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Alerts</CardTitle>
            <AlertTriangle className={`w-4 h-4 ${alertCount > 0 ? "text-amber-500" : "text-slate-400"}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${alertCount > 0 ? "text-amber-600" : ""}`}>
              {alertCount}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {alertCount > 0 ? "Require attention" : "All clear"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Next Actions</CardTitle>
            <Clock className="w-4 h-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            {nextActions.length === 0 ? (
              <p className="text-sm text-slate-400">No actions needed</p>
            ) : (
              <ul className="space-y-1.5">
                {nextActions.map((action, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span
                      className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${
                        action.priority === "high"
                          ? "bg-red-500"
                          : action.priority === "medium"
                          ? "bg-amber-500"
                          : "bg-blue-500"
                      }`}
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-700 leading-tight">{action.label}</p>
                      <p className="text-xs text-slate-400 truncate">{action.detail}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-slate-900 mb-3">Phase Progress</h2>
        <PhaseProgress steps={credentialingSteps} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-slate-900">Due Follow-Ups</CardTitle>
        </CardHeader>
        <CardContent>
          <FollowUpList />
        </CardContent>
      </Card>

      <div>
        <h2 className="text-lg font-semibold text-slate-900 mb-3">Clinicians</h2>
        {clinicians.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-sm text-slate-400">
                No clinicians yet. Share the intake portal link to get started.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {clinicians.map((c) => {
              const stats = payerStats.get(c.id) || { total: 0, approved: 0 };
              return (
                <ClinicianCard
                  key={c.id}
                  id={c.id}
                  firstName={c.first_name}
                  lastName={c.last_name}
                  licenseType={c.license_type}
                  npi={c.npi_type1}
                  caqhId={c.caqh_id}
                  status={c.status || "intake_complete"}
                  licenseExpiry={c.license_expiry}
                  payerCount={stats.total}
                  payerApproved={stats.approved}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
