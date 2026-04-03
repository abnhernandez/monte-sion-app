import PublicLandingPage from "@/components/home/PublicLandingPage"
import AuthenticatedHomeClient from "@/components/home/AuthenticatedHomeClient"
import { getSupabaseServer } from "@/lib/supabase-server"
import { redirect } from "next/navigation"
import { getServerQueryParams } from "@/lib/query-params-server"
import { resolveSmartRedirect } from "@/lib/query-params-routing"
import {
  logLandingTrafficView,
  logQueryParamsAttribution,
  logSmartRedirect,
} from "@/lib/query-params-audit"

export default async function RootPage({
  searchParams,
}: {
  searchParams?: Record<string, string | string[] | undefined>
}) {
  const requestQueryParams = await getServerQueryParams(searchParams ?? {})
  const supabase = await getSupabaseServer()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (Object.keys(requestQueryParams).length > 0) {
    await logQueryParamsAttribution({
      actorId: user?.id,
      pathname: "/",
      params: requestQueryParams,
      source: user ? "authenticated-landing" : "landing",
    })
    await logLandingTrafficView({
      actorId: user?.id,
      pathname: "/",
      params: requestQueryParams,
      source: user ? "authenticated-landing" : "landing",
    })
  }

  const smartRedirect = resolveSmartRedirect("/", requestQueryParams, {
    authenticated: Boolean(user),
  })

  if (smartRedirect) {
    await logSmartRedirect({
      actorId: user?.id,
      from: "/",
      to: smartRedirect,
      params: requestQueryParams,
    })
    redirect(smartRedirect)
  }

  if (!user) {
    return <PublicLandingPage />
  }

  return <AuthenticatedHomeClient />
}
