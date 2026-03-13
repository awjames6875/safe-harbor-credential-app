"use client";

import { useEffect, useState } from "react";

interface TeamMember {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string | null;
}

export function TeamMembers() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState("");
  const [isInviting, setIsInviting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchMembers = async () => {
    try {
      const response = await fetch("/api/admin/team");
      if (!response.ok) throw new Error("Failed to fetch team members");
      const data = await response.json();
      setMembers(data);
    } catch {
      setMessage({ type: "error", text: "Failed to load team members" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;

    setIsInviting(true);
    setMessage(null);

    try {
      const response = await fetch("/api/admin/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: inviteEmail.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to send invite");
      }

      setMessage({ type: "success", text: `Invite sent to ${inviteEmail}` });
      setInviteEmail("");
      fetchMembers();
    } catch (err) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Failed to send invite" });
    } finally {
      setIsInviting(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Never";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      {/* Team Members List */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200">
          <h3 className="text-sm font-semibold text-slate-900">Team Members</h3>
        </div>

        {isLoading ? (
          <div className="px-6 py-8 text-center text-sm text-slate-500">Loading...</div>
        ) : members.length === 0 ? (
          <div className="px-6 py-8 text-center text-sm text-slate-500">No team members found</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {members.map((member) => (
              <div key={member.id} className="px-6 py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-900">{member.email}</p>
                  <p className="text-xs text-slate-500">
                    Joined {formatDate(member.created_at)}
                  </p>
                </div>
                <div className="text-xs text-slate-500">
                  Last sign in: {formatDate(member.last_sign_in_at)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Invite Form */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h3 className="text-sm font-semibold text-slate-900 mb-4">Invite New Member</h3>

        {message && (
          <div
            className={`mb-4 px-4 py-2 rounded-lg text-sm ${
              message.type === "success"
                ? "bg-green-50 text-green-700 border border-green-200"
                : "bg-red-50 text-red-700 border border-red-200"
            }`}
          >
            {message.text}
          </div>
        )}

        <form onSubmit={handleInvite} className="flex gap-3">
          <input
            type="email"
            placeholder="colleague@example.com"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            className="flex-1 px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
          <button
            type="submit"
            disabled={isInviting}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isInviting ? "Sending..." : "Send Invite"}
          </button>
        </form>
      </div>
    </div>
  );
}
