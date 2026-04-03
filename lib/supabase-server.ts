import { createServerClient, type SetAllCookies } from "@supabase/ssr"
import { cookies } from "next/headers"
type CookiePayload = Parameters<SetAllCookies>[0][number]

export async function getSupabaseServer() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll().map((cookie) => ({
            name: cookie.name,
            value: cookie.value,
          }))
        },
        setAll(cookies: CookiePayload[]) {
          try {
            cookies.forEach(({ name, value, options }) => {
              cookieStore.set({ name, value, ...(options ?? {}) })
            })
          } catch {
            // When this runs inside a Server Component, Next.js blocks cookie writes.
            // In that case the proxy/middleware layer should handle session refreshes.
          }
        },
      },
    }
  )
}

export { createServerClient }
