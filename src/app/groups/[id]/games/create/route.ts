import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id: groupId } = await context.params;
  const formData = await request.formData();

  const date = String(formData.get("date") || "").trim();
  const formation = String(formData.get("formation") || "4-3-3").trim() || "4-3-3";
  const squadSizeRaw = String(formData.get("squad_size") || "11").trim();
  const squadSize = squadSizeRaw === "8" ? 8 : 11;
  const opponent = String(formData.get("opponent") || "").trim() || null;
  const location = String(formData.get("location") || "").trim() || null;
  const notes = String(formData.get("notes") || "").trim() || null;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const { data: game, error } = await supabase
    .from("games")
    .insert({
      group_id: groupId,
      created_by: user.id,
      date: date || undefined,
      opponent,
      location,
      formation,
      squad_size: squadSize,
      notes,
    })
    .select("id")
    .single();

  if (error) {
    return NextResponse.redirect(
      new URL(
        `/groups/${groupId}/games/new?error=${encodeURIComponent(error.message)}`,
        request.url
      )
    );
  }

  return NextResponse.redirect(
    new URL(`/groups/${groupId}/games/${game.id}`, request.url)
  );
}
