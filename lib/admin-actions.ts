"use server"

import { createClient } from "@supabase/supabase-js"
import { getSupabaseServer } from "@/lib/supabase-server"
import { getSafeAppRole, type AppRole } from "@/lib/roles"

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // 🔐 SOLO SERVER
)

/* ===============================
   VERIFICAR ADMIN
================================ */
async function assertAdmin() {
  const supabase = await getSupabaseServer()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) throw new Error("No autenticado")

  const { data } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  if (data?.role !== "admin") {
    throw new Error("No autorizado")
  }

  return user
}

/* ===============================
   OBTENER USUARIOS
================================ */
export async function getAllUsers() {
  await assertAdmin()

  const { data, error } = await supabaseAdmin
    .from("profiles")
    .select("id, name, email, role, created_at")
    .order("created_at", { ascending: false })

  if (error) throw error
  return (data ?? []).map((user) => ({
    ...user,
    role: getSafeAppRole(user.role),
  }))
}

/* ===============================
   CAMBIAR ROL
================================ */
export async function updateUserRole(
  userId: string,
  role: AppRole
) {
  await assertAdmin()

  const { error } = await supabaseAdmin
    .from("profiles")
    .update({ role })
    .eq("id", userId)

  if (error) throw error
}

/* ===============================
   ELIMINAR USUARIO (OPCIONAL)
================================ */
export async function deleteUser(userId: string) {
  await assertAdmin()

  // borrar perfil
  await supabaseAdmin
    .from("profiles")
    .delete()
    .eq("id", userId)

  // borrar auth
  const { error } =
    await supabaseAdmin.auth.admin.deleteUser(userId)

  if (error) throw error
}
