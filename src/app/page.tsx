import Link from "next/link";
import {
  ArrowRight,
  ChevronRight,
  ListChecks,
  BarChart3,
  Bell,
  FileDown,
  ClipboardList,
  FileText,
} from "lucide-react";

const fontStyle = `
  @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;0,9..144,600;1,9..144,400&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap');
`;

const phases = [
  { num: "01", label: "Foundation", color: "#0d9488" },
  { num: "02", label: "OK Medicaid", color: "#0891b2" },
  { num: "03", label: "Commercial", color: "#7c3aed" },
  { num: "04", label: "Get Paid", color: "#16a34a" },
];

const steps = [
  {
    num: "1",
    Icon: ClipboardList,
    title: "Clinician Fills Intake",
    desc: "Share one link. Clinicians complete 9 sections — basic info, license, malpractice, work history, education, and more. Works on any device.",
  },
  {
    num: "2",
    Icon: FileText,
    title: "AI Pre-Fills CAQH",
    desc: "Upload a resume. Claude AI extracts work history, education, and licenses in seconds. A personalized CAQH cheat sheet auto-generates.",
  },
  {
    num: "3",
    Icon: BarChart3,
    title: "Track Every Payer",
    desc: "Follow each application from submission to approval. Get alerts before credentials expire. Never miss a follow-up deadline again.",
  },
];

const features = [
  {
    Icon: ListChecks,
    title: "18-Step Guide",
    desc: "4 phases, 18 numbered steps — each with exact URLs, field instructions, phone scripts, and trap warnings. A 5th grader can follow it.",
    color: "#0d9488",
  },
  {
    Icon: BarChart3,
    title: "Payer Tracker",
    desc: "Every payer × every clinician in one table. Status, follow-up dates, confirmation numbers, and notes — all in one place.",
    color: "#0891b2",
  },
  {
    Icon: Bell,
    title: "Smart Alerts",
    desc: "Automatic warnings for expiring licenses, malpractice, CAQH attestation, and re-credentialing deadlines. Nothing falls through.",
    color: "#d97706",
  },
  {
    Icon: FileDown,
    title: "CAQH PDF Generator",
    desc: "After intake submission, a CAQH cheat sheet auto-generates with answers mapped to ProView fields. Cuts setup from 45 min to 10.",
    color: "#7c3aed",
  },
];

const stats = [
  { value: "8", label: "Payers covered" },
  { value: "18", label: "Guided steps" },
  { value: "< 20 min", label: "Clinician intake" },
  { value: "0", label: "Missed deadlines" },
];

