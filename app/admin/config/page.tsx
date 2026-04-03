import { existsSync } from "node:fs"
import path from "node:path"
import Link from "next/link"
import {
  AlertTriangle,
  ArrowRight,
  Bell,
  BookOpen,
  Cake,
  CheckCircle2,
  FileKey,
  KeyRound,
  Megaphone,
  Shield,
  Sparkles,
  Users,
} from "lucide-react"
import { getAllUsers } from "@/lib/admin-actions"

function getStatusBadge(ready: boolean) {
  return ready
    ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300"
    : "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-300"
}

function getStatusLabel(ready: boolean) {
  return ready ? "Listo" : "Falta revisar"
}

function maskUrl(value: string | undefined) {
  if (!value) return "No definido"

  try {
    const parsed = new URL(value)
    return `${parsed.protocol}//${parsed.host}`
  } catch {
    return value
  }
}

type ModuleCardProps = {
  title: string
  description: string
  href: string
  cta: string
  status: string
  ready: boolean
  icon: React.ReactNode
}

function ModuleCard({
  title,
  description,
  href,
  cta,
  status,
  ready,
  icon,
}: ModuleCardProps) {
  return (
    <div className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
      <div className="flex items-start justify-between gap-4">
        <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-3 text-neutral-700 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-200">
          {icon}
        </div>
        <span
          className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${getStatusBadge(ready)}`}
        >
          {status}
        </span>
      </div>

      <h2 className="mt-4 text-lg font-semibold">{title}</h2>
      <p className="mt-2 text-sm text-neutral-500">{description}</p>

      <Link
        href={href}
        className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-neutral-900 transition hover:opacity-70 dark:text-neutral-100"
      >
        {cta}
        <ArrowRight size={16} />
      </Link>
    </div>
  )
}

type HealthItemProps = {
  title: string
  detail: string
  ready: boolean
}

function HealthItem({ title, detail, ready }: HealthItemProps) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-950">
      <div
        className={`mt-0.5 rounded-full p-1.5 ${
          ready
            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300"
            : "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300"
        }`}
      >
        {ready ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
      </div>
      <div>
        <p className="text-sm font-semibold">{title}</p>
        <p className="mt-1 text-sm text-neutral-500">{detail}</p>
      </div>
    </div>
  )
}

export default async function AdminConfigPage() {
  const users = await getAllUsers()

  const counts = {
    total: users.length,
    admins: users.filter((user) => user.role === "admin").length,
    leaders: users.filter((user) => user.role === "leader").length,
    staff: users.filter((user) => user.role === "staff").length,
    users: users.filter((user) => user.role === "user").length,
  }

  const hasSupabasePublic = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )
  const hasSupabaseServer = Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY)
  const hasOpenAI = Boolean(process.env.OPENAI_API_KEY)
  const hasSmtp = Boolean(
    (process.env.SMTP_HOST &&
      process.env.SMTP_PORT &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASS) ||
      (process.env.EMAIL_HOST &&
        process.env.EMAIL_PORT &&
        process.env.EMAIL_USER &&
        process.env.EMAIL_PASSWORD) ||
      process.env.RESEND_API_KEY
  )
  const hasBirthdaysCron = Boolean(process.env.BIRTHDAYS_CRON_SECRET)
  const hasBirthdaysFromEmail = Boolean(
    process.env.BIRTHDAYS_FROM_EMAIL ||
      process.env.EMAIL_FROM ||
      process.env.SMTP_USER ||
      process.env.EMAIL_USER
  )
  const hasCampFromEmail = Boolean(process.env.CAMP_FROM_EMAIL)
  const hasPublicPem = existsSync(path.join(process.cwd(), "public.pem"))
  const appUrl = maskUrl(process.env.NEXT_PUBLIC_APP_URL)

  const alerts = [
    !hasBirthdaysCron
      ? "Falta configurar `BIRTHDAYS_CRON_SECRET` para automatizar recordatorios de cumples."
      : null,
    !hasSmtp
      ? "Todavía no hay correo saliente listo. Los avisos por email no van a salir hasta configurarlo."
      : null,
    !hasOpenAI
      ? "OpenAI no está configurado. Las funciones de IA seguirán apagadas."
      : null,
    !hasPublicPem
      ? "No se detectó `public.pem`. Revisa si tu firma o validación pública depende de ese archivo."
      : null,
    counts.admins === 0
      ? "No hay admins registrados en perfiles. Conviene revisar accesos antes de seguir."
      : null,
  ].filter(Boolean) as string[]

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mx-auto w-full max-w-7xl space-y-8">
        <section className="rounded-[2rem] border border-neutral-200 bg-gradient-to-br from-white via-neutral-50 to-amber-50/60 p-6 shadow-sm dark:border-neutral-800 dark:from-neutral-950 dark:via-neutral-950 dark:to-amber-950/10">
          <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-300">
                <Sparkles size={14} />
                Configuración central
              </div>
              <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
                Estado y ajustes del panel admin
              </h1>
              <p className="mt-3 max-w-2xl text-sm text-neutral-600 dark:text-neutral-400">
                Aquí tienes una vista rápida de accesos, módulos, correo, seguridad y automatizaciones para que el sistema no quede a medias.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              <div className="rounded-2xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-950">
                <p className="text-xs uppercase tracking-[0.16em] text-neutral-500">Usuarios totales</p>
                <p className="mt-2 text-2xl font-semibold">{counts.total}</p>
              </div>
              <div className="rounded-2xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-950">
                <p className="text-xs uppercase tracking-[0.16em] text-neutral-500">App URL</p>
                <p className="mt-2 text-sm font-medium break-all">{appUrl}</p>
              </div>
              <div className="rounded-2xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-950">
                <p className="text-xs uppercase tracking-[0.16em] text-neutral-500">Alertas abiertas</p>
                <p className="mt-2 text-2xl font-semibold">{alerts.length}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <div className="rounded-3xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-950">
            <p className="text-xs uppercase tracking-[0.16em] text-neutral-500">Admins</p>
            <p className="mt-2 text-3xl font-semibold">{counts.admins}</p>
            <p className="mt-2 text-sm text-neutral-500">Control total del sistema</p>
          </div>
          <div className="rounded-3xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-950">
            <p className="text-xs uppercase tracking-[0.16em] text-neutral-500">Líderes</p>
            <p className="mt-2 text-3xl font-semibold">{counts.leaders}</p>
            <p className="mt-2 text-sm text-neutral-500">Operación y seguimiento</p>
          </div>
          <div className="rounded-3xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-950">
            <p className="text-xs uppercase tracking-[0.16em] text-neutral-500">Staff</p>
            <p className="mt-2 text-3xl font-semibold">{counts.staff}</p>
            <p className="mt-2 text-sm text-neutral-500">Participación en cumples</p>
          </div>
          <div className="rounded-3xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-950">
            <p className="text-xs uppercase tracking-[0.16em] text-neutral-500">Usuarios</p>
            <p className="mt-2 text-3xl font-semibold">{counts.users}</p>
            <p className="mt-2 text-sm text-neutral-500">Acceso normal al sitio</p>
          </div>
          <div className="rounded-3xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-950">
            <p className="text-xs uppercase tracking-[0.16em] text-neutral-500">Roles activos</p>
            <p className="mt-2 text-3xl font-semibold">4</p>
            <p className="mt-2 text-sm text-neutral-500">Admin, líder, staff y usuario</p>
          </div>
        </section>

        <section className="grid gap-4 xl:grid-cols-2">
          <div className="rounded-3xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-950">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-neutral-100 p-3 dark:bg-neutral-900">
                <Shield size={18} />
              </div>
              <div>
                <h2 className="text-xl font-semibold">Salud del sistema</h2>
                <p className="text-sm text-neutral-500">
                  Un resumen rápido de lo importante antes de publicar o automatizar cosas.
                </p>
              </div>
            </div>

            <div className="mt-5 grid gap-3">
              <HealthItem
                title="Supabase público"
                detail={
                  hasSupabasePublic
                    ? "La URL pública y la anon key están listas."
                    : "Falta `NEXT_PUBLIC_SUPABASE_URL` o `NEXT_PUBLIC_SUPABASE_ANON_KEY`."
                }
                ready={hasSupabasePublic}
              />
              <HealthItem
                title="Supabase server"
                detail={
                  hasSupabaseServer
                    ? "La service role key está disponible para procesos seguros."
                    : "Falta `SUPABASE_SERVICE_ROLE_KEY`."
                }
                ready={hasSupabaseServer}
              />
              <HealthItem
                title="Correo saliente"
                detail={
                  hasSmtp
                    ? "Hay un proveedor de email listo para avisos y recordatorios."
                    : "No hay SMTP o Resend configurado todavía."
                }
                ready={hasSmtp}
              />
              <HealthItem
                title="Automatización de cumples"
                detail={
                  hasBirthdaysCron
                    ? "El cron de cumpleaños ya puede ejecutarse con secreto."
                    : "Falta `BIRTHDAYS_CRON_SECRET` para proteger el cron."
                }
                ready={hasBirthdaysCron}
              />
              <HealthItem
                title="Clave pública local"
                detail={
                  hasPublicPem
                    ? "`public.pem` está disponible en el proyecto."
                    : "No se encontró `public.pem` en la raíz del repo."
                }
                ready={hasPublicPem}
              />
            </div>
          </div>

          <div className="rounded-3xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-950">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-neutral-100 p-3 dark:bg-neutral-900">
                <KeyRound size={18} />
              </div>
              <div>
                <h2 className="text-xl font-semibold">Pendientes recomendados</h2>
                <p className="text-sm text-neutral-500">
                  Cosas que conviene dejar listas para que el panel quede completo.
                </p>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              {alerts.length === 0 ? (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300">
                  Todo lo esencial se ve en orden. Esta parte del panel ya está bastante bien armada.
                </div>
              ) : (
                alerts.map((alert) => (
                  <div
                    key={alert}
                    className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-300"
                  >
                    {alert}
                  </div>
                ))
              )}
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-800 dark:bg-neutral-900">
                <p className="text-xs uppercase tracking-[0.16em] text-neutral-500">Email para cumples</p>
                <p className="mt-2 text-sm font-medium">
                  {hasBirthdaysFromEmail ? "Listo para usar" : "Aún no definido"}
                </p>
              </div>
              <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-800 dark:bg-neutral-900">
                <p className="text-xs uppercase tracking-[0.16em] text-neutral-500">Email de camp</p>
                <p className="mt-2 text-sm font-medium">
                  {hasCampFromEmail ? "Listo para usar" : "Aún no definido"}
                </p>
              </div>
              <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-800 dark:bg-neutral-900">
                <p className="text-xs uppercase tracking-[0.16em] text-neutral-500">IA</p>
                <p className="mt-2 text-sm font-medium">
                  {hasOpenAI ? "Conectada" : "Apagada por ahora"}
                </p>
              </div>
              <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-800 dark:bg-neutral-900">
                <p className="text-xs uppercase tracking-[0.16em] text-neutral-500">Archivo público</p>
                <p className="mt-2 text-sm font-medium">
                  {hasPublicPem ? "Detectado" : "No detectado"}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section>
          <div className="mb-4">
            <h2 className="text-2xl font-semibold">Módulos y accesos rápidos</h2>
            <p className="text-sm text-neutral-500">
              Entra directo a la parte correcta del sistema sin andar buscando entre pantallas.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <ModuleCard
              title="Usuarios y roles"
              description="Administra admins, líderes, staff y usuarios normales desde un solo lugar."
              href="/admin/users"
              cta="Abrir usuarios"
              status={`${counts.admins} admins · ${counts.leaders} líderes · ${counts.staff} staff`}
              ready={counts.admins > 0}
              icon={<Users size={18} />}
            />
            <ModuleCard
              title="Cumples"
              description="Revisa si el módulo de cumpleaños ya tiene correo y automatización listos."
              href="/birthdays/admin"
              cta="Abrir cumples admin"
              status={getStatusLabel(hasBirthdaysCron && hasBirthdaysFromEmail)}
              ready={hasBirthdaysCron && hasBirthdaysFromEmail}
              icon={<Cake size={18} />}
            />
            <ModuleCard
              title="Avisos"
              description="Publica comunicados y mantén al grupo actualizado desde el panel."
              href="/admin/avisos"
              cta="Abrir avisos"
              status="Disponible"
              ready={true}
              icon={<Megaphone size={18} />}
            />
            <ModuleCard
              title="Notificaciones"
              description="Verifica que el correo y los avisos internos estén listos para funcionar."
              href="/admin"
              cta="Ver centro de notificaciones"
              status={getStatusLabel(hasSmtp)}
              ready={hasSmtp}
              icon={<Bell size={18} />}
            />
            <ModuleCard
              title="Biblia admin"
              description="Gestiona contenido espiritual y revisa el acceso administrativo de estudio."
              href="/admin/bible"
              cta="Abrir Biblia admin"
              status="Disponible"
              ready={true}
              icon={<BookOpen size={18} />}
            />
            <ModuleCard
              title="Auditoría"
              description="Consulta cambios sensibles y revisa trazabilidad cuando algo se mueva."
              href="/admin/audit"
              cta="Abrir auditoría"
              status={getStatusLabel(hasSupabaseServer)}
              ready={hasSupabaseServer}
              icon={<FileKey size={18} />}
            />
          </div>
        </section>

        <section className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-3xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-950">
            <h2 className="text-xl font-semibold">Matriz de acceso actual</h2>
            <p className="mt-2 text-sm text-neutral-500">
              Esto te ayuda a recordar rápidamente qué puede hacer cada rol dentro de la plataforma.
            </p>

            <div className="mt-5 grid gap-3">
              <div className="rounded-2xl border border-neutral-200 p-4 dark:border-neutral-800">
                <p className="font-semibold">Admin</p>
                <p className="mt-1 text-sm text-neutral-500">
                  Control total del panel, gestión de usuarios, configuración, auditoría y admin de cumples.
                </p>
              </div>
              <div className="rounded-2xl border border-neutral-200 p-4 dark:border-neutral-800">
                <p className="font-semibold">Líder</p>
                <p className="mt-1 text-sm text-neutral-500">
                  Acceso operativo a cumpleaños y seguimiento, sin entrar al panel admin completo.
                </p>
              </div>
              <div className="rounded-2xl border border-neutral-200 p-4 dark:border-neutral-800">
                <p className="font-semibold">Staff</p>
                <p className="mt-1 text-sm text-neutral-500">
                  Puede ver cumples y participar en reservas o acciones permitidas, sin editar lo sensible.
                </p>
              </div>
              <div className="rounded-2xl border border-neutral-200 p-4 dark:border-neutral-800">
                <p className="font-semibold">Usuario</p>
                <p className="mt-1 text-sm text-neutral-500">
                  Es el acceso normal al sitio. No entra al panel admin ni al módulo de cumples.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-950">
            <h2 className="text-xl font-semibold">Siguientes pasos</h2>
            <p className="mt-2 text-sm text-neutral-500">
              Si quieres seguir fortaleciendo el panel, estas serían buenas mejoras.
            </p>

            <div className="mt-5 space-y-3">
              <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4 text-sm dark:border-neutral-800 dark:bg-neutral-900">
                Agregar edición real de variables no sensibles desde la UI con confirmaciones claras.
              </div>
              <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4 text-sm dark:border-neutral-800 dark:bg-neutral-900">
                Mostrar últimas ejecuciones del cron de cumples y sus errores si llega a fallar.
              </div>
              <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4 text-sm dark:border-neutral-800 dark:bg-neutral-900">
                Centralizar estado de correo, push y OpenAI en un panel de integraciones.
              </div>
            </div>

            <Link
              href="/admin"
              className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-neutral-900 transition hover:opacity-70 dark:text-neutral-100"
            >
              Volver al panel admin
              <ArrowRight size={16} />
            </Link>
          </div>
        </section>
      </div>
    </div>
  )
}
