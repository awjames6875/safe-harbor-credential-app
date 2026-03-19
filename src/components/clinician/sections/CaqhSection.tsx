"use client";

import { useState } from "react";
import { useIntakeStore } from "@/stores/intakeStore";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import CaqhUpload from "../CaqhUpload";

export default function CaqhSection() {
  const { caqh, updateCaqh, markSectionComplete, goNext, goBack } =
    useIntakeStore();

  const [hasCaqh, setHasCaqh] = useState(caqh.hasCaqh);
  const [caqhId, setCaqhId] = useState(caqh.caqhId);
  const [error, setError] = useState<string | null>(null);

  function handleSubmit() {
    if (hasCaqh && caqhId) {
      if (!/^\d{8}$/.test(caqhId)) {
        setError("CAQH ID must be exactly 8 digits");
        return;
      }
    }
    setError(null);
    updateCaqh({ hasCaqh, caqhId: hasCaqh ? caqhId : "" });
    markSectionComplete(6);
    goNext();
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">
          CAQH ProView
        </h2>
        <p className="text-sm text-slate-400 mt-1">
          Council for Affordable Quality Healthcare profile
        </p>
      </div>

      <div className="flex items-center gap-2">
        <Checkbox
          checked={hasCaqh}
          onCheckedChange={(checked) => {
            setHasCaqh(checked === true);
            if (!checked) {
              setCaqhId("");
              setError(null);
            }
          }}
        />
        <Label className="text-sm">I already have a CAQH ProView account</Label>
      </div>

      {hasCaqh && (
        <>
        <div>
          <Label htmlFor="caqhId">
            CAQH Provider ID <span className="text-red-500">*</span>
          </Label>
          <Input
            id="caqhId"
            inputMode="numeric"
            maxLength={8}
            placeholder="8 digits"
            className="font-mono"
            value={caqhId}
            onChange={(e) => {
              setCaqhId(e.target.value.replace(/\D/g, "").slice(0, 8));
              setError(null);
            }}
          />
          {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
        </div>

        <CaqhUpload />
        </>
      )}

      {!hasCaqh && (
        <div className="bg-sky-50 border border-sky-200 rounded-lg p-4">
          <p className="text-sm text-sky-700">
            No worries! We&apos;ll help you set up your CAQH ProView account as
            part of the credentialing process.
          </p>
        </div>
      )}

      <div className="flex gap-3">
        <Button type="button" variant="outline" onClick={goBack} className="flex-1">
          Back
        </Button>
        <Button
          type="button"
          onClick={handleSubmit}
          className="flex-1 bg-blue-600 hover:bg-blue-700"
        >
          Next: References
        </Button>
      </div>
    </div>
  );
}
