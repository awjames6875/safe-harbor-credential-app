"use client";

import { useIntakeStore } from "@/stores/intakeStore";
import { Button } from "@/components/ui/button";
import FileUpload from "@/components/shared/FileUpload";

export default function DocumentsSection() {
  const { documents, setDocument, setDocumentFile, markSectionComplete, goNext, goBack } =
    useIntakeStore();

  const hasRequired =
    documents.license !== null &&
    documents.malpractice !== null &&
    documents.photoId !== null;

  function handleSubmit() {
    if (!hasRequired) return;
    markSectionComplete(9);
    goNext();
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">
          Document Uploads
        </h2>
        <p className="text-sm text-slate-400 mt-1">
          Upload required credentialing documents
        </p>
      </div>

      <FileUpload
        label="State License (required)"
        onFileSelect={(file) => {
          setDocument("license", { name: file.name, type: file.type, size: file.size });
          setDocumentFile("license", file);
        }}
        onRemove={() => { setDocument("license", null); setDocumentFile("license", null); }}
        currentFile={documents.license}
        error={!documents.license ? undefined : undefined}
      />

      <FileUpload
        label="Malpractice Certificate (required)"
        onFileSelect={(file) => {
          setDocument("malpractice", { name: file.name, type: file.type, size: file.size });
          setDocumentFile("malpractice", file);
        }}
        onRemove={() => { setDocument("malpractice", null); setDocumentFile("malpractice", null); }}
        currentFile={documents.malpractice}
      />

      <FileUpload
        label="Photo ID (required)"
        onFileSelect={(file) => {
          setDocument("photoId", { name: file.name, type: file.type, size: file.size });
          setDocumentFile("photoId", file);
        }}
        onRemove={() => { setDocument("photoId", null); setDocumentFile("photoId", null); }}
        currentFile={documents.photoId}
      />

      <FileUpload
        label="CV / Resume (optional)"
        onFileSelect={(file) => {
          setDocument("cv", { name: file.name, type: file.type, size: file.size });
          setDocumentFile("cv", file);
        }}
        onRemove={() => { setDocument("cv", null); setDocumentFile("cv", null); }}
        currentFile={documents.cv}
      />

      {!hasRequired && (
        <p className="text-xs text-amber-600">
          Please upload all 3 required documents to continue.
        </p>
      )}

      <div className="flex gap-3">
        <Button type="button" variant="outline" onClick={goBack} className="flex-1">
          Back
        </Button>
        <Button
          type="button"
          onClick={handleSubmit}
          disabled={!hasRequired}
          className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
        >
          Next: Disclosures
        </Button>
      </div>
    </div>
  );
}
