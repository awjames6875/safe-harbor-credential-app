"use client";

import { useState, useEffect } from "react";
import { useIntakeStore } from "@/stores/intakeStore";
import { detectWorkGaps, type WorkHistoryEntry } from "@/lib/validations/clinician";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Trash2, AlertTriangle } from "lucide-react";

const EMPTY_ENTRY: WorkHistoryEntry = {
  employerName: "",
  employerAddress: "",
  jobTitle: "",
  supervisorName: "",
  supervisorPhone: "",
  startDate: "",
  endDate: "",
  reasonLeaving: "",
  isCurrent: false,
};

export default function WorkHistorySection() {
  const { workHistory, setWorkHistory, markSectionComplete, goNext, goBack, isResumeParsed, resetVersion } =
    useIntakeStore();

  const [entries, setEntries] = useState<WorkHistoryEntry[]>(
    workHistory.length > 0 ? workHistory : [{ ...EMPTY_ENTRY }]
  );

  useEffect(() => {
    if (isResumeParsed && workHistory.length > 0) {
      setEntries(workHistory);
    } else if (!isResumeParsed) {
      setEntries([{ ...EMPTY_ENTRY }]);
    }
  }, [isResumeParsed, resetVersion, workHistory]);
  const [error, setError] = useState<string | null>(null);

  const gaps = detectWorkGaps(entries.filter((e) => e.employerName));

  function updateEntry(index: number, field: keyof WorkHistoryEntry, value: string | boolean) {
    const updated = [...entries];
    updated[index] = { ...updated[index], [field]: value };
    if (field === "isCurrent" && value === true) {
      updated[index].endDate = "";
    }
    setEntries(updated);
  }

  function addEntry() {
    setEntries([...entries, { ...EMPTY_ENTRY }]);
  }

  function removeEntry(index: number) {
    if (entries.length <= 1) return;
    setEntries(entries.filter((_, i) => i !== index));
  }

  function handleSubmit() {
    const valid = entries.filter((e) => e.employerName.trim() && e.jobTitle.trim() && e.startDate);
    if (valid.length === 0) {
      setError("At least one work history entry is required");
      return;
    }
    setError(null);
    setWorkHistory(valid);
    markSectionComplete(4);
    goNext();
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">Work History</h2>
        <p className="text-sm text-slate-400 mt-1">
          Last 10 years of employment
        </p>
      </div>

      {entries.map((entry, index) => (
        <div
          key={index}
          className="border border-slate-200 rounded-xl p-4 space-y-3"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-slate-700">
              Position {index + 1}
            </h3>
            {entries.length > 1 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeEntry(index)}
                className="text-red-400 hover:text-red-600"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label>Employer Name *</Label>
              <Input
                value={entry.employerName}
                onChange={(e) => updateEntry(index, "employerName", e.target.value)}
              />
            </div>
            <div>
              <Label>Job Title *</Label>
              <Input
                value={entry.jobTitle}
                onChange={(e) => updateEntry(index, "jobTitle", e.target.value)}
              />
            </div>
          </div>

          <div>
            <Label>Employer Address</Label>
            <Input
              value={entry.employerAddress || ""}
              onChange={(e) => updateEntry(index, "employerAddress", e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label>Supervisor Name</Label>
              <Input
                value={entry.supervisorName || ""}
                onChange={(e) => updateEntry(index, "supervisorName", e.target.value)}
              />
            </div>
            <div>
              <Label>Supervisor Phone</Label>
              <Input
                value={entry.supervisorPhone || ""}
                onChange={(e) => updateEntry(index, "supervisorPhone", e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label>Start Date *</Label>
              <Input
                type="date"
                value={entry.startDate}
                onChange={(e) => updateEntry(index, "startDate", e.target.value)}
              />
            </div>
            <div>
              <Label>End Date</Label>
              <Input
                type="date"
                value={entry.endDate || ""}
                onChange={(e) => updateEntry(index, "endDate", e.target.value)}
                disabled={entry.isCurrent}
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              checked={entry.isCurrent}
              onCheckedChange={(checked) =>
                updateEntry(index, "isCurrent", checked === true)
              }
            />
            <Label className="text-sm">Currently employed here</Label>
          </div>

          <div>
            <Label>Reason for Leaving</Label>
            <Input
              value={entry.reasonLeaving || ""}
              onChange={(e) => updateEntry(index, "reasonLeaving", e.target.value)}
              disabled={entry.isCurrent}
            />
          </div>
        </div>
      ))}

      {/* Gap warnings */}
      {gaps.map((gap, i) => (
        <div
          key={i}
          className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-lg p-3"
        >
          <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
          <p className="text-sm text-amber-700">
            Gap detected: {gap.durationDays} days between {gap.startDate} and{" "}
            {gap.endDate}
          </p>
        </div>
      ))}

      <button
        type="button"
        onClick={addEntry}
        className="w-full border-2 border-dashed border-blue-200 rounded-xl p-4 text-blue-600 text-sm font-medium hover:bg-blue-50 transition-colors flex items-center justify-center gap-2"
      >
        <Plus className="w-4 h-4" /> Add another position
      </button>

      {error && <p className="text-xs text-red-500">{error}</p>}

      <div className="flex gap-3">
        <Button type="button" variant="outline" onClick={goBack} className="flex-1">
          Back
        </Button>
        <Button
          type="button"
          onClick={handleSubmit}
          className="flex-1 bg-blue-600 hover:bg-blue-700"
        >
          Next: Education
        </Button>
      </div>
    </div>
  );
}
