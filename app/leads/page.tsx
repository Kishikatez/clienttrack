import { Suspense } from "react";
import { connection } from "next/server";
import { AppShell } from "@/components/AppShell";
import { requireUser } from "@/lib/auth";
import LeadsWrapper from "./LeadsWrapper";

export const instant = false;

export default function LeadsPage() {
  return (
    <Suspense fallback={null}>
      <LeadsContent />
    </Suspense>
  );
}

async function LeadsContent() {
  await connection();
  const { user } = await requireUser();

  return (
    <AppShell email={user.email}>
      <LeadsWrapper />
    </AppShell>
  );
}
