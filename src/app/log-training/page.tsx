import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import LogTrainingForm from "./LogTrainingForm";
import AppShell from "@/components/AppShell";

export default async function LogTrainingPage({
  searchParams,
}: {
  searchParams: Promise<{ exerciseId?: string }>;
}) {
  const { exerciseId } = await searchParams;

  if (!exerciseId) {
    redirect("/exercises");
  }

  const supabase = await createClient();

  const { data: exercise, error } = await supabase
    .from("exercises")
    .select("id,title,metrics_type,numeric_unit")
    .eq("id", exerciseId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!exercise) {
    redirect("/exercises");
  }

  return (
    <AppShell title="Log træning" description={exercise.title}>
      <div className="mx-auto max-w-lg space-y-6">
        <div className="flex items-center justify-between gap-4">
          <Link className="text-sm underline" href={`/exercises/${exercise.id}`}>
            Tilbage
          </Link>
          <Link className="text-sm underline" href="/progress">
            Progress
          </Link>
        </div>

        <div className="rounded-lg border border-zinc-200 p-4">
          <LogTrainingForm exercise={exercise} />
        </div>
      </div>
    </AppShell>
  );
}
