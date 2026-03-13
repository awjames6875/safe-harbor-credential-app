"use client";

interface PhaseStep {
  phase: number;
  is_completed: boolean;
}

interface PhaseProgressProps {
  steps: PhaseStep[];
}

const PHASE_LABELS = ["Foundation", "Medicaid & MCOs", "Commercial", "Payment Setup"];

export default function PhaseProgress({ steps }: PhaseProgressProps) {
  const phaseStats = PHASE_LABELS.map((label, index) => {
    const phaseNumber = index + 1;
    const phaseSteps = steps.filter((s) => s.phase === phaseNumber);
    const completed = phaseSteps.filter((s) => s.is_completed).length;
    const total = phaseSteps.length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { label, completed, total, percentage };
  });

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {phaseStats.map((phase) => (
        <div key={phase.label} className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-slate-700">{phase.label}</span>
            <span className="text-xs text-slate-500">
              {phase.total > 0 ? `${phase.percentage}%` : "No steps"}
            </span>
          </div>
          <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all"
              style={{ width: `${phase.percentage}%` }}
            />
          </div>
          {phase.total > 0 && (
            <p className="text-xs text-slate-400 mt-1">
              {phase.completed}/{phase.total} steps
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
