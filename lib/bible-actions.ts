"use server"

import { getSupabaseServer } from "@/lib/supabase-server"

export interface Versiculo {
  id: number
  libro: string
  capitulo: number
  versiculo: number
  texto: string
  referencia?: string
}

export async function getVersiculos(): Promise<Versiculo[]> {
  const supabase = await getSupabaseServer()

  const { data } = await supabase
    .from("versiculos")
    .select("*")
    .order("id", { ascending: true })

  return data || []
}
 
export async function getRandomVersiculo(): Promise<Versiculo | null> {
  const supabase = await getSupabaseServer()

  const { data, error } = await supabase
    .from("versiculos")
    .select("*")

  if (error || !data || data.length === 0) {
    return null
  }

  const random = data[Math.floor(Math.random() * data.length)]
  return random as Versiculo
}
export async function getBiblePassage({
  bibleId = "1637",
  passage = "JHN.3.16",
}: {
  bibleId?: string
  passage?: string
}) {
  const res = await fetch(
    `https://api.youversion.com/v1/bibles/${bibleId}/passages/${passage}`,
    {
      headers: {
        "x-yvp-app-key": process.env.BIBLE_API_KEY!,
      },
      cache: "no-store",
    }
  )

  if (!res.ok) {
    const text = await res.text()
    console.error("YouVersion error:", res.status, text)
    return {
      reference: "Error",
      text: "No se pudo cargar el pasaje",
    }
  }

  const data = await res.json()

  const blocks = (data?.data?.content ?? []) as Array<{ text?: string }>
  const text = blocks.map((b) => b.text ?? "").join("\n\n")

  return {
    reference: data?.data?.reference ?? "Unknown",
    text,
  }
}