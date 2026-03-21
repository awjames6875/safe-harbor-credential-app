import jsPDF from "jspdf";

interface CaqhData {
  firstName: string;
  lastName: string;
  dob: string;
  ssn: string;
  homeAddress: string;
  phone: string;
  email: string;
  gender: string;
  languages: string;
  formerNames: string;
  npiType1: string;
  taxonomyCode: string;
  licenseType: string;
  licenseNumber: string;
  licenseState: string;
  licenseIssued: string;
  licenseExpiry: string;
  malpracticeCarrier: string;
  malpracticePolicy: string;
  malpracticePerClaim: string;
  malpracticeAggregate: string;
  malpracticeStart: string;
  malpracticeEnd: string;
  caqhId: string;
  schoolName: string;
  degree: string;
  major: string;
  gradDate: string;
  schoolAddress: string;
  primarySpecialty: string;
  boardCertification: string;
  certifyingBoard: string;
  certificationDate: string;
  certificationExpiry: string;
  workHistory: {
    employerName: string;
    employerAddress: string;
    jobTitle: string;
    supervisorName: string;
    startDate: string;
    endDate: string;
    isCurrent: boolean;
  }[];
  references: {
    name: string;
    title: string;
    phone: string;
    email: string;
    organization: string;
    yearsKnown: string;
  }[];
  disclosures: {
    malpracticeClaim: boolean;
    licenseAction: boolean;
    federalExclusion: boolean;
    felony: boolean;
  };
}

function maskSSN(ssn: string): string {
  if (!ssn || ssn.length < 4) return "XXX-XX-XXXX";
  return `XXX-XX-${ssn.slice(-4)}`;
}

