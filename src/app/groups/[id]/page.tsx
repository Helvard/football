import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AppShell from "@/components/AppShell";

export default async function GroupDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: group, error: groupError } = await supabase
    .from("groups")
    .select("id,name")
    .eq("id", id)
    .maybeSingle();

  if (groupError) {
    return (
      <AppShell title="Gruppe" description="">
        <div className="space-y-4">
          <Link className="text-sm underline" href="/groups">
            Tilbage
          </Link>
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {groupError.message}
          </div>
        </div>
      </AppShell>
    );
  }

  if (!group) {
    notFound();
  }

  const { data: members } = await supabase
    .from("group_members")
    .select("user_id,role,profiles ( name, email )")
    .eq("group_id", id)
    .order("created_at", { ascending: true });

  const { data: feed } = await supabase
    .from("match_report_shared_groups")
    .select(
      "group_id, match_reports ( id, date, opponent, score_for, score_against, notes, author_user_id )"
    )
    .eq("group_id", id)
    .order("match_reports(date)", { ascending: false });

  return (
    <AppShell title={group.name} description="Kampfeed (delte kampnoter)">
      <div className="space-y-8">
        <div className="flex items-center justify-between gap-4">
          <Link className="text-sm underline" href="/groups">
            Tilbage
          </Link>
          <div className="flex gap-3 text-sm">
            <Link className="underline" href={`/groups/${group.id}/practice`}>
              Træning
            </Link>
            <Link className="underline" href={`/groups/${group.id}/games`}>
              Opstilling
            </Link>
            <Link className="underline" href="/match/new">
              Ny kamp
            </Link>
          </div>
        </div>

        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Medlemmer</h2>
            <Link className="text-sm underline" href={`/groups/${group.id}/add-member`}>
              Tilføj medlem
            </Link>
          </div>

          <div className="rounded-lg border border-zinc-200">
            <div className="divide-y divide-zinc-200">
              {(members ?? []).map((m) => (
                <div key={m.user_id} className="flex items-center justify-between p-3">
                  <div className="space-y-0.5">
                    <div className="font-medium">{(m as any).profiles?.name ?? "(uden navn)"}</div>
                    <div className="text-xs text-zinc-600">{(m as any).profiles?.email ?? m.user_id}</div>
                  </div>
                  <div className="text-xs text-zinc-500">{m.role}</div>
                </div>
              ))}

              {members && members.length === 0 ? (
                <div className="p-3 text-sm text-zinc-600">Ingen medlemmer.</div>
              ) : null}
            </div>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Kampfeed</h2>

          <div className="grid gap-3">
            {(feed ?? []).map((row: any) => {
              const mr = row.match_reports;
              if (!mr) return null;

              return (
                <div key={mr.id} className="rounded-lg border border-zinc-200 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="font-medium">
                        {mr.opponent ? `Mod ${mr.opponent}` : "Kamp"}
                      </div>
                      <div className="text-sm text-zinc-600">{mr.date}</div>
                    </div>
                    {mr.score_for !== null && mr.score_against !== null ? (
                      <div className="shrink-0 rounded-full border border-zinc-200 px-2 py-1 text-xs">
                        {mr.score_for}-{mr.score_against}
                      </div>
                    ) : null}
                  </div>
                  <div className="mt-2 whitespace-pre-line text-sm text-zinc-700">{mr.notes}</div>
                </div>
              );
            })}

            {feed && feed.length === 0 ? (
              <div className="rounded-lg border border-zinc-200 p-4 text-sm text-zinc-600">
                Ingen delte kampnoter endnu.
              </div>
            ) : null}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
