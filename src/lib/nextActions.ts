import { Alert } from "./alerts";

export interface NextAction {
  priority: "high" | "medium" | "low";
  label: string;
  detail: string;
}

interface PayerAppRow {
  status: string;
  follow_up_date: string | null;
  date_submitted: string | null;
  clinician_name: string;
}

interface ClinicianRow {
  id: string;
  first_name: string;
  last_name: string;
}

export function calculateNextActions(
  alerts: Alert[],
  payerApps: PayerAppRow[],
  clinicians: ClinicianRow[]
): NextAction[] {
  const actions: NextAction[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // 1. HIGH: Overdue follow-ups
  const terminalStatuses = ["Approved", "Active", "Denied"];
  const overdueFollowUps = payerApps.filter((app) => {
    if (!app.follow_up_date) return false;
    if (terminalStatuses.includes(app.status)) return false;
    return new Date(app.follow_up_date) < today;
  });
  if (overdueFollowUps.length > 0) {
    actions.push({
      priority: "high",
      label: `${overdueFollowUps.length} overdue follow-up${overdueFollowUps.length > 1 ? "s" : ""}`,
      detail: overdueFollowUps.slice(0, 2).map((a) => a.clinician_name).join(", "),
    });
  }

  // 2. HIGH: Critical alerts
  const criticalCount = alerts.filter((a) => a.type === "critical").length;
  if (criticalCount > 0) {
    actions.push({
      priority: "high",
      label: `Address ${criticalCount} critical alert${criticalCount > 1 ? "s" : ""}`,
      detail: "Expired or expiring credentials",
    });
  }

  // 3. MEDIUM: Payer apps stuck 30+ days in Submitted/In Progress
  const stuckApps = payerApps.filter((app) => {
    if (app.status !== "Submitted" && app.status !== "In Progress") return false;
    if (!app.date_submitted) return false;
    const submitted = new Date(app.date_submitted);
    const daysSince = Math.floor((today.getTime() - submitted.getTime()) / (1000 * 60 * 60 * 24));
    return daysSince >= 30;
  });
  if (stuckApps.length > 0) {
    actions.push({
      priority: "medium",
      label: `${stuckApps.length} app${stuckApps.length > 1 ? "s" : ""} stuck 30+ days`,
      detail: "Follow up with payers on pending applications",
    });
  }

  // 4. MEDIUM: Clinicians without any payer applications
  const clinicianIdsWithApps = new Set(
    payerApps.map((a) => {
      // clinician_name is "First Last", match against clinicians
      return a.clinician_name;
    })
  );
  const cliniciansWithoutApps = clinicians.filter(
    (c) => !clinicianIdsWithApps.has(`${c.first_name} ${c.last_name}`)
  );
  if (cliniciansWithoutApps.length > 0) {
    actions.push({
      priority: "medium",
      label: `${cliniciansWithoutApps.length} clinician${cliniciansWithoutApps.length > 1 ? "s" : ""} without payer apps`,
      detail: cliniciansWithoutApps.slice(0, 2).map((c) => `${c.first_name} ${c.last_name}`).join(", "),
    });
  }

  // 5. LOW: Warning alerts → upcoming renewals
  const warningCount = alerts.filter((a) => a.type === "warning").length;
  if (warningCount > 0) {
    actions.push({
      priority: "low",
      label: "Plan for upcoming renewals",
      detail: `${warningCount} credential${warningCount > 1 ? "s" : ""} expiring soon`,
    });
  }

  return actions.slice(0, 3);
}
