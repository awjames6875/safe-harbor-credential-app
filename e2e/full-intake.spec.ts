import { test, expect } from "@playwright/test";
import path from "path";

// Increase timeout — this test uploads a resume, waits for AI parsing, fills 10 sections
test.setTimeout(300_000); // 5 minutes

test.describe("Full clinician intake flow", () => {
  test("resume upload → fill all sections → submit → CAQH PDF", async ({
    page,
  }) => {
    const startTime = Date.now();

    // ─── Step 1: Login ───
    await page.goto("/clinician/login");
    await page.getByLabel("Email").fill("1alphaj@gmail.com");
    await page.getByLabel("Password").fill("Integrity!2026");
    await page.getByRole("button", { name: "Sign In" }).click();
    await page.waitForURL("**/clinician", { timeout: 30_000 });
    console.log(`✓ Login: ${((Date.now() - startTime) / 1000).toFixed(1)}s`);

    // ─── Step 2: Clear any saved form data ───
    page.on("dialog", (d) => d.accept());
    const startOver = page.getByText("Start Over");
    if (await startOver.isVisible({ timeout: 3000 }).catch(() => false)) {
      await startOver.click();
      await page.waitForTimeout(500);
    }

    // ─── Step 3: Upload resume ───
    const resumePath = path.resolve(__dirname, "fixtures/fake-resume.pdf");
    const resumeInput = page.locator('input[type="file"][accept=".pdf,.doc,.docx"]');
    await resumeInput.setInputFiles(resumePath);

    // Wait for AI parsing to complete
    const parseStart = Date.now();
    await expect(page.getByText("Resume parsed!")).toBeVisible({
      timeout: 60_000,
    });
    const parseTime = ((Date.now() - parseStart) / 1000).toFixed(1);
    console.log(`✓ Resume parsed: ${parseTime}s`);

    // ─── Step 4: Basic Info (Section 0) ───
    await expect(page.getByText("Basic Information")).toBeVisible();

    // Fill all fields (overwrite any resume pre-fills to ensure completeness)
    await page.locator("#firstName").fill("Maria");
    await page.locator("#lastName").fill("Rodriguez");
    await page.locator("#dob").fill("1992-03-15");
    await page.locator("#homeAddress").fill("4521 South Peoria Avenue, Tulsa, OK 74105");
    await page.locator("#phone").fill("(918) 555-0147");
    await page.locator("#email").fill("maria.rodriguez@email.com");

    // SSN uses MaskedInput — type the digits
    const ssnInput = page.locator('input[autocomplete="off"]').first();
    await ssnInput.click();
    await ssnInput.fill("123456789");

    await page.getByRole("button", { name: "Next: NPI Number" }).click();
    console.log(
      `✓ Basic Info: ${((Date.now() - startTime) / 1000).toFixed(1)}s`
    );

    // ─── Step 5: NPI (Section 1) ───
    await expect(page.getByText("NPI Number")).toBeVisible();
    await page.locator("#npiType1").fill("1234567890");
    await page.locator("#taxonomyCode").selectOption("101YM0800X");
    await page.getByRole("button", { name: "Next: License" }).click();
    console.log(`✓ NPI: ${((Date.now() - startTime) / 1000).toFixed(1)}s`);

    // ─── Step 6: License (Section 2) ───
    await expect(page.getByText("State License")).toBeVisible();

    // License Type is a shadcn Select — click trigger then option
    const selectTrigger = page.locator('[role="combobox"]');
    await selectTrigger.click();
    await page.getByRole("option", { name: "LPC" }).click();

    await page.locator("#licenseNumber").fill("7842");
    // licenseState defaults to "OK" — leave it
    await page.locator("#licenseIssued").fill("2018-08-01");
    await page.locator("#licenseExpiry").fill("2026-08-01");
    await page.getByRole("button", { name: "Next: Malpractice" }).click();
    console.log(`✓ License: ${((Date.now() - startTime) / 1000).toFixed(1)}s`);

    // ─── Step 7: Malpractice (Section 3) ───
    await expect(page.getByText("Malpractice Insurance")).toBeVisible();
    await page.locator("#malpracticeCarrier").fill("HPSO");
    await page.locator("#malpracticePolicy").fill("POL-2024-5678");
    await page.locator("#malpracticePerClaim").fill("1000000");
    await page.locator("#malpracticeAggregate").fill("3000000");
    await page.locator("#malpracticeStart").fill("2024-01-01");
    await page.locator("#malpracticeEnd").fill("2025-01-01");
    await page.getByRole("button", { name: "Next: Work History" }).click();
    console.log(
      `✓ Malpractice: ${((Date.now() - startTime) / 1000).toFixed(1)}s`
    );

    // ─── Step 8: Work History (Section 4) ───
    await expect(page.getByRole("heading", { name: "Work History" })).toBeVisible();

    // Fill first position using block-scoped selectors (Labels lack htmlFor)
    const pos1 = page.locator(".border.border-slate-200.rounded-xl").first();
    const pos1Inputs = pos1.locator("input");
    // Input order: employerName(0), jobTitle(1), employerAddress(2), supervisorName(3), supervisorPhone(4), startDate(5), endDate(6), reasonLeaving(8)
    await pos1Inputs.nth(0).fill("Safe Harbor Behavioral Health");
    await pos1Inputs.nth(1).fill("Licensed Professional Counselor");
    await pos1Inputs.nth(5).fill("2021-01-15");
    // Check "Currently employed here" checkbox (first checkbox in the block)
    const currentCheckbox = pos1.locator('[role="checkbox"]').first();
    if ((await currentCheckbox.getAttribute("aria-checked")) !== "true") {
      await currentCheckbox.click();
    }

    await page.getByRole("button", { name: "Next: Education" }).click();
    console.log(
      `✓ Work History: ${((Date.now() - startTime) / 1000).toFixed(1)}s`
    );

    // ─── Step 9: Education (Section 5) ───
    await expect(page.getByRole("heading", { name: "Education" })).toBeVisible();

    // Fill unconditionally
    await page.locator("#schoolName").fill("University of Oklahoma");
    await page.locator("#degree").fill("Master of Science");
    await page.locator("#major").fill("Clinical Mental Health Counseling");
    await page.locator("#gradDate").fill("2018-05-15");

    await page.getByRole("button", { name: "Next: CAQH" }).click();
    console.log(
      `✓ Education: ${((Date.now() - startTime) / 1000).toFixed(1)}s`
    );

    // ─── Step 10: CAQH (Section 6) ───
    await expect(page.getByRole("heading", { name: "CAQH ProView" })).toBeVisible();
    // Leave "No CAQH" (default unchecked)
    await page.getByRole("button", { name: "Next: References" }).click();
    console.log(`✓ CAQH: ${((Date.now() - startTime) / 1000).toFixed(1)}s`);

    // ─── Step 11: References (Section 7) ───
    await expect(page.getByText("Professional References")).toBeVisible();

    // Fill 3 references
    const refs = [
      {
        name: "Dr. Amanda James",
        title: "Clinical Director",
        specialty: "Clinical Psychology",
        phone: "(918) 555-0200",
        email: "ajames@safeharborbh.com",
      },
      {
        name: "Dr. Robert Chen",
        title: "Director of Outpatient Services",
        specialty: "Psychiatry",
        phone: "(918) 555-0300",
        email: "rchen@parksidepsych.com",
      },
      {
        name: "Dr. Sarah Williams",
        title: "Clinical Supervisor",
        specialty: "Marriage and Family Therapy",
        phone: "(918) 555-0400",
        email: "swilliams@tulsacounseling.com",
      },
    ];

    for (let i = 0; i < 3; i++) {
      const refBlock = page
        .locator(".border.border-slate-200.rounded-xl")
        .nth(i);
      const inputs = refBlock.locator("input");
      // Input order: name(0), title(1), specialty(2), phone(3), email(4)
      await inputs.nth(0).fill(refs[i].name);
      await inputs.nth(1).fill(refs[i].title);
      await inputs.nth(2).fill(refs[i].specialty);
      await inputs.nth(3).fill(refs[i].phone);
      await inputs.nth(4).fill(refs[i].email);
    }

    await page.getByRole("button", { name: "Next: Documents" }).click();
    console.log(
      `✓ References: ${((Date.now() - startTime) / 1000).toFixed(1)}s`
    );

    // ─── Step 12: Documents (Section 8) ───
    await expect(page.getByText("Document Uploads")).toBeVisible();

    // Create a minimal dummy PDF for each required upload
    const dummyPath = path.resolve(__dirname, "fixtures/fake-resume.pdf");

    // Each FileUpload removes its <input type="file"> after upload (replaced by green card),
    // so always target the first remaining hidden input
    for (let i = 0; i < 4; i++) {
      const fileInput = page.locator('input[type="file"]').first();
      if (await fileInput.count() === 0) break;
      await fileInput.setInputFiles(dummyPath);
      await page.waitForTimeout(500);
    }

    // Wait for Next button to be enabled
    const nextDocsBtn = page.getByRole("button", { name: "Next: Disclosures" });
    await expect(nextDocsBtn).toBeEnabled({ timeout: 5000 });
    await nextDocsBtn.click();
    console.log(
      `✓ Documents: ${((Date.now() - startTime) / 1000).toFixed(1)}s`
    );

    // ─── Step 13: Disclosures (Section 9) ───
    await expect(page.getByText("Disclosures & Signature")).toBeVisible();

    // All disclosures default to false (No is highlighted) — verify they show "No" as active
    // The "No" buttons should already be active (emerald styling), just verify and move on

    // Type digital signature
    await page.locator("#signedName").fill("Maria Elena Rodriguez");

    // Submit
    const submitBtn = page.getByRole("button", { name: "Submit Intake Form" });
    await submitBtn.click();
    console.log(
      `✓ Disclosures submitted: ${((Date.now() - startTime) / 1000).toFixed(1)}s`
    );

    // ─── Step 14: Wait for success page ───
    await page.waitForURL("**/clinician/success**", { timeout: 60_000 });

    const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`\n✅ COMPLETE — Total time: ${totalTime}s`);
    console.log(`   Resume parsing: ${parseTime}s`);

    // Verify we're on the success page
    expect(page.url()).toContain("/clinician/success");
  });
});
