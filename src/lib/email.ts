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
