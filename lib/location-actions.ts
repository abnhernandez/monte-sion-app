"use server"

import { getSupabaseServer } from "@/lib/supabase-server"

type LocationInfo = {
  id: string
  title: string
  address_line1: string
  address_line2: string
  city: string
  map_label: string
}

export async function getLocation(): Promise<LocationInfo | null> {
  const supabase = await getSupabaseServer()

  const { data, error } = await supabase
    .from("locations")
    .select("id, title, address_line1, address_line2, city, map_label")
    .eq("published", true)
    .order("position", { ascending: true })
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) throw error
  return data ?? null
}
