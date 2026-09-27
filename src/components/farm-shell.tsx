import { Link, useNavigate } from "@tanstack/react-router";
import { CircleUserRound, Leaf, LogOut, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export function FarmShell({ children, eyebrow = "Harvest ledger" }: { children: React.ReactNode; eyebrow?: string }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    void supabase.auth.getSession().then(({ data }) => setEmail(data.session?.user.email ?? null));
    const { data } = supabase.auth.onAuthStateChange((_event, session) => setEmail(session?.user.email ?? null));
    return () => data.subscription.unsubscribe();
  }, []);

  async function signOut() {
    await supabase.auth.signOut();
    setEmail(null);
    await navigate({ to: "/" });
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-border/80 bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8">
          <Link to="/" className="flex items-center gap-3" aria-label="Farm to Table home">
            <span className="grid size-10 place-items-center rounded-lg bg-field text-paper"><Leaf className="size-5" /></span>
            <span><span className="block font-display text-xl font-semibold leading-none">Farm to Table</span><span className="mt-1 block font-mono text-[9px] uppercase tracking-[0.22em] text-muted-foreground">{eyebrow}</span></span>
          </Link>
          <nav className="hidden items-center gap-7 text-sm font-medium md:flex">
            <Link to="/marketplace" activeProps={{ className: "text-foreground" }} className="text-muted-foreground hover:text-foreground">Marketplace</Link>
            <Link to="/dashboard" activeProps={{ className: "text-foreground" }} className="text-muted-foreground hover:text-foreground">Dashboard</Link>
            <Link to="/requests" activeProps={{ className: "text-foreground" }} className="text-muted-foreground hover:text-foreground">Requests</Link>
          </nav>
          <div className="hidden items-center gap-2 md:flex">
            {email ? <><Link to="/profile" className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground hover:text-foreground"><CircleUserRound className="size-4" /> Profile</Link><button type="button" onClick={signOut} className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm text-muted-foreground hover:bg-secondary"><LogOut className="size-4" /> Sign out</button></> : <Link to="/auth" className="rounded-md bg-field-deep px-4 py-2 text-sm font-semibold text-paper hover:bg-field">Sign in</Link>}
          </div>
          <button type="button" className="rounded-md p-2 md:hidden" onClick={() => setOpen((value) => !value)} aria-label="Toggle navigation">{open ? <X className="size-5" /> : <Menu className="size-5" />}</button>
        </div>
        {open && <div className="border-t border-border px-5 py-4 md:hidden"><div className="grid gap-4 text-sm"><Link to="/marketplace" onClick={() => setOpen(false)}>Marketplace</Link><Link to="/dashboard" onClick={() => setOpen(false)}>Dashboard</Link><Link to="/requests" onClick={() => setOpen(false)}>Requests</Link><Link to={email ? "/profile" : "/auth"} onClick={() => setOpen(false)} className="w-fit rounded-md bg-field px-4 py-2 font-semibold text-paper">{email ? "Profile" : "Sign in"}</Link></div></div>}
      </header>
      {children}
    </div>
  );
}

export function PageIntro({ kicker, title, body, action }: { kicker: string; title: string; body: string; action?: React.ReactNode }) {
  return <div className="border-b border-border bg-card"><div className="mx-auto flex max-w-7xl flex-col gap-6 px-5 py-12 lg:flex-row lg:items-end lg:justify-between lg:px-8 lg:py-16"><div className="max-w-2xl"><p className="font-mono text-[10px] uppercase tracking-[0.2em] text-field">{kicker}</p><h1 className="mt-3 font-display text-5xl font-semibold leading-[0.98] tracking-tight text-balance">{title}</h1><p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground">{body}</p></div>{action}</div></div>;
}