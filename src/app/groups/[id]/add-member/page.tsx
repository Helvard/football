import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AppShell from "@/components/AppShell";

export default async function AddMemberPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  async function addMember(formData: FormData) {
    "use server";

    const email = String(formData.get("email") || "").trim();
    if (!email) {
      redirect(`/groups/${id}/add-member`);
    }

    const supabase = await createClient();
    const { error } = await supabase.rpc("add_group_member_by_email", {
      p_group_id: id,
      p_email: email,
    });

    if (error) {
      redirect(`/groups/${id}/add-member?error=${encodeURIComponent(error.message)}`);
    }

    redirect(`/groups/${id}`);
  }

  return (
    <AppShell
      title="Tilføj medlem"
      description="Brug email (brugeren skal allerede have en konto)."
    >
      <div className="mx-auto max-w-lg space-y-6">
        <div className="flex items-center justify-between">
          <Link className="text-sm underline" href={`/groups/${id}`}>
            Tilbage
          </Link>
          <Link className="text-sm underline" href="/groups">
            Grupper
          </Link>
        </div>

        <div className="rounded-lg border border-zinc-200 p-4">
          <form action={addMember} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="w-full rounded-md border border-zinc-200 bg-transparent px-3 py-2 text-sm"
              />
            </div>
            <button className="w-full rounded-md bg-black px-3 py-2 text-sm font-medium text-white">
              Tilføj
            </button>
          </form>
        </div>
      </div>
    </AppShell>
  );
}
