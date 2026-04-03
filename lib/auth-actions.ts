"use server"

import { getSupabaseServer } from "@/lib/supabase-server"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { getServerTrackedQueryParams } from "@/lib/query-params-server"
import { logCampaignConversion } from "@/lib/query-params-audit"
import { LEGAL_VERSION } from "@/lib/legal"

/* =========================
   LOGIN
========================= */
export async function loginAction(data: {
  email: string
  password: string
}) {
  const supabase = await getSupabaseServer()

  const { data: authData, error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    return { error: "Credenciales inválidas" }
  }

  const trackedParams = await getServerTrackedQueryParams()

  if (authData.user && Object.keys(trackedParams).length > 0) {
    await logCampaignConversion({
      actorId: authData.user.id,
      conversion: "auth_login",
      pathname: "/login",
      params: trackedParams,
      metadata: {
        provider: "password",
      },
    })
  }

  redirect("/")
}

/* =========================
   LOGIN INLINE (MODAL)
========================= */
export async function loginInlineAction(data: {
  email: string
  password: string
}) {
  const supabase = await getSupabaseServer()

  const { data: authData, error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    return { error: "Credenciales inválidas" }
  }

  const trackedParams = await getServerTrackedQueryParams()

  if (authData.user && Object.keys(trackedParams).length > 0) {
    await logCampaignConversion({
      actorId: authData.user.id,
      conversion: "auth_login_inline",
      pathname: "/login",
      params: trackedParams,
      metadata: {
        provider: "password",
      },
    })
  }

  return { success: true }
}

/* =========================
   REGISTRO
========================= */
export async function registerAction(data: {
  name: string
  email: string
  password: string
  acceptedLegal: boolean
}) {
  if (!data.acceptedLegal) {
    return { error: "Debes aceptar los Términos y el Aviso de Privacidad" }
  }

  const supabase = await getSupabaseServer()

  // 1️⃣ Crear usuario en auth.users
  const { data: authData, error } =
    await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          name: data.name, // se guarda en raw_user_meta_data
          legal_accepted: true,
          legal_version: LEGAL_VERSION,
          legal_accepted_at: new Date().toISOString(),
        },
      },
    })

  if (error || !authData.user) {
    return { error: error?.message ?? "Error al registrar" }
  }

  const trackedParams = await getServerTrackedQueryParams()

  // 2️⃣ Crear perfil en public.profiles (duplicando email y nombre)
  await supabase.from("profiles").insert({
    id: authData.user.id,
    name: data.name,
    email: data.email,
  })

  if (Object.keys(trackedParams).length > 0) {
    await logCampaignConversion({
      actorId: authData.user.id,
      conversion: "auth_signup",
      pathname: "/registro",
      params: trackedParams,
      metadata: {
        flow: "email_password",
      },
    })
  }

  return { success: true }
}

/* =========================
   FORGOT PASSWORD
========================= */
export async function forgotPasswordAction(email: string) {
  const supabase = await getSupabaseServer()

  const { error } = await supabase.auth.resetPasswordForEmail(
    email,
    {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/reset-password`,
    }
  )

  if (error) {
    return { error: error.message }
  }

  return { success: true }
}

/* =========================
   RESET PASSWORD
========================= */
export async function resetPasswordAction(password: string) {
  const supabase = await getSupabaseServer()

  const { error } = await supabase.auth.updateUser({
    password,
  })

  if (error) {
    return { error: error.message }
  }

  redirect("/login")
}

/* =========================
   OAuth - GET URL
========================= */
export async function getOAuthUrlAction(provider: "github" | "notion" | "spotify") {
  const supabase = await getSupabaseServer()

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    },
  })

  if (error) {
    return { error: error.message }
  }

  return { url: data.url }
}

/* =========================
   DELETE ACCOUNT
========================= */
export async function deleteAccountAction() {
  const supabase = await getSupabaseServer()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "No autenticado" }
  }

  // borrar perfil (si tienes FK)
  await supabase.from("profiles").delete().eq("id", user.id)

  // cerrar sesión
  await supabase.auth.signOut()

  revalidatePath("/")
  redirect("/")
}

/* =========================
   GET CURRENT USER NOTIFICATION DATA
========================= */
export async function getCurrentUserNotificationData() {
  const supabase = await getSupabaseServer()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  return {
    userId: user.id,
    role: (profile?.role as string) ?? "user",
  }
}

/* =========================
   GET CURRENT USER FOR HEADER
========================= */
export async function getCurrentUserForHeader() {
  const supabase = await getSupabaseServer()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  return {
    id: user.id,
    email: user.email,
    username: user.user_metadata?.username || user.email,
  }
}

/* =========================
   LOGOUT
========================= */
export async function logoutAction() {
  const supabase = await getSupabaseServer()

  await supabase.auth.signOut()

  revalidatePath("/")
  redirect("/")
}
