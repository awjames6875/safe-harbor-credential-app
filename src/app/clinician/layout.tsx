export default function ClinicianLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-10 h-10 bg-blue-600 rounded-lg mb-3">
            <span className="text-white font-bold text-sm">SH</span>
          </div>
          <h1 className="text-2xl font-semibold text-slate-900">
            Safe Harbor Behavioral Health
          </h1>
          <p className="text-slate-500 mt-1">Clinician Intake Form</p>
          <a
            href="/clinician/settings"
            className="text-xs text-slate-400 hover:text-teal-600 underline mt-1 inline-block"
          >
            Change Password
          </a>
        </div>
        {children}
      </div>
    </div>
  );
}
