// app/dashboard/page.tsx
import { Suspense } from "react";
import { connection } from "next/server";
import { AppShell } from "@/components/AppShell";
import { requireUser } from "@/lib/auth";
import DashboardWrapper from "./DashboardWrapper";

export const instant = false;

export default function DashboardPage() {
  return (
    <Suspense fallback={null}>
      <DashboardContent />
    </Suspense>
  );
}

async function DashboardContent() {
  await connection();
  const { user } = await requireUser();

  return (
    <AppShell email={user.email}>
      <DashboardWrapper email={user.email} />
    </AppShell>
  );
}
