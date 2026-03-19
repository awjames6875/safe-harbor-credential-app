import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { encryptSSN } from "@/lib/encryption";
import { generateCaqhCheatSheet } from "@/lib/caqhPdfGenerator";
import { sendSubmissionNotification } from "@/lib/email";

interface SubmissionData {
  basicInfo: {
    firstName: string;
    lastName: string;
    dob: string;
    ssn: string;
    homeAddress: string;
    phone: string;
    email: string;
  };
  npi: { npiType1: string; taxonomyCode: string };
  license: {
    licenseType: string;
    licenseNumber: string;
    licenseState: string;
    licenseIssued: string;
    licenseExpiry: string;
  };
  malpractice: {
    malpracticeCarrier: string;
    malpracticePolicy: string;
    malpracticePerClaim: string;
    malpracticeAggregate: string;
    malpracticeStart: string;
    malpracticeEnd: string;
  };
  workHistory: {
    employerName: string;
    employerAddress?: string;
    jobTitle: string;
    supervisorName?: string;
    supervisorPhone?: string;
    startDate: string;
    endDate?: string;
    reasonLeaving?: string;
    isCurrent: boolean;
  }[];
  education: {
    schoolName: string;
    degree: string;
    major?: string;
    gradDate: string;
  };
  caqh: { hasCaqh: boolean; caqhId: string };
  references: {
    name: string;
    title: string;
    specialty?: string;
    phone: string;
    email: string;
  }[];
  documents?: Record<string, { name: string; type: string; size: number } | null>;
  disclosures: {
    malpracticeClaim: boolean;
    licenseAction: boolean;
    federalExclusion: boolean;
    felony: boolean;
    explanation?: string;
    signedName: string;
  };
  documentUrls?: Record<string, string>;
}

