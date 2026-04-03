import { redirect } from "next/navigation";
import type { Metadata } from "next";
import CampAdminDashboard from "@/components/camp/CampAdminDashboard";
import { CampAuthError, assertCampAdminAccess } from "@/lib/camp/auth";
import { listCampRegistrations } from "@/lib/camp/repository";

export const metadata: Metadata = {
  title: "Panel Campamento Monte Sion 2026",
};

export default async function CampAdminPage() {
  try {
    await assertCampAdminAccess();
  } catch (error) {
    if (error instanceof CampAuthError) {
      redirect(error.status === 401 ? "/login" : "/dashboard");
    }

    throw error;
  }

  const registrations = await listCampRegistrations();

  return (
    <main className="min-h-screen bg-[#071009] px-6 py-16 text-white">
      <div className="mx-auto max-w-7xl space-y-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#d9b65d]">
            Admin Campamento Monte Sion
          </p>
          <h1 className="mt-3 text-4xl font-semibold">
            Registros, tickets y estado de acceso
          </h1>
        </div>

        <CampAdminDashboard registrations={registrations} />
      </div>
    </main>
  );
}
