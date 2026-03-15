"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ClinicianLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetMode, setResetMode] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const router = useRouter();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push("/clinician");
      router.refresh();
    }
  }

  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + "/reset-password",
    });

    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      setResetSent(true);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-10 h-10 bg-teal-600 rounded-lg mb-3">
            <span className="text-white font-bold text-sm">SH</span>
          </div>
          <h1 className="text-2xl font-semibold text-slate-900">
            Safe Harbor Behavioral Health
          </h1>
          <p className="text-sm text-slate-500 mt-1">Clinician Portal</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              {resetMode ? "Reset Password" : "Sign In"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {resetSent ? (
              <div className="space-y-4">
                <div className="rounded-md bg-emerald-50 p-3 text-sm text-emerald-700">
                  Check your email for a password reset link.
                </div>
                <button
                  type="button"
                  onClick={() => { setResetMode(false); setResetSent(false); }}
                  className="text-sm text-slate-500 hover:text-slate-700 underline"
                >
                  Back to sign in
                </button>
              </div>
            ) : resetMode ? (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                  />
                </div>

                {error && (
                  <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</div>
                )}

                <Button type="submit" className="w-full bg-teal-600 hover:bg-teal-700" disabled={loading}>
                  {loading ? "Sending..." : "Send Reset Email"}
                </Button>

                <button
                  type="button"
                  onClick={() => { setResetMode(false); setError(""); }}
                  className="text-sm text-slate-500 hover:text-slate-700 underline w-full text-center"
                >
                  Back to sign in
                </button>
              </form>
            ) : (
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    <button
                      type="button"
                      onClick={() => { setResetMode(true); setError(""); }}
                      className="text-xs text-slate-400 hover:text-teal-600 underline"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>

                {error && (
                  <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</div>
                )}

                <Button type="submit" className="w-full bg-teal-600 hover:bg-teal-700" disabled={loading}>
                  {loading ? "Signing in..." : "Sign In"}
                </Button>
              </form>
            )}

            {!resetMode && !resetSent && (
              <p className="text-xs text-slate-400 text-center mt-4">
                Your login was sent by Safe Harbor Behavioral Health. Contact{" "}
                <a href="mailto:ajames@safeharborbehavioralhealth.com" className="underline">
                  ajames@safeharborbehavioralhealth.com
                </a>{" "}
                if you need access.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
