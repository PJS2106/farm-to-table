import type { Database } from "@/integrations/supabase/types";

export type Listing = Database["public"]["Tables"]["produce_listings"]["Row"];
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type RequestRow = Database["public"]["Tables"]["purchase_requests"]["Row"];
export type AppRole = Database["public"]["Enums"]["app_role"];

export const fallbackListings: Listing[] = [
  {
    id: "demo-tomatoes",
    farmer_id: null,
    name: "Heirloom Tomatoes",
    category: "Fruit",
    description: "Vine-ripened and picked at dawn. Deep flavor, thin skin, no long-distance miles.",
    price: 4.5,
    unit: "kg",
    quantity: 68,
    image_url: "/images/heirloom-tomatoes.jpg",
    location: "Cedar Hollow Farm · 6.2 mi",
    harvest_date: "2026-09-29",
    status: "active",
    created_at: "2026-09-20T08:00:00.000Z",
    updated_at: "2026-09-20T08:00:00.000Z",
  },
  {
    id: "demo-chard",
    farmer_id: null,
    name: "Rainbow Chard",
    category: "Leafy greens",
    description: "Crisp stems and tender leaves, cut to order for the week ahead.",
    price: 3.25,
    unit: "bunch",
    quantity: 42,
    image_url: "/images/rainbow-chard.jpg",
    location: "Meadowlark Co-op · 11 mi",
    harvest_date: "2026-09-28",
    status: "active",
    created_at: "2026-09-19T08:00:00.000Z",
    updated_at: "2026-09-19T08:00:00.000Z",
  },
  {
    id: "demo-berries",
    farmer_id: null,
    name: "Alpine Strawberries",
    category: "Fruit",
    description: "Small, sweet, and sun-warmed. A short seasonal run from the hillside.",
    price: 7.8,
    unit: "punnet",
    quantity: 24,
    image_url: "/images/strawberries.jpg",
    location: "Sunny Slope · 14 mi",
    harvest_date: "2026-09-30",
    status: "active",
    created_at: "2026-09-18T08:00:00.000Z",
    updated_at: "2026-09-18T08:00:00.000Z",
  },
];

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);
}

export function formatDate(value: string | null) {
  if (!value) return "Harvest date pending";
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(`${value}T12:00:00`));
}