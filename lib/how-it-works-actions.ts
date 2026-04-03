"use server"

import { getSupabaseServer } from "@/lib/supabase-server"

export type HowItWorksStep = {
  id: string
  step: number
  title: string
  description: string
}

export async function getHowItWorksSteps(): Promise<HowItWorksStep[]> {
  const supabase = await getSupabaseServer()

  const { data, error } = await supabase
    .from("how_it_works_steps")
    .select("id, step, title, description")
    .eq("published", true)
    .order("step", { ascending: true })
    .order("created_at", { ascending: false })

  if (error) throw error
  return data ?? []
}