"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function RegisterPage() {
  const router = useRouter();
  const supabase = createClient();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleRegister(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();
    setMessage("");

    if (name.trim().length < 2) {
      setMessage("Please enter your full name.");
      return;
    }

    if (password.length < 8) {
      setMessage("Password must contain at least 8 characters.");
      return;
    }

    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: {
          full_name: name.trim(),
        },
        emailRedirectTo: `${window.location.origin}/auth/confirm?next=/dashboard`,
      },
    });

    setLoading(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    if (data.session) {
      router.push("/dashboard");
      router.refresh();
    } else {
      setMessage(
        "Registration successful! Please check your email to verify your account."
      );
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">

        <h1 className="text-3xl font-bold text-slate-900">
          ClientTrack
        </h1>

        <p className="text-slate-500 mt-2 mb-6">
          Create your account to manage your clients.
        </p>

        <form onSubmit={handleRegister} className="space-y-4">

          <div>
            <label className="block mb-1 font-medium">
              Full Name
            </label>

            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className="w-full border rounded-lg p-3"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">
              Email Address
            </label>

            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full border rounded-lg p-3"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">
              Password
            </label>

            <input
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimum 8 characters"
              className="w-full border rounded-lg p-3"
            />
          </div>

          {message && (
            <p className="text-sm text-blue-700 bg-blue-50 p-3 rounded-lg">
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg font-semibold disabled:opacity-50"
          >
            {loading ? "Creating account..." : "Create Account"}
          </button>

        </form>

        <p className="text-center mt-6 text-slate-600">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-blue-600 font-semibold"
          >
            Login
          </Link>
        </p>

      </div>
    </main>
  );
}