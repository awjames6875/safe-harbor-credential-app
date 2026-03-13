import { createClient } from "@/lib/supabase/server";
import StepsClient from "./StepsClient";

const PHASE_INFO = [
  { phase: 1, label: "Phase 1 — Foundation", emoji: "🔵", description: "NPI registration and CAQH ProView setup" },
  { phase: 2, label: "Phase 2 — Oklahoma Medicaid", emoji: "🟢", description: "SoonerCare and SoonerSelect MCO enrollment" },
  { phase: 3, label: "Phase 3 — Commercial Insurance", emoji: "🟣", description: "BCBS, UHC, Aetna, Cigna enrollment" },
  { phase: 4, label: "Phase 4 — Get Paid!", emoji: "💚", description: "EFT, ERA, test claims, and go-live" },
];

export default async function StepsPage() {
  const supabase = await createClient();

  const { data: steps } = await supabase
    .from("credentialing_steps")
    .select("*")
    .order("phase", { ascending: true })
    .order("step_number", { ascending: true });

  const allSteps = (steps ?? []).map((s) => ({
    ...s,
    document_checklist: typeof s.document_checklist === "string"
      ? JSON.parse(s.document_checklist)
      : s.document_checklist,
    field_instructions: typeof s.field_instructions === "string"
      ? JSON.parse(s.field_instructions)
      : s.field_instructions,
  }));

  const totalSteps = allSteps.length;
  const completedSteps = allSteps.filter((s) => s.is_completed).length;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Credentialing Guide
        </h1>
        <p className="text-slate-500 mt-1">
          Step-by-step walkthrough for each credentialing phase
        </p>
      </div>

      {/* Progress bar */}
      <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-bold text-slate-700">Overall Progress</span>
          <span className="text-sm font-bold text-teal-600">
            {completedSteps} of {totalSteps} steps done
          </span>
        </div>
        <div className="h-3.5 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-teal-500 to-cyan-400 rounded-full transition-all duration-700 ease-out"
            style={{ width: totalSteps > 0 ? `${(completedSteps / totalSteps) * 100}%` : "0%" }}
          />
        </div>
      </div>

      {/* Trap counter */}
      <div className="bg-amber-50 border-2 border-amber-300 rounded-xl p-4 flex items-center gap-3">
        <span className="text-3xl">⚠️</span>
        <div>
          <p className="font-bold text-amber-800 text-sm">This guide protects you from 15 known traps</p>
          <p className="text-xs text-amber-600 mt-0.5">
            Each step highlights the common mistakes that cause weeks of delays
          </p>
        </div>
      </div>

      {/* Phases + Steps */}
      <StepsClient steps={allSteps} phases={PHASE_INFO} />
    </div>
  );
}
