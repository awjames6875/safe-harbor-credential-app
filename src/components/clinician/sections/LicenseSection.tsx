"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { licenseSchema, type LicenseData } from "@/lib/validations/clinician";
import { useIntakeStore } from "@/stores/intakeStore";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const LICENSE_TYPES = ["LPC", "LCSW", "LMFT", "LBP", "LADC", "PhD", "PsyD"];

export default function LicenseSection() {
  const { license, updateLicense, markSectionComplete, goNext, goBack, isResumeParsed } =
    useIntakeStore();

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<LicenseData>({
    resolver: zodResolver(licenseSchema),
    defaultValues: {
      licenseType: license.licenseType || "",
      licenseNumber: license.licenseNumber || "",
      licenseState: license.licenseState || "OK",
      licenseIssued: license.licenseIssued || "",
      licenseExpiry: license.licenseExpiry || "",
    },
  });

  useEffect(() => {
    if (isResumeParsed) {
      reset({
        licenseType: license.licenseType || "",
        licenseNumber: license.licenseNumber || "",
        licenseState: license.licenseState || "OK",
        licenseIssued: license.licenseIssued || "",
        licenseExpiry: license.licenseExpiry || "",
      });
    }
  }, [isResumeParsed, license, reset]);

  function onSubmit(data: LicenseData) {
    updateLicense(data);
    markSectionComplete(2);
    goNext();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">State License</h2>
        <p className="text-sm text-slate-400 mt-1">
          Your behavioral health license details
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label>
            License Type <span className="text-red-500">*</span>
          </Label>
          <Select
            defaultValue={license.licenseType || ""}
            onValueChange={(val: string | null) =>
              setValue("licenseType", val ?? "", { shouldValidate: true })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              {LICENSE_TYPES.map((t) => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.licenseType && (
            <p className="text-xs text-red-500 mt-1">
              {errors.licenseType.message}
            </p>
          )}
        </div>
        <div>
          <Label htmlFor="licenseNumber">
            License Number <span className="text-red-500">*</span>
          </Label>
          <Input id="licenseNumber" {...register("licenseNumber")} />
          {errors.licenseNumber && (
            <p className="text-xs text-red-500 mt-1">
              {errors.licenseNumber.message}
            </p>
          )}
        </div>
      </div>

      <div>
        <Label htmlFor="licenseState">
          License State <span className="text-red-500">*</span>
        </Label>
        <Input
          id="licenseState"
          maxLength={2}
          defaultValue="OK"
          {...register("licenseState")}
        />
        {errors.licenseState && (
          <p className="text-xs text-red-500 mt-1">
            {errors.licenseState.message}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="licenseIssued">
            Date Issued <span className="text-red-500">*</span>
          </Label>
          <Input id="licenseIssued" type="date" {...register("licenseIssued")} />
          {errors.licenseIssued && (
            <p className="text-xs text-red-500 mt-1">
              {errors.licenseIssued.message}
            </p>
          )}
        </div>
        <div>
          <Label htmlFor="licenseExpiry">
            Expiration Date <span className="text-red-500">*</span>
          </Label>
          <Input id="licenseExpiry" type="date" {...register("licenseExpiry")} />
          {errors.licenseExpiry && (
            <p className="text-xs text-red-500 mt-1">
              {errors.licenseExpiry.message}
            </p>
          )}
        </div>
      </div>

      <div className="flex gap-3">
        <Button type="button" variant="outline" onClick={goBack} className="flex-1">
          Back
        </Button>
        <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700">
          Next: Malpractice
        </Button>
      </div>
    </form>
  );
}
