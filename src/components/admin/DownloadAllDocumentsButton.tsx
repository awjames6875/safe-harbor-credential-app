"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import JSZip from "jszip";

export default function DownloadAllDocumentsButton({
  documents,
  clinicianName,
}: {
  documents: { file_url: string; file_name: string }[];
  clinicianName: string;
}) {
  const [isDownloading, setIsDownloading] = useState(false);

  async function handleDownloadAll() {
    setIsDownloading(true);
    try {
      const zip = new JSZip();

      const filePromises = documents.map(async (doc) => {
        try {
          const response = await fetch(doc.file_url);
          const blob = await response.blob();
          zip.file(doc.file_name || `document-${Date.now()}`, blob);
        } catch {
          console.error(`Failed to fetch ${doc.file_name}`);
        }
      });

      await Promise.all(filePromises);

      const zipBlob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${clinicianName}-documents.zip`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert("Failed to download documents. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  }

  return (
    <button
      onClick={handleDownloadAll}
      disabled={isDownloading}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50"
    >
      <Download className="w-3.5 h-3.5" />
      {isDownloading ? "Downloading..." : "Download All"}
    </button>
  );
}
