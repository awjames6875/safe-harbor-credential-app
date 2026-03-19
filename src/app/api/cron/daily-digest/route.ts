import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { calculateAlerts } from "@/lib/alerts";
import { sendDailyDigest } from "@/lib/email";

export async function GET(request: NextRequest) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = await createClient();

    // Fetch clinicians
    const { data: clinicians } = await supabase
      .from("clinicians")
      .select("id, first_name, last_name, license_expiry, malpractice_end, caqh_last_attest");

    // Fetch clinic
    const { data: clinicRows } = await supabase
      .from("clinic")
      .select("odmhsas_expiry, malpractice_expiry")
      .limit(1);

    // Fetch documents
    const { data: documents } = await supabase
      .from("documents")
      .select("id, document_type, expiry_date, owner_type");

    const clinic = clinicRows?.[0] ?? null;
    const alerts = calculateAlerts(clinicians ?? [], clinic, documents ?? []);
    const criticalAlerts = alerts.filter((a) => a.type === "critical");

    if (criticalAlerts.length > 0) {
      await sendDailyDigest(alerts);
    }

    return NextResponse.json({
      success: true,
      totalAlerts: alerts.length,
      criticalAlerts: criticalAlerts.length,
      emailSent: criticalAlerts.length > 0,
    });
  } catch (error) {
    console.error("Daily digest cron error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
