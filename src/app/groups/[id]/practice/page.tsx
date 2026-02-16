import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AppShell from "@/components/AppShell";

export default async function PracticeSessionsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: group } = await supabase
    .from("groups")
    .select("id,name")
    .eq("id", id)
    .maybeSingle();

  if (!group) {
    notFound();
  }

  const { data: sessions, error } = await supabase
    .from("practice_sessions")
    .select("id,title,date,notes,created_at")
    .eq("group_id", id)
    .order("date", { ascending: false })
    .order("created_at", { ascending: false });

  return (
    <AppShell title={`${group.name} — Træning`} description="Træningspas oprettet af coach/stab.">
      <div className="flex items-center justify-between gap-4">
        <Link className="text-sm underline" href={`/groups/${group.id}`}>
          Tilbage
        </Link>
        <Link
          className="inline-flex rounded-md bg-black px-3 py-2 text-sm font-medium text-white"
          href={`/groups/${group.id}/practice/new`}
        >
          Nyt træningspas
        </Link>
      </div>

      {error ? (
        <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error.message}
        </div>
      ) : null}

      <div className="mt-6 grid gap-3">
        {(sessions ?? []).map((s) => (
          <Link
            key={s.id}
            href={`/groups/${group.id}/practice/${s.id}`}
            className="rounded-lg border border-zinc-200 p-4 hover:bg-zinc-50"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="font-medium">{s.title}</div>
                <div className="text-sm text-zinc-600">{s.date}</div>
              </div>
            </div>
            {s.notes ? (
              <div className="mt-2 line-clamp-3 whitespace-pre-line text-sm text-zinc-700">
                {s.notes}
              </div>
            ) : null}
          </Link>
        ))}

        {sessions && sessions.length === 0 ? (
          <div className="rounded-lg border border-zinc-200 p-4 text-sm text-zinc-600">
            Ingen træningspas endnu.
          </div>
        ) : null}
      </div>
    </AppShell>
  );
}
