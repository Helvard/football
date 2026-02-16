"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/browser";

export default function CreateGroupForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const trimmed = name.trim();
    if (!trimmed) return;

    setLoading(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase.rpc("create_group", {
        p_name: trimmed,
      });

      if (error) {
        setError(error.message);
        return;
      }

      setName("");
      router.push(`/groups/${data}`);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-3">
      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <form onSubmit={onSubmit} className="flex gap-2">
        <input
          name="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-md border border-zinc-200 bg-transparent px-3 py-2 text-sm"
          placeholder="Navn på gruppe"
          required
        />
        <button
          disabled={loading}
          className="rounded-md bg-black px-3 py-2 text-sm font-medium text-white disabled:opacity-60"
        >
          {loading ? "Opretter..." : "Opret"}
        </button>
      </form>
    </div>
  );
}