export default function LandingPage() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: fontStyle }} />
      <div
        style={{ fontFamily: "'DM Sans', sans-serif" }}
        className="min-h-screen bg-stone-50 text-slate-800"
      >
        {/* Nav */}
        <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-sm border-b border-slate-200">
          <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-teal-600" />
              <span className="text-sm font-medium text-slate-700 tracking-tight">
                Safe Harbor Behavioral Health
              </span>
            </div>

          </div>
        </nav>

        {/* Hero */}
        <section className="max-w-6xl mx-auto px-6 pt-16 pb-14">
          {/* Phase pills */}
          <div className="flex flex-wrap gap-2 mb-10">
            {phases.map((p) => (
              <span
                key={p.num}
                className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full border"
                style={{
                  borderColor: p.color + "50",
                  backgroundColor: p.color + "12",
                  color: p.color,
                }}
              >
                <span style={{ opacity: 0.55 }}>{p.num}</span>
                {p.label}
              </span>
            ))}
          </div>

          <div className="max-w-3xl">
            <h1
              style={{ fontFamily: "'Fraunces', serif", lineHeight: 1.15 }}
              className="text-5xl md:text-6xl font-semibold text-slate-900 mb-6"
            >
              Insurance credentialing,{" "}
              <em className="not-italic text-teal-600">step by step.</em>
            </h1>
            <p className="text-xl text-slate-500 leading-relaxed mb-10 max-w-xl">
              The complete credentialing command center for Safe Harbor
              Behavioral Health. From NPI to first payment — no insurance
              knowledge required.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 bg-teal-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-teal-700 transition-colors text-sm"
              >
                Admin Dashboard
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/clinician"
                className="inline-flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-6 py-3 rounded-lg font-medium hover:border-teal-300 hover:text-teal-600 transition-colors text-sm"
              >
                Clinician Portal
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16 pt-16 border-t border-slate-200">
            {stats.map((s) => (
              <div key={s.label}>
                <div
                  style={{ fontFamily: "'Fraunces', serif" }}
                  className="text-3xl font-semibold text-teal-600"
                >
                  {s.value}
                </div>
                <div className="text-sm text-slate-500 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section className="bg-white border-y border-slate-200">
          <div className="max-w-6xl mx-auto px-6 py-16">
            <p className="text-xs font-semibold tracking-widest text-teal-600 uppercase mb-2">
              How it works
            </p>
            <h2
              style={{ fontFamily: "'Fraunces', serif" }}
              className="text-3xl font-semibold text-slate-900 mb-12"
            >
              Three steps to credentialed
            </h2>
            <div className="grid md:grid-cols-3 gap-10">
              {steps.map((step, i) => (
                <div key={i} className="relative">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-9 h-9 rounded-full bg-teal-600 text-white flex items-center justify-center text-sm font-semibold shrink-0">
                      {step.num}
                    </div>
                    {i < steps.length - 1 && (
                      <div className="hidden md:block flex-1 h-px bg-slate-200" />
                    )}
                  </div>
                  <step.Icon className="w-5 h-5 text-teal-500 mb-3" />
                  <h3 className="font-semibold text-slate-900 mb-2">
                    {step.title}
                  </h3>
                  <p className="text-sm text-slate-500 leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="max-w-6xl mx-auto px-6 py-16">
          <p className="text-xs font-semibold tracking-widest text-teal-600 uppercase mb-2">
            Features
          </p>
          <h2
            style={{ fontFamily: "'Fraunces', serif" }}
            className="text-3xl font-semibold text-slate-900 mb-12"
          >
            Everything you need, nothing you don&apos;t
          </h2>
          <div className="grid md:grid-cols-2 gap-5">
            {features.map((f, i) => (
              <div
                key={i}
                className="bg-white border border-slate-200 rounded-xl p-6 hover:border-slate-300 hover:shadow-sm transition-all"
              >
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center mb-4"
                  style={{ backgroundColor: f.color + "18" }}
                >
                  <f.Icon className="w-5 h-5" style={{ color: f.color }} />
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">{f.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA band */}
        <section className="bg-teal-600">
          <div className="max-w-6xl mx-auto px-6 py-14 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <h2
                style={{ fontFamily: "'Fraunces', serif" }}
                className="text-2xl font-semibold text-white mb-1"
              >
                Ready to start credentialing?
              </h2>
              <p className="text-teal-100 text-sm">
                Log in to the dashboard or share the clinician intake link.
              </p>
            </div>
            <div className="flex gap-3 shrink-0">
              <Link
                href="/login"
                className="bg-white text-teal-700 font-medium px-5 py-2.5 rounded-lg text-sm hover:bg-teal-50 transition-colors"
              >
                Admin Login
              </Link>
              <Link
                href="/clinician"
                className="border border-teal-400/60 text-white font-medium px-5 py-2.5 rounded-lg text-sm hover:bg-teal-700 transition-colors"
              >
                Clinician Portal
              </Link>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-white border-t border-slate-200">
          <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-slate-400">
            <div className="flex items-center gap-2">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-teal-500" />
              <span>Safe Harbor Behavioral Health · Tulsa, OK</span>
            </div>
            <span>ajames@safeharborbehavioralhealth.com</span>
          </div>
        </footer>
      </div>
    </>
  );
}
