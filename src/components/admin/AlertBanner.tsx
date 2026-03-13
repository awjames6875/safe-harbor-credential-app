"use client";

import { useState } from "react";
import { AlertTriangle, X, ChevronDown } from "lucide-react";
import type { Alert } from "@/lib/alerts";

interface AlertBannerProps {
  alerts: Alert[];
}

export default function AlertBanner({ alerts }: AlertBannerProps) {
  const [dismissed, setDismissed] = useState<Set<number>>(new Set());
  const [expanded, setExpanded] = useState(false);

  const visible = alerts.filter((_, i) => !dismissed.has(i));
  const critical = visible.filter((a) => a.type === "critical");
  const warnings = visible.filter((a) => a.type === "warning");

  if (visible.length === 0) return null;

  const shown = expanded ? visible : visible.slice(0, 3);
  const hiddenCount = visible.length - shown.length;

  return (
    <div className="space-y-2 mb-6">
      {critical.length > 0 && (
        <div className="bg-red-500 text-white rounded-lg px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full rounded-full bg-white opacity-75 animate-ping" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white" />
            </span>
            <p className="text-sm font-medium">
              {critical.length} critical alert{critical.length > 1 ? "s" : ""} require immediate action
            </p>
          </div>
        </div>
      )}

      {shown.map((alert) => {
        const isCritical = alert.type === "critical";
        const originalIndex = alerts.indexOf(alert);

        return (
          <div
            key={originalIndex}
            className={`rounded-lg px-4 py-3 flex items-start justify-between ${
              isCritical
                ? "bg-red-50 border border-red-200"
                : "bg-amber-50 border border-amber-200"
            }`}
          >
            <div className="flex items-start gap-2">
              <AlertTriangle
                className={`w-4 h-4 mt-0.5 shrink-0 ${
                  isCritical ? "text-red-500" : "text-amber-500"
                }`}
              />
              <div>
                <p
                  className={`text-sm font-medium ${
                    isCritical ? "text-red-800" : "text-amber-800"
                  }`}
                >
                  {alert.message}
                </p>
                <p
                  className={`text-xs mt-0.5 ${
                    isCritical ? "text-red-600" : "text-amber-600"
                  }`}
                >
                  {alert.actionRequired}
                </p>
              </div>
            </div>
            {!isCritical && (
              <button
                onClick={() =>
                  setDismissed((prev) => new Set(prev).add(originalIndex))
                }
                className="text-amber-400 hover:text-amber-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        );
      })}

      {hiddenCount > 0 && !expanded && (
        <button
          onClick={() => setExpanded(true)}
          className="text-sm text-slate-500 hover:text-slate-700 flex items-center gap-1"
        >
          <ChevronDown className="w-4 h-4" />+{hiddenCount} more alert
          {hiddenCount > 1 ? "s" : ""}
        </button>
      )}

      {warnings.length > 0 && critical.length === 0 && visible.length > 0 && null}
    </div>
  );
}
