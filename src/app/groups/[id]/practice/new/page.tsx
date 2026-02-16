import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AppShell from "@/components/AppShell";

export default async function NewPracticeSessionPage({
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

  const { data: exercises } = await supabase
    .from("exercises")
    .select("id,title,category")
    .order("title", { ascending: true });

  return (
    <AppShell title="Nyt træningspas" description={group.name}>
      <div className="flex items-center justify-between">
        <Link className="text-sm underline" href={`/groups/${group.id}/practice`}>
          Tilbage
        </Link>
        <Link className="text-sm underline" href={`/groups/${group.id}`}>
          Gruppe
        </Link>
      </div>

      <div className="mt-6 rounded-lg border border-zinc-200 p-4">
        <form action={`/groups/${group.id}/practice/create`} method="post" className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="title">
                Titel
              </label>
              <input
                id="title"
                name="title"
                required
                className="w-full rounded-md border border-zinc-200 bg-transparent px-3 py-2 text-sm"
                placeholder="Fx Tirsdagstræning"
              />
            </div>
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

          <div className="space-y-2">
            <div className="font-medium">Øvelser</div>
            <p className="text-sm text-zinc-600">
              Vælg øvelser og angiv rækkefølge og minutter (valgfrit).
            </p>

            <div className="max-h-[420px] overflow-auto rounded-md border border-zinc-200">
              <div className="divide-y divide-zinc-200">
                {(exercises ?? []).map((ex) => (
                  <div key={ex.id} className="flex items-center gap-3 p-3">
                    <input type="checkbox" name="exercise_ids" value={ex.id} />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium">{ex.title}</div>
                      <div className="truncate text-xs text-zinc-500">{ex.category ?? ""}</div>
                    </div>
                    <input
                      name={`sort_${ex.id}`}
                      placeholder="#"
                      inputMode="numeric"
                      className="w-16 rounded-md border border-zinc-200 bg-transparent px-2 py-1 text-sm"
                    />
                    <input
                      name={`minutes_${ex.id}`}
                      placeholder="min"
                      inputMode="numeric"
                      className="w-20 rounded-md border border-zinc-200 bg-transparent px-2 py-1 text-sm"
                    />
                  </div>
                ))}

                {exercises && exercises.length === 0 ? (
                  <div className="p-3 text-sm text-zinc-600">Ingen øvelser.</div>
                ) : null}
              </div>
            </div>
          </div>

          <button className="w-full rounded-md bg-black px-3 py-2 text-sm font-medium text-white">
            Gem træningspas
          </button>
        </form>
      </div>
    </AppShell>
  );
}
