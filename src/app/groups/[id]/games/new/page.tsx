import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AppShell from "@/components/AppShell";

export default async function NewGamePage({
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

  return (
    <AppShell title="Ny kampopstilling" description={group.name}>
      <div className="flex items-center justify-between">
        <Link className="text-sm underline" href={`/groups/${group.id}/games`}>
          Tilbage
        </Link>
        <Link className="text-sm underline" href={`/groups/${group.id}`}>
          Gruppe
        </Link>
      </div>

      <div className="mt-6 rounded-lg border border-zinc-200 p-4">
        <form action={`/groups/${group.id}/games/create`} method="post" className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="date">
                Dato
              </label>
              <input
                id="date"
                name="date"
                type="date"
                className="w-full rounded-md border border-zinc-200 bg-transparent px-3 py-2 text-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="formation">
                Formation
              </label>
              <select
                id="formation"
                name="formation"
                defaultValue="4-3-3"
                className="w-full rounded-md border border-zinc-200 bg-transparent px-3 py-2 text-sm"
              >
                <option value="4-3-3">4-3-3</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="squad_size">
              Spillere på banen
            </label>
            <select
              id="squad_size"
              name="squad_size"
              defaultValue="11"
              className="w-full rounded-md border border-zinc-200 bg-transparent px-3 py-2 text-sm"
            >
              <option value="8">8 (U12, 7+GK)</option>
              <option value="11">11</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="opponent">
              Modstander (valgfri)
            </label>
            <input
              id="opponent"
              name="opponent"
              className="w-full rounded-md border border-zinc-200 bg-transparent px-3 py-2 text-sm"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="location">
              Sted (valgfri)
            </label>
            <input
              id="location"
              name="location"
              className="w-full rounded-md border border-zinc-200 bg-transparent px-3 py-2 text-sm"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="notes">
              Noter (valgfri)
            </label>
            <textarea
              id="notes"
              name="notes"
              rows={4}
              className="w-full rounded-md border border-zinc-200 bg-transparent px-3 py-2 text-sm"
            />
          </div>

          <button className="w-full rounded-md bg-black px-3 py-2 text-sm font-medium text-white">
            Opret og lav opstilling
          </button>
        </form>
      </div>
    </AppShell>
  );
}
