"use server"

import { getSupabaseServer } from "@/lib/supabase-server"

export type QuickAction = {
  id: string
  label: string
  href: string
}

export async function getQuickActions(): Promise<QuickAction[]> {
  const supabase = await getSupabaseServer()

  const { data, error } = await supabase
    .from("quick_actions")
    .select("id, label, href")
    .eq("published", true)
    .order("position", { ascending: true })
    .order("created_at", { ascending: false })

  if (error) throw error
  return data ?? []
}