import AppShell from "@/components/AppShell";
import { Dumbbell, NotebookPen, Shield, Target, Users } from "lucide-react";

export default function Home() {
  return (
    <AppShell
      title="Hjem"
      description="Vælg øvelser, log træning og følg udviklingen."
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <a
          href="/exercises"
          className="rounded-lg border border-zinc-200 p-4 hover:bg-zinc-50"
        >
          <div className="flex items-center gap-3">
            <div className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-zinc-200 bg-white">
              <Dumbbell className="h-4 w-4" />
            </div>
            <div>
              <div className="font-medium">Øvelser</div>
              <div className="text-sm text-zinc-600">Se og vælg øvelser</div>
            </div>
          </div>
        </a>

        <a
          href="/progress"
          className="rounded-lg border border-zinc-200 p-4 hover:bg-zinc-50"
        >
          <div className="flex items-center gap-3">
            <div className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-zinc-200 bg-white">
              <Target className="h-4 w-4" />
            </div>
            <div>
              <div className="font-medium">Progress</div>
              <div className="text-sm text-zinc-600">Se dine logs</div>
            </div>
          </div>
        </a>

        <a
          href="/groups"
          className="rounded-lg border border-zinc-200 p-4 hover:bg-zinc-50"
        >
          <div className="flex items-center gap-3">
            <div className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-zinc-200 bg-white">
              <Users className="h-4 w-4" />
            </div>
            <div>
              <div className="font-medium">Grupper</div>
              <div className="text-sm text-zinc-600">Se og opret grupper</div>
            </div>
          </div>
        </a>

        <a
          href="/match/new"
          className="rounded-lg border border-zinc-200 p-4 hover:bg-zinc-50"
        >
          <div className="flex items-center gap-3">
            <div className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-zinc-200 bg-white">
              <NotebookPen className="h-4 w-4" />
            </div>
            <div>
              <div className="font-medium">Kampdag</div>
              <div className="text-sm text-zinc-600">Skriv kampnoter</div>
            </div>
          </div>
        </a>

        <a
          href="/dashboard"
          className="rounded-lg border border-zinc-200 p-4 hover:bg-zinc-50"
        >
          <div className="flex items-center gap-3">
            <div className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-zinc-200 bg-white">
              <Shield className="h-4 w-4" />
            </div>
            <div>
              <div className="font-medium">Konto</div>
              <div className="text-sm text-zinc-600">Log ind/ud</div>
            </div>
          </div>
        </a>
      </div>
    </AppShell>
  );
}
