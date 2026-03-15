"use client";

import { useState } from "react";
import { UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function InviteUserButton() {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const res = await fetch("/api/admin/invite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    const result = await res.json();
    setLoading(false);

    if (res.ok) {
      setMessage({ type: "success", text: `Invite sent to ${email}` });
      setEmail("");
      setTimeout(() => { setOpen(false); setMessage(null); }, 3000);
    } else {
      setMessage({ type: "error", text: result.error || "Failed to send invite." });
    }
  }

  if (!open) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5"
      >
        <UserPlus className="w-4 h-4" />
        Invite User
      </Button>
    );
  }

  return (
    <form onSubmit={handleInvite} className="flex items-center gap-2">
      <Input
        type="email"
        placeholder="colleague@email.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-56 h-9 text-sm"
        required
        autoFocus
      />
      <Button type="submit" size="sm" disabled={loading}>
        {loading ? "Sending..." : "Send Invite"}
      </Button>
      <button
        type="button"
        onClick={() => { setOpen(false); setMessage(null); }}
        className="text-sm text-slate-400 hover:text-slate-600"
      >
        Cancel
      </button>
      {message && (
        <span className={`text-sm ${message.type === "success" ? "text-emerald-600" : "text-red-600"}`}>
          {message.text}
        </span>
      )}
    </form>
  );
}
