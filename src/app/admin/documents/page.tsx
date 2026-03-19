import { createClient } from "@/lib/supabase/server";
import DocumentTable from "@/components/admin/DocumentTable";

export default async function DocumentsPage() {
  const supabase = await createClient();

  const { data: documents } = await supabase
    .from("documents")
    .select("*")
    .order("uploaded_at", { ascending: false });

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
      <DocumentTable documents={documents || []} />
    </div>
  );
}
