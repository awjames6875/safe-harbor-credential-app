"use client";

import { useState } from "react";
import { Check, ChevronDown, ChevronRight, Clock, Copy, ExternalLink, Phone, AlertTriangle } from "lucide-react";

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

export default function StepCard({ step, onComplete }: { step: Step; onComplete: (id: string) => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const copyScript = async () => {
    if (!step.phone_script) return;
    await navigator.clipboard.writeText(step.phone_script);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const statusBadge = step.is_completed
    ? { label: "Done!", bg: "bg-emerald-50", text: "text-emerald-700" }
    : { label: "To Do", bg: "bg-sky-50", text: "text-sky-700" };

  const circleColor = step.is_completed
    ? "bg-emerald-100 text-emerald-700"
    : "bg-sky-50 text-sky-700";

  return (
    <div
      className={`bg-white rounded-xl shadow-sm border border-slate-100 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${
        step.is_completed ? "opacity-75" : ""
      }`}
    >
      {/* Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-4 p-5 text-left cursor-pointer select-none"
      >
        {/* Step number circle */}
        <div className={`w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${circleColor}`}>
          {step.is_completed ? <Check className="w-5 h-5" /> : step.step_number}
        </div>

        {/* Title + subtitle */}
        <div className="flex-1 min-w-0">
          <p className={`font-semibold text-slate-900 ${step.is_completed ? "line-through text-slate-400" : ""}`}>
            {step.title}
          </p>
          {step.time_estimate && (
            <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
              <Clock className="w-3 h-3" /> ~{step.time_estimate}
            </p>
          )}
        </div>

        {/* Badge + chevron */}
        <span className={`text-xs font-bold px-3 py-1 rounded-full shrink-0 ${statusBadge.bg} ${statusBadge.text}`}>
          {statusBadge.label}
        </span>
        {isOpen ? (
          <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
        ) : (
          <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
        )}
      </button>

      {/* Expandable body */}
      {isOpen && (
        <div className="px-5 pb-5 border-t-2 border-dashed border-slate-100 pt-4 space-y-4">
          {/* Description */}
          <p className="text-sm text-slate-600 leading-relaxed">{step.description}</p>

          {/* URL link */}
          {step.url && (
            <a
              href={step.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-teal-600 to-cyan-500 text-white text-sm font-bold rounded-xl hover:shadow-lg hover:-translate-y-0.5 transition-all"
            >
              <ExternalLink className="w-4 h-4" />
              Open Portal
            </a>
          )}

          {/* Document checklist */}
          {step.document_checklist && step.document_checklist.length > 0 && (
            <div className="bg-sky-50 border-l-4 border-sky-500 rounded-r-lg p-4">
              <p className="text-xs font-bold text-sky-700 uppercase tracking-wider mb-2">Documents Needed</p>
              <ul className="space-y-1.5">
                {step.document_checklist.map((doc, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                    <span className="text-sky-500 mt-0.5">&#9744;</span>
                    {doc}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Field instructions */}
          {step.field_instructions && Object.keys(step.field_instructions).length > 0 && (
            <div className="bg-emerald-50 border-l-4 border-emerald-500 rounded-r-lg p-4">
              <p className="text-xs font-bold text-emerald-700 uppercase tracking-wider mb-2">Field-by-Field Guide</p>
              <div className="space-y-2">
                {Object.entries(step.field_instructions).map(([field, instruction]) => (
                  <div key={field} className="text-sm">
                    <span className="font-bold text-slate-800">{field}:</span>{" "}
                    <span className="text-slate-600">{instruction}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Phone script */}
          {step.phone_script && (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5" /> Phone Script
                </p>
                <button
                  onClick={copyScript}
                  className="flex items-center gap-1 text-xs font-bold text-teal-600 bg-teal-50 px-3 py-1.5 rounded-lg hover:bg-teal-100 transition-colors"
                >
                  {copied ? (
                    <><Check className="w-3 h-3" /> Copied!</>
                  ) : (
                    <><Copy className="w-3 h-3" /> Copy Script</>
                  )}
                </button>
              </div>
              <pre className="text-sm text-slate-600 whitespace-pre-wrap font-sans leading-relaxed">
                {step.phone_script}
              </pre>
            </div>
          )}

          {/* Common mistakes / Trap box */}
          {step.common_mistakes && (
            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
              <p className="text-xs font-bold text-red-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" /> Common Traps
              </p>
              <div className="text-sm text-red-800 leading-relaxed whitespace-pre-wrap">
                {step.common_mistakes}
              </div>
            </div>
          )}

          {/* Mark complete button */}
          {!step.is_completed && (
            <button
              onClick={() => onComplete(step.id)}
              className="w-full py-3.5 bg-gradient-to-r from-teal-600 to-cyan-500 text-white font-bold rounded-xl hover:shadow-lg hover:-translate-y-0.5 transition-all text-sm"
            >
              Mark Step {step.step_number} as Done
            </button>
          )}
        </div>
      )}
    </div>
  );
}
