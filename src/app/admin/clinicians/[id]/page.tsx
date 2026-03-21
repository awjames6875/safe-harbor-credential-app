import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import StatusBadge from "@/components/shared/StatusBadge";
import ExpiryCountdown from "@/components/shared/ExpiryCountdown";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import DeleteClinicianButton from "@/components/admin/DeleteClinicianButton";
import DownloadAllDocumentsButton from "@/components/admin/DownloadAllDocumentsButton";
import ClinicianNotes from "@/components/admin/ClinicianNotes";

export default async function ClinicianDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: clinician } = await supabase
    .from("clinicians")
    .select("*")
    .eq("id", id)
    .single();

  if (!clinician) return notFound();

  const [workResult, refsResult, disclosuresResult, payerResult, docsResult] = await Promise.all([
    supabase.from("work_history").select("*").eq("clinician_id", id).order("start_date", { ascending: false }),
    supabase.from("professional_references").select("*").eq("clinician_id", id),
    supabase.from("disclosures").select("*").eq("clinician_id", id).single(),
    supabase.from("payer_applications").select("*").eq("clinician_id", id),
    supabase.from("documents").select("*").eq("owner_id", id).eq("owner_type", "clinician"),
  ]);

  const workHistory = workResult.data ?? [];
  const references = refsResult.data ?? [];
  const disclosures = disclosuresResult.data;
  const payerApps = payerResult.data ?? [];
  const documents = docsResult.data ?? [];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Link
        href="/admin/clinicians"
        className="text-sm text-slate-500 hover:text-slate-700 flex items-center gap-1"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Clinicians
      </Link>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            {clinician.first_name} {clinician.last_name}
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <StatusBadge status={clinician.status || "intake_complete"} />
            {clinician.license_type && (
              <span className="text-sm text-slate-500">{clinician.license_type}</span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {clinician.id && (
            <a
              href={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/documents/caqh-cheatsheet-${clinician.id}.pdf`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
            >
              Download CAQH PDF
            </a>
          )}
          <DeleteClinicianButton
            clinicianId={clinician.id}
            clinicianName={`${clinician.first_name} ${clinician.last_name}`}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Contact & Personal</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500">Email</span>
              <span>{clinician.email || "—"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Phone</span>
              <span>{clinician.phone || "—"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">DOB</span>
              <span>{clinician.dob || "—"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">SSN</span>
              <span className="text-slate-400">XXX-XX-XXXX (encrypted)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Address</span>
              <span className="text-right max-w-[200px]">{clinician.home_address || "—"}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Credentials</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500">NPI</span>
              <span className="font-mono">{clinician.npi_type1 || "—"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Taxonomy</span>
              <span>{clinician.taxonomy_code || "—"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">License</span>
              <span>{clinician.license_number || "—"} ({clinician.license_state})</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">License Expiry</span>
              <ExpiryCountdown date={clinician.license_expiry} />
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">CAQH ID</span>
              <span className="font-mono">{clinician.caqh_id || "—"}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Malpractice Insurance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500">Carrier</span>
              <span>{clinician.malpractice_carrier || "—"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Policy #</span>
              <span>{clinician.malpractice_policy || "—"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Per Claim</span>
              <span>${clinician.malpractice_per_claim || "—"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Aggregate</span>
              <span>${clinician.malpractice_aggregate || "—"}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Expiry</span>
              <ExpiryCountdown date={clinician.malpractice_end} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Education</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500">School</span>
              <span>{clinician.school_name || "—"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Degree</span>
              <span>{clinician.degree || "—"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Major</span>
              <span>{clinician.major || "—"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Graduation</span>
              <span>{clinician.grad_date || "—"}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {workHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Work History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {workHistory.map((w) => (
                <div key={w.id} className="border-b border-slate-100 pb-3 last:border-0 last:pb-0">
                  <p className="font-medium text-sm">{w.employer_name}</p>
                  <p className="text-sm text-slate-500">{w.job_title}</p>
                  <p className="text-xs text-slate-400">
                    {w.start_date} — {w.is_current ? "Present" : w.end_date || "—"}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {references.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Professional References</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {references.map((r) => (
                <div key={r.id} className="text-sm">
                  <p className="font-medium">{r.name}</p>
                  <p className="text-slate-500">{r.title}</p>
                  <p className="text-slate-400 text-xs">{r.phone} | {r.email}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {disclosures && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Disclosures</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500">Malpractice Claims</span>
              <span className={disclosures.malpractice_claim ? "text-red-600 font-medium" : "text-emerald-600"}>
                {disclosures.malpractice_claim ? "Yes" : "No"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">License Actions</span>
              <span className={disclosures.license_action ? "text-red-600 font-medium" : "text-emerald-600"}>
                {disclosures.license_action ? "Yes" : "No"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Federal Exclusion</span>
              <span className={disclosures.federal_exclusion ? "text-red-600 font-medium" : "text-emerald-600"}>
                {disclosures.federal_exclusion ? "Yes" : "No"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Felony</span>
              <span className={disclosures.felony ? "text-red-600 font-medium" : "text-emerald-600"}>
                {disclosures.felony ? "Yes" : "No"}
              </span>
            </div>
            {disclosures.explanation && (
              <div className="mt-2 p-3 bg-slate-50 rounded text-slate-600">
                {disclosures.explanation}
              </div>
            )}
            <div className="flex justify-between text-xs text-slate-400 pt-2">
              <span>Signed: {disclosures.signed_name}</span>
              <span>{disclosures.signed_at ? new Date(disclosures.signed_at).toLocaleDateString() : ""}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {payerApps.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Payer Applications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {payerApps.map((app) => (
                <div key={app.id} className="flex items-center justify-between text-sm">
                  <span>{app.payer_name}</span>
                  <StatusBadge status={app.status} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    
      <ClinicianNotes clinicianId={id} />

      {documents.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Uploaded Documents</CardTitle>
            <DownloadAllDocumentsButton
              documents={documents.map((d) => ({ file_url: d.file_url, file_name: d.file_name }))}
              clinicianName={`${clinician.first_name}-${clinician.last_name}`}
            />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {documents.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between text-sm">
                  <div>
                    <p className="font-medium">{doc.document_type}</p>
                    <p className="text-xs text-slate-400">{doc.file_name}</p>
                  </div>
                  <a
                    href={doc.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline text-xs"
                  >
                    Download
                  </a>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
