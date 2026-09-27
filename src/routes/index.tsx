import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Check, ChevronDown, CircleUserRound, Leaf, Menu, Search, ShoppingBasket, Sprout, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import fieldImage from "@/assets/farm-field.jpg";
import tomatoesImage from "@/assets/heirloom-tomatoes.jpg";
import chardImage from "@/assets/rainbow-chard.jpg";
import strawberriesImage from "@/assets/strawberries.jpg";

type Role = "farmer" | "consumer";
type Listing = {
  id: string;
  name: string;
  category: string;
  description: string;
  price: number;
  unit: string;
  quantity: number;
  location: string | null;
  harvest_date: string | null;
  farmer_id: string | null;
  image_url: string | null;
};

const sampleListings: Listing[] = [
  { id: "tomatoes", name: "Heirloom Tomatoes", category: "Fruit", description: "Vine-ripened and picked at dawn. Deep flavor, thin skin, no long-distance miles.", price: 4.5, unit: "kg", quantity: 68, location: "Cedar Hollow Farm · 6.2 mi", harvest_date: "2026-09-29", farmer_id: null, image_url: tomatoesImage },
  { id: "chard", name: "Rainbow Chard", category: "Leafy greens", description: "Crisp stems and tender leaves, cut to order for the week ahead.", price: 3.25, unit: "bunch", quantity: 42, location: "Meadowlark Co-op · 11 mi", harvest_date: "2026-09-28", farmer_id: null, image_url: chardImage },
  { id: "berries", name: "Alpine Strawberries", category: "Fruit", description: "Small, sweet, and sun-warmed. A short seasonal run from the hillside.", price: 7.8, unit: "punnet", quantity: 24, location: "Sunny Slope · 14 mi", harvest_date: "2026-09-30", farmer_id: null, image_url: strawberriesImage },
];

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Farm to Table — Fresh produce, direct from growers" },
      { name: "description", content: "Shop fresh local produce and help farmers sell what they grow." },
      { property: "og:title", content: "Farm to Table — Fresh produce, direct from growers" },
      { property: "og:description", content: "Shop fresh local produce and help farmers sell what they grow." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: FarmToTable,
});

