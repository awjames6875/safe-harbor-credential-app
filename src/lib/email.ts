import sgMail from "@sendgrid/mail";
import { Alert } from "@/lib/alerts";

const FROM_EMAIL = "ajames@safeharborbehavioralhealth.com";

function initSendGrid(): boolean {
  const apiKey = process.env.SENDGRID_API_KEY;
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!apiKey || !adminEmail) {
    console.warn("Email not configured: SENDGRID_API_KEY or ADMIN_EMAIL missing");
    return false;
  }
  sgMail.setApiKey(apiKey);
  return true;
}

export async function sendSubmissionNotification(clinicianName: string) {
  if (!initSendGrid()) return;

  await sgMail.send({
    from: FROM_EMAIL,
    to: process.env.ADMIN_EMAIL!,
    subject: `New Clinician Intake: ${clinicianName}`,
    text: `A new clinician intake form has been submitted by ${clinicianName}.\n\nLog in to the admin dashboard to review their information and begin the credentialing process.\n\n— Safe Harbor Credentialing System`,
  });
}

export async function sendWelcomeEmail(toEmail: string): Promise<void> {
  if (!initSendGrid()) return;

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://safe-harbor-credential-app.vercel.app";

  const body = [
    "Welcome to Safe Harbor Behavioral Health - Credentialing Portal",
    "================================================================",
    "",
    "You have been invited to access the Safe Harbor credentialing management system.",
    "",
    "GETTING STARTED",
    "---------------",
    "Step 1: Check your inbox for a separate email with a link to set your password.",
    "        (It may be in your spam folder - subject: You have been invited)",
    "",
    "Step 2: Click that link and create your password.",
    "",
    "Step 3: Log in at one of these links:",
    "        - Admin staff:  " + appUrl + "/login",
    "        - Clinicians:   " + appUrl + "/clinician/login",
    "",
    "WHAT YOU CAN DO",
    "---------------",
    "- Clinicians: Complete your intake form so our team can begin the",
    "  credentialing process with insurance payers on your behalf.",
    "",
    "- Admin staff: Track payer applications, manage clinician profiles,",
    "  set follow-up reminders, and monitor credential expiry dates.",
    "",
    "QUESTIONS?",
    "----------",
    "Contact Ashley James at ajames@safeharborbehavioralhealth.com",
    "",
    "- Safe Harbor Behavioral Health Credentialing System",
  ].join("\n");

  await sgMail.send({
    from: FROM_EMAIL,
    to: toEmail,
    subject: "Welcome to Safe Harbor Behavioral Health - Credentialing Portal",
    text: body,
  });
}

export async function sendDailyDigest(alerts: Alert[]): Promise<void> {
  if (!initSendGrid()) return;

  const criticalAlerts = alerts.filter((a) => a.type === "critical");
  const warningAlerts = alerts.filter((a) => a.type === "warning");
  const criticalCount = criticalAlerts.length;

  const formatAlert = (a: Alert) =>
    `  - [${a.type.toUpperCase()}] ${a.message}\n    Action: ${a.actionRequired}${a.dueDate ? `\n    Due: ${a.dueDate}` : ""}`;

  let body = `Safe Harbor Credentialing — Daily Alert Digest\n`;
  body += `================================================\n\n`;
  body += `Summary: ${criticalCount} critical, ${warningAlerts.length} warning\n\n`;

  if (criticalAlerts.length > 0) {
    body += `CRITICAL ALERTS:\n`;
    body += criticalAlerts.map(formatAlert).join("\n\n");
    body += "\n\n";
  }

  if (warningAlerts.length > 0) {
    body += `WARNINGS:\n`;
    body += warningAlerts.map(formatAlert).join("\n\n");
    body += "\n\n";
  }

  body += `— Safe Harbor Credentialing System`;

  await sgMail.send({
    from: FROM_EMAIL,
    to: process.env.ADMIN_EMAIL!,
    subject: `Safe Harbor: ${criticalCount} Critical Alert(s) - Daily Digest`,
    text: body,
  });
}
