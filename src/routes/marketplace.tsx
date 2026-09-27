import { createFileRoute, Link } from "@tanstack/react-router";
import { Filter, Search, SlidersHorizontal } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { FarmShell, PageIntro } from "@/components/farm-shell";
import { fallbackListings, formatCurrency, formatDate, type Listing } from "@/lib/farm-data";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/marketplace")({
  head: () => ({ meta: [{ title: "Marketplace — Farm to Table" }, { name: "description", content: "Find fresh local produce from nearby growers." }, { property: "og:title", content: "Marketplace — Farm to Table" }, { property: "og:description", content: "Find fresh local produce from nearby growers." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: Marketplace,
});

function Marketplace() {
  const [listings, setListings] = useState<Listing[]>(fallbackListings);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All produce");
  const [sort, setSort] = useState("newest");

  useEffect(() => {
    let active = true;
    void supabase.from("produce_listings").select("*").eq("status", "active").order("created_at", { ascending: false }).then(({ data }) => { if (active && data?.length) setListings(data); });
    return () => { active = false; };
  }, []);

  const filtered = useMemo(() => [...listings].filter((item) => `${item.name} ${item.category} ${item.location ?? ""}`.toLowerCase().includes(query.toLowerCase()) && (category === "All produce" || item.category === category)).sort((a, b) => sort === "price-low" ? a.price - b.price : sort === "price-high" ? b.price - a.price : b.created_at.localeCompare(a.created_at)), [category, listings, query, sort]);
  const categories = ["All produce", ...Array.from(new Set(listings.map((item) => item.category)))];

  return <FarmShell eyebrow="The market floor"><PageIntro kicker="The market floor" title="Fresh, nearby, ready." body="Browse what is growing right now, then send a request straight to the farm." action={<Link to="/dashboard" className="rounded-md border border-border bg-background px-4 py-3 text-sm font-semibold hover:bg-secondary">View my dashboard</Link>} /><main className="mx-auto max-w-7xl px-5 py-10 lg:px-8 lg:py-14"><div className="flex flex-col gap-3 border-b border-border pb-5 lg:flex-row lg:items-center"><div className="relative flex-1"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search produce, category, or farm" className="w-full rounded-md border border-border bg-card py-3 pl-10 pr-3 text-sm outline-none focus:border-field" /></div><div className="flex flex-wrap gap-2"><label className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-sm"><Filter className="size-4 text-field" /><select value={category} onChange={(event) => setCategory(event.target.value)} className="bg-transparent outline-none">{categories.map((item) => <option key={item}>{item}</option>)}</select></label><label className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-sm"><SlidersHorizontal className="size-4 text-field" /><select value={sort} onChange={(event) => setSort(event.target.value)} className="bg-transparent outline-none"><option value="newest">Newest first</option><option value="price-low">Price: low to high</option><option value="price-high">Price: high to low</option></select></label></div></div><div className="mt-7 flex items-center justify-between"><p className="text-sm text-muted-foreground"><span className="font-semibold text-foreground">{filtered.length}</span> listings available</p><p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Short miles · long flavor</p></div><div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-3">{filtered.map((item) => <ListingCard key={item.id} listing={item} />)}</div>{filtered.length === 0 && <div className="mt-6 rounded-lg border border-dashed border-border p-12 text-center"><h2 className="font-display text-3xl">No produce found.</h2><p className="mt-2 text-sm text-muted-foreground">Try a wider search or clear the filters.</p></div>}</main></FarmShell>;
}

function ListingCard({ listing }: { listing: Listing }) {
  return <article className="group overflow-hidden rounded-lg border border-border bg-card"><Link to="/product/$id" params={{ id: listing.id }}><div className="relative aspect-[4/3] overflow-hidden bg-secondary"><img src={listing.image_url ?? "/images/farm-field.jpg"} alt={listing.name} width={928} height={720} className="size-full object-cover transition-transform duration-500 group-hover:scale-105" /><span className="absolute left-3 top-3 rounded-full bg-field px-3 py-1 font-mono text-[9px] uppercase tracking-[0.14em] text-paper">{listing.category}</span></div></Link><div className="p-4"><div className="flex items-start justify-between gap-3"><div><Link to="/product/$id" params={{ id: listing.id }} className="font-display text-xl font-semibold hover:text-field">{listing.name}</Link><p className="mt-1 text-xs text-muted-foreground">{listing.location ?? "Local grower"}</p></div><span className="font-display text-xl font-semibold">{formatCurrency(listing.price)}<span className="font-sans text-xs font-normal text-muted-foreground"> / {listing.unit}</span></span></div><p className="mt-3 line-clamp-2 text-sm leading-relaxed text-muted-foreground">{listing.description}</p><div className="mt-4 flex items-center justify-between border-t border-border pt-3"><span className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">{listing.quantity} available</span><span className="text-xs text-muted-foreground">{formatDate(listing.harvest_date)}</span></div></div></article>;
}