"use client";

import { useSearchParams } from "next/navigation";
import { CheckCircle, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Suspense } from "react";

function SuccessContent() {
  const searchParams = useSearchParams();
  const clinicianId = searchParams.get("id");
  const pdfFile = searchParams.get("pdf");

  function handleDownload() {
    if (pdfFile) {
      window.open(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/documents/${pdfFile}`,
        "_blank"
      );
    }
  }

  return (
    <div className="text-center space-y-6">
      <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-100 rounded-full">
        <CheckCircle className="w-10 h-10 text-emerald-500" />
      </div>

      <div>
        <h2 className="text-2xl font-semibold text-slate-900">
          Your information has been submitted!
        </h2>
        <p className="text-slate-500 mt-2">
          Thank you for completing the intake form.
        </p>
      </div>

      {pdfFile && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h3 className="font-semibold text-blue-900 mb-2">
            Your CAQH Cheat Sheet is ready
          </h3>
          <p className="text-sm text-blue-700 mb-4">
            Use this document when filling out your CAQH ProView profile.
            It maps all the information you provided to the correct CAQH sections.
          </p>
          <Button
            onClick={handleDownload}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Download className="w-4 h-4 mr-2" />
            Download CAQH Cheat Sheet
          </Button>
        </div>
      )}

      <div className="bg-slate-50 rounded-xl p-6 text-left">
        <h3 className="font-semibold text-slate-900 mb-4">
          What happens next?
        </h3>
        <ol className="space-y-3">
          <li className="flex gap-3">
            <span className="inline-flex items-center justify-center w-6 h-6 bg-blue-600 text-white text-sm rounded-full shrink-0">
              1
            </span>
            <p className="text-sm text-slate-600">
              Our team will review your submitted information and documents.
            </p>
          </li>
          <li className="flex gap-3">
            <span className="inline-flex items-center justify-center w-6 h-6 bg-blue-600 text-white text-sm rounded-full shrink-0">
              2
            </span>
            <p className="text-sm text-slate-600">
              We&apos;ll begin submitting your credentials to insurance payers
              on your behalf.
            </p>
          </li>
          <li className="flex gap-3">
            <span className="inline-flex items-center justify-center w-6 h-6 bg-blue-600 text-white text-sm rounded-full shrink-0">
              3
            </span>
            <p className="text-sm text-slate-600">
              You&apos;ll receive updates as each payer application progresses.
              This typically takes 60-120 days.
            </p>
          </li>
        </ol>
      </div>

      {clinicianId && (
        <p className="text-xs text-slate-400">
          Reference ID: {clinicianId}
        </p>
      )}
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<div className="text-center text-slate-400">Loading...</div>}>
      <SuccessContent />
    </Suspense>
  );
}
