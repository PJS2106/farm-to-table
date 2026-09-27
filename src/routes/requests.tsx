import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, Clock3, MessageSquare, X } from "lucide-react";
import { useEffect, useState } from "react";
import { FarmShell, PageIntro } from "@/components/farm-shell";
import { getCurrentRole } from "@/lib/account";
import type { AppRole, RequestRow } from "@/lib/farm-data";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/requests")({
  head: () => ({ meta: [{ title: "Purchase requests — Farm to Table" }, { name: "description", content: "Track produce requests and conversations with local growers." }, { property: "og:title", content: "Purchase requests — Farm to Table" }, { property: "og:description", content: "Track produce requests and conversations with local growers." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: Requests,
});

function Requests() {
  const [role, setRole] = useState<AppRole>("consumer");
  const [rows, setRows] = useState<RequestRow[]>([]);
  const [signedIn, setSignedIn] = useState(true);
  const [notice, setNotice] = useState("");

  useEffect(() => { let active = true; void supabase.auth.getUser().then(async ({ data }) => { if (!data.user) { if (active) setSignedIn(false); return; } const currentRole = await getCurrentRole(); const { data: requests } = await supabase.from("purchase_requests").select("*").or(`consumer_id.eq.${data.user.id},farmer_id.eq.${data.user.id}`).order("created_at", { ascending: false }); if (active) { setRole(currentRole ?? "consumer"); setRows(requests ?? []); } }); return () => { active = false; }; }, []);

  async function updateRequest(id: string, status: string) {
    const { error } = await supabase.from("purchase_requests").update({ status }).eq("id", id);
    if (error) setNotice(error.message); else { setRows((current) => current.map((row) => row.id === id ? { ...row, status } : row)); setNotice(status === "accepted" ? "Request accepted." : "Request updated."); }
  }

  if (!signedIn) return <FarmShell><main className="mx-auto max-w-2xl px-5 py-24 text-center"><MessageSquare className="mx-auto size-10 text-field" /><h1 className="mt-5 font-display text-5xl">Keep the conversation close.</h1><p className="mt-4 text-muted-foreground">Sign in to see your produce requests.</p><Link to="/auth" className="mt-7 inline-flex rounded-md bg-field-deep px-5 py-3 font-semibold text-paper">Sign in</Link></main></FarmShell>;
  return <FarmShell eyebrow="Purchase requests"><PageIntro kicker={role === "farmer" ? "Incoming requests" : "Your requests"} title={role === "farmer" ? "What is moving from your field." : "Your path from field to table."} body={role === "farmer" ? "Review requests, keep buyers in the loop, and let the harvest move." : "Every request is a small conversation with the grower who raised it."} /><main className="mx-auto max-w-5xl px-5 py-10 lg:px-8 lg:py-14">{notice && <p className="mb-5 rounded-md border border-field/30 bg-sage/20 px-4 py-3 text-sm text-field-deep">{notice}</p>}<div className="grid gap-4">{rows.length ? rows.map((row) => <RequestCard key={row.id} row={row} farmer={role === "farmer"} onUpdate={updateRequest} />) : <div className="rounded-lg border border-dashed border-border p-12 text-center"><Clock3 className="mx-auto size-8 text-field" /><h2 className="mt-4 font-display text-3xl">No requests yet.</h2><p className="mt-2 text-sm text-muted-foreground">Start with something fresh from the market.</p><Link to="/marketplace" className="mt-5 inline-flex rounded-md bg-field px-4 py-2 text-sm font-semibold text-paper">Browse produce</Link></div>}</div></main></FarmShell>;
}

function RequestCard({ row, farmer, onUpdate }: { row: RequestRow; farmer: boolean; onUpdate: (id: string, status: string) => Promise<void> }) {
  return <article className="rounded-lg border border-border bg-card p-5"><div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"><div><div className="flex items-center gap-2"><span className={`size-2 rounded-full ${row.status === "accepted" ? "bg-field" : row.status === "declined" ? "bg-clay" : "bg-sun"}`} /><p className="font-display text-2xl font-semibold">{row.quantity} units requested</p></div><p className="mt-2 text-xs text-muted-foreground">Sent {new Date(row.created_at).toLocaleDateString()} · Request #{row.id.slice(0, 8)}</p></div><span className="rounded-full bg-secondary px-3 py-1 text-xs capitalize text-muted-foreground">{row.status}</span></div><p className="mt-5 border-l-2 border-field pl-4 text-sm leading-relaxed text-muted-foreground">{row.message || "No message included."}</p><div className="mt-5 flex flex-wrap gap-2 border-t border-border pt-4">{farmer && row.status === "pending" ? <><button type="button" onClick={() => onUpdate(row.id, "accepted")} className="inline-flex items-center gap-2 rounded-md bg-field px-4 py-2 text-sm font-semibold text-paper"><Check className="size-4" /> Accept request</button><button type="button" onClick={() => onUpdate(row.id, "declined")} className="inline-flex items-center gap-2 rounded-md border border-border px-4 py-2 text-sm font-semibold hover:bg-secondary"><X className="size-4" /> Decline</button></> : !farmer && row.status === "pending" ? <button type="button" onClick={() => onUpdate(row.id, "cancelled")} className="rounded-md border border-border px-4 py-2 text-sm font-semibold hover:bg-secondary">Cancel request</button> : <span className="text-sm text-muted-foreground">This request is {row.status}.</span>}</div></article>;
}