import Link from "next/link";
import {
  Dumbbell,
  Home,
  NotebookPen,
  Shield,
  Target,
  Users,
} from "lucide-react";
import type { ReactNode } from "react";

export default function AppShell({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen">
      <header className="border-b border-zinc-200 bg-background">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-6 py-4">
          <div className="min-w-0">
            <div className="text-sm text-zinc-600">Træningssystem</div>
            <div className="truncate text-lg font-semibold">{title}</div>
            {description ? (
              <div className="truncate text-sm text-zinc-600">{description}</div>
            ) : null}
          </div>

          <nav className="hidden items-center gap-2 md:flex">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-100"
            >
              <Home className="h-4 w-4" />
              Hjem
            </Link>
            <Link
              href="/exercises"
              className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-100"
            >
              <Dumbbell className="h-4 w-4" />
              Øvelser
            </Link>
            <Link
              href="/progress"
              className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-100"
            >
              <Target className="h-4 w-4" />
              Progress
            </Link>
            <Link
              href="/groups"
              className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-100"
            >
              <Users className="h-4 w-4" />
              Grupper
            </Link>
            <Link
              href="/match/new"
              className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-100"
            >
              <NotebookPen className="h-4 w-4" />
              Kampdag
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-100"
            >
              <Shield className="h-4 w-4" />
              Konto
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-10 pb-24 md:pb-10">{children}</main>

      <nav className="fixed inset-x-0 bottom-0 border-t border-zinc-200 bg-background md:hidden">
        <div className="mx-auto grid max-w-5xl grid-cols-5 px-2 py-2">
          <Link
            href="/"
            className="flex flex-col items-center justify-center gap-1 rounded-md px-2 py-2 text-xs text-zinc-700 hover:bg-zinc-100"
          >
            <Home className="h-5 w-5" />
            Hjem
          </Link>
          <Link
            href="/exercises"
            className="flex flex-col items-center justify-center gap-1 rounded-md px-2 py-2 text-xs text-zinc-700 hover:bg-zinc-100"
          >
            <Dumbbell className="h-5 w-5" />
            Øvelser
          </Link>
          <Link
            href="/progress"
            className="flex flex-col items-center justify-center gap-1 rounded-md px-2 py-2 text-xs text-zinc-700 hover:bg-zinc-100"
          >
            <Target className="h-5 w-5" />
            Progress
          </Link>
          <Link
            href="/groups"
            className="flex flex-col items-center justify-center gap-1 rounded-md px-2 py-2 text-xs text-zinc-700 hover:bg-zinc-100"
          >
            <Users className="h-5 w-5" />
            Grupper
          </Link>
          <Link
            href="/match/new"
            className="flex flex-col items-center justify-center gap-1 rounded-md px-2 py-2 text-xs text-zinc-700 hover:bg-zinc-100"
          >
            <NotebookPen className="h-5 w-5" />
            Kamp
          </Link>
        </div>
      </nav>
    </div>
  );
}
