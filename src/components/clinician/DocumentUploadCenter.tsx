"use client";

import { useState } from "react";
import { CheckCircle, Loader2, AlertCircle, FileText, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIntakeStore } from "@/stores/intakeStore";
import ResumeUpload from "./ResumeUpload";
import CaqhUpload from "./CaqhUpload";
import FileUpload from "@/components/shared/FileUpload";

type ParseStatus = "idle" | "parsing" | "success" | "error";

export default function DocumentUploadCenter() {
  const store = useIntakeStore();

  const [licenseStatus, setLicenseStatus] = useState<ParseStatus>("idle");
  const [licenseError, setLicenseError] = useState("");
  const [malpracticeStatus, setMalpracticeStatus] = useState<ParseStatus>("idle");
  const [malpracticeError, setMalpracticeError] = useState("");

  async function handleLicenseUpload(file: File) {
    store.setDocument("license", { name: file.name, type: file.type, size: file.size });
    store.setDocumentFile("license", file);

    setLicenseStatus("parsing");
    setLicenseError("");

    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await fetch("/api/clinician/parse-license", {
        method: "POST",
        body: formData,
      });
      const result = await response.json();

      if (!response.ok) {
        setLicenseStatus("error");
        setLicenseError(result.error || "Failed to parse license");
        return;
      }

      store.updateLicense(result.data);
      setLicenseStatus("success");
    } catch {
      setLicenseStatus("error");
      setLicenseError("Network error. Document saved but parsing failed.");
    }
  }

  async function handleMalpracticeUpload(file: File) {
    store.setDocument("malpractice", { name: file.name, type: file.type, size: file.size });
    store.setDocumentFile("malpractice", file);

    setMalpracticeStatus("parsing");
    setMalpracticeError("");

    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await fetch("/api/clinician/parse-malpractice-cert", {
        method: "POST",
        body: formData,
      });
      const result = await response.json();

      if (!response.ok) {
        setMalpracticeStatus("error");
        setMalpracticeError(result.error || "Failed to parse certificate");
        return;
      }

      store.updateMalpractice(result.data);
      setMalpracticeStatus("success");
    } catch {
      setMalpracticeStatus("error");
      setMalpracticeError("Network error. Document saved but parsing failed.");
    }
  }

  function handlePhotoIdUpload(file: File) {
    store.setDocument("photoId", { name: file.name, type: file.type, size: file.size });
    store.setDocumentFile("photoId", file);
  }

  function handleResumeFileSelected(file: File) {
    store.setDocument("cv", { name: file.name, type: file.type, size: file.size });
    store.setDocumentFile("cv", file);
  }

  function handleContinue() {
    store.setHasCompletedDocumentUpload(true);
  }

  const hasAnyDocument =
    store.documents.license !== null ||
    store.documents.malpractice !== null ||
    store.documents.photoId !== null ||
    store.isResumeParsed;

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-slate-900">
          Upload Your Documents
        </h1>
        <p className="text-slate-500 mt-2 max-w-lg mx-auto">
          Upload your documents and we&apos;ll automatically fill out the form for you.
          The more you upload, the less you type.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <p className="text-sm font-medium text-slate-700 mb-2">Resume / CV</p>
          <ResumeUpload onFileSelected={handleResumeFileSelected} />
        </div>
        <div>
          <p className="text-sm font-medium text-slate-700 mb-2">CAQH Profile</p>
          <CaqhUpload />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* License Upload with parsing */}
        <div>
          {licenseStatus === "parsing" ? (
            <div>
              <p className="text-sm font-medium text-slate-700 mb-2">State License</p>
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 text-center">
                <Loader2 className="w-6 h-6 text-blue-500 mx-auto mb-2 animate-spin" />
                <p className="text-sm font-medium text-blue-800">Analyzing license...</p>
              </div>
            </div>
          ) : licenseStatus === "success" ? (
            <div>
              <p className="text-sm font-medium text-slate-700 mb-2">State License</p>
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-emerald-800">License parsed</p>
                  <p className="text-xs text-emerald-600">{store.documents.license?.name}</p>
                </div>
              </div>
            </div>
          ) : licenseStatus === "error" ? (
            <div>
              <p className="text-sm font-medium text-slate-700 mb-2">State License</p>
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-amber-800">Saved, but couldn&apos;t parse</p>
                  <p className="text-xs text-amber-600">{licenseError}</p>
                </div>
              </div>
            </div>
          ) : (
            <FileUpload
              label="State License"
              onFileSelect={handleLicenseUpload}
              onRemove={() => { store.setDocument("license", null); store.setDocumentFile("license", null); }}
              currentFile={store.documents.license}
            />
          )}
        </div>

        {/* Malpractice Cert Upload with parsing */}
        <div>
          {malpracticeStatus === "parsing" ? (
            <div>
              <p className="text-sm font-medium text-slate-700 mb-2">Malpractice Certificate</p>
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 text-center">
                <Loader2 className="w-6 h-6 text-blue-500 mx-auto mb-2 animate-spin" />
                <p className="text-sm font-medium text-blue-800">Analyzing certificate...</p>
              </div>
            </div>
          ) : malpracticeStatus === "success" ? (
            <div>
              <p className="text-sm font-medium text-slate-700 mb-2">Malpractice Certificate</p>
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-emerald-800">Certificate parsed</p>
                  <p className="text-xs text-emerald-600">{store.documents.malpractice?.name}</p>
                </div>
              </div>
            </div>
          ) : malpracticeStatus === "error" ? (
            <div>
              <p className="text-sm font-medium text-slate-700 mb-2">Malpractice Certificate</p>
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-amber-800">Saved, but couldn&apos;t parse</p>
                  <p className="text-xs text-amber-600">{malpracticeError}</p>
                </div>
              </div>
            </div>
          ) : (
            <FileUpload
              label="Malpractice Certificate"
              onFileSelect={handleMalpracticeUpload}
              onRemove={() => { store.setDocument("malpractice", null); store.setDocumentFile("malpractice", null); }}
              currentFile={store.documents.malpractice}
            />
          )}
        </div>

        {/* Photo ID - no parsing */}
        <FileUpload
          label="Photo ID"
          onFileSelect={handlePhotoIdUpload}
          onRemove={() => { store.setDocument("photoId", null); store.setDocumentFile("photoId", null); }}
          currentFile={store.documents.photoId}
        />
      </div>

      {hasAnyDocument && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center gap-3">
          <FileText className="w-5 h-5 text-blue-500 shrink-0" />
          <p className="text-sm text-blue-800">
            Your documents have been processed. Click continue to review the pre-filled form.
          </p>
        </div>
      )}

      <div className="flex items-center justify-between pt-2">
        <button
          type="button"
          onClick={handleContinue}
          className="text-sm text-slate-400 hover:text-slate-600 underline"
        >
          Skip — I&apos;ll fill it out manually
        </button>
        <Button onClick={handleContinue} className="gap-2">
          Continue to Form
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
