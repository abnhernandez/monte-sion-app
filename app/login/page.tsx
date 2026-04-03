import LoginForm from "@/app/components/login"
import AuthLayout from "@/app/components/AuthLayout"
import { redirect } from "next/navigation"
import { getSupabaseServer } from "@/lib/supabase-server"
import { getServerQueryParams } from "@/lib/query-params-server"
import { resolveSmartRedirect } from "@/lib/query-params-routing"
import { logLandingTrafficView, logSmartRedirect } from "@/lib/query-params-audit"

export default async function LoginPage({
  searchParams,
}: {
  searchParams?: Record<string, string | string[] | undefined>
}) {
  const queryParams = await getServerQueryParams(searchParams ?? {})
  const supabase = await getSupabaseServer()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (Object.keys(queryParams).length > 0) {
    await logLandingTrafficView({
      actorId: user?.id,
      pathname: "/login",
      params: queryParams,
      source: user ? "authenticated-landing" : "landing",
    })
  }

  const smartRedirect = resolveSmartRedirect("/login", queryParams, {
    authenticated: Boolean(user),
  })

  if (smartRedirect) {
    await logSmartRedirect({
      actorId: user?.id,
      from: "/login",
      to: smartRedirect,
      params: queryParams,
    })
    redirect(smartRedirect)
  }

  return (
    <AuthLayout
      title="Bienvenido"
      subtitle="Inicia sesión para continuar"
    >
      <LoginForm />
    </AuthLayout>
  )
}