import { NextResponse, type NextRequest } from "next/server"
import { createServerClient, type SetAllCookies } from "@supabase/ssr"
import {
  pickTrackedQueryParams,
  readQueryParamsFromSearchParams,
  writeTrackedQueryParamsToCookies,
} from "@/lib/query-params"

type CookiePayload = Parameters<SetAllCookies>[0][number]

const protectedRoutes = [
  "/dashboard",
  "/account",
  "/admin",
  "/birthdays",
  "/camp/admin",
  "/camp/check-in",
]
const adminRoutes = ["/admin", "/camp/admin", "/camp/check-in"]
const birthdayAdminRoutes = ["/birthdays/admin"]
const birthdayTeamRoutes = ["/birthdays"]

export async function proxy(request: NextRequest) {
  const response = NextResponse.next()

  const isServerAction =
    request.headers.get("next-action") !== null ||
    request.headers.get("x-action") !== null

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookies: CookiePayload[]) {
          cookies.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname
  const code = request.nextUrl.searchParams.get("code")
  const currentQueryParams = readQueryParamsFromSearchParams(request.nextUrl.searchParams)
  const trackedQueryParams = pickTrackedQueryParams(currentQueryParams)

  if (Object.keys(trackedQueryParams).length > 0) {
    writeTrackedQueryParamsToCookies(
      response.cookies,
      trackedQueryParams,
      request.nextUrl.protocol === "https:"
    )
  }

  // OAuth callback fallback: if Supabase redirects to / with ?code=
  if (pathname === "/" && code) {
    const url = request.nextUrl.clone()
    url.pathname = "/auth/callback"
    return NextResponse.redirect(url)
  }

  if (isServerAction) {
    return response
  }

  // Alias legado: /home ahora vive en /
  if (pathname === "/home") {
    const url = request.nextUrl.clone()
    url.pathname = "/"
    return NextResponse.redirect(url)
  }

  // 🔐 Rutas protegidas
  if (protectedRoutes.some(r => pathname.startsWith(r)) && !user) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  // 👑 Solo admin / equipo de cumpleaños
  if (
    user &&
    (adminRoutes.some(r => pathname.startsWith(r)) ||
      birthdayAdminRoutes.some(r => pathname.startsWith(r)) ||
      birthdayTeamRoutes.some(r => pathname.startsWith(r)))
  ) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single()

    if (
      adminRoutes.some(r => pathname.startsWith(r)) &&
      profile?.role !== "admin"
    ) {
      return NextResponse.redirect(new URL("/dashboard", request.url))
    }

    if (
      birthdayAdminRoutes.some(r => pathname.startsWith(r)) &&
      profile?.role !== "admin"
    ) {
      return NextResponse.redirect(new URL("/birthdays", request.url))
    }

    if (
      birthdayTeamRoutes.some(r => pathname.startsWith(r)) &&
      !["admin", "leader", "staff"].includes(profile?.role ?? "")
    ) {
      return NextResponse.redirect(new URL("/dashboard", request.url))
    }
  }

  // Evitar login si ya está logueado
  if (user && (pathname === "/login" || pathname === "/registro")) {
    return NextResponse.redirect(new URL("/", request.url))
  }

  return response
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|manifest.webmanifest).*)",
  ],
}
