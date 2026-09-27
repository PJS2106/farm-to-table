import { supabase } from "@/integrations/supabase/client";
import type { AppRole } from "@/lib/farm-data";

export async function ensureAccount(role: AppRole = "consumer", fullName = "") {
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) return null;

  const { data: existingProfile } = await supabase.from("profiles").select("id").eq("id", user.id).maybeSingle();
  if (!existingProfile) {
    await supabase.from("profiles").insert({ id: user.id, full_name: fullName || user.user_metadata.full_name || user.email?.split("@")[0] || "" });
  }
  const { data: existingRole } = await supabase.from("user_roles").select("role").eq("user_id", user.id).maybeSingle();
  if (!existingRole) await supabase.from("user_roles").insert({ user_id: user.id, role });
  return user;
}

export async function getCurrentRole() {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return null;
  const { data } = await supabase.from("user_roles").select("role").eq("user_id", userData.user.id).maybeSingle();
  return data?.role ?? null;
}