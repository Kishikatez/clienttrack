"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);
    if (signInError) {
      setError(signInError.message);
    } else {
      router.replace("/dashboard");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-lg">
        <h1 className="mb-6 text-center text-2xl font-semibold text-gray-800">Sign in to ClientTrack</h1>
        {error && <p className="mb-4 rounded bg-red-100 p-2 text-sm text-red-700">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
            <input id="email" type="email" required value={email} onChange={e=>setEmail(e.target.value)} className="mt-1 block w-full rounded border-gray-300 focus:border-indigo-500 focus:ring-indigo-500" />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
            <input id="password" type="password" required value={password} onChange={e=>setPassword(e.target.value)} className="mt-1 block w-full rounded border-gray-300 focus:border-indigo-500 focus:ring-indigo-500" />
          </div>
          <button type="submit" disabled={loading} className="w-full rounded bg-indigo-600 py-2 text-white hover:bg-indigo-700 disabled:opacity-50">
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-gray-600">Don't have an account? <a href="/register" className="text-indigo-600 hover:underline">Register</a></p>
      </div>
    </div>
  );
}
