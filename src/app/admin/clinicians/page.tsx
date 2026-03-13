import { createClient } from "@/lib/supabase/server";
import ClinicianCard from "@/components/admin/ClinicianCard";

export default async function CliniciansPage() {
  const supabase = await createClient();

  const [cliniciansResult, payerAppsResult] = await Promise.all([
    supabase.from("clinicians").select("*").order("created_at", { ascending: false }),
    supabase.from("payer_applications").select("clinician_id, status"),
  ]);

  const clinicians = cliniciansResult.data ?? [];
  const payerApps = payerAppsResult.data ?? [];

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
        <h1 className="text-2xl font-semibold text-slate-900">Clinicians</h1>
        <p className="text-slate-500 mt-1">
          {clinicians.length} clinician{clinicians.length !== 1 ? "s" : ""} enrolled
        </p>
      </div>

      {clinicians.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-8 text-center">
          <p className="text-slate-400">
            No clinicians yet. Share the intake portal link to get started.
          </p>
        </div>
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
  );
}