function FarmToTable() {
  const navigate = useNavigate();
  const [sessionEmail, setSessionEmail] = useState<string | null>(null);
  const [role, setRole] = useState<Role>("consumer");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All produce");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [authBusy, setAuthBusy] = useState(false);
  const [authError, setAuthError] = useState("");
  const [authSuccess, setAuthSuccess] = useState("");

  useEffect(() => {
    void supabase.auth.getSession().then(({ data }) => setSessionEmail(data.session?.user.email ?? null));
    const { data } = supabase.auth.onAuthStateChange((_event, currentSession) => setSessionEmail(currentSession?.user.email ?? null));
    return () => data.subscription.unsubscribe();
  }, []);

  const listings = useMemo(() => sampleListings.filter((listing) => {
    const matchesQuery = `${listing.name} ${listing.category} ${listing.location}`.toLowerCase().includes(query.toLowerCase());
    return matchesQuery && (category === "All produce" || listing.category === category);
  }), [category, query]);

  async function handleGoogle() {
    setAuthBusy(true);
    setAuthError("");
    const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
    if (result.error) setAuthError(result.error.message);
    setAuthBusy(false);
  }

  async function handleEmailAuth(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAuthBusy(true);
    setAuthError("");
    setAuthSuccess("");
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "");
    const password = String(form.get("password") ?? "");
    if (authMode === "register") {
      const name = String(form.get("name") ?? "");
      const result = await supabase.auth.signUp({ email, password, options: { data: { full_name: name, role } } });
      if (result.error) setAuthError(result.error.message);
      else setAuthSuccess("Check your email to confirm your account, then come back to Farm to Table.");
    } else {
      const result = await supabase.auth.signInWithPassword({ email, password });
      if (result.error) setAuthError(result.error.message);
      else {
        setSessionEmail(result.data.user.email ?? email);
        setShowAuth(false);
        void navigate({ to: "/dashboard" });
      }
    }
    setAuthBusy(false);
  }

  function requestPurchase(listing: Listing) {
    if (!sessionEmail) {
      setAuthMode("login");
      setShowAuth(true);
      return;
    }
    void navigate({ to: "/marketplace", search: { listing: listing.id } });
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-border/80 bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8">
          <Link to="/" className="flex items-center gap-3" aria-label="Farm to Table home">
            <span className="grid size-10 place-items-center rounded-lg bg-field text-paper"><Leaf className="size-5" /></span>
            <span><span className="block font-display text-xl font-semibold leading-none">Farm to Table</span><span className="mt-1 block font-mono text-[9px] uppercase tracking-[0.22em] text-muted-foreground">the harvest ledger</span></span>
          </Link>
          <nav className="hidden items-center gap-7 text-sm font-medium md:flex">
            <a href="#market" className="text-foreground">Marketplace</a>
            <Link to="/dashboard" className="text-muted-foreground transition-colors hover:text-foreground">Dashboard</Link>
            <Link to="/requests" className="text-muted-foreground transition-colors hover:text-foreground">Requests</Link>
            <a href="#about" className="text-muted-foreground transition-colors hover:text-foreground">About us</a>
          </nav>
          <div className="hidden items-center gap-2 md:flex">
            {sessionEmail ? <Link to="/profile" className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground"><CircleUserRound className="size-4" /> Profile</Link> : <button type="button" onClick={() => { setAuthMode("login"); setShowAuth(true); }} className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground">Log in</button>}
            <button type="button" onClick={() => { setAuthMode("register"); setShowAuth(true); }} className="rounded-md bg-field-deep px-4 py-2 text-sm font-semibold text-paper transition-colors hover:bg-field">Join the table <ArrowRight className="ml-1 inline size-4" /></button>
          </div>
          <button type="button" className="rounded-md p-2 md:hidden" onClick={() => setMobileOpen((open) => !open)} aria-label="Toggle navigation">{mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}</button>
        </div>
        {mobileOpen && <div className="border-t border-border px-5 py-4 md:hidden"><div className="grid gap-4 text-sm"><a href="#market" onClick={() => setMobileOpen(false)}>Marketplace</a><Link to="/dashboard">Dashboard</Link><Link to="/requests">Requests</Link><button type="button" className="w-fit rounded-md bg-field px-4 py-2 font-semibold text-paper" onClick={() => { setShowAuth(true); setAuthMode("register"); setMobileOpen(false); }}>Join the table</button></div></div>}
      </header>

      <main>
        <section className="mx-auto max-w-7xl px-5 pb-10 pt-7 lg:px-8 lg:pt-10">
          <div className="relative min-h-[520px] overflow-hidden rounded-xl bg-field-deep">
            <img src={fieldImage} alt="Fresh greens growing in a valley field" width={1440} height={912} className="absolute inset-0 size-full object-cover opacity-75" />
            <div className="absolute inset-0 bg-field-deep/55" />
            <div className="relative flex min-h-[520px] max-w-2xl flex-col justify-end px-7 py-9 text-paper lg:px-14 lg:py-14">
              <p className="animate-rise font-mono text-[10px] uppercase tracking-[0.22em] text-sun">A better way to buy local</p>
              <h1 className="animate-rise mt-4 max-w-xl font-display text-5xl font-semibold leading-[0.95] tracking-tight text-balance [animation-delay:80ms] md:text-7xl">What the field grows, the table keeps.</h1>
              <p className="animate-rise mt-6 max-w-lg text-base leading-relaxed text-paper/80 [animation-delay:160ms] md:text-lg">A dependable marketplace between growers and the people who cook. Real produce, honest acreage, and purchase requests that actually move.</p>
              <div className="animate-rise mt-8 flex flex-wrap gap-3 [animation-delay:240ms]"><a href="#market" className="rounded-md bg-sun px-5 py-3 text-sm font-semibold text-ink transition-transform hover:-translate-y-0.5">Browse the market <ArrowRight className="ml-1 inline size-4" /></a><button type="button" onClick={() => { setAuthMode("register"); setRole("farmer"); setShowAuth(true); }} className="rounded-md border border-paper/40 bg-paper/10 px-5 py-3 text-sm font-semibold text-paper backdrop-blur transition-colors hover:bg-paper/20">I grow produce</button></div>
            </div>
            <div className="absolute bottom-6 right-6 hidden w-64 border-l border-paper/40 pl-4 text-paper/80 lg:block"><p className="font-mono text-[9px] uppercase tracking-[0.2em] text-sun">This week in the field</p><p className="mt-2 font-display text-xl">62 growers · 184 fresh listings</p></div>
          </div>
        </section>

        <section id="market" className="mx-auto max-w-7xl px-5 py-10 lg:px-8 lg:py-16">
          <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
            <aside className="lg:pt-2"><p className="font-mono text-[10px] uppercase tracking-[0.2em] text-field">The market floor</p><h2 className="mt-3 font-display text-4xl font-semibold tracking-tight">Fresh, nearby, ready.</h2><p className="mt-4 text-sm leading-relaxed text-muted-foreground">Browse what is growing right now, then send a request straight to the farm.</p><div className="mt-7 hidden border-t border-border pt-5 lg:block"><p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Your impact</p><p className="mt-2 font-display text-3xl">18,430</p><p className="text-xs text-muted-foreground">kg kept in local circulation</p></div></aside>
            <div>
              <div className="flex flex-col gap-3 border-b border-border pb-5 sm:flex-row sm:items-center sm:justify-between"><div className="relative flex-1"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search produce or farm" className="w-full rounded-md border border-border bg-card py-3 pl-10 pr-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-field" /></div><div className="flex items-center gap-2"><select value={category} onChange={(event) => setCategory(event.target.value)} className="rounded-md border border-border bg-card px-3 py-3 text-sm outline-none"><option>All produce</option><option>Fruit</option><option>Leafy greens</option></select><button type="button" className="rounded-md border border-border p-3 text-muted-foreground" aria-label="Sort listings"><ChevronDown className="size-4" /></button></div></div>
              <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">{listings.map((listing) => <article key={listing.id} className="group overflow-hidden rounded-lg border border-border bg-card transition-transform hover:-translate-y-1"><Link to="/product/$id" params={{ id: listing.id }}><div className="relative aspect-[4/3] overflow-hidden bg-secondary"><img src={listing.image_url ?? fieldImage} alt={listing.name} width={928} height={720} loading="lazy" className="size-full object-cover transition-transform duration-500 group-hover:scale-105" /><span className="absolute left-3 top-3 rounded-full bg-field px-3 py-1 font-mono text-[9px] uppercase tracking-[0.14em] text-paper">{listing.category}</span></div></Link><div className="p-4"><div className="flex items-start justify-between gap-3"><div><Link to="/product/$id" params={{ id: listing.id }} className="font-display text-xl font-semibold leading-tight hover:text-field">{listing.name}</Link><p className="mt-1 text-xs text-muted-foreground">{listing.location}</p></div><span className="font-display text-xl font-semibold">${listing.price.toFixed(2)}<span className="font-sans text-xs font-normal text-muted-foreground"> / {listing.unit}</span></span></div><p className="mt-3 line-clamp-2 text-sm leading-relaxed text-muted-foreground">{listing.description}</p><div className="mt-4 flex items-center justify-between border-t border-border pt-3"><span className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">{listing.quantity} available</span><button type="button" onClick={() => requestPurchase(listing)} className="rounded-md bg-field-deep px-3 py-2 text-xs font-semibold text-paper transition-colors hover:bg-field">Request produce</button></div></div></article>)}</div>
              {listings.length === 0 && <div className="mt-6 rounded-lg border border-dashed border-border bg-card p-10 text-center"><Sprout className="mx-auto size-8 text-field" /><h3 className="mt-3 font-display text-2xl">Nothing matches that search.</h3><p className="mt-1 text-sm text-muted-foreground">Try another crop or clear the category filter.</p></div>}
            </div>
          </div>
        </section>

        <section id="about" className="border-y border-border bg-card"><div className="mx-auto grid max-w-7xl gap-8 px-5 py-14 lg:grid-cols-[1fr_1.4fr] lg:px-8 lg:py-20"><div><p className="font-mono text-[10px] uppercase tracking-[0.2em] text-field">Built for both sides of the table</p><h2 className="mt-3 max-w-md font-display text-4xl font-semibold leading-tight">The same harvest, clear on both ends.</h2></div><div className="grid gap-4 sm:grid-cols-2"><div className="border-l-2 border-field px-5"><ShoppingBasket className="size-6 text-field" /><h3 className="mt-4 font-display text-2xl font-semibold">For the people who cook</h3><p className="mt-2 text-sm leading-relaxed text-muted-foreground">Find honest produce from nearby farms, request exactly what you need, and keep your weekly shop connected to the season.</p></div><div className="border-l-2 border-sun px-5"><Sprout className="size-6 text-clay" /><h3 className="mt-4 font-display text-2xl font-semibold">For the people who grow</h3><p className="mt-2 text-sm leading-relaxed text-muted-foreground">List what is ready, keep requests organized, and build a direct relationship with the people buying your harvest.</p></div></div></div></section>
      </main>

      <footer className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between lg:px-8"><div><span className="font-display text-lg font-semibold text-foreground">Farm to Table</span><span className="ml-3 font-mono text-[9px] uppercase tracking-[0.18em]">grown carefully · recorded honestly</span></div><p>Free to join for farmers and consumers.</p></footer>

      {showAuth && <div className="fixed inset-0 z-50 grid place-items-center bg-field-deep/60 p-5 backdrop-blur-sm"><div className="relative w-full max-w-md rounded-xl border border-border bg-background p-6 shadow-2xl"><button type="button" onClick={() => setShowAuth(false)} className="absolute right-4 top-4 rounded-md p-2 text-muted-foreground hover:bg-secondary" aria-label="Close sign in"><X className="size-4" /></button><p className="font-mono text-[10px] uppercase tracking-[0.2em] text-field">Farm to Table account</p><h2 className="mt-3 font-display text-3xl font-semibold">{authMode === "login" ? "Welcome back." : "Join the table."}</h2><p className="mt-2 text-sm text-muted-foreground">{authMode === "login" ? "Keep your requests and harvests in one place." : "Choose how you participate in the local harvest."}</p><div className="mt-5 grid grid-cols-2 gap-2 rounded-md bg-secondary p-1"><button type="button" onClick={() => setRole("consumer")} className={`rounded px-3 py-2 text-sm font-medium ${role === "consumer" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"}`}>I shop for produce</button><button type="button" onClick={() => setRole("farmer")} className={`rounded px-3 py-2 text-sm font-medium ${role === "farmer" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"}`}>I grow produce</button></div><button type="button" onClick={handleGoogle} disabled={authBusy} className="mt-4 flex w-full items-center justify-center gap-2 rounded-md border border-border bg-card px-4 py-3 text-sm font-semibold hover:bg-secondary disabled:opacity-60"><span className="text-base font-bold">G</span> Continue with Google</button><div className="my-5 flex items-center gap-3 text-[10px] uppercase tracking-[0.15em] text-muted-foreground"><span className="h-px flex-1 bg-border" /> or <span className="h-px flex-1 bg-border" /></div><form onSubmit={handleEmailAuth} className="grid gap-3">{authMode === "register" && <label className="grid gap-1.5 text-sm font-medium">Your name<input name="name" required className="rounded-md border border-input bg-card px-3 py-2.5 text-sm outline-none focus:border-field" placeholder="Asha Green" /></label>}<label className="grid gap-1.5 text-sm font-medium">Email<input name="email" required type="email" className="rounded-md border border-input bg-card px-3 py-2.5 text-sm outline-none focus:border-field" placeholder="you@example.com" /></label><label className="grid gap-1.5 text-sm font-medium">Password<input name="password" required type="password" minLength={6} className="rounded-md border border-input bg-card px-3 py-2.5 text-sm outline-none focus:border-field" placeholder="At least 6 characters" /></label>{authError && <p className="text-sm text-destructive">{authError}</p>}{authSuccess && <p className="text-sm text-field">{authSuccess}</p>}<button type="submit" disabled={authBusy} className="mt-2 rounded-md bg-field-deep px-4 py-3 text-sm font-semibold text-paper hover:bg-field disabled:opacity-60">{authBusy ? "Working…" : authMode === "login" ? "Log in" : "Create my account"}</button></form><button type="button" onClick={() => { setAuthMode(authMode === "login" ? "register" : "login"); setAuthError(""); setAuthSuccess(""); }} className="mt-5 w-full text-center text-sm text-muted-foreground hover:text-foreground">{authMode === "login" ? "New here? Create a free account" : "Already have an account? Log in"}</button></div></div>}
    </div>
  );
}