import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import LogoutButton from "@/components/LogoutButton";

export default async function DashboardPage() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getClaims();

  if (error || !data.claims) {
    redirect("/login");
  }

  const email = data.claims.email;

  return (
    <main className="min-h-screen bg-slate-100 p-8">

      <div className="max-w-6xl mx-auto">

        <header className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              ClientTrack Dashboard
            </h1>

            <p className="text-slate-500 mt-2">
              Welcome, {email}
            </p>
          </div>

          <LogoutButton />
        </header>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">

          <div className="bg-white p-6 rounded-xl shadow-sm">
            <p className="text-slate-500">Total Clients</p>
            <h2 className="text-3xl font-bold mt-3">0</h2>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm">
            <p className="text-slate-500">Active Leads</p>
            <h2 className="text-3xl font-bold mt-3">0</h2>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm">
            <p className="text-slate-500">Converted Leads</p>
            <h2 className="text-3xl font-bold mt-3">0</h2>
          </div>

        </section>

        <section className="bg-white p-8 rounded-xl shadow-sm mt-8">
          <h2 className="text-xl font-semibold">
            Welcome to ClientTrack
          </h2>

          <p className="text-slate-500 mt-2">
            Your client management workspace is ready.
            We'll implement client management next.
          </p>
        </section>

      </div>

    </main>
  );
}