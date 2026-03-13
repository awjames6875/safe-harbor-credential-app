"use client";

import { Check } from "lucide-react";
import { SECTION_LABELS, TOTAL_SECTIONS } from "@/lib/validations/clinician";

interface SectionProgressProps {
  currentSection: number;
  completedSections: Set<number>;
}

export default function SectionProgress({
  currentSection,
  completedSections,
}: SectionProgressProps) {
  const completedCount = completedSections.size;

  return (
    <div className="mb-8">
      {/* Progress circles */}
      <div className="flex items-center justify-between overflow-x-auto pb-2">
        {SECTION_LABELS.map((label, index) => {
          const isCompleted = completedSections.has(index);
          const isCurrent = index === currentSection;

          return (
            <div key={label} className="flex items-center">
              <div className="flex flex-col items-center min-w-[40px]">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                    isCompleted
                      ? "bg-emerald-500 text-white"
                      : isCurrent
                      ? "border-2 border-blue-600 text-blue-600"
                      : "border-2 border-slate-200 text-slate-400"
                  }`}
                >
                  {isCompleted ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    index + 1
                  )}
                </div>
                <span
                  className={`text-[10px] mt-1 text-center leading-tight ${
                    isCurrent
                      ? "text-blue-600 font-medium"
                      : isCompleted
                      ? "text-emerald-600"
                      : "text-slate-400"
                  }`}
                >
                  {label}
                </span>
              </div>
              {/* Connector line */}
              {index < TOTAL_SECTIONS - 1 && (
                <div
                  className={`h-0.5 w-4 mx-0.5 ${
                    isCompleted ? "bg-emerald-500" : "bg-slate-200"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Overall progress bar */}
      <div className="mt-3">
        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-500 rounded-full transition-all duration-300"
            style={{
              width: `${(completedCount / TOTAL_SECTIONS) * 100}%`,
            }}
          />
        </div>
        <p className="text-xs text-slate-400 mt-1 text-center">
          {completedCount} of {TOTAL_SECTIONS} sections complete
        </p>
      </div>
    </div>
  );
}
