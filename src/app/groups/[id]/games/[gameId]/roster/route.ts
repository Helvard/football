import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string; gameId: string }> }
) {
  const { id: groupId, gameId } = await context.params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return new NextResponse("Not authenticated", { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const entries = (body?.entries ?? []) as Array<{
    position_code: string;
    x: number | null;
    y: number | null;
    user_id: string | null;
    guest_name: string | null;
    shirt_number: number | null;
  }>;

  if (!Array.isArray(entries)) {
    return new NextResponse("Invalid payload", { status: 400 });
  }

  const { data: game, error: gameError } = await supabase
    .from("games")
    .select("id,group_id")
    .eq("id", gameId)
    .maybeSingle();

  if (gameError) {
    return new NextResponse(gameError.message, { status: 400 });
  }

  if (!game || game.group_id !== groupId) {
    return new NextResponse("Game not found", { status: 404 });
  }

  const { error: deleteError } = await supabase
    .from("game_roster_entries")
    .delete()
    .eq("game_id", gameId);

  if (deleteError) {
    return new NextResponse(deleteError.message, { status: 400 });
  }

  const rows = entries
    .filter((e) => e.user_id || e.guest_name)
    .map((e) => ({
      game_id: gameId,
      position_code: String(e.position_code),
      x: e.x,
      y: e.y,
      user_id: e.user_id,
      guest_name: e.guest_name,
      shirt_number: e.shirt_number,
    }));

  if (rows.length > 0) {
    const { error: insertError } = await supabase
      .from("game_roster_entries")
      .insert(rows);

    if (insertError) {
      return new NextResponse(insertError.message, { status: 400 });
    }
  }

  return NextResponse.json({ ok: true });
}
