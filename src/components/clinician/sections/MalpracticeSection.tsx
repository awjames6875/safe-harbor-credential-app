"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { malpracticeSchema, type MalpracticeData } from "@/lib/validations/clinician";
import { useIntakeStore } from "@/stores/intakeStore";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function MalpracticeSection() {
  const { malpractice, updateMalpractice, markSectionComplete, goNext, goBack, isResumeParsed, resetVersion } =
    useIntakeStore();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<MalpracticeData>({
    resolver: zodResolver(malpracticeSchema),
    defaultValues: {
      malpracticeCarrier: malpractice.malpracticeCarrier || "",
      malpracticePolicy: malpractice.malpracticePolicy || "",
      malpracticePerClaim: malpractice.malpracticePerClaim || "",
      malpracticeAggregate: malpractice.malpracticeAggregate || "",
      malpracticeStart: malpractice.malpracticeStart || "",
      malpracticeEnd: malpractice.malpracticeEnd || "",
    },
  });

  useEffect(() => {
    reset({
      malpracticeCarrier: malpractice.malpracticeCarrier || "",
      malpracticePolicy: malpractice.malpracticePolicy || "",
      malpracticePerClaim: malpractice.malpracticePerClaim || "",
      malpracticeAggregate: malpractice.malpracticeAggregate || "",
      malpracticeStart: malpractice.malpracticeStart || "",
      malpracticeEnd: malpractice.malpracticeEnd || "",
    });
  }, [isResumeParsed, resetVersion, malpractice, reset]);

  function onSubmit(data: MalpracticeData) {
    updateMalpractice(data);
    markSectionComplete(3);
    goNext();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">
          Malpractice Insurance
        </h2>
        <p className="text-sm text-slate-400 mt-1">
          Professional liability coverage details
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="malpracticeCarrier">
            Insurance Carrier <span className="text-red-500">*</span>
          </Label>
          <Input id="malpracticeCarrier" {...register("malpracticeCarrier")} />
          {errors.malpracticeCarrier && (
            <p className="text-xs text-red-500 mt-1">
              {errors.malpracticeCarrier.message}
            </p>
          )}
        </div>
        <div>
          <Label htmlFor="malpracticePolicy">
            Policy Number <span className="text-red-500">*</span>
          </Label>
          <Input id="malpracticePolicy" {...register("malpracticePolicy")} />
          {errors.malpracticePolicy && (
            <p className="text-xs text-red-500 mt-1">
              {errors.malpracticePolicy.message}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="malpracticePerClaim">
            Per Claim Amount <span className="text-red-500">*</span>
          </Label>
          <Input
            id="malpracticePerClaim"
            placeholder="1,000,000"
            {...register("malpracticePerClaim")}
          />
          <p className="text-xs text-slate-400 mt-1">Minimum $1,000,000</p>
          {errors.malpracticePerClaim && (
            <p className="text-xs text-red-500 mt-1">
              {errors.malpracticePerClaim.message}
            </p>
          )}
        </div>
        <div>
          <Label htmlFor="malpracticeAggregate">
            Aggregate Amount <span className="text-red-500">*</span>
          </Label>
          <Input
            id="malpracticeAggregate"
            placeholder="3,000,000"
            {...register("malpracticeAggregate")}
          />
          <p className="text-xs text-slate-400 mt-1">Minimum $3,000,000</p>
          {errors.malpracticeAggregate && (
            <p className="text-xs text-red-500 mt-1">
              {errors.malpracticeAggregate.message}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="malpracticeStart">
            Policy Start Date <span className="text-red-500">*</span>
          </Label>
          <Input id="malpracticeStart" type="date" {...register("malpracticeStart")} />
          {errors.malpracticeStart && (
            <p className="text-xs text-red-500 mt-1">
              {errors.malpracticeStart.message}
            </p>
          )}
        </div>
        <div>
          <Label htmlFor="malpracticeEnd">
            Policy End Date <span className="text-red-500">*</span>
          </Label>
          <Input id="malpracticeEnd" type="date" {...register("malpracticeEnd")} />
          {errors.malpracticeEnd && (
            <p className="text-xs text-red-500 mt-1">
              {errors.malpracticeEnd.message}
            </p>
          )}
        </div>
      </div>

      <div className="flex gap-3">
        <Button type="button" variant="outline" onClick={goBack} className="flex-1">
          Back
        </Button>
        <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700">
          Next: Work History
        </Button>
      </div>
    </form>
  );
}
