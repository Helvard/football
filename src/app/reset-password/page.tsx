import AppShell from "@/components/AppShell";
import ResetPasswordClient from "@/app/reset-password/ResetPasswordClient";

export default function ResetPasswordPage() {
  return (
    <AppShell title="Nyt password" description="Sæt et nyt password.">
      <ResetPasswordClient />
    </AppShell>
  );
}
