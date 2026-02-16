import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import AppShell from "@/components/AppShell";
import CreateGroupForm from "@/app/groups/CreateGroupForm";

export default async function GroupsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const sp = await searchParams;
  const supabase = await createClient();

  const { data: groups, error } = await supabase
    .from("groups")
    .select("id,name,created_at")
    .order("created_at", { ascending: false });

  return (
    <AppShell title="Grupper" description="Opret en gruppe og del kampnoter.">
      {sp.error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {sp.error}
        </div>
      ) : null}
      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error.message}
        </div>
      ) : null}

      <div className="rounded-lg border border-zinc-200 p-4">
        <CreateGroupForm />
      </div>

      <div className="mt-6 grid gap-3">
        {(groups ?? []).map((g) => (
          <Link
            key={g.id}
            href={`/groups/${g.id}`}
            className="rounded-lg border border-zinc-200 p-4 hover:bg-zinc-50"
          >
            <div className="font-medium">{g.name}</div>
            <div className="text-xs text-zinc-500">{g.created_at}</div>
          </Link>
        ))}

        {groups && groups.length === 0 ? (
          <div className="rounded-lg border border-zinc-200 p-4 text-sm text-zinc-600">
            Ingen grupper endnu.
          </div>
        ) : null}
      </div>
    </AppShell>
  );
}