export function generateCaqhCheatSheet(data: CaqhData): Buffer {
  const doc = new jsPDF();
  let y = 20;

  function addHeader(text: string) {
    checkPage();
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(30, 41, 59);
    doc.text(text, 14, y);
    y += 2;
    doc.setDrawColor(200, 200, 200);
    doc.line(14, y, 196, y);
    y += 6;
  }

  function addField(label: string, value: string) {
    checkPage();
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(100, 116, 139);
    doc.text(label, 14, y);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(30, 41, 59);
    doc.text(value || "—", 80, y);
    y += 6;
  }

  function addNote(text: string) {
    checkPage();
    doc.setFontSize(9);
    doc.setFont("helvetica", "italic");
    doc.setTextColor(120, 130, 150);
    doc.text(text, 14, y);
    y += 5;
  }

  function checkPage() {
    if (y > 270) {
      doc.addPage();
      y = 20;
    }
  }

  // Title
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(37, 99, 235);
  doc.text("CAQH ProView Cheat Sheet", 14, y);
  y += 8;
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 116, 139);
  doc.text(`Generated for ${data.firstName} ${data.lastName}`, 14, y);
  y += 4;
  doc.text(`Date: ${new Date().toLocaleDateString()}`, 14, y);
  y += 4;
  doc.text("Use this sheet to fill out your CAQH ProView profile at proview.caqh.org", 14, y);
  y += 10;

  // Section 1: Personal Information
  addHeader("1. Personal Information");
  addField("Full Name:", `${data.firstName} ${data.lastName}`);
  if (data.formerNames) addField("Former Names:", data.formerNames);
  addField("Date of Birth:", data.dob);
  addField("SSN:", maskSSN(data.ssn));
  addField("Gender:", data.gender || "Not specified");
  addField("Home Address:", data.homeAddress);
  addField("Phone:", data.phone);
  addField("Email:", data.email);
  addField("Languages:", data.languages || "English");
  y += 4;

  // Section 2: Practice Location
  addHeader("2. Practice Location");
  addField("Practice Name:", "Safe Harbor Behavioral Health");
  addField("Address:", "2510 E 15th St, Ste 207");
  addField("City/State/Zip:", "Tulsa, OK 74104");
  addField("Phone:", "(918) 555-0100");
  addField("NPI (Type 2):", "1234567890");
  addNote("Safe Harbor is your primary practice location for credentialing.");
  y += 4;

  // Section 3: Education
  addHeader("3. Education");
  addField("School:", data.schoolName);
  if (data.schoolAddress) addField("School Location:", data.schoolAddress);
  addField("Degree:", data.degree);
  addField("Major:", data.major);
  addField("Graduation Date:", data.gradDate);
  y += 4;

  // Section 4: Postgraduate Training
  addHeader("4. Postgraduate Training");
  addNote("List any post-graduate clinical supervision or training hours.");
  addNote("For most LPC/LCSW clinicians, enter your supervised clinical experience.");
  addField("Note:", "Enter details from your supervision records");
  y += 4;

  // Section 5: Specialties & Board Certifications
  addHeader("5. Specialties & Board Certifications");
  addField("Primary Specialty:", data.primarySpecialty || "Not specified");
  if (data.boardCertification) {
    addField("Board Certification:", data.boardCertification);
    if (data.certifyingBoard) addField("Certifying Board:", data.certifyingBoard);
    if (data.certificationDate) addField("Certification Date:", data.certificationDate);
    if (data.certificationExpiry) addField("Expiration:", data.certificationExpiry);
  } else {
    addNote("No board certification listed. If applicable, add during CAQH setup.");
  }
  y += 4;

  // Section 6: Work History
  addHeader("6. Work History");
  if (data.workHistory.length === 0) {
    addField("Note:", "No work history provided");
  } else {
    data.workHistory.forEach((job, i) => {
      checkPage();
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(30, 41, 59);
      doc.text(`Position ${i + 1}:`, 14, y);
      y += 6;
      addField("  Employer:", job.employerName);
      if (job.employerAddress) addField("  Address:", job.employerAddress);
      addField("  Title:", job.jobTitle);
      if (job.supervisorName) addField("  Supervisor:", job.supervisorName);
      addField("  Dates:", `${job.startDate} — ${job.isCurrent ? "Present" : job.endDate}`);
      y += 2;
    });
  }
  y += 4;

  // Section 7: Hospital Affiliations
  addHeader("7. Hospital Affiliations");
  addField("Status:", "N/A — Outpatient behavioral health");
  addNote("Hospital privileges are not required for outpatient therapy practice.");
  y += 4;

  // Section 8: Professional License
  addHeader("8. Professional License");
  addField("License Type:", data.licenseType);
  addField("License Number:", data.licenseNumber);
  addField("State:", data.licenseState);
  addField("Issue Date:", data.licenseIssued);
  addField("Expiration:", data.licenseExpiry);
  addField("NPI (Type 1):", data.npiType1);
  addField("Taxonomy Code:", data.taxonomyCode);
  y += 4;

  // Section 9: DEA Registration
  addHeader("9. DEA Registration");
  addField("Status:", "N/A — Non-prescriber");
  addNote("DEA registration is only required for prescribing providers.");
  y += 4;

  // Section 10: Liability Insurance
  addHeader("10. Liability Insurance");
  addField("Carrier:", data.malpracticeCarrier);
  addField("Policy #:", data.malpracticePolicy);
  addField("Per Claim:", `$${data.malpracticePerClaim}`);
  addField("Aggregate:", `$${data.malpracticeAggregate}`);
  addField("Start Date:", data.malpracticeStart);
  addField("End Date:", data.malpracticeEnd);
  y += 4;

  // Section 11: Disclosure Questions
  addHeader("11. Disclosure Questions");
  addField("Malpractice Claims:", data.disclosures.malpracticeClaim ? "YES" : "No");
  addField("License Actions:", data.disclosures.licenseAction ? "YES" : "No");
  addField("Federal Exclusion:", data.disclosures.federalExclusion ? "YES" : "No");
  addField("Felony Conviction:", data.disclosures.felony ? "YES" : "No");
  y += 4;

  // Section 12: Professional References
  addHeader("12. Professional References");
  addNote("CAQH requires at least 3 professional references (not family members).");
  if (data.references.length === 0) {
    addField("Note:", "No references provided");
  } else {
    data.references.forEach((ref, i) => {
      checkPage();
      addField(`Reference ${i + 1}:`, `${ref.name} (${ref.title})`);
      if (ref.organization) addField("  Organization:", ref.organization);
      addField("  Phone:", ref.phone);
      addField("  Email:", ref.email);
      if (ref.yearsKnown) addField("  Years Known:", ref.yearsKnown);
      y += 2;
    });
  }

  // CAQH ID
  if (data.caqhId) {
    y += 4;
    addHeader("CAQH Provider ID");
    addField("ID:", data.caqhId);
  }

  // Medicare/Medicaid
  y += 4;
  addHeader("Medicare / Medicaid");
  addField("Status:", "To be assigned after credentialing");
  addNote("Safe Harbor will assist with Medicare/Medicaid enrollment if needed.");

  // Credentialing Contact
  y += 4;
  addHeader("Credentialing Contact");
  addField("Organization:", "Safe Harbor Behavioral Health");
  addField("Contact:", "Credentialing Department");
  addField("Phone:", "(918) 555-0100");
  addField("Email:", "credentialing@safeharborbh.com");

  // CAQH Tips Footer
  y += 6;
  checkPage();
  doc.setDrawColor(37, 99, 235);
  doc.setLineWidth(0.5);
  doc.line(14, y, 196, y);
  y += 6;
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(37, 99, 235);
  doc.text("CAQH ProView Tips", 14, y);
  y += 6;
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(80, 80, 80);
  const tips = [
    "1. Re-attest every 120 days — CAQH will email reminders. Missing this delays credentialing.",
    "2. Keep your profile current — update any changes to address, license, or insurance immediately.",
    "3. Upload clear copies of all documents (license, malpractice cert, DEA if applicable).",
    "4. Authorize all health plans you want to be credentialed with in the 'Manage My Plans' section.",
    "5. Complete all sections even if N/A — mark them as N/A rather than leaving blank.",
    "6. Save your CAQH Provider ID — you'll need it for every credentialing application.",
  ];
  tips.forEach((tip) => {
    checkPage();
    doc.text(tip, 14, y);
    y += 5;
  });

  const arrayBuffer = doc.output("arraybuffer");
  return Buffer.from(arrayBuffer);
}
