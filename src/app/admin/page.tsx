import AppShell from "@/components/AppShell";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import AdminClient from "@/app/admin/AdminClient";

export default async function AdminPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("is_system_admin")
    .eq("id", user.id)
    .maybeSingle();

  if (error) {
    return (
      <AppShell title="Admin" description="">
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error.message}
        </div>
      </AppShell>
    );
  }

  if (!profile?.is_system_admin) {
    return (
      <AppShell title="Admin" description="">
        <div className="rounded-lg border border-zinc-200 p-4 text-sm text-zinc-700">
          Ikke adgang.
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell title="Admin" description="System administration">
      <AdminClient />
    </AppShell>
  );
}
