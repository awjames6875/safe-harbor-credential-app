"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useIntakeStore } from "@/stores/intakeStore";
import ResumeUpload from "./ResumeUpload";
import SectionProgress from "./SectionProgress";
import BasicInfoSection from "./sections/BasicInfoSection";
import NpiSection from "./sections/NpiSection";
import LicenseSection from "./sections/LicenseSection";
import MalpracticeSection from "./sections/MalpracticeSection";
import WorkHistorySection from "./sections/WorkHistorySection";
import EducationSection from "./sections/EducationSection";
import CaqhSection from "./sections/CaqhSection";
import ReferencesSection from "./sections/ReferencesSection";
import DocumentsSection from "./sections/DocumentsSection";
import DisclosuresSection from "./sections/DisclosuresSection";

const SECTIONS = [
  BasicInfoSection,
  NpiSection,
  LicenseSection,
  MalpracticeSection,
  WorkHistorySection,
  EducationSection,
  CaqhSection,
  ReferencesSection,
  DocumentsSection,
  DisclosuresSection,
];

export default function IntakeForm() {
  const router = useRouter();
  const store = useIntakeStore();
  const { currentSection, completedSections } = store;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  async function uploadDocumentFiles(): Promise<Record<string, string>> {
    const urls: Record<string, string> = {};
    const entries = Object.entries(store.documentFiles) as [string, File | null][];

    for (const [docType, file] of entries) {
      if (!file) continue;
      const formData = new FormData();
      formData.append("file", file);
      formData.append("docType", docType);

      const res = await fetch("/api/clinician/upload-document", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        console.error(`Failed to upload ${docType} document — storage may not be configured`);
        continue;
      }

      const result = await res.json();
      urls[docType] = result.url;
    }
    return urls;
  }

  async function handleFinalSubmit() {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Upload document files first
      const documentUrls = await uploadDocumentFiles();

      // Read latest state directly — the hook reference may be stale
      // since DisclosuresSection updates the store then calls this synchronously
      const latest = useIntakeStore.getState();

      const response = await fetch("/api/clinician/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          basicInfo: latest.basicInfo,
          npi: latest.npi,
          license: latest.license,
          malpractice: latest.malpractice,
          workHistory: latest.workHistory,
          education: latest.education,
          caqh: latest.caqh,
          references: latest.references,
          documents: latest.documents,
          documentUrls,
          disclosures: latest.disclosures,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setSubmitError(result.error || "Submission failed. Please try again.");
        setIsSubmitting(false);
        return;
      }

      store.reset();
      router.push(`/clinician/success?id=${result.clinicianId}&pdf=${result.pdfFileName}`);
    } catch {
      setSubmitError("Network error. Please try again.");
      setIsSubmitting(false);
    }
  }

  const CurrentSectionComponent = SECTIONS[currentSection];

  if (isSubmitting) {
    return (
      <div className="text-center py-16">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-lg font-medium text-slate-700">Submitting your intake form...</p>
        <p className="text-sm text-slate-400 mt-1">This may take a moment</p>
      </div>
    );
  }

  return (
    <div>
      {currentSection === 0 && <ResumeUpload />}
      <SectionProgress
        currentSection={currentSection}
        completedSections={completedSections}
      />
      <div className="flex items-center justify-between mt-2 mb-1">
        <p className="text-xs text-slate-400">
          Your progress is automatically saved
        </p>
        <button
          type="button"
          className="text-xs text-slate-400 hover:text-red-500 underline"
          onClick={() => {
            if (window.confirm("Clear all form data and start over?")) {
              store.reset();
            }
          }}
        >
          Start Over
        </button>
      </div>

      {submitError && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
          <p className="text-sm text-red-700">{submitError}</p>
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
        {currentSection === SECTIONS.length - 1 ? (
          <DisclosuresSection onFinalSubmit={handleFinalSubmit} />
        ) : (
          <CurrentSectionComponent />
        )}
      </div>
    </div>
  );
}
