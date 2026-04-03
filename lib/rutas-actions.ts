"use server"

import { createServerClient, type SetAllCookies } from "@supabase/ssr"
import { cookies } from "next/headers"
import { normalizarCoordenadas } from "@/lib/coordenadas"

type CookiePayload = Parameters<SetAllCookies>[0][number]

export async function guardarUbicacionUsuario({
  userLat,
  userLng,
}: {
  userLat: number
  userLng: number
}) {
  const coords = normalizarCoordenadas({
    lat: userLat,
    lng: userLng,
  })

  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet: CookiePayload[]) => {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { error } = await supabase.from("rutas_iglesia").insert({
    user_id: user?.id ?? null,
    origen_lat: coords.lat,
    origen_lng: coords.lng,
  })

  if (error) {
    console.error("SUPABASE ERROR:", error)
    throw new Error(error.message)
  }

  return { ok: true }
}