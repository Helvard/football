import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import AppShell from "@/components/AppShell";

export default async function ProgressPage() {
  const supabase = await createClient();

  const { data: logs, error } = await supabase
    .from("training_logs")
    .select(
      "id,date,result_type,rating,numeric_value,notes,exercises ( title, numeric_unit )"
    )
    .order("date", { ascending: false })
    .order("created_at", { ascending: false });

  return (
    <AppShell title="Progress" description="Dine seneste træningslogs.">
      <div className="flex items-center justify-between gap-4">
        <div />
        <Link className="text-sm underline" href="/exercises">
          Til Øvelser
        </Link>
      </div>

      {error ? (
        <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error.message}
        </div>
      ) : null}

      <div className="mt-6 grid gap-3">
        {(logs ?? []).map((log) => {
          const exerciseTitle = (log as any).exercises?.title ?? "Øvelse";
          const unit = (log as any).exercises?.numeric_unit ?? null;

          const value =
            log.result_type === "rating"
              ? log.rating
              : `${log.numeric_value}${unit ? ` ${unit}` : ""}`;

          return (
            <div key={log.id} className="rounded-lg border border-zinc-200 p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="font-medium">{exerciseTitle}</div>
                  <div className="text-sm text-zinc-600">{log.date}</div>
                </div>
                <div className="shrink-0 rounded-full border border-zinc-200 px-2 py-1 text-xs">
                  {value}
                </div>
              </div>
              {log.notes ? (
                <div className="mt-2 whitespace-pre-line text-sm text-zinc-700">
                  {log.notes}
                </div>
              ) : null}
            </div>
          );
        })}

        {logs && logs.length === 0 ? (
          <div className="rounded-lg border border-zinc-200 p-4 text-sm text-zinc-600">
            Ingen logs endnu. Gå til Øvelser og log din første træning.
          </div>
        ) : null}
      </div>
    </AppShell>
  );
}
