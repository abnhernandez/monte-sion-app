import Image from "next/image";
import Link from "next/link";
import { CalendarDays, Download, MapPin, QrCode, ShieldCheck, Ticket } from "lucide-react";
import type { CampTicketViewModel } from "@/lib/camp/types";

type CampTicketCardProps = {
  ticket: CampTicketViewModel;
};

export default function CampTicketCard({ ticket }: CampTicketCardProps) {
  return (
    <article className="overflow-hidden rounded-[2rem] border border-[#d9b65d]/20 bg-[linear-gradient(145deg,#102116_0%,#0b160d_45%,#0a120d_100%)] shadow-[0_24px_80px_rgba(0,0,0,0.4)]">
      <div className="grid gap-0 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="relative overflow-hidden p-6 md:p-8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(217,182,93,0.18),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(84,155,103,0.18),transparent_32%)]" />
          <div className="relative">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#d9b65d]">
                  Campamento Monte Sion 2026
                </p>
                <h3 className="mt-3 text-3xl font-semibold text-white">
                  {ticket.attendeeName}
                </h3>
                <p className="mt-2 text-sm text-white/60">{ticket.roleLabel}</p>
              </div>
              <div className="rounded-full border border-emerald-400/25 bg-emerald-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-200">
                {ticket.checkedInAt ? "Check-in realizado" : "Listo para acceso"}
              </div>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/45">
                  Ticket ID
                </p>
                <div className="mt-3 flex items-center gap-3 text-lg font-semibold text-white">
                  <Ticket className="h-5 w-5 text-[#d9b65d]" />
                  {ticket.ticketId}
                </div>
              </div>

              <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/45">
                  Emitido
                </p>
                <p className="mt-3 text-sm text-white/85">{ticket.createdAtLabel}</p>
              </div>
            </div>

            <div className="mt-8 space-y-4 rounded-[1.75rem] border border-white/10 bg-black/15 p-5">
              <div className="flex items-center gap-3 text-sm text-white/80">
                <CalendarDays className="h-4 w-4 text-[#d9b65d]" />
                {ticket.eventDateLabel}
              </div>
              <div className="flex items-center gap-3 text-sm text-white/80">
                <MapPin className="h-4 w-4 text-[#d9b65d]" />
                {ticket.location}
              </div>
              <div className="flex items-center gap-3 text-sm text-white/80">
                <ShieldCheck className="h-4 w-4 text-[#d9b65d]" />
                {ticket.isMinor
                  ? "Incluye carta responsiva descargable."
                  : "Registro completo para mayor de edad."}
              </div>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href={ticket.ticketUrl}
                className="rounded-full bg-[#d9b65d] px-5 py-3 text-sm font-semibold text-[#102116] transition hover:brightness-105"
              >
                Abrir ticket
              </Link>
              {ticket.responsivaUrl ? (
                <a
                  href={ticket.responsivaUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-white/15 px-5 py-3 text-sm font-medium text-white/80 transition hover:border-white/30 hover:text-white"
                >
                  <Download className="h-4 w-4" />
                  Descargar responsiva
                </a>
              ) : null}
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center gap-5 border-t border-white/10 bg-[#08110b] p-6 lg:border-l lg:border-t-0">
          <div className="rounded-full border border-[#d9b65d]/30 bg-[#d9b65d]/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#f0cf79]">
            Código QR
          </div>
          <div className="rounded-[2rem] border border-[#d9b65d]/20 bg-white p-5 shadow-[0_20px_50px_rgba(0,0,0,0.25)]">
            <Image
              src={ticket.qrDataUrl}
              alt={`QR del ticket ${ticket.ticketId}`}
              width={224}
              height={224}
              unoptimized
              className="h-56 w-56"
            />
          </div>
          <div className="flex items-center gap-2 text-sm text-white/60">
            <QrCode className="h-4 w-4 text-[#d9b65d]" />
            Presenta este código al ingresar
          </div>
        </div>
      </div>
    </article>
  );
}
