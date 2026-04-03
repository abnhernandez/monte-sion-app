"use server"

import { createClient } from "@supabase/supabase-js"
import { getSupabaseServer } from "@/lib/supabase-server"

export async function deleteAccount() {
  // cliente normal (para auth.uid)
  const supabase = await getSupabaseServer()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("No autenticado")
  }

  // 🔐 cliente ADMIN (service role)
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY! // ❗ SOLO EN SERVER
  )

  // 1️⃣ borrar perfil
  await supabaseAdmin
    .from("profiles")
    .delete()
    .eq("id", user.id)

  // 2️⃣ borrar usuario auth
  const { error } = await supabaseAdmin.auth.admin.deleteUser(
    user.id
  )

  if (error) {
    throw error
  }

  // 3️⃣ cerrar sesión
  await supabase.auth.signOut()
}