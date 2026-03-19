"use client";

import { useRef, useState, type DragEvent } from "react";
import { Upload, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { useIntakeStore } from "@/stores/intakeStore";

type UploadState = "idle" | "dragging" | "parsing" | "success" | "error";

export default function CaqhUpload() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [state, setState] = useState<UploadState>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [fieldsCount, setFieldsCount] = useState(0);
  const { prefillFromResume } = useIntakeStore();

  async function handleFile(file: File) {
    setState("parsing");
    setErrorMessage("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/clinician/parse-caqh", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        setState("error");
        setErrorMessage(result.error || "Failed to parse CAQH profile");
        return;
      }

      const data = result.data;
      prefillFromResume(data);

      // Count non-null fields for the success message
      let count = 0;
      if (data.firstName) count++;
      if (data.lastName) count++;
      if (data.email) count++;
      if (data.phone) count++;
      if (data.address) count++;
      if (data.npiNumber) count++;
      if (data.caqhId) count++;
      if (data.education?.length) count += data.education.length;
      if (data.workHistory?.length) count += data.workHistory.length;
      if (data.licenses?.length) count += data.licenses.length;
      if (data.references?.length) count += data.references.length;
      if (data.malpractice?.carrier) count++;
      setFieldsCount(count);

      setState("success");
    } catch {
      setState("error");
      setErrorMessage("Network error. Please try again.");
    }
  }

  function handleFileInput(files: FileList | null) {
    if (!files || files.length === 0) return;
    handleFile(files[0]);
  }

  function handleDragOver(e: DragEvent) {
    e.preventDefault();
    if (state !== "parsing") setState("dragging");
  }

  function handleDragLeave(e: DragEvent) {
    e.preventDefault();
    if (state === "dragging") setState("idle");
  }

  function handleDrop(e: DragEvent) {
    e.preventDefault();
    if (state === "parsing") return;
    const files = e.dataTransfer.files;
    if (files.length > 0) handleFile(files[0]);
  }

  if (state === "success") {
    return (
      <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mt-4">
        <div className="flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
          <div>
            <p className="font-medium text-emerald-800 text-sm">
              CAQH profile parsed! {fieldsCount} fields pre-filled across all sections
            </p>
            <p className="text-xs text-emerald-600 mt-1">
              Review each section to verify the extracted data.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (state === "error") {
    return (
      <div className="mt-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
            <div>
              <p className="font-medium text-red-800 text-sm">{errorMessage}</p>
              <button
                onClick={() => setState("idle")}
                className="text-xs text-red-600 underline mt-1"
              >
                Try again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (state === "parsing") {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-4 text-center">
        <Loader2 className="w-6 h-6 text-blue-500 mx-auto mb-2 animate-spin" />
        <p className="font-medium text-blue-800 text-sm">Analyzing your CAQH profile...</p>
        <p className="text-xs text-blue-600 mt-1">This may take a few seconds</p>
      </div>
    );
  }

  return (
    <div className="mt-4">
      <p className="text-sm text-slate-500 mb-2">
        Have your CAQH ProView PDF? Upload it to auto-fill the rest of the form.
      </p>
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
          state === "dragging"
            ? "border-blue-500 bg-blue-50"
            : "border-slate-200 hover:border-slate-300"
        }`}
      >
        <Upload
          className={`w-6 h-6 mx-auto mb-2 ${
            state === "dragging" ? "text-blue-500" : "text-slate-400"
          }`}
        />
        <p className="text-sm font-medium text-slate-700">
          Upload your CAQH ProView PDF
        </p>
        <p className="text-xs text-slate-400 mt-1">PDF or Word, max 10MB</p>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.doc,.docx"
        onChange={(e) => handleFileInput(e.target.files)}
        className="hidden"
      />
    </div>
  );
}
