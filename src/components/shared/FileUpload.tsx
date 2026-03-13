"use client";

import { useRef, useState, type DragEvent } from "react";
import { Upload, X, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

const ACCEPTED_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];
const MAX_SIZE_MB = 10;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

interface FileUploadProps {
  label: string;
  accept?: string;
  onFileSelect: (file: File) => void;
  onRemove?: () => void;
  currentFile?: { name: string } | null;
  error?: string;
}

export default function FileUpload({
  label,
  accept = ".pdf,.jpg,.jpeg,.png,.doc,.docx",
  onFileSelect,
  onRemove,
  currentFile,
  error,
}: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);

  function validateFile(file: File): boolean {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setFileError("Invalid file type. Please upload PDF, JPG, PNG, or Word.");
      return false;
    }
    if (file.size > MAX_SIZE_BYTES) {
      setFileError(`File too large. Maximum size is ${MAX_SIZE_MB}MB.`);
      return false;
    }
    setFileError(null);
    return true;
  }

  function handleFileChange(files: FileList | null) {
    if (!files || files.length === 0) return;
    const file = files[0];
    if (validateFile(file)) {
      onFileSelect(file);
    }
  }

  function handleDragOver(e: DragEvent) {
    e.preventDefault();
    setIsDragging(true);
  }

  function handleDragLeave(e: DragEvent) {
    e.preventDefault();
    setIsDragging(false);
  }

  function handleDrop(e: DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    handleFileChange(e.dataTransfer.files);
  }

  const displayError = error || fileError;

  if (currentFile) {
    return (
      <div className="border border-emerald-200 bg-emerald-50 rounded-xl p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FileText className="w-5 h-5 text-emerald-600" />
          <div>
            <p className="text-sm font-medium text-slate-900">{label}</p>
            <p className="text-xs text-emerald-600">{currentFile.name}</p>
          </div>
        </div>
        {onRemove && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onRemove}
            className="text-slate-400 hover:text-red-500"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>
    );
  }

  return (
    <div>
      <p className="text-sm font-medium text-slate-700 mb-2">{label}</p>
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
          isDragging
            ? "border-blue-500 bg-blue-50"
            : displayError
            ? "border-red-300 bg-red-50"
            : "border-slate-200 hover:border-slate-300"
        }`}
      >
        <Upload
          className={`w-6 h-6 mx-auto mb-2 ${
            isDragging ? "text-blue-500" : "text-slate-400"
          }`}
        />
        <p className="text-sm text-slate-500">
          Drop file here or <span className="text-blue-600">browse</span>
        </p>
        <p className="text-xs text-slate-400 mt-1">
          PDF, JPG, PNG, or Word. Max {MAX_SIZE_MB}MB
        </p>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={(e) => handleFileChange(e.target.files)}
        className="hidden"
      />
      {displayError && (
        <p className="text-xs text-red-500 mt-1">{displayError}</p>
      )}
    </div>
  );
}
