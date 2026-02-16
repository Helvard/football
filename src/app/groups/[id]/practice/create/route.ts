import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

function parseOptionalInt(value: FormDataEntryValue | null) {
  if (value === null) return null;
  const str = String(value).trim();
  if (!str) return null;
  const n = Number(str);
  if (!Number.isFinite(n)) return null;
  return Math.trunc(n);
}

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id: groupId } = await context.params;
  const formData = await request.formData();

  const title = String(formData.get("title") || "").trim();
  const dateRaw = String(formData.get("date") || "").trim();
  const notes = String(formData.get("notes") || "").trim() || null;

  const exerciseIds = formData.getAll("exercise_ids").map((v) => String(v));

  if (!title) {
    return NextResponse.redirect(new URL(`/groups/${groupId}/practice/new`, request.url));
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const { data: session, error: sessionError } = await supabase
    .from("practice_sessions")
    .insert({
      group_id: groupId,
      created_by: user.id,
      title,
      date: dateRaw || undefined,
      notes,
    })
    .select("id")
    .single();

  if (sessionError) {
    return NextResponse.redirect(
      new URL(
        `/groups/${groupId}/practice/new?error=${encodeURIComponent(sessionError.message)}`,
        request.url
      )
    );
  }

  if (exerciseIds.length > 0) {
    const rows = exerciseIds.map((exercise_id) => {
      const sort_order = parseOptionalInt(formData.get(`sort_${exercise_id}`)) ?? 0;
      const duration_minutes = parseOptionalInt(formData.get(`minutes_${exercise_id}`));
      return {
        practice_session_id: session.id,
        exercise_id,
        sort_order,
        duration_minutes,
      };
    });

    const { error: drillsError } = await supabase
      .from("practice_session_drills")
      .insert(rows);

    if (drillsError) {
      return NextResponse.redirect(
        new URL(
          `/groups/${groupId}/practice/new?error=${encodeURIComponent(drillsError.message)}`,
          request.url
        )
      );
    }
  }

  return NextResponse.redirect(
    new URL(`/groups/${groupId}/practice/${session.id}`, request.url)
  );
}
