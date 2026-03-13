import { z } from "zod";

// Valid behavioral health NUCC taxonomy codes
export const TAXONOMY_CODES = [
  { code: "101YM0800X", description: "Mental Health Counselor" },
  { code: "101YP0107X", description: "Professional Counselor (LPC)" },
  { code: "101YS0200X", description: "School Counselor" },
  { code: "104100000X", description: "Social Worker" },
  { code: "1041C0700X", description: "Clinical Social Worker (LCSW)" },
  { code: "1041S0200X", description: "School Social Worker" },
  { code: "106H00000X", description: "Marriage & Family Therapist (LMFT)" },
  { code: "103T00000X", description: "Psychologist" },
  { code: "103TA0400X", description: "Psychologist, Addiction" },
  { code: "103TA0700X", description: "Psychologist, Adult Development" },
  { code: "103TC0700X", description: "Psychologist, Clinical" },
  { code: "103TC2200X", description: "Psychologist, Child/Adolescent" },
  { code: "103TB0200X", description: "Psychologist, Behavioral" },
  { code: "261QM0801X", description: "Mental Health Clinic (org taxonomy)" },
] as const;

const VALID_TAXONOMY_CODES = new Set<string>(TAXONOMY_CODES.map((t) => t.code));

// Section 1: Basic Information
export const basicInfoSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  dob: z.string().min(1, "Date of birth is required"),
  ssn: z
    .string()
    .regex(/^\d{3}-\d{2}-\d{4}$/, "SSN must be format XXX-XX-XXXX"),
  homeAddress: z.string().min(1, "Home address is required"),
  phone: z
    .string()
    .regex(
      /^\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}$/,
      "Enter a valid US phone number"
    ),
  email: z.string().email("Enter a valid email address"),
});

// Section 2: NPI Number
export const npiSchema = z.object({
  npiType1: z
    .string()
    .regex(/^\d{10}$/, "NPI must be exactly 10 digits"),
  taxonomyCode: z.string().min(1, "Taxonomy code is required").refine(
    (val) => VALID_TAXONOMY_CODES.has(val),
    "Invalid taxonomy code. Select a valid behavioral health code."
  ),
});

// Section 3: State License
export const licenseSchema = z.object({
  licenseType: z.string().min(1, "License type is required"),
  licenseNumber: z.string().min(1, "License number is required"),
  licenseState: z.string().length(2, "Select a state"),
  licenseIssued: z.string().min(1, "Issue date is required"),
  licenseExpiry: z.string().min(1, "Expiry date is required"),
});

// Section 4: Malpractice Insurance
export const malpracticeSchema = z.object({
  malpracticeCarrier: z.string().min(1, "Insurance carrier is required"),
  malpracticePolicy: z.string().min(1, "Policy number is required"),
  malpracticePerClaim: z
    .string()
    .min(1, "Per-claim amount is required")
    .refine(
      (val) => {
        const num = parseInt(val.replace(/[,$]/g, ""), 10);
        return !isNaN(num) && num >= 1000000;
      },
      { message: "Per-claim minimum is $1,000,000" }
    ),
  malpracticeAggregate: z
    .string()
    .min(1, "Aggregate amount is required")
    .refine(
      (val) => {
        const num = parseInt(val.replace(/[,$]/g, ""), 10);
        return !isNaN(num) && num >= 3000000;
      },
      { message: "Aggregate minimum is $3,000,000" }
    ),
  malpracticeStart: z.string().min(1, "Start date is required"),
  malpracticeEnd: z.string().min(1, "End date is required"),
});

// Section 5: Work History (single entry)
export const workHistoryEntrySchema = z.object({
  employerName: z.string().min(1, "Employer name is required"),
  employerAddress: z.string().optional(),
  jobTitle: z.string().min(1, "Job title is required"),
  supervisorName: z.string().optional(),
  supervisorPhone: z.string().optional(),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().optional(),
  reasonLeaving: z.string().optional(),
  isCurrent: z.boolean().default(false),
});

export const workHistorySchema = z.object({
  workHistory: z.array(workHistoryEntrySchema).min(1, "At least one work history entry is required"),
});

