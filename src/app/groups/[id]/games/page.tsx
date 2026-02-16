import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AppShell from "@/components/AppShell";

export default async function GamesPage({
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

  const { data: games, error } = await supabase
    .from("games")
    .select("id,date,opponent,location,formation,squad_size,created_at")
    .eq("group_id", id)
    .order("date", { ascending: false })
    .order("created_at", { ascending: false });

  return (
    <AppShell title={`${group.name} — Opstilling`} description="Kamptrup og positioner på banen.">
      <div className="flex items-center justify-between gap-4">
        <Link className="text-sm underline" href={`/groups/${group.id}`}>
          Tilbage
        </Link>
        <Link
          className="inline-flex rounded-md bg-black px-3 py-2 text-sm font-medium text-white"
          href={`/groups/${group.id}/games/new`}
        >
          Ny kampopstilling
        </Link>
      </div>

      {error ? (
        <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error.message}
        </div>
      ) : null}

      <div className="mt-6 grid gap-3">
        {(games ?? []).map((g) => (
          <Link
            key={g.id}
            href={`/groups/${group.id}/games/${g.id}`}
            className="rounded-lg border border-zinc-200 p-4 hover:bg-zinc-50"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="font-medium">
                  {g.opponent ? `Mod ${g.opponent}` : "Kamp"}
                </div>
                <div className="text-sm text-zinc-600">{g.date}</div>
              </div>
              <div className="shrink-0 text-xs text-zinc-500">
                {(g.squad_size ?? 11) === 8 ? "8" : "11"} • {g.formation ?? "4-3-3"}
              </div>
            </div>
            {g.location ? (
              <div className="mt-2 text-sm text-zinc-700">{g.location}</div>
            ) : null}
          </Link>
        ))}

        {games && games.length === 0 ? (
          <div className="rounded-lg border border-zinc-200 p-4 text-sm text-zinc-600">
            Ingen kampopstillinger endnu.
          </div>
        ) : null}
      </div>
    </AppShell>
  );
}
