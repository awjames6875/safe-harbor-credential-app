import Link from "next/link";
import { ChangePasswordCard } from "@/components/shared/ChangePasswordCard";

export default function ClinicianSettingsPage() {
  return (
    <div className="space-y-6">
      <ChangePasswordCard />
      <Link
        href="/clinician"
        className="inline-block text-sm text-slate-500 hover:text-slate-700 underline"
      >
        &larr; Back to Intake Form
      </Link>
    </div>
  );
}
