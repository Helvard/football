import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AppShell from "@/components/AppShell";
import ExerciseIcon from "@/components/ExerciseIcon";

export default async function PracticeSessionDetailPage({
  params,
}: {
  params: Promise<{ id: string; practiceId: string }>;
}) {
  const { id: groupId, practiceId } = await params;
  const supabase = await createClient();

  const { data: group } = await supabase
    .from("groups")
    .select("id,name")
    .eq("id", groupId)
    .maybeSingle();

  if (!group) {
    notFound();
  }

  const { data: session } = await supabase
    .from("practice_sessions")
    .select("id,title,date,notes")
    .eq("id", practiceId)
    .eq("group_id", groupId)
    .maybeSingle();

  if (!session) {
    notFound();
  }

  const { data: drills } = await supabase
    .from("practice_session_drills")
    .select("exercise_id,sort_order,duration_minutes,notes,exercises ( title, category )")
    .eq("practice_session_id", practiceId)
    .order("sort_order", { ascending: true });

  return (
    <AppShell title={session.title} description={`${group.name} • ${session.date}`}>
      <div className="flex items-center justify-between">
        <Link className="text-sm underline" href={`/groups/${group.id}/practice`}>
          Tilbage
        </Link>
        <Link className="text-sm underline" href={`/groups/${group.id}`}>
          Gruppe
        </Link>
      </div>

      {session.notes ? (
        <div className="mt-6 rounded-lg border border-zinc-200 p-4 whitespace-pre-line text-sm text-zinc-700">
          {session.notes}
        </div>
      ) : null}

      <div className="mt-6 space-y-3">
        <h2 className="text-lg font-semibold">Plan</h2>
        <div className="grid gap-3">
          {(drills ?? []).map((d: any) => (
            <div key={d.exercise_id} className="rounded-lg border border-zinc-200 p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 inline-flex h-8 w-8 items-center justify-center rounded-md border border-zinc-200 bg-white">
                    <ExerciseIcon category={d.exercises?.category ?? null} className="h-4 w-4 text-zinc-700" />
                  </div>
                  <div>
                    <div className="font-medium">{d.exercises?.title ?? "Øvelse"}</div>
                    <div className="text-xs text-zinc-500">
                      {d.sort_order}
                      {d.duration_minutes ? ` • ${d.duration_minutes} min` : ""}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {drills && drills.length === 0 ? (
            <div className="rounded-lg border border-zinc-200 p-4 text-sm text-zinc-600">
              Ingen øvelser på dette træningspas.
            </div>
          ) : null}
        </div>
      </div>
    </AppShell>
  );
}
