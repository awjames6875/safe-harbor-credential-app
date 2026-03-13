import { requireUser } from "@/lib/auth";
import { Sidebar } from "@/components/admin/Sidebar";
import { Header } from "@/components/admin/Header";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />
      <div className="md:pl-64">
        <Header email={user.email ?? ""} />
        <main className="p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
