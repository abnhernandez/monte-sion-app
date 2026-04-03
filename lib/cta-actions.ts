"use server"

import { getSupabaseServer } from "@/lib/supabase-server"

export type CtaSettings = {
  id: string
  title: string
  description: string
  icon: "heart" | "arrow"
  primary_label: string
  primary_href: string
  secondary_label: string
  secondary_href: string
  secondary_external: boolean
}

export async function getCtaSettings(): Promise<CtaSettings | null> {
  const supabase = await getSupabaseServer()

  const { data, error } = await supabase
    .from("cta_settings")
    .select(
      "id, title, description, icon, primary_label, primary_href, secondary_label, secondary_href, secondary_external"
    )
    .eq("published", true)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) throw error
  return data ?? null
}