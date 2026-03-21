"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Upload, Download, Trash2, Edit2, Check, X } from "lucide-react";

interface Document {
  id: string;
  owner_type: string;
  owner_id: string | null;
  document_type: string;
  file_name: string;
  file_url: string;
  file_size: number | null;
  expiry_date: string | null;
  notes: string | null;
  uploaded_by: string | null;
  uploaded_at: string;
}

export default function DocumentTable({ documents, clinicianNames = {} }: { documents: Document[]; clinicianNames?: Record<string, string> }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"clinician" | "organization">("clinician");
  const [showUpload, setShowUpload] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editExpiry, setEditExpiry] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploadForm, setUploadForm] = useState({
    ownerType: "organization" as string,
    documentType: "",
    expiryDate: "",
    notes: "",
  });

  const filtered = documents.filter((d) =>
    activeTab === "clinician" ? d.owner_type === "clinician" : d.owner_type === "organization"
  );

  async function handleUpload(file: File) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("ownerType", uploadForm.ownerType);
    formData.append("documentType", uploadForm.documentType);
    if (uploadForm.expiryDate) formData.append("expiryDate", uploadForm.expiryDate);
    if (uploadForm.notes) formData.append("notes", uploadForm.notes);

    await fetch("/api/admin/documents", { method: "POST", body: formData });
    setShowUpload(false);
    setUploadForm({ ownerType: "organization", documentType: "", expiryDate: "", notes: "" });
    router.refresh();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this document?")) return;
    await fetch(`/api/admin/documents/${id}`, { method: "DELETE" });
    router.refresh();
  }

  async function handleSaveExpiry(id: string) {
    await fetch(`/api/admin/documents/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ expiry_date: editExpiry || null }),
    });
    setEditingId(null);
    router.refresh();
  }

  function formatDate(dateStr: string | null) {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString();
  }

  function formatSize(bytes: number | null) {
    if (!bytes) return "—";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  return (
    <div className="space-y-4">
      {/* Tabs and Upload button */}
      <div className="flex items-center justify-between">
        <div className="flex gap-1 bg-slate-100 rounded-lg p-1">
          <button
            onClick={() => setActiveTab("clinician")}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
              activeTab === "clinician" ? "bg-white shadow text-slate-900" : "text-slate-500"
            }`}
          >
            Clinician Docs
          </button>
          <button
            onClick={() => setActiveTab("organization")}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
              activeTab === "organization" ? "bg-white shadow text-slate-900" : "text-slate-500"
            }`}
          >
            Organization Docs
          </button>
        </div>
        <Button
          size="sm"
          onClick={() => setShowUpload(!showUpload)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Upload className="w-4 h-4 mr-1" /> Upload
        </Button>
      </div>

      {/* Upload form */}
      {showUpload && (
        <div className="border border-blue-200 bg-blue-50 rounded-xl p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-600">Owner Type</label>
              <select
                value={uploadForm.ownerType}
                onChange={(e) => setUploadForm({ ...uploadForm, ownerType: e.target.value })}
                className="w-full mt-1 rounded-lg border border-slate-200 px-3 py-2 text-sm"
              >
                <option value="organization">Organization</option>
                <option value="clinician">Clinician</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600">Document Type</label>
              <input
                value={uploadForm.documentType}
                onChange={(e) => setUploadForm({ ...uploadForm, documentType: e.target.value })}
                placeholder="e.g. Business License"
                className="w-full mt-1 rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600">Expiry Date</label>
              <input
                type="date"
                value={uploadForm.expiryDate}
                onChange={(e) => setUploadForm({ ...uploadForm, expiryDate: e.target.value })}
                className="w-full mt-1 rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600">Notes</label>
              <input
                value={uploadForm.notes}
                onChange={(e) => setUploadForm({ ...uploadForm, notes: e.target.value })}
                placeholder="Optional notes"
                className="w-full mt-1 rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
            </div>
          </div>
          <div>
            <input
              ref={fileRef}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file && uploadForm.documentType) handleUpload(file);
              }}
            />
            <Button
              size="sm"
              onClick={() => fileRef.current?.click()}
              disabled={!uploadForm.documentType}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Choose File & Upload
            </Button>
            {!uploadForm.documentType && (
              <span className="text-xs text-amber-600 ml-2">Enter a document type first</span>
            )}
          </div>
        </div>
      )}

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="text-center py-8 text-slate-400 text-sm">
          No {activeTab} documents found.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-xs text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-3">Type</th>
                {activeTab === "clinician" && <th className="py-3 px-3">Owner</th>}
                <th className="py-3 px-3">File</th>
                <th className="py-3 px-3">Size</th>
                <th className="py-3 px-3">Expiry</th>
                <th className="py-3 px-3">Uploaded</th>
                <th className="py-3 px-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((doc) => (
                <tr key={doc.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="py-3 px-3 font-medium">{doc.document_type}</td>
                  {activeTab === "clinician" && (
                    <td className="py-3 px-3 text-slate-600">
                      {doc.owner_id ? clinicianNames[doc.owner_id] || "—" : "—"}
                    </td>
                  )}
                  <td className="py-3 px-3 text-slate-600 max-w-[200px] truncate">{doc.file_name}</td>
                  <td className="py-3 px-3 text-slate-500">{formatSize(doc.file_size)}</td>
                  <td className="py-3 px-3">
                    {editingId === doc.id ? (
                      <div className="flex items-center gap-1">
                        <input
                          type="date"
                          value={editExpiry}
                          onChange={(e) => setEditExpiry(e.target.value)}
                          className="rounded border border-slate-200 px-2 py-1 text-xs"
                        />
                        <button onClick={() => handleSaveExpiry(doc.id)} className="text-emerald-600 hover:text-emerald-700">
                          <Check className="w-4 h-4" />
                        </button>
                        <button onClick={() => setEditingId(null)} className="text-slate-400 hover:text-slate-600">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <span
                        onClick={() => { setEditingId(doc.id); setEditExpiry(doc.expiry_date || ""); }}
                        className="cursor-pointer hover:text-blue-600"
                      >
                        {formatDate(doc.expiry_date)}
                        <Edit2 className="w-3 h-3 inline ml-1 text-slate-300" />
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-3 text-slate-500">{formatDate(doc.uploaded_at)}</td>
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2">
                      <a
                        href={doc.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-700"
                      >
                        <Download className="w-4 h-4" />
                      </a>
                      <button
                        onClick={() => handleDelete(doc.id)}
                        className="text-slate-400 hover:text-red-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
