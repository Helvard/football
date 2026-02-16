"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/browser";

export default function ResetPasswordClient() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus(null);
    setError(null);

    const p = password.trim();
    if (p.length < 8) {
      setError("Password skal være mindst 8 tegn.");
      return;
    }

    setLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ password: p });
      if (error) {
        setError(error.message);
        return;
      }
      setStatus("Opdateret");
      setPassword("");
      router.push("/login");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div className="rounded-lg border border-zinc-200 p-4">
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="password">
              Nyt password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-md border border-zinc-200 bg-transparent px-3 py-2 text-sm"
            />
          </div>

          <button
            disabled={loading}
            className="w-full rounded-md bg-black px-3 py-2 text-sm font-medium text-white disabled:opacity-60"
          >
            {loading ? "Gemmer..." : "Gem"}
          </button>

          {error ? (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          ) : null}
          {status ? (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
              {status}
            </div>
          ) : null}
        </form>
      </div>
    </div>
  );
}
