"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { educationSchema, type EducationData } from "@/lib/validations/clinician";
import { useIntakeStore } from "@/stores/intakeStore";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function EducationSection() {
  const { education, updateEducation, markSectionComplete, goNext, goBack, isResumeParsed } =
    useIntakeStore();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EducationData>({
    resolver: zodResolver(educationSchema),
    defaultValues: {
      schoolName: education.schoolName || "",
      degree: education.degree || "",
      major: education.major || "",
      gradDate: education.gradDate || "",
    },
  });

  useEffect(() => {
    if (isResumeParsed) {
      reset({
        schoolName: education.schoolName || "",
        degree: education.degree || "",
        major: education.major || "",
        gradDate: education.gradDate || "",
      });
    }
  }, [isResumeParsed, education, reset]);

  function onSubmit(data: EducationData) {
    updateEducation(data);
    markSectionComplete(5);
    goNext();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">Education</h2>
        <p className="text-sm text-slate-400 mt-1">
          Highest relevant degree
        </p>
      </div>

      <div>
        <Label htmlFor="schoolName">
          School / University <span className="text-red-500">*</span>
        </Label>
        <Input id="schoolName" {...register("schoolName")} />
        {errors.schoolName && (
          <p className="text-xs text-red-500 mt-1">{errors.schoolName.message}</p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="degree">
            Degree <span className="text-red-500">*</span>
          </Label>
          <Input id="degree" placeholder="e.g., Master of Science" {...register("degree")} />
          {errors.degree && (
            <p className="text-xs text-red-500 mt-1">{errors.degree.message}</p>
          )}
        </div>
        <div>
          <Label htmlFor="major">Major / Field of Study</Label>
          <Input id="major" placeholder="e.g., Clinical Psychology" {...register("major")} />
        </div>
      </div>

      <div>
        <Label htmlFor="gradDate">
          Graduation Date <span className="text-red-500">*</span>
        </Label>
        <Input id="gradDate" type="date" {...register("gradDate")} />
        {errors.gradDate && (
          <p className="text-xs text-red-500 mt-1">{errors.gradDate.message}</p>
        )}
      </div>

      <div className="flex gap-3">
        <Button type="button" variant="outline" onClick={goBack} className="flex-1">
          Back
        </Button>
        <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700">
          Next: CAQH
        </Button>
      </div>
    </form>
  );
}
