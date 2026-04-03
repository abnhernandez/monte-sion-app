import { redirect } from "next/navigation"
import { getSupabaseServer } from "@/lib/supabase-server"
import { getAvisosActorContext } from "@/lib/avisos/permissions"
import { getAvisosHubPayload } from "@/lib/avisos/queries"
import { getServerQueryParams } from "@/lib/query-params-server"
import { resolveSmartRedirect } from "@/lib/query-params-routing"
import { logLandingTrafficView, logSmartRedirect } from "@/lib/query-params-audit"
import AvisosClient from "./ui"

export default async function AvisosPage({
  searchParams,
}: {
  searchParams?: Record<string, string | string[] | undefined>
}) {
  const queryParams = await getServerQueryParams(searchParams ?? {})
  const supabase = await getSupabaseServer()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  const actor = await getAvisosActorContext()

  if (Object.keys(queryParams).length > 0) {
    await logLandingTrafficView({
      actorId: user?.id,
      pathname: "/avisos",
      params: queryParams,
      source: user ? "authenticated-landing" : "landing",
    })
  }

  const smartRedirect = resolveSmartRedirect("/avisos", queryParams, {
    authenticated: Boolean(user),
  })

  if (smartRedirect) {
    await logSmartRedirect({
      actorId: user?.id,
      from: "/avisos",
      to: smartRedirect,
      params: queryParams,
    })
    redirect(smartRedirect)
  }

  const initialData = await getAvisosHubPayload(actor)

  return <AvisosClient initialData={initialData} />
}
