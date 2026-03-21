import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  BasicInfoData,
  NpiData,
  LicenseData,
  MalpracticeData,
  WorkHistoryEntry,
  EducationData,
  SpecialtiesData,
  ReferenceEntry,
  DisclosuresData,
} from "@/lib/validations/clinician";
import { TOTAL_SECTIONS } from "@/lib/validations/clinician";

// Normalize YYYY-MM → YYYY-MM-01 so HTML date inputs work correctly
function normalizeDate(value: string | null | undefined): string {
  if (!value || value.trim() === "") return "";
  if (/^\d{4}-\d{2}$/.test(value)) return `${value}-01`;
  return value;
}

interface UploadedFile {
  name: string;
  type: string;
  size: number;
  url?: string;
}

type DocumentKey = "license" | "malpractice" | "photoId" | "cv";

interface IntakeState {
  // Navigation
  currentSection: number;
  completedSections: Set<number>;

  // Section data
  basicInfo: Partial<BasicInfoData>;
  npi: Partial<NpiData>;
  license: Partial<LicenseData>;
  malpractice: Partial<MalpracticeData>;
  workHistory: WorkHistoryEntry[];
  education: Partial<EducationData>;
  specialties: Partial<SpecialtiesData>;
  caqh: { hasCaqh: boolean; caqhId: string };
  references: ReferenceEntry[];
  documents: {
    license: UploadedFile | null;
    malpractice: UploadedFile | null;
    photoId: UploadedFile | null;
    cv: UploadedFile | null;
  };
  documentFiles: Record<DocumentKey, File | null>;
  disclosures: Partial<DisclosuresData>;

  // Document upload center
  hasCompletedDocumentUpload: boolean;

  // Resume parsing
  isResumeParsed: boolean;
  resumeConfidence: number;
  resetVersion: number;

  // Actions
  setCurrentSection: (section: number) => void;
  markSectionComplete: (section: number) => void;
  goNext: () => void;
  goBack: () => void;

  updateBasicInfo: (data: Partial<BasicInfoData>) => void;
  updateNpi: (data: Partial<NpiData>) => void;
  updateLicense: (data: Partial<LicenseData>) => void;
  updateMalpractice: (data: Partial<MalpracticeData>) => void;
  setWorkHistory: (entries: WorkHistoryEntry[]) => void;
  updateEducation: (data: Partial<EducationData>) => void;
  updateSpecialties: (data: Partial<SpecialtiesData>) => void;
  updateCaqh: (data: { hasCaqh: boolean; caqhId: string }) => void;
  setReferences: (refs: ReferenceEntry[]) => void;
  setDocument: (type: keyof IntakeState["documents"], file: UploadedFile | null) => void;
  setDocumentFile: (type: DocumentKey, file: File | null) => void;
  updateDisclosures: (data: Partial<DisclosuresData>) => void;

  setHasCompletedDocumentUpload: (value: boolean) => void;
  prefillFromResume: (data: Record<string, unknown>) => void;
  reset: () => void;
}

const initialState = {
  currentSection: 0,
  completedSections: new Set<number>(),
  basicInfo: {},
  npi: {},
  license: {},
  malpractice: {},
  workHistory: [] as WorkHistoryEntry[],
  education: {},
  specialties: {},
  caqh: { hasCaqh: false, caqhId: "" },
  references: [] as ReferenceEntry[],
  documents: { license: null, malpractice: null, photoId: null, cv: null },
  documentFiles: { license: null, malpractice: null, photoId: null, cv: null },
  disclosures: {},
  hasCompletedDocumentUpload: false,
  isResumeParsed: false,
  resumeConfidence: 0,
  resetVersion: 0,
};

