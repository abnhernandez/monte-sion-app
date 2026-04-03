"use server"

import { getSupabaseServer } from "@/lib/supabase-server"

export type HeroCta = {
  id: string
  label: string
  href: string
  variant: "primary" | "ghost"
  icon: "heart" | "map" | "calendar"
}

export async function getHeroCtas(): Promise<HeroCta[]> {
  const supabase = await getSupabaseServer()

  const { data, error } = await supabase
    .from("hero_ctas")
    .select("id, label, href, variant, icon")
    .eq("published", true)
    .order("position", { ascending: true })
    .order("created_at", { ascending: false })

  if (error) throw error
  return data ?? []
}