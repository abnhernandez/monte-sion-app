"use server"

import { getSupabaseServer } from "@/lib/supabase-server"

export type HeroSettings = {
  id: string
  badge_label: string
  badge_href: string
}

export type HeroScheduleItem = {
  id: string
  label: string
  time: string
  location: string
  href?: string | null
}

export async function getHeroSettings(): Promise<HeroSettings | null> {
  const supabase = await getSupabaseServer()

  const { data, error } = await supabase
    .from("hero_settings")
    .select("id, badge_label, badge_href")
    .eq("published", true)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) throw error
  return data ?? null
}

export async function getHeroSchedule(): Promise<HeroScheduleItem[]> {
  const supabase = await getSupabaseServer()

  const { data, error } = await supabase
    .from("hero_schedule")
    .select("id, label, time, location, href")
    .eq("published", true)
    .order("position", { ascending: true })
    .order("created_at", { ascending: false })

  if (error) throw error
  return data ?? []
}