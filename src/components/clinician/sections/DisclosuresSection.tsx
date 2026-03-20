"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { disclosuresSchema, type DisclosuresData } from "@/lib/validations/clinician";
import { useIntakeStore } from "@/stores/intakeStore";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface DisclosureQuestionProps {
  label: string;
  value: boolean;
  onChange: (val: boolean) => void;
}

function DisclosureQuestion({ label, value, onChange }: DisclosureQuestionProps) {
  return (
    <div className="flex items-start justify-between gap-4 py-3 border-b border-slate-100 last:border-0">
      <p className="text-sm text-slate-700 flex-1">{label}</p>
      <div className="flex gap-2 shrink-0">
        <button
          type="button"
          onClick={() => onChange(true)}
          className={`px-3 py-1 text-sm rounded-md border transition-colors ${
            value
              ? "bg-red-50 border-red-300 text-red-700"
              : "border-slate-200 text-slate-400 hover:border-slate-300"
          }`}
        >
          Yes
        </button>
        <button
          type="button"
          onClick={() => onChange(false)}
          className={`px-3 py-1 text-sm rounded-md border transition-colors ${
            !value
              ? "bg-emerald-50 border-emerald-300 text-emerald-700"
              : "border-slate-200 text-slate-400 hover:border-slate-300"
          }`}
        >
          No
        </button>
      </div>
    </div>
  );
}

interface DisclosuresSectionProps {
  onFinalSubmit?: () => void;
}

export default function DisclosuresSection({ onFinalSubmit }: DisclosuresSectionProps) {
  const { disclosures, updateDisclosures, markSectionComplete, goBack, isResumeParsed, resetVersion } =
    useIntakeStore();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<DisclosuresData>({
    resolver: zodResolver(disclosuresSchema),
    defaultValues: {
      malpracticeClaim: disclosures.malpracticeClaim || false,
      licenseAction: disclosures.licenseAction || false,
      federalExclusion: disclosures.federalExclusion || false,
      felony: disclosures.felony || false,
      explanation: disclosures.explanation || "",
      signedName: disclosures.signedName || "",
    },
  });

  useEffect(() => {
    reset({
      malpracticeClaim: disclosures.malpracticeClaim || false,
      licenseAction: disclosures.licenseAction || false,
      federalExclusion: disclosures.federalExclusion || false,
      felony: disclosures.felony || false,
      explanation: disclosures.explanation || "",
      signedName: disclosures.signedName || "",
    });
  }, [isResumeParsed, resetVersion, disclosures, reset]);

  const values = watch();
  const hasYes =
    values.malpracticeClaim ||
    values.licenseAction ||
    values.federalExclusion ||
    values.felony;

  function onSubmit(data: DisclosuresData) {
    updateDisclosures(data);
    markSectionComplete(9);
    if (onFinalSubmit) onFinalSubmit();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">
          Disclosures & Signature
        </h2>
        <p className="text-sm text-slate-400 mt-1">
          Please answer truthfully. All answers are confidential.
        </p>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-4">
        <DisclosureQuestion
          label="Have you ever had a malpractice claim filed against you?"
          value={values.malpracticeClaim}
          onChange={(val) => setValue("malpracticeClaim", val)}
        />
        <DisclosureQuestion
          label="Has your professional license ever been subject to disciplinary action?"
          value={values.licenseAction}
          onChange={(val) => setValue("licenseAction", val)}
        />
        <DisclosureQuestion
          label="Have you ever been excluded from any federal healthcare program?"
          value={values.federalExclusion}
          onChange={(val) => setValue("federalExclusion", val)}
        />
        <DisclosureQuestion
          label="Have you ever been convicted of a felony?"
          value={values.felony}
          onChange={(val) => setValue("felony", val)}
        />
      </div>

      {hasYes && (
        <div>
          <Label htmlFor="explanation">
            Please explain any &quot;Yes&quot; answers{" "}
            <span className="text-red-500">*</span>
          </Label>
          <Textarea
            id="explanation"
            rows={4}
            {...register("explanation")}
            placeholder="Provide details for each 'Yes' answer..."
          />
          {errors.explanation && (
            <p className="text-xs text-red-500 mt-1">
              {errors.explanation.message}
            </p>
          )}
        </div>
      )}

      <div className="border-t border-slate-200 pt-4">
        <Label htmlFor="signedName">
          Digital Signature (type your full legal name){" "}
          <span className="text-red-500">*</span>
        </Label>
        <Input
          id="signedName"
          placeholder="Full legal name"
          className="font-serif italic"
          {...register("signedName")}
        />
        {errors.signedName && (
          <p className="text-xs text-red-500 mt-1">
            {errors.signedName.message}
          </p>
        )}
        <p className="text-xs text-slate-400 mt-2">
          By typing your name, you attest that all information provided is true
          and accurate to the best of your knowledge.
        </p>
      </div>

      <div className="flex gap-3">
        <Button type="button" variant="outline" onClick={goBack} className="flex-1">
          Back
        </Button>
        <Button
          type="submit"
          className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
        >
          Submit Intake Form
        </Button>
      </div>
    </form>
  );
}
