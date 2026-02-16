import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

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

function jsonResponse(data: any, status = 200) {
  return NextResponse.json(data, { status });
}

async function getSupabase(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY");
  }

  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  return { supabase, response };
}

export async function POST(request: NextRequest) {
  try {
    const anthropicKey = process.env.ANTHROPIC_API_KEY;
    if (!anthropicKey) {
      return jsonResponse({ error: "Missing ANTHROPIC_API_KEY" }, 500);
    }

    const { supabase } = await getSupabase(request);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return jsonResponse({ error: "Not authenticated" }, 401);
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("is_system_admin")
      .eq("id", user.id)
      .maybeSingle();

    if (!profile?.is_system_admin) {
      return jsonResponse({ error: "Not authorized" }, 403);
    }

    const body = await request.json().catch(() => null);
    const prompt = String(body?.prompt ?? "").trim();
    if (!prompt) {
      return jsonResponse({ error: "Missing prompt" }, 400);
    }

    const system =
      "Du er en fodboldtræner-assistent. Svar KUN med valid JSON (ingen markdown, ingen forklaringer). " +
      "Skriv på dansk. Hold beskrivelser konkrete og brugbare i en træningskontekst. " +
      "Hvis et felt er ukendt, brug null.\n\n" +
      "Returnér præcis disse felter: " +
      "title, description, how_to, category, focus_areas, variants, players_min, players_max, area_size, image_url, mode, metrics_type, numeric_unit.\n" +
      "mode skal være en af: solo|group|both. metrics_type skal være en af: rating|numeric|both.";

    const userPrompt =
      "Lav en ny fodboldøvelse baseret på denne prompt. Husk felterne: Beskrivelse, Fokusområder, Varianter, Antal spillere (min/max), Banestørrelse.\n\nPrompt: " +
      prompt;

    const aiRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": anthropicKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-3-7-sonnet-20250219",
        max_tokens: 1200,
        temperature: 0.4,
        system,
        messages: [{ role: "user", content: userPrompt }],
      }),
    });

    if (!aiRes.ok) {
      const text = await aiRes.text();
      return jsonResponse({ error: text || "Anthropic error" }, 500);
    }

    const payload = await aiRes.json();
    const content = payload?.content?.[0]?.text;
    if (!content) {
      return jsonResponse({ error: "No content from Anthropic" }, 500);
    }

    const generated = JSON.parse(content) as GeneratedExercise;

    if (!generated.title || !generated.mode || !generated.metrics_type) {
      return jsonResponse({ error: "Invalid JSON from Anthropic" }, 500);
    }

    return jsonResponse({ exercise: generated });
  } catch (e: any) {
    return jsonResponse({ error: e?.message ?? "Unknown error" }, 500);
  }
}
