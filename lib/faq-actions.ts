"use server"

import { getSupabaseServer } from "@/lib/supabase-server"

type FaqItem = {
  id: string
  question: string
  answer: string
}

export async function getFaqs(): Promise<FaqItem[]> {
  const supabase = await getSupabaseServer()

  const { data, error } = await supabase
    .from("faqs")
    .select("id, question, answer")
    .eq("published", true)
    .order("position", { ascending: true })
    .order("created_at", { ascending: false })

  if (error) throw error
  return data ?? []
}
