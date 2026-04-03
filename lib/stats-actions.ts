"use server"

import { getSupabaseServer } from "@/lib/supabase-server"

export type StatItem = {
  id: string
  label: string
  value: string
  description: string
  icon: "users" | "map" | "sparkles"
}

export async function getStats(): Promise<StatItem[]> {
  const supabase = await getSupabaseServer()

  const { data, error } = await supabase
    .from("stats")
    .select("id, label, value, description, icon")
    .eq("published", true)
    .order("position", { ascending: true })
    .order("created_at", { ascending: false })

  if (error) throw error
  return data ?? []
}