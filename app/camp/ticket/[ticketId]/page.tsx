import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft, Download } from "lucide-react";
import CampTicketCard from "@/components/camp/CampTicketCard";
import { getCampRegistrationByTicketId } from "@/lib/camp/repository";
import { buildCampTicketViewModel } from "@/lib/camp/ticket";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ ticketId: string }>;
}): Promise<Metadata> {
  const { ticketId } = await params;

  return {
    title: `Ticket ${ticketId} | Campamento Monte Sion 2026`,
  };
}

export default async function CampTicketPage({
  params,
}: {
  params: Promise<{ ticketId: string }>;
}) {
  const { ticketId } = await params;
  const registration = await getCampRegistrationByTicketId(ticketId);

  if (!registration) {
    return (
      <main className="min-h-screen bg-[#071009] px-6 py-20 text-white">
        <div className="mx-auto max-w-3xl rounded-[2rem] bg-white/[0.03] p-8 text-center ring-1 ring-white/8">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#d9b65d]">
            Ticket no encontrado
          </p>
          <h1 className="mt-4 text-4xl font-semibold">No existe ese ticket</h1>
          <p className="mt-4 text-sm leading-7 text-white/65">
            Verifica el enlace o vuelve al formulario para completar una nueva
            inscripción.
          </p>
          <Link
            href="/camp"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#d9b65d] px-5 py-3 text-sm font-semibold text-[#102116]"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al campamento
          </Link>
        </div>
      </main>
    );
  }

  const ticket = await buildCampTicketViewModel(registration);

  return (
    <main className="min-h-screen bg-[#071009] px-6 py-16 text-white">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#d9b65d]">
              Ticket digital
            </p>
            <h1 className="mt-2 text-4xl font-semibold">Acceso Campamento Monte Sion 2026</h1>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/camp"
              className="inline-flex items-center gap-2 rounded-full bg-white/5 px-5 py-3 text-sm font-medium text-white/80 transition hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              Volver
            </Link>
            {ticket.responsivaUrl ? (
              <a
                href={ticket.responsivaUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-[#d9b65d] px-5 py-3 text-sm font-semibold text-[#102116]"
              >
                <Download className="h-4 w-4" />
                Descargar responsiva
              </a>
            ) : null}
          </div>
        </div>

        <CampTicketCard ticket={ticket} />
      </div>
    </main>
  );
}
