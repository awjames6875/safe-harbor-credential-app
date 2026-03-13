import Link from "next/link";
import StatusBadge from "@/components/shared/StatusBadge";
import ExpiryCountdown from "@/components/shared/ExpiryCountdown";

interface ClinicianCardProps {
  id: string;
  firstName: string;
  lastName: string;
  licenseType: string | null;
  npi: string | null;
  caqhId: string | null;
  status: string;
  licenseExpiry: string | null;
  payerCount: number;
  payerApproved: number;
}

export default function ClinicianCard({
  id,
  firstName,
  lastName,
  licenseType,
  npi,
  caqhId,
  status,
  licenseExpiry,
  payerCount,
  payerApproved,
}: ClinicianCardProps) {
  const progressPercent = payerCount > 0 ? (payerApproved / payerCount) * 100 : 0;

  return (
    <Link href={`/admin/clinicians/${id}`}>
      <div className="bg-white border border-slate-200 rounded-xl p-5 hover:shadow-md transition-shadow cursor-pointer">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div
              className={`w-3 h-3 rounded-full ${
                status === "Active" || status === "Approved"
                  ? "bg-emerald-500"
                  : status === "intake_complete"
                  ? "bg-blue-500"
                  : "bg-amber-500"
              }`}
            />
            <h3 className="font-semibold text-lg text-slate-900">
              {firstName} {lastName}
            </h3>
          </div>
          <StatusBadge status={status} />
        </div>

        <div className="space-y-1.5 mb-4">
          {licenseType && (
            <p className="text-sm text-slate-600">
              <span className="inline-block bg-slate-100 text-slate-700 text-xs font-medium px-2 py-0.5 rounded mr-2">
                {licenseType}
              </span>
              <ExpiryCountdown date={licenseExpiry} />
            </p>
          )}
          {npi && (
            <p className="text-sm text-slate-500">
              NPI: <span className="font-mono">{npi}</span>
            </p>
          )}
          {caqhId && (
            <p className="text-sm text-slate-500">
              CAQH: <span className="font-mono">{caqhId}</span>
            </p>
          )}
        </div>

        <div>
          <div className="flex justify-between text-xs text-slate-400 mb-1">
            <span>Credentialing</span>
            <span>
              {payerApproved} of {payerCount} payers
            </span>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>
    </Link>
  );
}
