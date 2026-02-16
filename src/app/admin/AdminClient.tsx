"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/browser";

type GeneratedExercise = {
  title: string;
  description: string | null;
  how_to: string | null;
  category: string | null;
  focus_areas: string | null;
  variants: string | null;
  players_min: number | null;
  players_max: number | null;
  area_size: string | null;
  image_url: string | null;
  mode: "solo" | "group" | "both";
  metrics_type: "rating" | "numeric" | "both";
  numeric_unit: string | null;
};

type ExerciseRow = GeneratedExercise & {
  id: string;
  visibility: "global" | "private" | "shared";
  created_at: string;
};

export default function AdminClient() {
  const [cleanupError, setCleanupError] = useState<string | null>(null);
  const [cleanupOk, setCleanupOk] = useState<string | null>(null);
  const [cleanupLoading, setCleanupLoading] = useState(false);

  const [resetEmail, setResetEmail] = useState("");
  const [resetStatus, setResetStatus] = useState<string | null>(null);
  const [resetError, setResetError] = useState<string | null>(null);

  const [exerciseTitle, setExerciseTitle] = useState("");
  const [exerciseCategory, setExerciseCategory] = useState("");
  const [exerciseHowTo, setExerciseHowTo] = useState("");
  const [exerciseStatus, setExerciseStatus] = useState<string | null>(null);
  const [exerciseError, setExerciseError] = useState<string | null>(null);

  const [aiPrompt, setAiPrompt] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [generated, setGenerated] = useState<GeneratedExercise | null>(null);
  const [aiSaveStatus, setAiSaveStatus] = useState<string | null>(null);
  const [aiSaveError, setAiSaveError] = useState<string | null>(null);

  const [exerciseList, setExerciseList] = useState<ExerciseRow[]>([]);
  const [exerciseListError, setExerciseListError] = useState<string | null>(null);
  const [exerciseListLoading, setExerciseListLoading] = useState(false);
  const [exerciseQuery, setExerciseQuery] = useState("");
  const [selectedExerciseId, setSelectedExerciseId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<ExerciseRow | null>(null);
  const [editStatus, setEditStatus] = useState<string | null>(null);
  const [editError, setEditError] = useState<string | null>(null);

  async function runCleanup() {
    setCleanupLoading(true);
    setCleanupError(null);
    setCleanupOk(null);

    try {
      const supabase = createClient();
      const { error } = await supabase.rpc("admin_cleanup_all");
      if (error) {
        setCleanupError(error.message);
        return;
      }

      setCleanupOk("Ryddet");
    } finally {
      setCleanupLoading(false);
    }
  }

  async function loadExercises() {
    setExerciseListLoading(true);
    setExerciseListError(null);
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("exercises")
        .select(
          "id,title,description,how_to,category,focus_areas,variants,players_min,players_max,area_size,image_url,mode,metrics_type,numeric_unit,visibility,created_at"
        )
        .order("created_at", { ascending: false })
        .limit(200);

      if (error) {
        setExerciseListError(error.message);
        return;
      }

      setExerciseList((data ?? []) as any);
    } finally {
      setExerciseListLoading(false);
    }
  }

  useEffect(() => {
    void loadExercises();
  }, []);

  const filteredExercises = useMemo(() => {
    const q = exerciseQuery.trim().toLowerCase();
    if (!q) return exerciseList;
    return exerciseList.filter((e) => {
      const t = (e.title ?? "").toLowerCase();
      const c = (e.category ?? "").toLowerCase();
      return t.includes(q) || c.includes(q);
    });
  }, [exerciseList, exerciseQuery]);

  useEffect(() => {
    if (!selectedExerciseId) {
      setEditDraft(null);
      return;
    }
    const found = exerciseList.find((e) => e.id === selectedExerciseId) ?? null;
    setEditDraft(found ? { ...found } : null);
  }, [selectedExerciseId, exerciseList]);

  async function saveEdit() {
    setEditStatus(null);
    setEditError(null);
    if (!editDraft) return;

    const title = editDraft.title.trim();
    if (!title) {
      setEditError("Mangler titel");
      return;
    }

    const supabase = createClient();
    const { error } = await supabase.rpc("admin_update_exercise_v2", {
      p_exercise_id: editDraft.id,
      p_title: title,
      p_description: editDraft.description,
      p_how_to: editDraft.how_to,
      p_mode: editDraft.mode,
      p_metrics_type: editDraft.metrics_type,
      p_numeric_unit: editDraft.numeric_unit,
      p_category: editDraft.category,
      p_image_url: editDraft.image_url,
      p_focus_areas: editDraft.focus_areas,
      p_variants: editDraft.variants,
      p_players_min: editDraft.players_min,
      p_players_max: editDraft.players_max,
      p_area_size: editDraft.area_size,
    });

    if (error) {
      setEditError(error.message);
      return;
    }

    setEditStatus("Gemt");
    await loadExercises();
  }

  async function deleteExercise() {
    setEditStatus(null);
    setEditError(null);
    if (!editDraft) return;

    if (!confirm("Slet øvelse?")) return;

    const supabase = createClient();
    const { error } = await supabase.rpc("admin_delete_exercise", {
      p_exercise_id: editDraft.id,
    });

    if (error) {
      setEditError(error.message);
      return;
    }

    setSelectedExerciseId(null);
    await loadExercises();
  }

  async function generateWithAi() {
    setAiLoading(true);
    setAiError(null);
    setGenerated(null);
    setAiSaveStatus(null);
    setAiSaveError(null);

    const prompt = aiPrompt.trim();
    if (!prompt) {
      setAiLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/admin/generate-exercise", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      const json = await res.json().catch(() => null);
      if (!res.ok) {
        setAiError(json?.error ?? "Kunne ikke generere");
        return;
      }

      setGenerated(json.exercise as GeneratedExercise);
    } finally {
      setAiLoading(false);
    }
  }

  async function saveGenerated() {
    setAiSaveStatus(null);
    setAiSaveError(null);

    if (!generated) return;
    if (!generated.title?.trim()) {
      setAiSaveError("Mangler titel");
      return;
    }

    const supabase = createClient();
    const { data, error } = await supabase.rpc("admin_create_global_exercise_v2", {
      p_title: generated.title,
      p_description: generated.description,
      p_how_to: generated.how_to,
      p_mode: generated.mode,
      p_metrics_type: generated.metrics_type,
      p_numeric_unit: generated.numeric_unit,
      p_category: generated.category,
      p_image_url: generated.image_url,
      p_focus_areas: generated.focus_areas,
      p_variants: generated.variants,
      p_players_min: generated.players_min,
      p_players_max: generated.players_max,
      p_area_size: generated.area_size,
    });

    if (error) {
      setAiSaveError(error.message);
      return;
    }

    setAiSaveStatus(`Oprettet: ${data}`);
    setAiPrompt("");
    setGenerated(null);
  }

  async function sendReset() {
    setResetStatus(null);
    setResetError(null);

    const email = resetEmail.trim();
    if (!email) return;

    const supabase = createClient();
    const redirectTo = `${window.location.origin}/reset-password`;

    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });

    if (error) {
      setResetError(error.message);
      return;
    }

    setResetStatus("Sendt");
    setResetEmail("");
  }

  async function addGlobalExercise() {
    setExerciseStatus(null);
    setExerciseError(null);

    const title = exerciseTitle.trim();
    if (!title) return;

    const supabase = createClient();
    const { data, error } = await supabase.rpc("admin_create_global_exercise", {
      p_title: title,
      p_description: null,
      p_how_to: exerciseHowTo.trim() || null,
      p_mode: "solo",
      p_metrics_type: "rating",
      p_numeric_unit: null,
      p_category: exerciseCategory.trim() || null,
    });

    if (error) {
      setExerciseError(error.message);
      return;
    }

    setExerciseStatus(`Oprettet: ${data}`);
    setExerciseTitle("");
    setExerciseCategory("");
    setExerciseHowTo("");
  }

  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Cleanup</h2>
        <div className="rounded-lg border border-zinc-200 p-4 space-y-3">
          <div className="text-sm text-zinc-600">
            Sletter alle kampnoter, opstillinger, træningspas og træningslogs (ikke grupper).
          </div>
          <button
            type="button"
            onClick={runCleanup}
            disabled={cleanupLoading}
            className="rounded-md bg-black px-3 py-2 text-sm font-medium text-white disabled:opacity-60"
          >
            {cleanupLoading ? "Kører..." : "Kør cleanup"}
          </button>

          {cleanupError ? (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {cleanupError}
            </div>
          ) : null}
          {cleanupOk ? (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
              {cleanupOk}
            </div>
          ) : null}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Edit drills</h2>
        <div className="rounded-lg border border-zinc-200 p-4 space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <input
              value={exerciseQuery}
              onChange={(e) => setExerciseQuery(e.target.value)}
              placeholder="Søg på titel eller kategori"
              className="w-full rounded-md border border-zinc-200 bg-transparent px-3 py-2 text-sm"
            />
            <button
              type="button"
              onClick={loadExercises}
              disabled={exerciseListLoading}
              className="rounded-md bg-black px-3 py-2 text-sm font-medium text-white disabled:opacity-60"
            >
              {exerciseListLoading ? "Loader..." : "Genindlæs"}
            </button>
          </div>

          {exerciseListError ? (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {exerciseListError}
            </div>
          ) : null}

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-lg border border-zinc-200">
              <div className="divide-y divide-zinc-200">
                {filteredExercises.map((e) => (
                  <button
                    key={e.id}
                    type="button"
                    onClick={() => setSelectedExerciseId(e.id)}
                    className={`w-full text-left p-3 hover:bg-zinc-50 ${
                      selectedExerciseId === e.id ? "bg-zinc-50" : ""
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="font-medium">{e.title}</div>
                        <div className="text-xs text-zinc-500">
                          {e.visibility} {e.category ? `• ${e.category}` : ""}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}

                {filteredExercises.length === 0 ? (
                  <div className="p-3 text-sm text-zinc-600">Ingen øvelser.</div>
                ) : null}
              </div>
            </div>

            <div className="rounded-lg border border-zinc-200 p-4">
              {editDraft ? (
                <div className="space-y-4">
                  <div className="text-sm text-zinc-600">Redigér og gem.</div>

                  <div className="grid gap-3">
                    <input
                      value={editDraft.title}
                      onChange={(e) => setEditDraft({ ...editDraft, title: e.target.value })}
                      className="w-full rounded-md border border-zinc-200 bg-transparent px-3 py-2 text-sm"
                      placeholder="Titel"
                    />
                    <input
                      value={editDraft.category ?? ""}
                      onChange={(e) =>
                        setEditDraft({ ...editDraft, category: e.target.value || null })
                      }
                      className="w-full rounded-md border border-zinc-200 bg-transparent px-3 py-2 text-sm"
                      placeholder="Kategori"
                    />
                    <input
                      value={editDraft.image_url ?? ""}
                      onChange={(e) =>
                        setEditDraft({ ...editDraft, image_url: e.target.value || null })
                      }
                      className="w-full rounded-md border border-zinc-200 bg-transparent px-3 py-2 text-sm"
                      placeholder="Billede URL"
                    />
                    <textarea
                      value={editDraft.description ?? ""}
                      onChange={(e) =>
                        setEditDraft({ ...editDraft, description: e.target.value || null })
                      }
                      rows={3}
                      className="w-full rounded-md border border-zinc-200 bg-transparent px-3 py-2 text-sm"
                      placeholder="Beskrivelse"
                    />
                    <textarea
                      value={editDraft.focus_areas ?? ""}
                      onChange={(e) =>
                        setEditDraft({ ...editDraft, focus_areas: e.target.value || null })
                      }
                      rows={2}
                      className="w-full rounded-md border border-zinc-200 bg-transparent px-3 py-2 text-sm"
                      placeholder="Fokusområder"
                    />
                    <textarea
                      value={editDraft.how_to ?? ""}
                      onChange={(e) =>
                        setEditDraft({ ...editDraft, how_to: e.target.value || null })
                      }
                      rows={5}
                      className="w-full rounded-md border border-zinc-200 bg-transparent px-3 py-2 text-sm"
                      placeholder="How-to"
                    />
                    <textarea
                      value={editDraft.variants ?? ""}
                      onChange={(e) =>
                        setEditDraft({ ...editDraft, variants: e.target.value || null })
                      }
                      rows={3}
                      className="w-full rounded-md border border-zinc-200 bg-transparent px-3 py-2 text-sm"
                      placeholder="Varianter"
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        inputMode="numeric"
                        value={editDraft.players_min ?? ""}
                        onChange={(e) => {
                          const v = e.target.value.trim();
                          const n = v ? Number(v) : NaN;
                          setEditDraft({
                            ...editDraft,
                            players_min: Number.isFinite(n) ? Math.trunc(n) : null,
                          });
                        }}
                        className="w-full rounded-md border border-zinc-200 bg-transparent px-3 py-2 text-sm"
                        placeholder="Min spillere"
                      />
                      <input
                        inputMode="numeric"
                        value={editDraft.players_max ?? ""}
                        onChange={(e) => {
                          const v = e.target.value.trim();
                          const n = v ? Number(v) : NaN;
                          setEditDraft({
                            ...editDraft,
                            players_max: Number.isFinite(n) ? Math.trunc(n) : null,
                          });
                        }}
                        className="w-full rounded-md border border-zinc-200 bg-transparent px-3 py-2 text-sm"
                        placeholder="Max spillere"
                      />
                    </div>
                    <input
                      value={editDraft.area_size ?? ""}
                      onChange={(e) =>
                        setEditDraft({ ...editDraft, area_size: e.target.value || null })
                      }
                      className="w-full rounded-md border border-zinc-200 bg-transparent px-3 py-2 text-sm"
                      placeholder="Banestørrelse"
                    />
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={saveEdit}
                      className="rounded-md bg-black px-3 py-2 text-sm font-medium text-white"
                    >
                      Gem
                    </button>
                    <button
                      type="button"
                      onClick={deleteExercise}
                      className="rounded-md border border-zinc-200 px-3 py-2 text-sm"
                    >
                      Slet
                    </button>
                  </div>

                  {editError ? (
                    <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                      {editError}
                    </div>
                  ) : null}
                  {editStatus ? (
                    <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
                      {editStatus}
                    </div>
                  ) : null}
                </div>
              ) : (
                <div className="text-sm text-zinc-600">Vælg en øvelse.</div>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">AI drills</h2>
        <div className="rounded-lg border border-zinc-200 p-4 space-y-4">
          <div className="text-sm text-zinc-600">
            Skriv en prompt og få AI til at lave en ny øvelse i samme format.
          </div>

          <textarea
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            rows={4}
            placeholder="Fx: Lav en pasningsøvelse til U12 (8v8) med fokus på førsteberøring og orientering..."
            className="w-full rounded-md border border-zinc-200 bg-transparent px-3 py-2 text-sm"
          />

          <button
            type="button"
            onClick={generateWithAi}
            disabled={aiLoading}
            className="rounded-md bg-black px-3 py-2 text-sm font-medium text-white disabled:opacity-60"
          >
            {aiLoading ? "Genererer..." : "Generer"}
          </button>

          {aiError ? (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {aiError}
            </div>
          ) : null}

          {generated ? (
            <div className="space-y-4 rounded-lg border border-zinc-200 p-4">
              <div className="text-sm font-semibold">Preview (kan redigeres)</div>

              <div className="grid gap-3">
                <input
                  value={generated.title}
                  onChange={(e) => setGenerated({ ...generated, title: e.target.value })}
                  className="w-full rounded-md border border-zinc-200 bg-transparent px-3 py-2 text-sm"
                  placeholder="Titel"
                />

                <input
                  value={generated.category ?? ""}
                  onChange={(e) =>
                    setGenerated({ ...generated, category: e.target.value || null })
                  }
                  className="w-full rounded-md border border-zinc-200 bg-transparent px-3 py-2 text-sm"
                  placeholder="Kategori"
                />

                <input
                  value={generated.image_url ?? ""}
                  onChange={(e) =>
                    setGenerated({ ...generated, image_url: e.target.value || null })
                  }
                  className="w-full rounded-md border border-zinc-200 bg-transparent px-3 py-2 text-sm"
                  placeholder="Billede URL (valgfri)"
                />

                <textarea
                  value={generated.description ?? ""}
                  onChange={(e) =>
                    setGenerated({ ...generated, description: e.target.value || null })
                  }
                  rows={3}
                  className="w-full rounded-md border border-zinc-200 bg-transparent px-3 py-2 text-sm"
                  placeholder="Beskrivelse"
                />

                <textarea
                  value={generated.focus_areas ?? ""}
                  onChange={(e) =>
                    setGenerated({ ...generated, focus_areas: e.target.value || null })
                  }
                  rows={2}
                  className="w-full rounded-md border border-zinc-200 bg-transparent px-3 py-2 text-sm"
                  placeholder="Fokusområder"
                />

                <textarea
                  value={generated.how_to ?? ""}
                  onChange={(e) =>
                    setGenerated({ ...generated, how_to: e.target.value || null })
                  }
                  rows={5}
                  className="w-full rounded-md border border-zinc-200 bg-transparent px-3 py-2 text-sm"
                  placeholder="How-to"
                />

                <textarea
                  value={generated.variants ?? ""}
                  onChange={(e) =>
                    setGenerated({ ...generated, variants: e.target.value || null })
                  }
                  rows={3}
                  className="w-full rounded-md border border-zinc-200 bg-transparent px-3 py-2 text-sm"
                  placeholder="Varianter"
                />

                <div className="grid grid-cols-2 gap-3">
                  <input
                    inputMode="numeric"
                    value={generated.players_min ?? ""}
                    onChange={(e) => {
                      const v = e.target.value.trim();
                      const n = v ? Number(v) : NaN;
                      setGenerated({
                        ...generated,
                        players_min: Number.isFinite(n) ? Math.trunc(n) : null,
                      });
                    }}
                    className="w-full rounded-md border border-zinc-200 bg-transparent px-3 py-2 text-sm"
                    placeholder="Min spillere"
                  />
                  <input
                    inputMode="numeric"
                    value={generated.players_max ?? ""}
                    onChange={(e) => {
                      const v = e.target.value.trim();
                      const n = v ? Number(v) : NaN;
                      setGenerated({
                        ...generated,
                        players_max: Number.isFinite(n) ? Math.trunc(n) : null,
                      });
                    }}
                    className="w-full rounded-md border border-zinc-200 bg-transparent px-3 py-2 text-sm"
                    placeholder="Max spillere"
                  />
                </div>

                <input
                  value={generated.area_size ?? ""}
                  onChange={(e) =>
                    setGenerated({ ...generated, area_size: e.target.value || null })
                  }
                  className="w-full rounded-md border border-zinc-200 bg-transparent px-3 py-2 text-sm"
                  placeholder="Banestørrelse (fx 20x15m)"
                />
              </div>

              <button
                type="button"
                onClick={saveGenerated}
                className="rounded-md bg-black px-3 py-2 text-sm font-medium text-white"
              >
                Gem som global øvelse
              </button>

              {aiSaveError ? (
                <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  {aiSaveError}
                </div>
              ) : null}
              {aiSaveStatus ? (
                <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
                  {aiSaveStatus}
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Password assistance</h2>
        <div className="rounded-lg border border-zinc-200 p-4 space-y-3">
          <div className="text-sm text-zinc-600">Send et password reset link via Supabase.</div>
          <div className="flex gap-2">
            <input
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
              placeholder="Email"
              className="w-full rounded-md border border-zinc-200 bg-transparent px-3 py-2 text-sm"
            />
            <button
              type="button"
              onClick={sendReset}
              className="rounded-md bg-black px-3 py-2 text-sm font-medium text-white"
            >
              Send
            </button>
          </div>
          {resetError ? (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {resetError}
            </div>
          ) : null}
          {resetStatus ? (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
              {resetStatus}
            </div>
          ) : null}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">System drills</h2>
        <div className="rounded-lg border border-zinc-200 p-4 space-y-4">
          <div className="text-sm text-zinc-600">
            Opret en global øvelse (synlig for alle).
          </div>
          <div className="grid gap-3">
            <input
              value={exerciseTitle}
              onChange={(e) => setExerciseTitle(e.target.value)}
              placeholder="Titel"
              className="w-full rounded-md border border-zinc-200 bg-transparent px-3 py-2 text-sm"
            />
            <input
              value={exerciseCategory}
              onChange={(e) => setExerciseCategory(e.target.value)}
              placeholder="Kategori (valgfri)"
              className="w-full rounded-md border border-zinc-200 bg-transparent px-3 py-2 text-sm"
            />
            <textarea
              value={exerciseHowTo}
              onChange={(e) => setExerciseHowTo(e.target.value)}
              placeholder="How-to (valgfri)"
              rows={4}
              className="w-full rounded-md border border-zinc-200 bg-transparent px-3 py-2 text-sm"
            />
            <button
              type="button"
              onClick={addGlobalExercise}
              className="rounded-md bg-black px-3 py-2 text-sm font-medium text-white"
            >
              Opret global øvelse
            </button>
          </div>

          {exerciseError ? (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {exerciseError}
            </div>
          ) : null}
          {exerciseStatus ? (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
              {exerciseStatus}
            </div>
          ) : null}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Formations</h2>
        <div className="rounded-lg border border-zinc-200 p-4 text-sm text-zinc-600">
          Kommer snart.
        </div>
      </section>
    </div>
  );
}
