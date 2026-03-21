import { createAdminClient } from "@/lib/supabase/admin";
import DocumentTable from "@/components/admin/DocumentTable";

export default async function DocumentsPage() {
  const supabase = createAdminClient();

  const [{ data: documents }, { data: clinicians }] = await Promise.all([
    supabase.from("documents").select("*").order("uploaded_at", { ascending: false }),
    supabase.from("clinicians").select("id, first_name, last_name"),
  ]);

  const clinicianNames: Record<string, string> = {};
  for (const c of clinicians || []) {
    clinicianNames[c.id] = `${c.first_name} ${c.last_name}`;
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">
          Document Vault
        </h1>
        <p className="text-slate-500 mt-1">
          Centralized storage for all credentialing documents
        </p>
      </div>
      <DocumentTable documents={documents || []} clinicianNames={clinicianNames} />
    </div>
  );
}
