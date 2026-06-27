// components/AuthModal.tsx
"use client";

import { useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { X } from "lucide-react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface AuthModalProps {
  onClose: () => void;
  onSuccess: (session: any) => void;
}

export default function AuthModal({ onClose, onSuccess }: AuthModalProps) {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function handleSubmit() {
    if (!email || !password) { setError("Email and password required."); return; }
    setLoading(true);
    setError("");
    setMessage("");

    if (mode === "signup") {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) { setError(error.message); setLoading(false); return; }
      setMessage("Check your email to confirm your account, then log in.");
      setLoading(false);
      return;
    }

    if (mode === "login") {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) { setError(error.message); setLoading(false); return; }
      onSuccess(data.session);
      onClose();
    }

    setLoading(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
      <div className="relative w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-8">
        <button onClick={onClose} className="absolute right-4 top-4 text-slate-400 hover:text-white">
          <X size={20} />
        </button>

        <h2 className="mb-2 text-2xl font-black text-white">
          {mode === "login" ? "Log in to FenceQuoteHQ" : "Create your account"}
        </h2>
        <p className="mb-6 text-sm text-slate-400">
          {mode === "login" ? "Access your Pro features." : "Sign up to unlock Pro contractor tools."}
        </p>

        <div className="grid gap-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="input"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSubmit()}
            className="input"
          />
        </div>

        {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
        {message && <p className="mt-3 text-sm text-emerald-400">{message}</p>}

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="mt-5 w-full rounded-xl bg-orange-500 py-3 font-bold text-white hover:bg-orange-600 disabled:opacity-50"
        >
          {loading ? "Please wait..." : mode === "login" ? "Log In" : "Create Account"}
        </button>

        <p className="mt-4 text-center text-sm text-slate-400">
          {mode === "login" ? (
            <>Don't have an account?{" "}
              <button onClick={() => { setMode("signup"); setError(""); setMessage(""); }} className="text-orange-400 hover:underline">Sign up</button>
            </>
          ) : (
            <>Already have an account?{" "}
              <button onClick={() => { setMode("login"); setError(""); setMessage(""); }} className="text-orange-400 hover:underline">Log in</button>
            </>
          )}
        </p>

        <style jsx global>{`.input{width:100%;border-radius:1rem;border:1px solid rgb(51 65 85);background:#020617;padding:0.85rem;color:white;outline:none}.input:focus{border-color:#fb923c}`}</style>
      </div>
    </div>
  );
}
