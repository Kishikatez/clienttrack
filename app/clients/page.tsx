import { Suspense } from "react";
import { connection } from "next/server";
import { AppShell } from "@/components/AppShell";
import { requireUser } from "@/lib/auth";
import ClientsWrapper from "./ClientsWrapper";

export const instant = false;

export default function ClientsPage() {
  return (
    <Suspense fallback={null}>
      <ClientsContent />
    </Suspense>
  );
}

async function ClientsContent() {
  await connection();
  const { user } = await requireUser();

  return (
    <AppShell email={user.email}>
      <ClientsWrapper />
    </AppShell>
  );
}
