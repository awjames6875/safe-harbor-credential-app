import { createClient } from "@/lib/supabase/server";
import PayerTable from "@/components/admin/PayerTable";

export default async function TrackerPage() {
  const supabase = await createClient();

  const { data: apps } = await supabase
    .from("payer_applications")
    .select("*, clinicians(first_name, last_name)")
    .order("created_at", { ascending: false });

  const applications = (apps ?? []).map((app) => ({
    id: app.id,
    clinician_name: app.clinicians
      ? `${(app.clinicians as { first_name: string; last_name: string }).first_name} ${(app.clinicians as { first_name: string; last_name: string }).last_name}`
      : "Unknown",
    payer_name: app.payer_name,
    payer_type: app.payer_type || "",
    phase: app.phase || 1,
    status: app.status || "Not Started",
    date_submitted: app.date_submitted,
    follow_up_date: app.follow_up_date,
    last_follow_up: app.last_follow_up,
    approval_date: app.approval_date,
    recredentialing_due: app.recredentialing_due ?? null,
    notes: app.notes,
  }));

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Payer Tracker</h1>
        <p className="text-slate-500 mt-1">
          {applications.length} application{applications.length !== 1 ? "s" : ""} across all clinicians
        </p>
      </div>
      <PayerTable applications={applications} />
    </div>
  );
}
