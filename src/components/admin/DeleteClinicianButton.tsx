"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

export default function DeleteClinicianButton({
  clinicianId,
  clinicianName,
}: {
  clinicianId: string;
  clinicianName: string;
}) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${clinicianName}? This will permanently remove all their data, documents, and payer applications.`
    );
    if (!confirmed) return;

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/clinicians/${clinicianId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        alert("Failed to delete clinician. Please try again.");
        return;
      }

      router.push("/admin/clinicians");
      router.refresh();
    } catch {
      alert("Failed to delete clinician. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      className="inline-flex items-center gap-1.5 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 disabled:opacity-50"
    >
      <Trash2 className="w-4 h-4" />
      {isDeleting ? "Deleting..." : "Delete"}
    </button>
  );
}
