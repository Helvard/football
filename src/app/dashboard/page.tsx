import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AppShell from "@/components/AppShell";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <AppShell title="Konto">
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="rounded-lg border border-zinc-200 p-4">
          <p className="text-sm text-zinc-600">Logget ind som</p>
          <p className="font-medium">{user.email}</p>
        </div>

        <form action="/auth/logout" method="post">
          <button className="rounded-md bg-black px-3 py-2 text-sm font-medium text-white">
            Log ud
          </button>
        </form>

        <p className="text-sm text-zinc-600">
          <Link className="underline" href="/">
            Til forsiden
          </Link>
        </p>
      </div>
    </AppShell>
  );
}
