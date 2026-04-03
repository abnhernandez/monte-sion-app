"use client";

import React, { useMemo, useState } from "react";
import Evento from "./evento";
import type { EventoItem } from "@/lib/eventos-types";

const monthFormatter = new Intl.DateTimeFormat("es-ES", {
  month: "short",
  timeZone: "UTC",
});

const monthYearFormatter = new Intl.DateTimeFormat("es-ES", {
  month: "long",
  year: "numeric",
});

const getDateKey = (fecha: string) => {
  if (!fecha) return "";

  const plainDateMatch = fecha.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (plainDateMatch) {
    return `${plainDateMatch[1]}-${plainDateMatch[2]}-${plainDateMatch[3]}`;
  }

  const parsed = new Date(fecha);
  if (Number.isNaN(parsed.getTime())) return "";

  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Mexico_City",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(parsed);

  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  const day = parts.find((part) => part.type === "day")?.value;

  if (!year || !month || !day) return "";
  return `${year}-${month}-${day}`;
};

const getTimeKey = (time: string) => {
  const match = time.match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return "";

  const [, hourRaw, minuteRaw] = match;
  const hour = Number(hourRaw);
  const minute = Number(minuteRaw);

  if (hour < 0 || hour > 23 || minute < 0 || minute > 59) return "";
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
};

const isPastEvent = (e: EventoItem, now: Date) => {
  if (!e.endTime) return false;

  const eventDateKey = getDateKey(e.fecha);
  if (!eventDateKey) return false;

  const nowDateKey = getDateKey(now.toISOString());
  if (!nowDateKey) return false;

  if (eventDateKey < nowDateKey) return true;
  if (eventDateKey > nowDateKey) return false;

  const endTimeKey = getTimeKey(e.endTime);
  if (!endTimeKey) return false;

  const nowMxParts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Mexico_City",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(now);

  const nowHour = nowMxParts.find((part) => part.type === "hour")?.value;
  const nowMinute = nowMxParts.find((part) => part.type === "minute")?.value;
  if (!nowHour || !nowMinute) return false;

  const nowTimeKey = `${nowHour}:${nowMinute}`;
  return endTimeKey < nowTimeKey;
};

const groupByDay = (events: EventoItem[]) => {
  const map = new Map<string, EventoItem[]>();

  for (const ev of events) {
    const key = getDateKey(ev.fecha);
    if (!key) continue;
    (map.get(key) ?? map.set(key, []).get(key)!).push(ev);
  }

  return [...map.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([day, list]) => ({
      day,
      list: [...list].sort((a, b) =>
        getTimeKey(a.startTime).localeCompare(getTimeKey(b.startTime)),
      ),
    }));
};

type Props = {
  eventos?: EventoItem[];
  titulo?: string;
  categoria?: string;
  currentTimeIso?: string;
};

export default function CalendarioSemanal({
  eventos = [],
  titulo = "Calendario",
  categoria = "GENERAL",
  currentTimeIso,
}: Props) {
  const [mostrarPasados, setMostrarPasados] = useState(false);
  const now = useMemo(
    () => (currentTimeIso ? new Date(currentTimeIso) : null),
    [currentTimeIso],
  );

  const visibles = useMemo(
    () =>
      now
        ? mostrarPasados
          ? eventos
          : eventos.filter((e: EventoItem) => !isPastEvent(e, now))
        : eventos,
    [eventos, mostrarPasados, now],
  );

  const grupos = useMemo(() => groupByDay(visibles), [visibles]);

  return (
    <section className="w-full px-4 py-6">
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-foreground">{titulo}</h1>

        <p className="text-muted-foreground capitalize">
          {now ? monthYearFormatter.format(now) : "—"}
        </p>

        <div className="mt-4 flex items-center justify-between gap-3 border-b border-border pb-2">
          <span className="relative inline-block py-2 text-sm font-semibold text-foreground">
            {categoria}
            <span className="absolute left-0 -bottom-px h-0.5 w-16 bg-[#0f2747] dark:bg-[#8ab4ff]" />
          </span>

          <a
            href="https://calendar.google.com/calendar/u/0?cid=YmM1NzA3MWZiNzkyMzQ3ZWM0MGNiMjZhZWFkMjcwNDNmZjMwNTQxYjYzZDM1MjY4YTgwMGY5NDg4MTdmZjc1M0Bncm91cC5jYWxlbmRhci5nb29nbGUuY29t"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center rounded-[18px] bg-black px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
          >
            Agregar al calendario
          </a>
        </div>
      </header>

      <div className="flex flex-col gap-4">
        {grupos.length === 0 && (
          <p className="text-sm text-muted-foreground">
            No hay eventos para mostrar.
          </p>
        )}

        {grupos.map(({ day, list }) => {
          const [year, monthIndex, dayIndex] = day.split("-").map(Number);
          const date = new Date(
            Date.UTC(year, monthIndex - 1, dayIndex, 12, 0, 0),
          );
          const month = monthFormatter.format(date).toUpperCase();
          const dayNum = dayIndex.toString();

          return (
            <div key={day} className="flex flex-col gap-4">
              {list.map((ev) => (
                <Evento
                  key={ev.id}
                  month={month}
                  day={dayNum}
                  title={ev.title}
                  subject={ev.subject}
                  teacher={ev.teacher}
                  startTime={ev.startTime}
                  endTime={ev.endTime}
                  avatarUrl={ev.avatarUrl}
                  actionHref={ev.actionHref}
                  hideActionButton={now ? isPastEvent(ev, now) : false}
                  summaryHref={ev.summaryHref}
                  readingHref={ev.readingHref}
                  tags={ev.tags?.map((t) => ({ label: t }))}
                />
              ))}
            </div>
          );
        })}
      </div>

      <footer className="mt-6">
        <label className="inline-flex items-center gap-2 text-sm text-muted-foreground">
          <input
            type="checkbox"
            className="rounded border-border bg-background text-[#0f2747] focus:ring-[#0f2747] dark:text-[#8ab4ff]"
            checked={mostrarPasados}
            onChange={(e) => setMostrarPasados(e.target.checked)}
          />
          Mostrar eventos pasados
        </label>
      </footer>
    </section>
  );
}
