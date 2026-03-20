"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { basicInfoSchema, type BasicInfoData } from "@/lib/validations/clinician";
import { useIntakeStore } from "@/stores/intakeStore";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import MaskedInput from "@/components/shared/MaskedInput";

export default function BasicInfoSection() {
  const { basicInfo, updateBasicInfo, markSectionComplete, goNext, isResumeParsed, resetVersion } =
    useIntakeStore();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<BasicInfoData>({
    resolver: zodResolver(basicInfoSchema),
    defaultValues: {
      firstName: basicInfo.firstName || "",
      lastName: basicInfo.lastName || "",
      dob: basicInfo.dob || "",
      ssn: basicInfo.ssn || "",
      homeAddress: basicInfo.homeAddress || "",
      phone: basicInfo.phone || "",
      email: basicInfo.email || "",
    },
  });

  useEffect(() => {
    reset({
      firstName: basicInfo.firstName || "",
      lastName: basicInfo.lastName || "",
      dob: basicInfo.dob || "",
      ssn: basicInfo.ssn || "",
      homeAddress: basicInfo.homeAddress || "",
      phone: basicInfo.phone || "",
      email: basicInfo.email || "",
    });
  }, [isResumeParsed, resetVersion, basicInfo, reset]);

  const ssnValue = watch("ssn");

  function onSubmit(data: BasicInfoData) {
    updateBasicInfo(data);
    markSectionComplete(0);
    goNext();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">
          Basic Information
        </h2>
        <p className="text-sm text-slate-400 mt-1">
          Personal details for credentialing
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="firstName">
            First Name <span className="text-red-500">*</span>
          </Label>
          <Input id="firstName" {...register("firstName")} />
          {errors.firstName && (
            <p className="text-xs text-red-500 mt-1">{errors.firstName.message}</p>
          )}
        </div>
        <div>
          <Label htmlFor="lastName">
            Last Name <span className="text-red-500">*</span>
          </Label>
          <Input id="lastName" {...register("lastName")} />
          {errors.lastName && (
            <p className="text-xs text-red-500 mt-1">{errors.lastName.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="dob">
            Date of Birth <span className="text-red-500">*</span>
          </Label>
          <Input id="dob" type="date" {...register("dob")} />
          {errors.dob && (
            <p className="text-xs text-red-500 mt-1">{errors.dob.message}</p>
          )}
        </div>
        <div>
          <Label htmlFor="ssn">
            Social Security Number <span className="text-red-500">*</span>
          </Label>
          <MaskedInput
            value={ssnValue}
            onChange={(val) => setValue("ssn", val, { shouldValidate: true })}
          />
          {errors.ssn && (
            <p className="text-xs text-red-500 mt-1">{errors.ssn.message}</p>
          )}
        </div>
      </div>

      <div>
        <Label htmlFor="homeAddress">
          Home Address <span className="text-red-500">*</span>
        </Label>
        <Input id="homeAddress" {...register("homeAddress")} />
        {errors.homeAddress && (
          <p className="text-xs text-red-500 mt-1">{errors.homeAddress.message}</p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="phone">
            Phone <span className="text-red-500">*</span>
          </Label>
          <Input id="phone" type="tel" {...register("phone")} />
          {errors.phone && (
            <p className="text-xs text-red-500 mt-1">{errors.phone.message}</p>
          )}
        </div>
        <div>
          <Label htmlFor="email">
            Email <span className="text-red-500">*</span>
          </Label>
          <Input id="email" type="email" {...register("email")} />
          {errors.email && (
            <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>
          )}
        </div>
      </div>

      <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
        Next: NPI Number
      </Button>
    </form>
  );
}
