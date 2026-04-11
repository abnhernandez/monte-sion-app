"use client";

import Link from "next/link";
import { useDeferredValue, useState } from "react";
import { Download, ExternalLink, Search } from "lucide-react";
import type { CampRegistrationRecord } from "@/lib/camp/types";
import {
  buildFullName,
  formatHumanDateTime,
  formatPhoneForDisplay,
  formatRoleLabel,
  summarizeRegistrationForSearch,
} from "@/lib/camp/utils";

type CampAdminDashboardProps = {
  registrations: CampRegistrationRecord[];
};

export default function CampAdminDashboard({
  registrations,
}: CampAdminDashboardProps) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"all" | CampRegistrationRecord["status"]>(
    "all"
  );
  const deferredQuery = useDeferredValue(query);

  const filteredRegistrations = registrations.filter((registration) => {
    const matchesQuery = deferredQuery
      ? summarizeRegistrationForSearch(registration).includes(
          deferredQuery.toLowerCase()
        )
      : true;
    const matchesStatus =
      status === "all" ? true : registration.status === status;

    return matchesQuery && matchesStatus;
  });

  const checkedInCount = registrations.filter(
    (registration) => registration.status === "checked_in"
  ).length;
  const minorsCount = registrations.filter((registration) => registration.isMinor).length;

  return (
    <div className="space-y-8">
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-[1.75rem] border border-white/10 bg-white/[0.03] p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#d9b65d]">
            Registros
          </p>
          <p className="mt-4 text-4xl font-semibold text-white">
            {registrations.length}
          </p>
        </div>
        <div className="rounded-[1.75rem] border border-white/10 bg-white/[0.03] p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#d9b65d]">
            Check-in
          </p>
          <p className="mt-4 text-4xl font-semibold text-white">{checkedInCount}</p>
        </div>
        <div className="rounded-[1.75rem] border border-white/10 bg-white/[0.03] p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#d9b65d]">
            Menores
          </p>
          <p className="mt-4 text-4xl font-semibold text-white">{minorsCount}</p>
        </div>
      </div>

      <div className="flex flex-col gap-4 rounded-[1.75rem] border border-white/10 bg-white/[0.03] p-5 md:flex-row md:items-center md:justify-between">
        <label className="relative w-full md:max-w-md">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar por ticket, nombre, telefono o iglesia"
            className="w-full rounded-full border border-white/10 bg-white/5 py-3 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-white/35 focus:border-[#d9b65d]/50"
          />
        </label>

        <select
          value={status}
          onChange={(event) =>
            setStatus(event.target.value as "all" | CampRegistrationRecord["status"])
          }
          className="rounded-full border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none"
        >
          <option value="all" className="bg-[#102116]">
            Todos
          </option>
          <option value="registered" className="bg-[#102116]">
            Registrados
          </option>
          <option value="checked_in" className="bg-[#102116]">
            Check-in realizado
          </option>
        </select>
      </div>

      <div className="space-y-4">
        {filteredRegistrations.map((registration) => (
          <article
            key={registration.id}
            className="rounded-[1.75rem] border border-white/10 bg-white/[0.03] p-5"
          >
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-3">
                  <h3 className="text-xl font-semibold text-white">
                    {buildFullName(registration.firstName, registration.lastName)}
                  </h3>
                  <span className="rounded-full border border-[#d9b65d]/25 bg-[#d9b65d]/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[#f0cf79]">
                    {registration.ticketId}
                  </span>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${
                      registration.status === "checked_in"
                        ? "bg-emerald-500/15 text-emerald-200"
                        : "bg-sky-500/15 text-sky-200"
                    }`}
                  >
                    {registration.status === "checked_in"
                      ? "Check-in"
                      : "Pendiente"}
                  </span>
                  {registration.isMinor ? (
                    <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white/70">
                      Menor
                    </span>
                  ) : null}
                </div>

                <div className="grid gap-3 text-sm text-white/70 md:grid-cols-2">
                  <p>{formatPhoneForDisplay(registration.phone)}</p>
                  <p>{registration.churchName}</p>
                  <p>{formatRoleLabel(registration.campRole)}</p>
                  <p>Emergencia: {registration.emergencyName}</p>
                  <p>Creado: {formatHumanDateTime(registration.createdAt)}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 lg:justify-end">
                <Link
                  href={`/camp/ticket/${registration.ticketId}`}
                  className="inline-flex items-center gap-2 rounded-full bg-[#d9b65d] px-4 py-2.5 text-sm font-semibold text-[#102116] transition hover:brightness-105"
                >
                  <ExternalLink className="h-4 w-4" />
                  Ver ticket
                </Link>
                {registration.isMinor ? (
                  <a
                    href={`/api/camp/responsiva/${registration.ticketId}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2.5 text-sm font-medium text-white/80 transition hover:border-white/30 hover:text-white"
                  >
                    <Download className="h-4 w-4" />
                    Responsiva
                  </a>
                ) : null}
              </div>
            </div>
          </article>
        ))}

        {filteredRegistrations.length === 0 ? (
          <div className="rounded-[1.75rem] border border-dashed border-white/10 bg-white/[0.02] px-6 py-12 text-center text-sm text-white/55">
            No hay registros que coincidan con la búsqueda.
          </div>
        ) : null}
      </div>
    </div>
  );
}
