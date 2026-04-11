import MultiStepForm from "@/components/form/MultiStepForm";

export default async function CampPage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(217,182,93,0.10),transparent_26%),linear-gradient(180deg,#070809_0%,#0b0d0f_44%,#0a0b0c_100%)] text-foreground">
      <section className="mx-auto w-full max-w-6xl px-6 pb-8 pt-8 sm:pb-10 sm:pt-12 lg:pt-16">
        <div className="rounded-[1.5rem] bg-white/[0.04] px-5 py-5 sm:px-6 sm:py-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#f0cf79]">
            Bautizos + servicio general
          </p>
          <h1 className="mt-2 text-3xl font-semibold leading-tight text-white sm:text-4xl lg:text-5xl">
            12 de Abril de 2026 | 10:00 AM (GMT-6)
          </h1>
        </div>
      </section>

      <section id="registro" className="mx-auto w-full max-w-6xl px-6 pb-16 sm:pb-20">
        <MultiStepForm />
      </section>

      <footer className="mx-auto w-full max-w-6xl px-6 pb-10 sm:pb-12">
        <div className="text-sm text-white/70">
          Rancho Leche &amp; Miel by UCTEM Universidad, Calle 2 de Abril, San Sebatián Abasolo, 70407, Oaxaca, México.
        </div>
      </footer>
    </main>
  );
}