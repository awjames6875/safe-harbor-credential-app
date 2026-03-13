export interface Alert {
  type: "critical" | "warning" | "reminder";
  category: string;
  message: string;
  actionRequired: string;
  dueDate: string | null;
}

interface ClinicianRow {
  id: string;
  first_name: string;
  last_name: string;
  license_expiry: string | null;
  malpractice_end: string | null;
  caqh_last_attest: string | null;
}

interface ClinicRow {
  odmhsas_expiry: string | null;
  malpractice_expiry: string | null;
}

function daysUntil(dateStr: string | null): number | null {
  if (!dateStr) return null;
  const diff = new Date(dateStr).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function checkExpiry(
  name: string,
  category: string,
  dateStr: string | null
): Alert | null {
  const days = daysUntil(dateStr);
  if (days === null) return null;

  if (days < 0) {
    return {
      type: "critical",
      category,
      message: `${name} has EXPIRED`,
      actionRequired: "Renew immediately",
      dueDate: dateStr,
    };
  }
  if (days <= 30) {
    return {
      type: "critical",
      category,
      message: `${name} expires in ${days} days`,
      actionRequired: "Begin renewal process",
      dueDate: dateStr,
    };
  }
  if (days <= 90) {
    return {
      type: "warning",
      category,
      message: `${name} expires in ${days} days`,
      actionRequired: "Plan for renewal",
      dueDate: dateStr,
    };
  }
  return null;
}

interface DocumentRow {
  id: string;
  document_type: string;
  expiry_date: string | null;
  owner_type: string;
}

interface PayerAppRow {
  id: string;
  payer_name: string;
  clinician_name?: string;
  recredentialing_due: string | null;
  status: string;
}

export function calculateAlerts(
  clinicians: ClinicianRow[],
  clinic: ClinicRow | null,
  documents?: DocumentRow[],
  payerApps?: PayerAppRow[]
): Alert[] {
  const alerts: Alert[] = [];

  // Clinic-level alerts
  if (clinic) {
    const odmhsas = checkExpiry("ODMHSAS License", "license", clinic.odmhsas_expiry);
    if (odmhsas) alerts.push(odmhsas);

    const clinicMal = checkExpiry("Clinic Malpractice", "malpractice", clinic.malpractice_expiry);
    if (clinicMal) alerts.push(clinicMal);
  }

  // Clinician-level alerts
  for (const c of clinicians) {
    const fullName = `${c.first_name} ${c.last_name}`;

    const lic = checkExpiry(`${fullName}'s license`, "license", c.license_expiry);
    if (lic) alerts.push(lic);

    const mal = checkExpiry(`${fullName}'s malpractice`, "malpractice", c.malpractice_end);
    if (mal) alerts.push(mal);

    const caqhDays = daysUntil(c.caqh_last_attest);
    if (caqhDays !== null) {
      // CAQH attestation expires after 120 days
      const daysLeft = 120 - (caqhDays < 0 ? Math.abs(caqhDays) : -caqhDays);
      if (daysLeft < 0) {
        alerts.push({
          type: "critical",
          category: "caqh",
          message: `${fullName}'s CAQH attestation has expired`,
          actionRequired: "Re-attest on CAQH ProView",
          dueDate: c.caqh_last_attest,
        });
      } else if (daysLeft <= 30) {
        alerts.push({
          type: "warning",
          category: "caqh",
          message: `${fullName}'s CAQH attestation expires in ${daysLeft} days`,
          actionRequired: "Re-attest on CAQH ProView",
          dueDate: c.caqh_last_attest,
        });
      }
    }
  }

  // Document expiry alerts
  if (documents) {
    for (const doc of documents) {
      if (!doc.expiry_date) continue;
      const docAlert = checkExpiry(
        `${doc.document_type} (${doc.owner_type})`,
        "document",
        doc.expiry_date
      );
      if (docAlert) alerts.push(docAlert);
    }
  }

  // Re-credentialing alerts
  if (payerApps) {
    for (const app of payerApps) {
      if (!app.recredentialing_due) continue;
      if (app.status !== "Approved" && app.status !== "Active") continue;

      const days = daysUntil(app.recredentialing_due);
      if (days === null) continue;

      const label = `${app.payer_name} re-credentialing${app.clinician_name ? ` (${app.clinician_name})` : ""}`;

      if (days < 0) {
        alerts.push({
          type: "critical",
          category: "recredentialing",
          message: `${label} is OVERDUE`,
          actionRequired: "Begin re-credentialing immediately",
          dueDate: app.recredentialing_due,
        });
      } else if (days <= 60) {
        alerts.push({
          type: "critical",
          category: "recredentialing",
          message: `${label} due in ${days} days`,
          actionRequired: "Begin re-credentialing process",
          dueDate: app.recredentialing_due,
        });
      } else if (days <= 180) {
        alerts.push({
          type: "warning",
          category: "recredentialing",
          message: `${label} due in ${days} days`,
          actionRequired: "Plan for re-credentialing",
          dueDate: app.recredentialing_due,
        });
      }
    }
  }

  // Sort: critical first, then warning, then reminder
  const priority = { critical: 0, warning: 1, reminder: 2 };
  alerts.sort((a, b) => priority[a.type] - priority[b.type]);

  return alerts;
}
