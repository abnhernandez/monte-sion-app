"use server"

import { getSupabaseServer } from "@/lib/supabase-server"

type Ministry = {
  id: string
  title: string
  description: string
  icon: string
}

export async function getMinistries(): Promise<Ministry[]> {
  const supabase = await getSupabaseServer()

  const { data, error } = await supabase
    .from("ministries")
    .select("id, title, description, icon")
    .eq("published", true)
    .order("position", { ascending: true })
    .order("created_at", { ascending: false })

  if (error) throw error
  return data ?? []
}
