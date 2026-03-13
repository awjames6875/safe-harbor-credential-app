import { TeamMembers } from "@/components/admin/TeamMembers";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
      <TeamMembers />
    </div>
  );
}
