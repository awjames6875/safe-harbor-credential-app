import { writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Use jsPDF to create a proper PDF that pdf-parse can read
async function main() {
  const mod = await import("jspdf");
  const jsPDF = mod.jsPDF || mod.default;
  const doc = new jsPDF();

  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("MARIA ELENA RODRIGUEZ, LPC", 20, 20);

  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text("Licensed Professional Counselor", 20, 28);

  let y = 42;
  const lines = [
    "CONTACT INFORMATION",
    "Email: maria.rodriguez@email.com",
    "Phone: (918) 555-0147",
    "Address: 4521 South Peoria Avenue, Tulsa, OK 74105",
    "NPI: 1234567890",
    "",
    "EDUCATION",
    "Master of Science in Clinical Mental Health Counseling",
    "University of Oklahoma, Norman, OK",
    "Graduated: May 2018",
    "",
    "Bachelor of Arts in Psychology",
    "Oklahoma State University, Stillwater, OK",
    "Graduated: May 2015",
    "",
    "PROFESSIONAL LICENSES",
    "Licensed Professional Counselor (LPC)",
    "License Number: 7842",
    "State: Oklahoma",
    "Issue Date: 08/2018",
    "Expiry Date: 08/2026",
    "",
    "WORK EXPERIENCE",
    "Safe Harbor Behavioral Health - Tulsa, OK",
    "Licensed Professional Counselor",
    "January 2021 - Present",
    "Supervisor: Dr. Amanda James",
    "",
    "Parkside Psychiatric Hospital - Tulsa, OK",
    "Mental Health Counselor",
    "August 2018 - December 2020",
    "Supervisor: Dr. Robert Chen",
    "",
    "PROFESSIONAL REFERENCES",
    "Dr. Amanda James, Clinical Director, Clinical Psychology",
    "Phone: (918) 555-0200 | Email: ajames@safeharborbh.com",
    "",
    "Dr. Robert Chen, Director of Outpatient Services, Psychiatry",
    "Phone: (918) 555-0300 | Email: rchen@parksidepsych.com",
    "",
    "Dr. Sarah Williams, Clinical Supervisor, Marriage and Family Therapy",
    "Phone: (918) 555-0400 | Email: swilliams@tulsacounseling.com",
  ];

  doc.setFontSize(10);
  for (const line of lines) {
    if (line === "") {
      y += 4;
      continue;
    }
    if (
      line === "CONTACT INFORMATION" ||
      line === "EDUCATION" ||
      line === "PROFESSIONAL LICENSES" ||
      line === "WORK EXPERIENCE" ||
      line === "PROFESSIONAL REFERENCES"
    ) {
      doc.setFont("helvetica", "bold");
      doc.text(line, 20, y);
      doc.setFont("helvetica", "normal");
    } else {
      doc.text(line, 20, y);
    }
    y += 6;
  }

  const arrayBuffer = doc.output("arraybuffer");
  writeFileSync(join(__dirname, "fake-resume.pdf"), Buffer.from(arrayBuffer));
  console.log("fake-resume.pdf created with jsPDF");
}

main().catch(console.error);
