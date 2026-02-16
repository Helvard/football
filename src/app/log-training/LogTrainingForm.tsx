"use client";

import type React from "react";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/browser";

type Exercise = {
  id: string;
  title: string;
  metrics_type: "rating" | "numeric" | "both";
  numeric_unit: string | null;
};

export default function LogTrainingForm({ exercise }: { exercise: Exercise }) {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  const [resultType, setResultType] = useState<"rating" | "numeric">(
    exercise.metrics_type === "numeric" ? "numeric" : "rating"
  );

  const [rating, setRating] = useState<"ok" | "good" | "mastered">("ok");
  const [numericValue, setNumericValue] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const showResultTypePicker = exercise.metrics_type === "both";

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) {
      setLoading(false);
      setError(userError.message);
      return;
    }

    if (!user) {
      setLoading(false);
      setError("Du er ikke logget ind.");
      return;
    }

    const payload:
      | {
          user_id: string;
          exercise_id: string;
          result_type: "rating";
          rating: "ok" | "good" | "mastered";
          numeric_value: null;
          notes: string | null;
        }
      | {
          user_id: string;
          exercise_id: string;
          result_type: "numeric";
          rating: null;
          numeric_value: number;
          notes: string | null;
        } =
      resultType === "rating"
        ? {
            user_id: user.id,
            exercise_id: exercise.id,
            result_type: "rating",
            rating,
            numeric_value: null,
            notes: notes.trim() ? notes.trim() : null,
          }
        : {
            user_id: user.id,
            exercise_id: exercise.id,
            result_type: "numeric",
            rating: null,
            numeric_value: Number(numericValue),
            notes: notes.trim() ? notes.trim() : null,
          };

    if (payload.result_type === "numeric" && Number.isNaN(payload.numeric_value)) {
      setLoading(false);
      setError("Indtast et tal.");
      return;
    }

    const { error: insertError } = await supabase
      .from("training_logs")
      .insert(payload);

    setLoading(false);

    if (insertError) {
      setError(insertError.message);
      return;
    }

    router.push("/progress");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {showResultTypePicker ? (
        <div className="space-y-2">
          <label className="text-sm font-medium">Type</label>
          <select
            className="w-full rounded-md border border-zinc-200 bg-transparent px-3 py-2 text-sm"
            value={resultType}
            onChange={(e) => setResultType(e.target.value as "rating" | "numeric")}
          >
            <option value="rating">Status (ok/god/mestret)</option>
            <option value="numeric">Tal (tid/reps)</option>
          </select>
        </div>
      ) : null}

      {resultType === "rating" ? (
        <div className="space-y-2">
          <label className="text-sm font-medium">Status</label>
          <select
            className="w-full rounded-md border border-zinc-200 bg-transparent px-3 py-2 text-sm"
            value={rating}
            onChange={(e) => setRating(e.target.value as typeof rating)}
          >
            <option value="ok">Ok</option>
            <option value="good">God</option>
            <option value="mastered">Mestret</option>
          </select>
        </div>
      ) : (
        <div className="space-y-2">
          <label className="text-sm font-medium">
            Resultat{exercise.numeric_unit ? ` (${exercise.numeric_unit})` : ""}
          </label>
          <input
            className="w-full rounded-md border border-zinc-200 bg-transparent px-3 py-2 text-sm"
            value={numericValue}
            onChange={(e) => setNumericValue(e.target.value)}
            inputMode="decimal"
            required
          />
        </div>
      )}

      <div className="space-y-2">
        <label className="text-sm font-medium">Noter (valgfri)</label>
        <textarea
          className="w-full rounded-md border border-zinc-200 bg-transparent px-3 py-2 text-sm"
          rows={4}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-md bg-black px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
      >
        {loading ? "Gemmer..." : "Gem log"}
      </button>
    </form>
  );
}
