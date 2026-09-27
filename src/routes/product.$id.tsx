import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, CalendarDays, MapPin, Minus, Plus, Send } from "lucide-react";
import { useEffect, useState } from "react";
import { FarmShell } from "@/components/farm-shell";
import { fallbackListings, formatCurrency, formatDate, type Listing } from "@/lib/farm-data";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/product/$id")({
  head: () => ({ meta: [{ title: "Produce details — Farm to Table" }, { name: "description", content: "View a local produce listing and send a purchase request." }, { property: "og:title", content: "Produce details — Farm to Table" }, { property: "og:description", content: "View a local produce listing and send a purchase request." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: ProductDetails,
});

function ProductDetails() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const [listing, setListing] = useState<Listing | null>(fallbackListings.find((item) => item.id === id) ?? null);
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState("I would love to collect this at the next available time.");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => { let active = true; void supabase.from("produce_listings").select("*").eq("id", id).maybeSingle().then(({ data }) => { if (active && data) setListing(data); }); return () => { active = false; }; }, [id]);
  if (!listing) return <FarmShell><main className="mx-auto max-w-3xl px-5 py-20 text-center"><h1 className="font-display text-5xl">Listing not found.</h1><Link to="/marketplace" className="mt-6 inline-flex rounded-md bg-field px-4 py-3 font-semibold text-paper">Back to marketplace</Link></main></FarmShell>;

  async function sendRequest() {
    setBusy(true); setNotice("");
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) { await navigate({ to: "/auth" }); return; }
    if (!listing?.farmer_id) { setNotice("This demo listing is view-only. Create an account to request a live farm listing."); setBusy(false); return; }
    const { error } = await supabase.from("purchase_requests").insert({ listing_id: listing.id, consumer_id: userData.user.id, farmer_id: listing.farmer_id, quantity, message });
    setNotice(error ? error.message : "Request sent. The grower will be in touch soon."); setBusy(false);
  }

  return <FarmShell eyebrow="Produce detail"><main className="mx-auto max-w-7xl px-5 py-8 lg:px-8 lg:py-12"><Link to="/marketplace" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="size-4" /> Back to marketplace</Link><div className="mt-8 grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-start"><div className="overflow-hidden rounded-xl bg-secondary"><img src={listing.image_url ?? "/images/farm-field.jpg"} alt={listing.name} width={1200} height={900} className="aspect-[4/3] w-full object-cover" /></div><div><p className="font-mono text-[10px] uppercase tracking-[0.2em] text-field">{listing.category} · available now</p><h1 className="mt-3 font-display text-5xl font-semibold leading-none">{listing.name}</h1><p className="mt-5 text-lg leading-relaxed text-muted-foreground">{listing.description}</p><div className="mt-7 grid gap-3 border-y border-border py-5 text-sm"><p className="flex items-center gap-3"><MapPin className="size-4 text-field" /> {listing.location ?? "Local grower"}</p><p className="flex items-center gap-3"><CalendarDays className="size-4 text-field" /> Harvested {formatDate(listing.harvest_date)}</p></div><div className="mt-7 flex items-end justify-between"><div><p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Price per {listing.unit}</p><p className="mt-1 font-display text-4xl font-semibold">{formatCurrency(listing.price)}</p></div><p className="text-sm text-muted-foreground">{listing.quantity} {listing.unit}s left</p></div><div className="mt-7 rounded-lg border border-border bg-card p-5"><h2 className="font-display text-2xl font-semibold">Send a purchase request</h2><p className="mt-1 text-sm text-muted-foreground">Tell the grower how much you need and when you can collect it.</p><div className="mt-5 flex items-center justify-between"><span className="text-sm font-medium">Quantity ({listing.unit})</span><div className="inline-flex items-center gap-3 rounded-md border border-border"><button type="button" onClick={() => setQuantity((value) => Math.max(1, value - 1))} className="p-2 text-muted-foreground hover:text-foreground" aria-label="Decrease quantity"><Minus className="size-4" /></button><span className="min-w-6 text-center text-sm font-semibold">{quantity}</span><button type="button" onClick={() => setQuantity((value) => Math.min(listing.quantity, value + 1))} className="p-2 text-muted-foreground hover:text-foreground" aria-label="Increase quantity"><Plus className="size-4" /></button></div></div><textarea value={message} onChange={(event) => setMessage(event.target.value)} className="mt-4 min-h-24 w-full resize-y rounded-md border border-input bg-background p-3 text-sm outline-none focus:border-field" aria-label="Message to grower" />{notice && <p className="mt-3 text-sm text-field">{notice}</p>}<button type="button" onClick={sendRequest} disabled={busy} className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-md bg-field-deep px-4 py-3 text-sm font-semibold text-paper hover:bg-field disabled:opacity-60"><Send className="size-4" /> {busy ? "Sending…" : "Send request"}</button></div></div></div></main></FarmShell>;
}