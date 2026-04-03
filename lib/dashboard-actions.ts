"use server"

import { getSupabaseServer } from "@/lib/supabase-server"
import { revalidatePath } from "next/cache"

export async function updateProfile(profile: {
  name: string
  bio?: string
  avatar_url?: string
}) {
  const supabase = await getSupabaseServer()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) throw new Error("No autenticado")

  const { error } = await supabase
    .from("profiles")
    .update(profile)
    .eq("id", user.id)

  if (error) throw error

  revalidatePath("/dashboard")
}