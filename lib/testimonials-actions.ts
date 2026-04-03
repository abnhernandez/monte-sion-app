"use server"

import { getSupabaseServer } from "@/lib/supabase-server"

type Testimonial = {
  id: string
  name: string
  role: string | null
  text: string
}

export async function getTestimonials(): Promise<Testimonial[]> {
  const supabase = await getSupabaseServer()

  const { data, error } = await supabase
    .from("testimonials")
    .select("id, name, role, text")
    .eq("published", true)
    .order("position", { ascending: true })
    .order("created_at", { ascending: false })

  if (error) throw error
  return data ?? []
}
