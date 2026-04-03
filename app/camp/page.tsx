import MultiStepForm from "@/components/form/MultiStepForm";

export default async function CampPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="mx-auto w-full max-w-5xl px-6 pt-12 sm:pt-16">
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Registro
        </h1>
      </section>

      <section
        id="registro"
        className="mx-auto w-full max-w-5xl px-6 pb-20 pt-8 sm:pt-10"
      >
        <MultiStepForm />
      </section>
    </main>
  );
}
