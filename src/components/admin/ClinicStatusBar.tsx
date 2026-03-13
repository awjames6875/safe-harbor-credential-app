import ExpiryCountdown from "@/components/shared/ExpiryCountdown";

interface ClinicStatusBarProps {
  npi: string | null;
  ein: string | null;
  odmhsasLicense: string | null;
  odmhsasExpiry: string | null;
  malpracticeExpiry: string | null;
}

export default function ClinicStatusBar({
  npi,
  ein,
  odmhsasLicense,
  odmhsasExpiry,
  malpracticeExpiry,
}: ClinicStatusBarProps) {
  const items = [
    { label: "NPI (Type 2)", value: npi, expiry: null },
    { label: "EIN", value: ein, expiry: null },
    { label: "ODMHSAS", value: odmhsasLicense, expiry: odmhsasExpiry },
    { label: "Malpractice", value: "Policy", expiry: malpracticeExpiry },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {items.map((item) => (
        <div
          key={item.label}
          className="bg-white border border-slate-200 rounded-lg p-3"
        >
          <p className="text-xs text-slate-400 mb-1">{item.label}</p>
          <p className="text-sm font-mono font-medium text-slate-900 truncate">
            {item.value || "—"}
          </p>
          {item.expiry && (
            <div className="mt-1.5">
              <ExpiryCountdown date={item.expiry} />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
