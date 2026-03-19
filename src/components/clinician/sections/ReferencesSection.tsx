"use client";

import { useState, useEffect } from "react";
import { useIntakeStore } from "@/stores/intakeStore";
import type { ReferenceEntry } from "@/lib/validations/clinician";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";

const EMPTY_REF: ReferenceEntry = {
  name: "",
  title: "",
  specialty: "",
  phone: "",
  email: "",
};

export default function ReferencesSection() {
  const { references, setReferences, markSectionComplete, goNext, goBack, isResumeParsed } =
    useIntakeStore();

  const [entries, setEntries] = useState<ReferenceEntry[]>(
    references.length >= 3
      ? references
      : [{ ...EMPTY_REF }, { ...EMPTY_REF }, { ...EMPTY_REF }]
  );

  useEffect(() => {
    if (isResumeParsed && references.length >= 3) {
      setEntries(references);
    }
  }, [isResumeParsed, references]);
  const [error, setError] = useState<string | null>(null);

  function updateEntry(index: number, field: keyof ReferenceEntry, value: string) {
    const updated = [...entries];
    updated[index] = { ...updated[index], [field]: value };
    setEntries(updated);
  }

  function addEntry() {
    setEntries([...entries, { ...EMPTY_REF }]);
  }

  function removeEntry(index: number) {
    if (entries.length <= 3) return;
    setEntries(entries.filter((_, i) => i !== index));
  }

  function handleSubmit() {
    const valid = entries.filter((e) => e.name.trim() && e.phone.trim() && e.email.trim());
    if (valid.length < 3) {
      setError("At least 3 professional references with name, phone, and email are required");
      return;
    }
    setError(null);
    setReferences(valid);
    markSectionComplete(7);
    goNext();
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">
          Professional References
        </h2>
        <p className="text-sm text-slate-400 mt-1">
          CAQH requires at least 3 professional colleagues
        </p>
      </div>

      {entries.map((entry, index) => (
        <div
          key={index}
          className="border border-slate-200 rounded-xl p-4 space-y-3"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-slate-700">
              Reference {index + 1}
            </h3>
            {entries.length > 3 && (
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
              <Label>Full Name *</Label>
              <Input
                value={entry.name}
                onChange={(e) => updateEntry(index, "name", e.target.value)}
              />
            </div>
            <div>
              <Label>Title *</Label>
              <Input
                value={entry.title}
                onChange={(e) => updateEntry(index, "title", e.target.value)}
              />
            </div>
          </div>

          <div>
            <Label>Specialty</Label>
            <Input
              value={entry.specialty || ""}
              onChange={(e) => updateEntry(index, "specialty", e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label>Phone *</Label>
              <Input
                type="tel"
                value={entry.phone}
                onChange={(e) => updateEntry(index, "phone", e.target.value)}
              />
            </div>
            <div>
              <Label>Email *</Label>
              <Input
                type="email"
                value={entry.email}
                onChange={(e) => updateEntry(index, "email", e.target.value)}
              />
            </div>
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={addEntry}
        className="w-full border-2 border-dashed border-blue-200 rounded-xl p-4 text-blue-600 text-sm font-medium hover:bg-blue-50 transition-colors flex items-center justify-center gap-2"
      >
        <Plus className="w-4 h-4" /> Add another reference
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
          Next: Documents
        </Button>
      </div>
    </div>
  );
}
