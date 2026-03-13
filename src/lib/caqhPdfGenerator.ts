import jsPDF from "jspdf";

interface CaqhData {
  firstName: string;
  lastName: string;
  dob: string;
  ssn: string; // Will be masked in output
  homeAddress: string;
  phone: string;
  email: string;
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
  workHistory: {
    employerName: string;
    jobTitle: string;
    startDate: string;
    endDate: string;
    isCurrent: boolean;
  }[];
  references: {
    name: string;
    title: string;
    phone: string;
    email: string;
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
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(30, 41, 59); // slate-800
    doc.text(text, 14, y);
    y += 2;
    doc.setDrawColor(200, 200, 200);
    doc.line(14, y, 196, y);
    y += 6;
  }

  function addField(label: string, value: string) {
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(100, 116, 139); // slate-500
    doc.text(label, 14, y);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(30, 41, 59);
    doc.text(value || "—", 80, y);
    y += 6;
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
  doc.setTextColor(37, 99, 235); // blue-600
  doc.text("CAQH ProView Cheat Sheet", 14, y);
  y += 8;
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 116, 139);
  doc.text(`Generated for ${data.firstName} ${data.lastName}`, 14, y);
  y += 4;
  doc.text(`Date: ${new Date().toLocaleDateString()}`, 14, y);
  y += 10;

  // Section 1: Personal Information
  addHeader("1. Personal Information");
  addField("Full Name:", `${data.firstName} ${data.lastName}`);
  addField("Date of Birth:", data.dob);
  addField("SSN:", maskSSN(data.ssn));
  addField("Home Address:", data.homeAddress);
  addField("Phone:", data.phone);
  addField("Email:", data.email);
  y += 4;

  // Section 2: Practice Location
  checkPage();
  addHeader("2. Practice Location");
  addField("Practice Name:", "Safe Harbor Behavioral Health");
  addField("Address:", "2510 E 15th St, Ste 207");
  addField("City/State/Zip:", "Tulsa, OK 74104");
  addField("Phone:", "(918) 555-0100");
  addField("NPI (Type 2):", "1234567890");
  y += 4;

  // Section 3: Education
  checkPage();
  addHeader("3. Education");
  addField("School:", data.schoolName);
  addField("Degree:", data.degree);
  addField("Major:", data.major);
  addField("Graduation Date:", data.gradDate);
  y += 4;

  // Section 4: Postgraduate Training
  checkPage();
  addHeader("4. Postgraduate Training");
  addField("Note:", "N/A for most outpatient therapists");
  y += 4;

  // Section 5: Work History
  checkPage();
  addHeader("5. Work History");
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
      addField("  Title:", job.jobTitle);
      addField("  Dates:", `${job.startDate} — ${job.isCurrent ? "Present" : job.endDate}`);
      y += 2;
    });
  }
  y += 4;

  // Section 6: Hospital Affiliations
  checkPage();
  addHeader("6. Hospital Affiliations");
  addField("Note:", "N/A for outpatient behavioral health");
  y += 4;

  // Section 7: Professional License
  checkPage();
  addHeader("7. Professional License");
  addField("License Type:", data.licenseType);
  addField("License Number:", data.licenseNumber);
  addField("State:", data.licenseState);
  addField("Issue Date:", data.licenseIssued);
  addField("Expiration:", data.licenseExpiry);
  addField("NPI (Type 1):", data.npiType1);
  addField("Taxonomy Code:", data.taxonomyCode);
  y += 4;

  // Section 8: DEA Registration
  checkPage();
  addHeader("8. DEA Registration");
  addField("Note:", "N/A unless prescriber");
  y += 4;

  // Section 9: Malpractice Insurance
  checkPage();
  addHeader("9. Liability Insurance");
  addField("Carrier:", data.malpracticeCarrier);
  addField("Policy #:", data.malpracticePolicy);
  addField("Per Claim:", `$${data.malpracticePerClaim}`);
  addField("Aggregate:", `$${data.malpracticeAggregate}`);
  addField("Start Date:", data.malpracticeStart);
  addField("End Date:", data.malpracticeEnd);
  y += 4;

  // Section 10: Disclosure Questions
  checkPage();
  addHeader("10. Disclosure Questions");
  addField("Malpractice Claims:", data.disclosures.malpracticeClaim ? "YES" : "No");
  addField("License Actions:", data.disclosures.licenseAction ? "YES" : "No");
  addField("Federal Exclusion:", data.disclosures.federalExclusion ? "YES" : "No");
  addField("Felony Conviction:", data.disclosures.felony ? "YES" : "No");
  y += 4;

  // Section 11: Professional References
  checkPage();
  addHeader("11. Professional References");
  if (data.references.length === 0) {
    addField("Note:", "No references provided");
  } else {
    data.references.forEach((ref, i) => {
      checkPage();
      addField(`Reference ${i + 1}:`, `${ref.name} (${ref.title})`);
      addField("  Phone:", ref.phone);
      addField("  Email:", ref.email);
      y += 2;
    });
  }

  // CAQH ID
  if (data.caqhId) {
    y += 4;
    checkPage();
    addHeader("CAQH Provider ID");
    addField("ID:", data.caqhId);
  }

  const arrayBuffer = doc.output("arraybuffer");
  return Buffer.from(arrayBuffer);
}
