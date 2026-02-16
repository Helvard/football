import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import AppShell from "@/components/AppShell";
import ExerciseIcon from "@/components/ExerciseIcon";

export default async function ExercisesPage() {
  const supabase = await createClient();

  const { data: exercises, error } = await supabase
    .from("exercises")
    .select("id,title,description,category,mode,metrics_type")
    .order("title", { ascending: true });

  return (
    <AppShell
      title="Øvelser"
      description="Vælg en øvelse for at se detaljer og logge træning."
    >
      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error.message}
        </div>
      ) : null}

      <div className="grid gap-3">
        {(exercises ?? []).map((ex) => (
          <Link
            key={ex.id}
            href={`/exercises/${ex.id}`}
            className="rounded-lg border border-zinc-200 p-4 hover:bg-zinc-50"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 inline-flex h-8 w-8 items-center justify-center rounded-md border border-zinc-200 bg-white">
                  <ExerciseIcon category={ex.category} className="h-4 w-4 text-zinc-700" />
                </div>
                <div className="space-y-1">
                  <div className="font-medium">{ex.title}</div>
                  {ex.description ? (
                    <div className="text-sm text-zinc-600">{ex.description}</div>
                  ) : null}
                </div>
              </div>
              <div className="shrink-0 text-right text-xs text-zinc-500">
                <div>{ex.category ?? ""}</div>
                <div>{ex.mode}</div>
              </div>
            </div>
          </Link>
        ))}

        {exercises && exercises.length === 0 ? (
          <div className="rounded-lg border border-zinc-200 p-4 text-sm text-zinc-600">
            Ingen øvelser fundet.
          </div>
        ) : null}
      </div>
    </AppShell>
  );
}
