"use client";

import { useRef, useState, type DragEvent } from "react";
import { Upload, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { useIntakeStore } from "@/stores/intakeStore";

type UploadState = "idle" | "dragging" | "parsing" | "success" | "error";

export default function ResumeUpload() {
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

      const response = await fetch("/api/clinician/parse-resume", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        setState("error");
        setErrorMessage(result.error || "Failed to parse resume");
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
      if (data.education?.length) count += data.education.length;
      if (data.workHistory?.length) count += data.workHistory.length;
      if (data.licenses?.length) count += data.licenses.length;
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
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6">
        <div className="flex items-center gap-3">
          <CheckCircle className="w-6 h-6 text-emerald-500 shrink-0" />
          <div>
            <p className="font-medium text-emerald-800">
              Resume parsed! {fieldsCount} fields pre-filled
            </p>
            <p className="text-sm text-emerald-600 mt-1">
              Review each section below to verify the extracted data.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (state === "error") {
    return (
      <div>
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-6 h-6 text-red-500 shrink-0" />
            <div>
              <p className="font-medium text-red-800">{errorMessage}</p>
              <button
                onClick={() => setState("idle")}
                className="text-sm text-red-600 underline mt-1"
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
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-8 text-center">
        <Loader2 className="w-8 h-8 text-blue-500 mx-auto mb-3 animate-spin" />
        <p className="font-medium text-blue-800">Analyzing your resume...</p>
        <p className="text-sm text-blue-600 mt-1">
          This may take a few seconds
        </p>
      </div>
    );
  }

  return (
    <div>
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
          state === "dragging"
            ? "border-blue-500 bg-blue-50"
            : "border-slate-200 hover:border-slate-300"
        }`}
      >
        <Upload
          className={`w-8 h-8 mx-auto mb-3 ${
            state === "dragging" ? "text-blue-500" : "text-slate-400"
          }`}
        />
        <p className="font-medium text-slate-700">
          Upload your resume to auto-fill the form
        </p>
        <p className="text-sm text-slate-400 mt-1">
          PDF or Word, max 10MB
        </p>
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