export const useIntakeStore = create<IntakeState>()(
  persist(
    (set) => ({
  ...initialState,

  setCurrentSection: (section) => set({ currentSection: section }),

  markSectionComplete: (section) =>
    set((state) => {
      const updated = new Set(state.completedSections);
      updated.add(section);
      return { completedSections: updated };
    }),

  goNext: () =>
    set((state) => ({
      currentSection: Math.min(state.currentSection + 1, TOTAL_SECTIONS - 1),
    })),

  goBack: () =>
    set((state) => ({
      currentSection: Math.max(state.currentSection - 1, 0),
    })),

  updateBasicInfo: (data) =>
    set((state) => ({ basicInfo: { ...state.basicInfo, ...data } })),

  updateNpi: (data) =>
    set((state) => ({ npi: { ...state.npi, ...data } })),

  updateLicense: (data) =>
    set((state) => ({ license: { ...state.license, ...data } })),

  updateMalpractice: (data) =>
    set((state) => ({ malpractice: { ...state.malpractice, ...data } })),

  setWorkHistory: (entries) => set({ workHistory: entries }),

  updateEducation: (data) =>
    set((state) => ({ education: { ...state.education, ...data } })),

  updateSpecialties: (data) =>
    set((state) => ({ specialties: { ...state.specialties, ...data } })),

  updateCaqh: (data) => set({ caqh: data }),

  setReferences: (refs) => set({ references: refs }),

  setDocument: (type, file) =>
    set((state) => ({
      documents: { ...state.documents, [type]: file },
    })),

  setDocumentFile: (type, file) =>
    set((state) => ({
      documentFiles: { ...state.documentFiles, [type]: file },
    })),

  updateDisclosures: (data) =>
    set((state) => ({ disclosures: { ...state.disclosures, ...data } })),

  setHasCompletedDocumentUpload: (value) => set({ hasCompletedDocumentUpload: value }),

  prefillFromResume: (data) =>
    set((state) => {
      const parsed = data as Record<string, unknown>;
      const updates: Partial<IntakeState> = { isResumeParsed: true };

      if (parsed.confidence) {
        updates.resumeConfidence = parsed.confidence as number;
      }

      if (parsed.firstName || parsed.lastName) {
        updates.basicInfo = {
          ...state.basicInfo,
          firstName: (parsed.firstName as string) || state.basicInfo.firstName,
          lastName: (parsed.lastName as string) || state.basicInfo.lastName,
          email: (parsed.email as string) || state.basicInfo.email,
          phone: (parsed.phone as string) || state.basicInfo.phone,
          homeAddress: (parsed.address as string) || state.basicInfo.homeAddress,
        };
      }

      if (Array.isArray(parsed.workHistory)) {
        updates.workHistory = parsed.workHistory.map((w: Record<string, unknown>) => ({
          employerName: (w.employer as string) || "",
          employerAddress: (w.address as string) || "",
          jobTitle: (w.title as string) || "",
          supervisorName: (w.supervisorName as string) || "",
          startDate: normalizeDate(w.startDate as string),
          endDate: normalizeDate(w.endDate as string),
          isCurrent: (w.isCurrent as boolean) || false,
        }));
      }

      if (Array.isArray(parsed.education) && parsed.education.length > 0) {
        const edu = parsed.education[0] as Record<string, unknown>;
        updates.education = {
          ...state.education,
          schoolName: (edu.school as string) || state.education.schoolName,
          degree: (edu.degree as string) || state.education.degree,
          major: (edu.major as string) || state.education.major,
          gradDate: normalizeDate(edu.graduationDate as string) || state.education.gradDate,
        };
      }

      if (Array.isArray(parsed.licenses) && parsed.licenses.length > 0) {
        const lic = parsed.licenses[0] as Record<string, unknown>;
        updates.license = {
          ...state.license,
          licenseType: (lic.type as string) || state.license.licenseType,
          licenseNumber: (lic.number as string) || state.license.licenseNumber,
          licenseState: (lic.state as string) || state.license.licenseState,
          licenseIssued: normalizeDate(lic.issueDate as string) || state.license.licenseIssued,
          licenseExpiry: normalizeDate(lic.expiryDate as string) || state.license.licenseExpiry,
        };
      }

      if (parsed.npiNumber) {
        updates.npi = {
          ...state.npi,
          npiType1: (parsed.npiNumber as string) || state.npi.npiType1,
        };
      }

      if (parsed.caqhId) {
        updates.caqh = {
          hasCaqh: true,
          caqhId: parsed.caqhId as string,
        };
      }

      if (parsed.malpractice && typeof parsed.malpractice === "object") {
        const m = parsed.malpractice as Record<string, string | null>;
        updates.malpractice = {
          ...state.malpractice,
          malpracticeCarrier: m.carrier || state.malpractice.malpracticeCarrier,
          malpracticePolicy: m.policyNumber || state.malpractice.malpracticePolicy,
          malpracticePerClaim: m.perClaim || state.malpractice.malpracticePerClaim,
          malpracticeAggregate: m.aggregate || state.malpractice.malpracticeAggregate,
          malpracticeStart: normalizeDate(m.startDate) || state.malpractice.malpracticeStart,
          malpracticeEnd: normalizeDate(m.endDate) || state.malpractice.malpracticeEnd,
        };
      }

      if (Array.isArray(parsed.references) && parsed.references.length > 0) {
        updates.references = parsed.references.map((r: Record<string, unknown>) => ({
          name: (r.name as string) || "",
          title: (r.title as string) || "",
          specialty: (r.specialty as string) || "",
          phone: (r.phone as string) || "",
          email: (r.email as string) || "",
          organization: (r.organization as string) || "",
          yearsKnown: (r.yearsKnown as string) || "",
        }));
      }

      return updates;
    }),

  reset: () => set((state) => ({ ...initialState, completedSections: new Set<number>(), documentFiles: { license: null, malpractice: null, photoId: null, cv: null }, hasCompletedDocumentUpload: false, resetVersion: state.resetVersion + 1 })),
    }),
    {
      name: "intake-form-draft",
      partialize: (state) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { documentFiles, ...rest } = state;
        return rest;
      },
      storage: {
        getItem: (name) => {
          if (typeof window === "undefined") return null;
          const raw = localStorage.getItem(name);
          if (!raw) return null;
          const parsed = JSON.parse(raw);
          // Convert completedSections array back to Set
          if (parsed?.state?.completedSections) {
            parsed.state.completedSections = new Set<number>(parsed.state.completedSections);
          }
          return parsed;
        },
        setItem: (name, value) => {
          if (typeof window === "undefined") return;
          // Convert completedSections Set to array for JSON serialization
          const toStore = {
            ...value,
            state: {
              ...value.state,
              completedSections: value.state?.completedSections instanceof Set
                ? Array.from(value.state.completedSections)
                : value.state?.completedSections ?? [],
            },
          };
          localStorage.setItem(name, JSON.stringify(toStore));
        },
        removeItem: (name) => {
          if (typeof window === "undefined") return;
          localStorage.removeItem(name);
        },
      },
    },
  ),
);
