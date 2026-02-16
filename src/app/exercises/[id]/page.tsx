import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AppShell from "@/components/AppShell";
import ExerciseIcon from "@/components/ExerciseIcon";

export default async function ExerciseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: exercise, error } = await supabase
    .from("exercises")
    .select(
      "id,title,description,how_to,category,mode,metrics_type,numeric_unit,image_url,focus_areas,variants,players_min,players_max,area_size"
    )
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!exercise) {
    notFound();
  }

  return (
    <AppShell title={exercise.title} description={exercise.description ?? undefined}>
      <div className="flex items-center justify-between gap-4">
        <Link className="text-sm underline" href="/exercises">
          Tilbage
        </Link>
        <Link
          href={`/log-training?exerciseId=${exercise.id}`}
          className="inline-flex rounded-md bg-black px-3 py-2 text-sm font-medium text-white"
        >
          Log træning
        </Link>
      </div>

      <div className="mt-6 space-y-3">
        <div className="flex items-start gap-3">
          <div className="mt-1 inline-flex h-10 w-10 items-center justify-center rounded-md border border-zinc-200 bg-white">
            <ExerciseIcon category={exercise.category} className="h-5 w-5 text-zinc-700" />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap gap-2 text-xs text-zinc-600">
              {exercise.category ? (
                <span className="rounded-full border border-zinc-200 px-2 py-1">
                  {exercise.category}
                </span>
              ) : null}
              <span className="rounded-full border border-zinc-200 px-2 py-1">
                {exercise.mode}
              </span>
              <span className="rounded-full border border-zinc-200 px-2 py-1">
                {exercise.metrics_type}
                {exercise.numeric_unit ? ` (${exercise.numeric_unit})` : ""}
              </span>
            </div>
          </div>
        </div>

        {exercise.image_url ? (
          <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={exercise.image_url}
              alt={exercise.title}
              className="h-auto w-full"
            />
          </div>
        ) : null}

        {exercise.description ? (
          <div className="rounded-lg border border-zinc-200 p-4">
            <div className="font-medium">Beskrivelse</div>
            <div className="mt-2 whitespace-pre-line text-sm text-zinc-700">
              {exercise.description}
            </div>
          </div>
        ) : null}

        {exercise.focus_areas ? (
          <div className="rounded-lg border border-zinc-200 p-4">
            <div className="font-medium">Fokusområder</div>
            <div className="mt-2 whitespace-pre-line text-sm text-zinc-700">
              {exercise.focus_areas}
            </div>
          </div>
        ) : null}

        {exercise.area_size || exercise.players_min !== null || exercise.players_max !== null ? (
          <div className="rounded-lg border border-zinc-200 p-4">
            <div className="font-medium">Rammer</div>
            <div className="mt-2 grid gap-2 text-sm text-zinc-700 sm:grid-cols-2">
              {exercise.area_size ? (
                <div>
                  <div className="text-xs text-zinc-500">Bane</div>
                  <div>{exercise.area_size}</div>
                </div>
              ) : null}
              {exercise.players_min !== null || exercise.players_max !== null ? (
                <div>
                  <div className="text-xs text-zinc-500">Spillere</div>
                  <div>
                    {exercise.players_min !== null ? exercise.players_min : "?"}–
                    {exercise.players_max !== null ? exercise.players_max : "?"}
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        ) : null}

        {exercise.how_to ? (
          <div className="rounded-lg border border-zinc-200 p-4">
            <div className="font-medium">Sådan gør du</div>
            <div className="mt-2 whitespace-pre-line text-sm text-zinc-700">
              {exercise.how_to}
            </div>
          </div>
        ) : null}

        {exercise.variants ? (
          <div className="rounded-lg border border-zinc-200 p-4">
            <div className="font-medium">Varianter</div>
            <div className="mt-2 whitespace-pre-line text-sm text-zinc-700">
              {exercise.variants}
            </div>
          </div>
        ) : null}
      </div>
    </AppShell>
  );
}
