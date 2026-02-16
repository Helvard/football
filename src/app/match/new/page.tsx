import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import AppShell from "@/components/AppShell";

export default async function NewMatchPage() {
  const supabase = await createClient();

  const { data: groups } = await supabase
    .from("groups")
    .select("id,name")
    .order("created_at", { ascending: false });

  return (
    <AppShell
      title="Ny kamp"
      description="Kampnoter er private som standard. Vælg grupper for at dele."
    >
      <div className="flex items-center justify-end">
        <Link className="text-sm underline" href="/groups">
          Grupper
        </Link>
      </div>

      <div className="mt-6 rounded-lg border border-zinc-200 p-4">
        <form action="/match/create" method="post" className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="opponent">
                Modstander
              </label>
              <input
                id="opponent"
                name="opponent"
                className="w-full rounded-md border border-zinc-200 bg-transparent px-3 py-2 text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="score_for">
                  Mål for
                </label>
                <input
                  id="score_for"
                  name="score_for"
                  inputMode="numeric"
                  className="w-full rounded-md border border-zinc-200 bg-transparent px-3 py-2 text-sm"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="score_against">
                  Mål imod
                </label>
                <input
                  id="score_against"
                  name="score_against"
                  inputMode="numeric"
                  className="w-full rounded-md border border-zinc-200 bg-transparent px-3 py-2 text-sm"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="notes">
                Noter
              </label>
              <textarea
                id="notes"
                name="notes"
                rows={6}
                required
                className="w-full rounded-md border border-zinc-200 bg-transparent px-3 py-2 text-sm"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Del med grupper (valgfrit)</label>
              <div className="grid gap-2">
                {(groups ?? []).map((g) => (
                  <label key={g.id} className="flex items-center gap-2 text-sm">
                    <input type="checkbox" name="group_ids" value={g.id} />
                    <span>{g.name}</span>
                  </label>
                ))}
                {groups && groups.length === 0 ? (
                  <p className="text-sm text-zinc-600">Du har ingen grupper endnu.</p>
                ) : null}
              </div>
            </div>

            <button className="w-full rounded-md bg-black px-3 py-2 text-sm font-medium text-white">
              Gem kamp
            </button>
        </form>
      </div>
    </AppShell>
  );
}
