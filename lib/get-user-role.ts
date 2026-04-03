"use server"

import { getSupabaseServer } from "@/lib/supabase-server"
import { getSafeAppRole } from "@/lib/roles"

export async function getUserRole() {
  const supabase = await getSupabaseServer()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  return getSafeAppRole(data?.role)
}
