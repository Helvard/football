"use client";

import { useMemo, useRef, useState } from "react";

type Member = {
  user_id: string;
  profiles?: { name: string | null; email: string | null } | null;
};

export type RosterEntry = {
  id?: string;
  position_code: string;
  x: number | null;
  y: number | null;
  user_id: string | null;
  guest_name: string | null;
  shirt_number: number | null;
};

const DEFAULT_433: Array<Pick<RosterEntry, "position_code" | "x" | "y">> = [
  { position_code: "GK", x: 50, y: 92 },
  { position_code: "LB", x: 18, y: 74 },
  { position_code: "LCB", x: 40, y: 78 },
  { position_code: "RCB", x: 60, y: 78 },
  { position_code: "RB", x: 82, y: 74 },
  { position_code: "LCM", x: 35, y: 55 },
  { position_code: "CM", x: 50, y: 58 },
  { position_code: "RCM", x: 65, y: 55 },
  { position_code: "LW", x: 20, y: 30 },
  { position_code: "ST", x: 50, y: 26 },
  { position_code: "RW", x: 80, y: 30 },
];

const DEFAULT_8: Array<Pick<RosterEntry, "position_code" | "x" | "y">> = [
  { position_code: "GK", x: 50, y: 92 },
  { position_code: "LB", x: 22, y: 72 },
  { position_code: "CB", x: 50, y: 78 },
  { position_code: "RB", x: 78, y: 72 },
  { position_code: "LM", x: 24, y: 48 },
  { position_code: "CM", x: 50, y: 52 },
  { position_code: "RM", x: 76, y: 48 },
  { position_code: "ST", x: 50, y: 26 },
];

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export default function RosterPitch({
  groupId,
  gameId,
  squadSize,
  members,
  initialEntries,
}: {
  groupId: string;
  gameId: string;
  squadSize: 8 | 11;
  members: Member[];
  initialEntries: RosterEntry[];
}) {
  const pitchRef = useRef<HTMLDivElement | null>(null);

  const initialByPos = useMemo(() => {
    const map = new Map<string, RosterEntry>();
    for (const e of initialEntries) map.set(e.position_code, e);
    return map;
  }, [initialEntries]);

  const basePositions = squadSize === 8 ? DEFAULT_8 : DEFAULT_433;

  const [entries, setEntries] = useState<RosterEntry[]>(() =>
    basePositions.map((p) => {
      const existing = initialByPos.get(p.position_code);
      return {
        id: existing?.id,
        position_code: p.position_code,
        x: existing?.x ?? p.x,
        y: existing?.y ?? p.y,
        user_id: existing?.user_id ?? null,
        guest_name: existing?.guest_name ?? null,
        shirt_number: existing?.shirt_number ?? null,
      };
    })
  );

  const [selectedPos, setSelectedPos] = useState<string>("GK");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const selected = entries.find((e) => e.position_code === selectedPos) ?? entries[0];

  function updateEntry(position_code: string, patch: Partial<RosterEntry>) {
    setEntries((prev) =>
      prev.map((e) => (e.position_code === position_code ? { ...e, ...patch } : e))
    );
  }

  async function save() {
    setSaving(true);
    setError(null);
    setSuccess(null);

    const payload = {
      entries: entries
        .map((e) => ({
          id: e.id,
          position_code: e.position_code,
          x: e.x,
          y: e.y,
          user_id: e.user_id,
          guest_name: e.guest_name,
          shirt_number: e.shirt_number,
        }))
        .filter((e) => e.user_id || e.guest_name),
    };

    try {
      const res = await fetch(`/groups/${groupId}/games/${gameId}/roster`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Kunne ikke gemme opstilling");
      }

      setSuccess("Gemt");
    } catch (e: any) {
      setError(e?.message ?? "Kunne ikke gemme");
    } finally {
      setSaving(false);
    }
  }

  function onStartDrag(position_code: string, ev: React.PointerEvent) {
    const pitch = pitchRef.current;
    if (!pitch) return;

    (ev.currentTarget as HTMLButtonElement).setPointerCapture(ev.pointerId);

    const rect = pitch.getBoundingClientRect();

    const move = (e: PointerEvent) => {
      const xPx = e.clientX - rect.left;
      const yPx = e.clientY - rect.top;
      const x = clamp((xPx / rect.width) * 100, 0, 100);
      const y = clamp((yPx / rect.height) * 100, 0, 100);
      updateEntry(position_code, { x, y });
    };

    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };

    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <div>
        <div
          ref={pitchRef}
          className="relative aspect-[3/4] w-full overflow-hidden rounded-xl border border-zinc-200 bg-gradient-to-b from-emerald-50 to-emerald-100"
        >
          <div className="absolute inset-0 opacity-60">
            <div className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-emerald-700/30" />
            <div className="absolute left-0 top-1/2 h-px w-full -translate-y-1/2 bg-emerald-700/30" />
            <div className="absolute left-[10%] top-[6%] h-[14%] w-[80%] rounded-md border border-emerald-700/30" />
            <div className="absolute left-[22%] top-[6%] h-[7%] w-[56%] rounded-md border border-emerald-700/30" />
            <div className="absolute left-[10%] bottom-[6%] h-[14%] w-[80%] rounded-md border border-emerald-700/30" />
            <div className="absolute left-[22%] bottom-[6%] h-[7%] w-[56%] rounded-md border border-emerald-700/30" />
            <div className="absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full border border-emerald-700/30" />
          </div>

          {entries.map((e) => {
            const left = `${e.x ?? 50}%`;
            const top = `${e.y ?? 50}%`;
            const active = e.position_code === selectedPos;

            const label = e.user_id
              ? members.find((m) => m.user_id === e.user_id)?.profiles?.name ?? "Spiller"
              : e.guest_name;

            return (
              <button
                key={e.position_code}
                type="button"
                onClick={() => setSelectedPos(e.position_code)}
                onPointerDown={(ev) => onStartDrag(e.position_code, ev)}
                className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full px-3 py-2 text-xs font-semibold shadow-sm ring-1 transition ${
                  active
                    ? "bg-black text-white ring-black"
                    : "bg-white text-zinc-800 ring-zinc-200 hover:bg-zinc-50"
                }`}
                style={{ left, top }}
              >
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-zinc-900/10 px-2 py-0.5">
                    {e.position_code}
                  </span>
                  <span className="max-w-[120px] truncate">
                    {label ? label : "-"}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-zinc-600">
            Træk spillere for at flytte dem. Klik for at redigere.
          </div>
          <button
            type="button"
            onClick={save}
            disabled={saving}
            className="rounded-md bg-black px-3 py-2 text-sm font-medium text-white disabled:opacity-60"
          >
            {saving ? "Gemmer..." : "Gem"}
          </button>
        </div>

        {error ? (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}
        {success ? (
          <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
            {success}
          </div>
        ) : null}
      </div>

      <div className="rounded-xl border border-zinc-200 p-4">
        <div className="text-sm font-semibold">{selected?.position_code}</div>
        <div className="mt-1 text-sm text-zinc-600">Vælg spiller eller gæst.</div>

        <div className="mt-4 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="player">
              Spiller (konto)
            </label>
            <select
              id="player"
              value={selected?.user_id ?? ""}
              onChange={(e) =>
                updateEntry(selected.position_code, {
                  user_id: e.target.value || null,
                  guest_name: null,
                })
              }
              className="w-full rounded-md border border-zinc-200 bg-transparent px-3 py-2 text-sm"
            >
              <option value="">-</option>
              {members.map((m) => (
                <option key={m.user_id} value={m.user_id}>
                  {(m.profiles?.name ?? m.profiles?.email ?? m.user_id) as string}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="guest">
              Gæst (navn)
            </label>
            <input
              id="guest"
              value={selected?.guest_name ?? ""}
              onChange={(e) =>
                updateEntry(selected.position_code, {
                  guest_name: e.target.value || null,
                  user_id: null,
                })
              }
              className="w-full rounded-md border border-zinc-200 bg-transparent px-3 py-2 text-sm"
              placeholder="Fx Mikkel (gæst)"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="shirt">
              Trøjenummer (valgfri)
            </label>
            <input
              id="shirt"
              inputMode="numeric"
              value={selected?.shirt_number ?? ""}
              onChange={(e) => {
                const v = e.target.value.trim();
                const n = v ? Number(v) : NaN;
                updateEntry(selected.position_code, {
                  shirt_number: Number.isFinite(n) ? Math.trunc(n) : null,
                });
              }}
              className="w-full rounded-md border border-zinc-200 bg-transparent px-3 py-2 text-sm"
            />
          </div>

          <button
            type="button"
            onClick={() =>
              updateEntry(selected.position_code, {
                user_id: null,
                guest_name: null,
                shirt_number: null,
              })
            }
            className="w-full rounded-md border border-zinc-200 px-3 py-2 text-sm"
          >
            Ryd position
          </button>
        </div>
      </div>
    </div>
  );
}
