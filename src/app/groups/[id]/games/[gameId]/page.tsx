import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AppShell from "@/components/AppShell";
import RosterPitch from "@/components/RosterPitch";

export default async function GameDetailPage({
  params,
}: {
  params: Promise<{ id: string; gameId: string }>;
}) {
  const { id: groupId, gameId } = await params;
  const supabase = await createClient();

  const { data: group } = await supabase
    .from("groups")
    .select("id,name")
    .eq("id", groupId)
    .maybeSingle();

  if (!group) {
    notFound();
  }

  const { data: game } = await supabase
    .from("games")
    .select("id,date,opponent,location,formation,squad_size,notes")
    .eq("id", gameId)
    .eq("group_id", groupId)
    .maybeSingle();

  if (!game) {
    notFound();
  }

  const { data: members } = await supabase
    .from("group_members")
    .select("user_id,profiles ( name, email )")
    .eq("group_id", groupId)
    .order("created_at", { ascending: true });

  const { data: rosterEntries } = await supabase
    .from("game_roster_entries")
    .select("id,position_code,x,y,user_id,guest_name,shirt_number")
    .eq("game_id", gameId);

  const title = game.opponent ? `Mod ${game.opponent}` : "Kamp";

  return (
    <AppShell
      title={title}
      description={`${group.name} • ${game.date} • ${(game.squad_size ?? 11) === 8 ? "8" : "11"} • ${game.formation ?? "4-3-3"}`}
    >
      <div className="flex items-center justify-between gap-4">
        <Link className="text-sm underline" href={`/groups/${group.id}/games`}>
          Tilbage
        </Link>
        <Link className="text-sm underline" href={`/groups/${group.id}`}>
          Gruppe
        </Link>
      </div>

      {game.notes ? (
        <div className="mt-6 rounded-lg border border-zinc-200 p-4 whitespace-pre-line text-sm text-zinc-700">
          {game.notes}
        </div>
      ) : null}

      <div className="mt-6">
        <RosterPitch
          groupId={groupId}
          gameId={gameId}
          squadSize={(game.squad_size ?? 11) as any}
          members={(members ?? []) as any}
          initialEntries={(rosterEntries ?? []) as any}
        />
      </div>
    </AppShell>
  );
}