export async function POST(request: NextRequest) {
  try {
    const data: SubmissionData = await request.json();

    // Basic validation
    if (!data.basicInfo?.firstName || !data.basicInfo?.lastName) {
      return NextResponse.json(
        { error: "First and last name are required" },
        { status: 400 }
      );
    }
    if (!data.disclosures?.signedName) {
      return NextResponse.json(
        { error: "Digital signature is required" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Encrypt SSN
    const ssnEncrypted = data.basicInfo.ssn
      ? encryptSSN(data.basicInfo.ssn)
      : null;

    // Insert clinician
    const { data: clinician, error: clinicianError } = await supabase
      .from("clinicians")
      .insert({
        first_name: data.basicInfo.firstName,
        last_name: data.basicInfo.lastName,
        email: data.basicInfo.email,
        phone: data.basicInfo.phone,
        dob: data.basicInfo.dob || null,
        ssn_encrypted: ssnEncrypted,
        home_address: data.basicInfo.homeAddress,
        npi_type1: data.npi.npiType1,
        taxonomy_code: data.npi.taxonomyCode,
        license_type: data.license.licenseType,
        license_number: data.license.licenseNumber,
        license_state: data.license.licenseState,
        license_issued: data.license.licenseIssued || null,
        license_expiry: data.license.licenseExpiry || null,
        malpractice_carrier: data.malpractice.malpracticeCarrier,
        malpractice_policy: data.malpractice.malpracticePolicy,
        malpractice_per_claim: data.malpractice.malpracticePerClaim,
        malpractice_aggregate: data.malpractice.malpracticeAggregate,
        malpractice_start: data.malpractice.malpracticeStart || null,
        malpractice_end: data.malpractice.malpracticeEnd || null,
        caqh_id: data.caqh.caqhId || null,
        school_name: data.education.schoolName,
        degree: data.education.degree,
        major: data.education.major || null,
        grad_date: data.education.gradDate || null,
        portal_submitted: true,
        portal_submitted_at: new Date().toISOString(),
        intake_complete: true,
        status: "intake_complete",
      })
      .select("id")
      .single();

    if (clinicianError) {
      console.error("Clinician insert error:", clinicianError);
      return NextResponse.json(
        { error: "Failed to save clinician data" },
        { status: 500 }
      );
    }

    const clinicianId = clinician.id;

    // Insert work history
    if (data.workHistory.length > 0) {
      const workRows = data.workHistory.map((w) => ({
        clinician_id: clinicianId,
        employer_name: w.employerName,
        employer_address: w.employerAddress || null,
        job_title: w.jobTitle,
        supervisor_name: w.supervisorName || null,
        supervisor_phone: w.supervisorPhone || null,
        start_date: w.startDate || null,
        end_date: w.endDate || null,
        reason_leaving: w.reasonLeaving || null,
        is_current: w.isCurrent,
      }));
      await supabase.from("work_history").insert(workRows);
    }

    // Insert professional references
    if (data.references.length > 0) {
      const refRows = data.references.map((r) => ({
        clinician_id: clinicianId,
        name: r.name,
        title: r.title,
        specialty: r.specialty || null,
        phone: r.phone,
        email: r.email,
      }));
      await supabase.from("professional_references").insert(refRows);
    }

    // Insert disclosures
    await supabase.from("disclosures").insert({
      clinician_id: clinicianId,
      malpractice_claim: data.disclosures.malpracticeClaim,
      license_action: data.disclosures.licenseAction,
      federal_exclusion: data.disclosures.federalExclusion,
      felony: data.disclosures.felony,
      explanation: data.disclosures.explanation || null,
      signed_name: data.disclosures.signedName,
      signed_at: new Date().toISOString(),
      ip_address: request.headers.get("x-forwarded-for") || "unknown",
    });

    // Insert uploaded documents
    if (data.documentUrls && Object.keys(data.documentUrls).length > 0) {
      const docTypeLabels: Record<string, string> = {
        license: "State License",
        malpractice: "Malpractice Certificate",
        photoId: "Photo ID",
        cv: "CV/Resume",
      };
      const docRows = Object.entries(data.documentUrls).map(([docType, url]) => ({
        owner_type: "clinician",
        owner_id: clinicianId,
        document_type: docTypeLabels[docType] || docType,
        file_name: data.documents?.[docType as keyof typeof data.documents]?.name || docType,
        file_url: url,
        uploaded_by: `${data.basicInfo.firstName} ${data.basicInfo.lastName}`,
      }));
      await supabase.from("documents").insert(docRows);
    }

    // Generate CAQH cheat sheet PDF
    const pdfBuffer = generateCaqhCheatSheet({
      firstName: data.basicInfo.firstName,
      lastName: data.basicInfo.lastName,
      dob: data.basicInfo.dob,
      ssn: data.basicInfo.ssn,
      homeAddress: data.basicInfo.homeAddress,
      phone: data.basicInfo.phone,
      email: data.basicInfo.email,
      npiType1: data.npi.npiType1,
      taxonomyCode: data.npi.taxonomyCode,
      licenseType: data.license.licenseType,
      licenseNumber: data.license.licenseNumber,
      licenseState: data.license.licenseState,
      licenseIssued: data.license.licenseIssued,
      licenseExpiry: data.license.licenseExpiry,
      malpracticeCarrier: data.malpractice.malpracticeCarrier,
      malpracticePolicy: data.malpractice.malpracticePolicy,
      malpracticePerClaim: data.malpractice.malpracticePerClaim,
      malpracticeAggregate: data.malpractice.malpracticeAggregate,
      malpracticeStart: data.malpractice.malpracticeStart,
      malpracticeEnd: data.malpractice.malpracticeEnd,
      caqhId: data.caqh.caqhId,
      schoolName: data.education.schoolName,
      degree: data.education.degree,
      major: data.education.major || "",
      gradDate: data.education.gradDate,
      workHistory: data.workHistory.map((w) => ({
        employerName: w.employerName,
        jobTitle: w.jobTitle,
        startDate: w.startDate,
        endDate: w.endDate || "",
        isCurrent: w.isCurrent,
      })),
      references: data.references.map((r) => ({
        name: r.name,
        title: r.title,
        phone: r.phone,
        email: r.email,
      })),
      disclosures: {
        malpracticeClaim: data.disclosures.malpracticeClaim,
        licenseAction: data.disclosures.licenseAction,
        federalExclusion: data.disclosures.federalExclusion,
        felony: data.disclosures.felony,
      },
    });

    // Upload PDF to Supabase Storage (non-blocking — don't fail submission if storage unavailable)
    const pdfFileName = `caqh-cheatsheet-${clinicianId}.pdf`;
    const { error: uploadError } = await supabase.storage
      .from("documents")
      .upload(pdfFileName, pdfBuffer, {
        contentType: "application/pdf",
        upsert: true,
      });
    if (uploadError) {
      console.error("CAQH PDF upload error:", uploadError);
    }

    // Send email notification
    const clinicianName = `${data.basicInfo.firstName} ${data.basicInfo.lastName}`;
    await sendSubmissionNotification(clinicianName).catch((err) => {
      console.error("Email notification failed:", err);
    });

    return NextResponse.json({
      success: true,
      clinicianId,
      pdfFileName,
    });
  } catch (error) {
    console.error("Submission error:", error);
    return NextResponse.json(
      { error: "Failed to submit intake form" },
      { status: 500 }
    );
  }
}
