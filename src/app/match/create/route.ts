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

export async function POST(request: Request) {
  const formData = await request.formData();

  const opponent = String(formData.get("opponent") || "").trim() || null;
  const scoreFor = parseOptionalInt(formData.get("score_for"));
  const scoreAgainst = parseOptionalInt(formData.get("score_against"));
  const notes = String(formData.get("notes") || "").trim();
  const groupIdsRaw = formData.getAll("group_ids").map((v) => String(v));
  const groupIds = Array.from(new Set(groupIdsRaw)).filter(Boolean);

  if (!notes) {
    return NextResponse.redirect(new URL("/match/new", request.url));
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const visibility = groupIds.length > 0 ? "shared" : "private";

  const { data: report, error: reportError } = await supabase
    .from("match_reports")
    .insert({
      author_user_id: user.id,
      opponent,
      score_for: scoreFor,
      score_against: scoreAgainst,
      notes,
      visibility,
    })
    .select("id")
    .single();

  if (reportError) {
    return NextResponse.redirect(
      new URL(`/match/new?error=${encodeURIComponent(reportError.message)}`, request.url)
    );
  }

  if (groupIds.length > 0) {
    const rows = groupIds.map((group_id) => ({
      match_report_id: report.id,
      group_id,
    }));

    const { error: shareError } = await supabase
      .from("match_report_shared_groups")
      .insert(rows);

    if (shareError) {
      return NextResponse.redirect(
        new URL(`/match/new?error=${encodeURIComponent(shareError.message)}`, request.url)
      );
    }
  }

  return NextResponse.redirect(new URL("/groups", request.url));
}
