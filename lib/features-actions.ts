"use server"

import { getSupabaseServer } from "@/lib/supabase-server"

export type FeatureItem = {
  id: string
  title: string
  description: string
  href: string
  icon: "book" | "message" | "calendar" | "bell"
}

export async function getFeatures(): Promise<FeatureItem[]> {
  const supabase = await getSupabaseServer()

  const { data, error } = await supabase
    .from("features")
    .select("id, title, description, href, icon")
    .eq("published", true)
    .order("position", { ascending: true })
    .order("created_at", { ascending: false })

  if (error) throw error
  return data ?? []
}