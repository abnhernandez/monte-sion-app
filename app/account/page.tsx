import Link from "next/link";
import { getAccount } from "@/lib/account";
import { getRoleLabel } from "@/lib/roles";
import AccountForm from "./AccountForm";

export default async function AccountPage() {
  const profile = await getAccount();

  if (!profile) {
    return (
      <main className="min-h-screen bg-background px-4 py-10">
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
          <Link
            href="/"
            className="inline-flex w-fit items-center rounded-full border border-border bg-background/80 px-4 py-2 text-sm font-medium text-muted-foreground transition hover:border-primary/30 hover:text-foreground"
          >
            Volver al inicio
          </Link>

          <section className="rounded-[2rem] border border-border/70 bg-card/90 p-8 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">
              Acceso requerido
            </p>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-foreground">
              Inicia sesión para administrar tu cuenta
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
              Necesitamos autenticarte antes de mostrar tu perfil, tus datos
              públicos y las opciones de seguridad.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/login"
                className="inline-flex items-center rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
              >
                Ir a iniciar sesión
              </Link>
              <Link
                href="/"
                className="inline-flex items-center rounded-full border border-border px-5 py-3 text-sm font-medium text-foreground transition hover:bg-muted"
              >
                Seguir navegando
              </Link>
            </div>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-background">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(245,158,11,0.14),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(34,197,94,0.12),transparent_30%)]" />

      <div className="relative mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-6 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="inline-flex w-fit items-center rounded-full border border-border bg-background/80 px-4 py-2 text-sm font-medium text-muted-foreground transition hover:border-primary/30 hover:text-foreground"
        >
          Volver al inicio
        </Link>

        <section className="rounded-[2rem] border border-border/70 bg-card/90 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur sm:p-8">
          <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
            <div className="max-w-3xl space-y-4">
              <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.24em] text-primary">
                <span className="inline-flex h-2 w-2 rounded-full bg-primary" />
                Cuenta y perfil
              </p>
              <div className="space-y-3">
                <h1 className="text-4xl font-semibold tracking-tight text-foreground md:text-5xl">
                  Tu cuenta, más clara y fácil de editar
                </h1>
                <p className="max-w-2xl text-sm leading-6 text-muted-foreground md:text-base">
                  Actualiza tu información pública, revisa tu acceso y deja
                  listos datos que ahora pueden reutilizarse en formularios del
                  sitio.
                </p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:w-[44rem]">
              <div className="rounded-2xl border border-primary/20 bg-primary/10 p-4">
                <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                  Correo de acceso
                </p>
                <p className="mt-2 truncate text-sm font-semibold text-foreground">
                  {profile.email ?? "Sin correo"}
                </p>
              </div>
              <div className="rounded-2xl border border-sky-500/20 bg-sky-500/10 p-4">
                <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                  Username
                </p>
                <p className="mt-2 truncate text-sm font-semibold text-foreground">
                  {profile.username ?? "Pendiente"}
                </p>
              </div>
              <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4">
                <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                  Telefono
                </p>
                <p className="mt-2 text-sm font-semibold text-foreground">
                  {profile.phone ? "Listo" : "Pendiente"}
                </p>
              </div>
              <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4">
                <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                  Rol
                </p>
                <p className="mt-2 text-sm font-semibold text-foreground">
                  {getRoleLabel(profile.role)}
                </p>
              </div>
              <div className="rounded-2xl border border-violet-500/20 bg-violet-500/10 p-4">
                <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                  Cumpleanos
                </p>
                <p className="mt-2 text-sm font-semibold text-foreground">
                  {profile.birthday ? "Vinculado" : "Sin vincular"}
                </p>
              </div>
              <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-4">
                <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                  Autofill
                </p>
                <p className="mt-2 text-sm font-semibold text-foreground">
                  {profile.autofill.enabled ? "Activo" : "Pausado"}
                </p>
              </div>
            </div>
          </div>
        </section>

        <AccountForm profile={profile} />
      </div>
    </main>
  );
}
