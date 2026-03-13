"use client";

import { useRouter } from "next/navigation";
import StepCard from "@/components/admin/StepCard";

interface Phase {
  phase: number;
  label: string;
  emoji: string;
  description: string;
}

interface Step {
  id: string;
  phase: number;
  step_number: string;
  title: string;
  description: string;
  url: string | null;
  document_checklist: string[] | null;
  field_instructions: Record<string, string> | null;
  phone_script: string | null;
  common_mistakes: string | null;
  time_estimate: string | null;
  is_completed: boolean;
}

export default function StepsClient({ steps, phases }: { steps: Step[]; phases: Phase[] }) {
  const router = useRouter();

  const isPhaseUnlocked = (phaseNumber: number): boolean => {
    if (phaseNumber === 1) return true;
    const previousPhaseSteps = steps.filter((s) => s.phase === phaseNumber - 1);
    return previousPhaseSteps.length > 0 && previousPhaseSteps.every((s) => s.is_completed);
  };

  const handleComplete = async (stepId: string) => {
    const step = steps.find((s) => s.id === stepId);
    if (!step || !isPhaseUnlocked(step.phase)) return;
    await fetch(`/api/admin/steps/${stepId}`, { method: "PUT" });
    router.refresh();
  };

  return (
    <div className="space-y-8">
      {phases.map((phase) => {
        const phaseSteps = steps.filter((s) => s.phase === phase.phase);
        if (phaseSteps.length === 0) return null;

        const done = phaseSteps.filter((s) => s.is_completed).length;
        const total = phaseSteps.length;
        const isUnlocked = isPhaseUnlocked(phase.phase);

        return (
          <div key={phase.phase} className="space-y-3">
            {/* Phase label */}
            <div className="flex items-center justify-between">
              <p className="text-xs font-black uppercase tracking-widest text-teal-600">
                {phase.emoji} {phase.label}
              </p>
              <span className="text-xs font-bold text-slate-400">
                {done}/{total} complete
              </span>
            </div>
            <p className="text-sm text-slate-500 -mt-1">{phase.description}</p>

            {!isUnlocked && (
              <p className="text-xs font-semibold text-slate-400">
                Complete all Phase {phase.phase - 1} steps to unlock
              </p>
            )}

            {/* Step cards */}
            <div className={`space-y-3${!isUnlocked ? " opacity-50 pointer-events-none" : ""}`}>
              {phaseSteps.map((step) => (
                <StepCard
                  key={step.id}
                  step={step}
                  onComplete={handleComplete}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
