import { NextResponse } from "next/server"
import { createServerClient, type SetAllCookies } from "@supabase/ssr"
import { cookies } from "next/headers"
type CookiePayload = Parameters<SetAllCookies>[0][number]

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  const redirectTo = searchParams.get("redirect_to") ?? "/"

  if (!code) {
    return NextResponse.redirect(new URL("/login", origin))
  }

  const cookieStore = await cookies()
  const response = NextResponse.redirect(new URL(redirectTo, origin))

  const supabase = createServerClient(
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
          cookies.forEach(({ name, value, options }) => {
            response.cookies.set({ name, value, ...(options ?? {}) })
          })
        },
      },
    }
  )

  const { error } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    return NextResponse.redirect(new URL("/login", origin))
  }

  return response
}
