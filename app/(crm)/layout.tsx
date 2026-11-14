import { redirect } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { requireUser } from "@/lib/auth";

export const instant = false;

export default async function CrmLayout({ children }: { children: React.ReactNode }) {
  const { user } = await requireUser();
  if (!user) redirect("/login");

  return <AppShell email={user.email}>{children}</AppShell>;
}