// Section 6: Education
export const educationSchema = z.object({
  schoolName: z.string().min(1, "School name is required"),
  degree: z.string().min(1, "Degree is required"),
  major: z.string().optional(),
  gradDate: z.string().min(1, "Graduation date is required"),
});

// Section 7: CAQH ProView
export const caqhSchema = z.object({
  hasCaqh: z.boolean(),
  caqhId: z.string().optional(),
}).refine(
  (data) => {
    if (data.hasCaqh && data.caqhId) {
      return /^\d{8}$/.test(data.caqhId);
    }
    return true;
  },
  { message: "CAQH ID must be exactly 8 digits", path: ["caqhId"] }
);

// Section 7.5: Professional References
export const referenceEntrySchema = z.object({
  name: z.string().min(1, "Reference name is required"),
  title: z.string().min(1, "Title is required"),
  specialty: z.string().optional(),
  phone: z.string().min(1, "Phone is required"),
  email: z.string().email("Enter a valid email"),
});

export const referencesSchema = z.object({
  references: z.array(referenceEntrySchema).min(3, "At least 3 professional references are required"),
});

// Section 8: Documents (validated at upload time, not schema)
export const documentsSchema = z.object({
  hasLicenseDoc: z.boolean().refine((v) => v, "License document is required"),
  hasMalpracticeDoc: z.boolean().refine((v) => v, "Malpractice certificate is required"),
  hasPhotoId: z.boolean().refine((v) => v, "Photo ID is required"),
});

// Section 9: Disclosures
export const disclosuresSchema = z.object({
  malpracticeClaim: z.boolean(),
  licenseAction: z.boolean(),
  federalExclusion: z.boolean(),
  felony: z.boolean(),
  explanation: z.string().optional(),
  signedName: z.string().min(1, "Digital signature is required"),
}).refine(
  (data) => {
    const hasYes = data.malpracticeClaim || data.licenseAction || data.federalExclusion || data.felony;
    if (hasYes && (!data.explanation || data.explanation.trim().length === 0)) {
      return false;
    }
    return true;
  },
  { message: "Please explain any 'Yes' answers", path: ["explanation"] }
);

// Section labels for progress bar
export const SECTION_LABELS = [
  "Basic Info",
  "NPI",
  "License",
  "Malpractice",
  "Work History",
  "Education",
  "CAQH",
  "References",
  "Documents",
  "Disclosures",
] as const;

export const TOTAL_SECTIONS = SECTION_LABELS.length;

// Type exports
export type BasicInfoData = z.infer<typeof basicInfoSchema>;
export type NpiData = z.infer<typeof npiSchema>;
export type LicenseData = z.infer<typeof licenseSchema>;
export type MalpracticeData = z.infer<typeof malpracticeSchema>;
export type WorkHistoryEntry = z.infer<typeof workHistoryEntrySchema>;
export type WorkHistoryData = z.infer<typeof workHistorySchema>;
export type EducationData = z.infer<typeof educationSchema>;
export type CaqhData = z.infer<typeof caqhSchema>;
export type ReferenceEntry = z.infer<typeof referenceEntrySchema>;
export type ReferencesData = z.infer<typeof referencesSchema>;
export type DocumentsData = z.infer<typeof documentsSchema>;
export type DisclosuresData = z.infer<typeof disclosuresSchema>;

// Utility: detect gaps > 30 days in work history
export function detectWorkGaps(
  workHistory: WorkHistoryEntry[]
): { startDate: string; endDate: string; durationDays: number }[] {
  const sorted = [...workHistory]
    .filter((w) => w.startDate)
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());

  const gaps: { startDate: string; endDate: string; durationDays: number }[] = [];

  for (let i = 0; i < sorted.length - 1; i++) {
    const currentEnd = sorted[i].endDate || sorted[i].startDate;
    const nextStart = sorted[i + 1].startDate;

    const endDate = new Date(currentEnd);
    const startDate = new Date(nextStart);
    const diffMs = startDate.getTime() - endDate.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays > 30) {
      gaps.push({
        startDate: currentEnd,
        endDate: nextStart,
        durationDays: diffDays,
      });
    }
  }

  return gaps;
}
