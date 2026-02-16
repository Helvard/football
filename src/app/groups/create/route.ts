import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const name = String(formData.get("name") || "").trim();

  if (!name) {
    return NextResponse.redirect(new URL("/groups", request.url));
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    return NextResponse.redirect(
      new URL(
        `/groups?error=${encodeURIComponent(
          "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY"
        )}`,
        request.url
      )
    );
  }

  let response = NextResponse.next({
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

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    response = NextResponse.redirect(new URL("/login", request.url));
    return response;
  }

  const { data, error } = await supabase
    .from("groups")
    .insert({ name, created_by: user.id })
    .select("id")
    .single();

  if (error) {
    response = NextResponse.redirect(
      new URL(`/groups?error=${encodeURIComponent(error.message)}`, request.url)
    );
    return response;
  }

  response = NextResponse.redirect(new URL(`/groups/${data.id}`, request.url));
  return response;
}
