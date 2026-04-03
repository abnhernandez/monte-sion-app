import { redirect } from "next/navigation";
import type { Metadata } from "next";
import CampCheckInClient from "@/components/camp/CampCheckInClient";
import { CampAuthError, assertCampAdminAccess } from "@/lib/camp/auth";

export const metadata: Metadata = {
  title: "Check-in Campamento Monte Sion 2026",
};

export default async function CampCheckInPage() {
  try {
    await assertCampAdminAccess();
  } catch (error) {
    if (error instanceof CampAuthError) {
      redirect(error.status === 401 ? "/login" : "/dashboard");
    }

    throw error;
  }

  return (
    <main className="min-h-screen bg-[#071009] px-6 py-16 text-white">
      <div className="mx-auto max-w-7xl space-y-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#d9b65d]">
            Acceso del evento
          </p>
          <h1 className="mt-3 text-4xl font-semibold">
            Escáner QR y check-in manual
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-white/65">
            Usa la cámara del dispositivo para leer el ticket o captura el ID
            manualmente si el navegador no soporta escaneo automático.
          </p>
        </div>

        <CampCheckInClient />
      </div>
    </main>
  );
}
