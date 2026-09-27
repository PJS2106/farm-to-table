import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Leaf } from "lucide-react";
import { useState, type FormEvent } from "react";
import { ensureAccount } from "@/lib/account";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: "Sign in — Farm to Table" }, { name: "description", content: "Sign in or create your Farm to Table account." }, { property: "og:title", content: "Sign in — Farm to Table" }, { property: "og:description", content: "Sign in or create your Farm to Table account." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [role, setRole] = useState<"farmer" | "consumer">("consumer");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function google() {
    setBusy(true); setError("");
    const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
    if (result.error) setError(result.error.message);
    setBusy(false);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError(""); setMessage("");
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "");
    const password = String(form.get("password") ?? "");
    if (mode === "register") {
      const fullName = String(form.get("fullName") ?? "");
      const result = await supabase.auth.signUp({ email, password, options: { data: { full_name: fullName, role } } });
      if (result.error) setError(result.error.message); else setMessage("Check your email to confirm your account before signing in.");
    } else {
      const result = await supabase.auth.signInWithPassword({ email, password });
      if (result.error) setError(result.error.message); else { await ensureAccount(role, String(form.get("fullName") ?? "")); await navigate({ to: "/dashboard" }); }
    }
    setBusy(false);
  }

  return <main className="grid min-h-[calc(100vh-73px)] lg:grid-cols-[1.1fr_0.9fr]"><div className="hidden bg-field-deep p-12 text-paper lg:flex lg:flex-col lg:justify-between"><Link to="/" className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-lg bg-sun text-ink"><Leaf className="size-5" /></span><span className="font-display text-xl">Farm to Table</span></Link><div><p className="font-mono text-[10px] uppercase tracking-[0.2em] text-sun">A better way to buy local</p><h1 className="mt-5 max-w-lg font-display text-6xl font-semibold leading-[0.95]">Keep your harvest close.</h1><p className="mt-6 max-w-md text-paper/70">Join the living marketplace connecting growers with the people who cook.</p></div><p className="font-mono text-[10px] uppercase tracking-[0.2em] text-paper/50">Free to join · fair by design</p></div><div className="flex items-center justify-center px-5 py-12"><div className="w-full max-w-md"><Link to="/" className="mb-10 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="size-4" /> Back to marketplace</Link><p className="font-mono text-[10px] uppercase tracking-[0.2em] text-field">Your harvest ledger</p><h2 className="mt-3 font-display text-4xl font-semibold">{mode === "login" ? "Welcome back." : "Join the table."}</h2><p className="mt-3 text-sm leading-relaxed text-muted-foreground">{mode === "login" ? "Sign in to manage your requests and listings." : "Create a free account and choose your side of the table."}</p>{mode === "register" && <div className="mt-6 grid grid-cols-2 gap-2 rounded-md bg-secondary p-1"><button type="button" onClick={() => setRole("consumer")} className={`rounded px-3 py-2 text-sm font-medium ${role === "consumer" ? "bg-card shadow-sm" : "text-muted-foreground"}`}>I shop</button><button type="button" onClick={() => setRole("farmer")} className={`rounded px-3 py-2 text-sm font-medium ${role === "farmer" ? "bg-card shadow-sm" : "text-muted-foreground"}`}>I grow</button></div>}<button type="button" onClick={google} disabled={busy} className="mt-6 flex w-full items-center justify-center gap-2 rounded-md border border-border bg-card px-4 py-3 text-sm font-semibold hover:bg-secondary disabled:opacity-60"><span className="font-bold">G</span> Continue with Google</button><div className="my-6 flex items-center gap-3 text-[10px] uppercase tracking-[0.15em] text-muted-foreground"><span className="h-px flex-1 bg-border" /> or <span className="h-px flex-1 bg-border" /></div><form onSubmit={submit} className="grid gap-4">{mode === "register" && <label className="grid gap-1.5 text-sm font-medium">Full name<input name="fullName" required className="rounded-md border border-input bg-card px-3 py-3 outline-none focus:border-field" placeholder="Asha Green" /></label>}<label className="grid gap-1.5 text-sm font-medium">Email<input name="email" type="email" required className="rounded-md border border-input bg-card px-3 py-3 outline-none focus:border-field" placeholder="you@example.com" /></label><label className="grid gap-1.5 text-sm font-medium">Password<input name="password" type="password" minLength={6} required className="rounded-md border border-input bg-card px-3 py-3 outline-none focus:border-field" placeholder="At least 6 characters" /></label>{error && <p className="text-sm text-destructive">{error}</p>}{message && <p className="text-sm text-field">{message}</p>}<button type="submit" disabled={busy} className="rounded-md bg-field-deep px-4 py-3 font-semibold text-paper hover:bg-field disabled:opacity-60">{busy ? "Working…" : mode === "login" ? "Sign in" : "Create account"}</button></form><button type="button" onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); setMessage(""); }} className="mt-6 w-full text-sm text-muted-foreground hover:text-foreground">{mode === "login" ? "New here? Create a free account" : "Already have an account? Sign in"}</button></div></div></main>;
}