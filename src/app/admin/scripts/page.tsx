import { createClient } from "@/lib/supabase/server";
import CopyButton from "@/components/admin/CopyButton";

const PHASE_LABELS: Record<number, string> = {
  1: "Foundation",
  2: "Medicaid & MCOs",
  3: "Commercial Insurance",
  4: "Payment Setup",
};

interface ScriptStep {
  phase: number;
  step_number: number;
  title: string;
  phone_script: string;
}

export default async function ScriptsPage() {
  const supabase = await createClient();

  const { data: steps } = await supabase
    .from("credentialing_steps")
    .select("phase, step_number, title, phone_script")
    .not("phone_script", "is", null)
    .order("phase", { ascending: true })
    .order("step_number", { ascending: true });

  const scriptSteps = (steps ?? []) as ScriptStep[];

  // Group by phase
  const grouped = scriptSteps.reduce<Record<number, ScriptStep[]>>(
    (acc, step) => {
      if (!acc[step.phase]) acc[step.phase] = [];
      acc[step.phase].push(step);
      return acc;
    },
    {}
  );

  const phases = Object.keys(grouped)
    .map(Number)
    .sort((a, b) => a - b);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">
          Phone Script Library
        </h1>
        <p className="text-slate-500 mt-1">
          Ready-to-use phone scripts for each credentialing step
        </p>
      </div>

      {phases.length === 0 && (
        <div className="bg-white rounded-xl p-8 shadow-sm border border-slate-100 text-center text-slate-500">
          No phone scripts found.
        </div>
      )}

      {phases.map((phase) => (
        <section key={phase} className="space-y-4">
          <h2 className="text-lg font-bold text-slate-800">
            Phase {phase} &mdash; {PHASE_LABELS[phase] ?? `Phase ${phase}`}
          </h2>

          {grouped[phase].map((step) => (
            <div
              key={`${step.phase}-${step.step_number}`}
              className="bg-white rounded-xl shadow-sm border border-slate-100 p-5 space-y-3"
            >
              <div className="flex items-start justify-between gap-4">
                <h3 className="text-sm font-semibold text-slate-900">
                  Step {step.phase}.{step.step_number} &mdash; {step.title}
                </h3>
                <CopyButton text={step.phone_script} />
              </div>
              <pre className="text-sm text-slate-700 whitespace-pre-wrap bg-slate-50 rounded-lg p-4 border border-slate-100 leading-relaxed">
                {step.phone_script}
              </pre>
            </div>
          ))}
        </section>
      ))}
    </div>
  );
}
