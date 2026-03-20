"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { npiSchema, TAXONOMY_CODES, type NpiData } from "@/lib/validations/clinician";
import { useIntakeStore } from "@/stores/intakeStore";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function NpiSection() {
  const { npi, updateNpi, markSectionComplete, goNext, goBack, isResumeParsed, resetVersion } =
    useIntakeStore();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<NpiData>({
    resolver: zodResolver(npiSchema),
    defaultValues: {
      npiType1: npi.npiType1 || "",
      taxonomyCode: npi.taxonomyCode || "",
    },
  });

  useEffect(() => {
    reset({
      npiType1: npi.npiType1 || "",
      taxonomyCode: npi.taxonomyCode || "",
    });
  }, [isResumeParsed, resetVersion, npi, reset]);

  function onSubmit(data: NpiData) {
    updateNpi(data);
    markSectionComplete(1);
    goNext();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">NPI Number</h2>
        <p className="text-sm text-slate-400 mt-1">
          Your individual (Type 1) National Provider Identifier
        </p>
      </div>

      <div>
        <Label htmlFor="npiType1">
          NPI (Type 1) <span className="text-red-500">*</span>
        </Label>
        <Input
          id="npiType1"
          inputMode="numeric"
          maxLength={10}
          placeholder="10 digits"
          className="font-mono"
          {...register("npiType1")}
        />
        {errors.npiType1 && (
          <p className="text-xs text-red-500 mt-1">{errors.npiType1.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="taxonomyCode">
          Taxonomy Code <span className="text-red-500">*</span>
        </Label>
        <select
          id="taxonomyCode"
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          {...register("taxonomyCode")}
        >
          <option value="">Select a taxonomy code</option>
          {TAXONOMY_CODES.map((t) => (
            <option key={t.code} value={t.code}>
              {t.code} — {t.description}
            </option>
          ))}
        </select>
        {errors.taxonomyCode && (
          <p className="text-xs text-red-500 mt-1">
            {errors.taxonomyCode.message}
          </p>
        )}
      </div>

      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={goBack}
          className="flex-1"
        >
          Back
        </Button>
        <Button
          type="submit"
          className="flex-1 bg-blue-600 hover:bg-blue-700"
        >
          Next: License
        </Button>
      </div>
    </form>
  );
}
