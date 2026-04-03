"use server"

import { getSupabaseServer } from "@/lib/supabase-server"

type CommunityGroup = {
  id: string
  name: string
  description: string
  href: string
  highlight: boolean
}

export async function getCommunityGroups(): Promise<CommunityGroup[]> {
  const supabase = await getSupabaseServer()

  const { data, error } = await supabase
    .from("community_groups")
    .select("id, name, description, href, highlight")
    .eq("published", true)
    .order("position", { ascending: true })
    .order("created_at", { ascending: false })

  if (error) throw error
  return data ?? []
}
