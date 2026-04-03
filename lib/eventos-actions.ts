"use server";
import "server-only";

import { getSupabaseServer } from "@/lib/supabase-server";
import type { EventoDbRow, EventoItem } from "@/lib/eventos-types";

const mexicoTimeFormatter = new Intl.DateTimeFormat("en-GB", {
  timeZone: "America/Mexico_City",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

const normalizeText = (value: unknown) => String(value ?? "").trim();

const normalizeTimeValue = (value: unknown) => {
  const normalized = normalizeText(value);
  if (!normalized) return "";

  const match = normalized.match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);
  if (!match) return "";

  const [, hoursRaw, minutesRaw] = match;
  const hours = Number(hoursRaw);
  const minutes = Number(minutesRaw);

  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
    return "";
  }

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
};

const getMexicoTimeFromDate = (value: unknown) => {
  const normalized = normalizeText(value);
  if (!normalized) return "";

  const date = new Date(normalized);
  if (Number.isNaN(date.getTime())) return "";

  const parts = mexicoTimeFormatter.formatToParts(date);
  const hours = parts.find((part) => part.type === "hour")?.value;
  const minutes = parts.find((part) => part.type === "minute")?.value;

  if (!hours || !minutes) return "";
  return `${hours}:${minutes}`;
};

const getEventoFecha = (row: EventoDbRow) =>
  normalizeText(
    row.start_at ??
      row.fecha_evento ??
      row.fecha ??
      row.date ??
      row.dia ??
      row.day,
  );

const getEventoAvatar = (row: EventoDbRow) =>
  normalizeText(row.avatar_url) || normalizeText(row.cover_image_url) || null;

const getEventoActionHref = (row: EventoDbRow) =>
  normalizeText(row.live_link) || null;

const getEventoSummaryHref = (row: EventoDbRow) =>
  normalizeText(row.reading_url) || null;

const getEventoReadingHref = (row: EventoDbRow) =>
  normalizeText(
      row.lectura_link ??
      row.enlace_lectura ??
      row.url_lectura ??
      row.link_lectura,
  ) || null;

const normalizeEvento = (row: EventoDbRow): EventoItem | null => {
  const fechaBase = getEventoFecha(row);
  if (!fechaBase) return null;

  const startTime =
    normalizeTimeValue(row.start_time ?? row.hora_inicio ?? row.inicio) ||
    getMexicoTimeFromDate(row.start_at ?? row.fecha_evento);

  const endTime =
    normalizeTimeValue(row.end_time ?? row.hora_fin ?? row.fin) ||
    getMexicoTimeFromDate(row.end_at);

  return {
    id: String(row.id ?? `${fechaBase}-${row.title ?? row.titulo ?? "evento"}`),
    fecha: fechaBase,
    title: row.title ?? row.titulo ?? row.nombre ?? "Evento",
    subject: row.subject ?? row.materia ?? row.tema ?? "",
    teacher: row.teacher ?? row.maestro ?? row.profesor ?? "",
    startTime,
    endTime,
    avatarUrl: getEventoAvatar(row),
    actionHref: getEventoActionHref(row),
    summaryHref: getEventoSummaryHref(row),
    readingHref: getEventoReadingHref(row),
    tags: row.tags ?? row.etiquetas ?? [],
  };
};

export async function getEventos(): Promise<EventoItem[]> {
  const supabase = await getSupabaseServer();

  const { data, error } = await supabase
    .from("eventos")
    .select("*")
    .eq("published", true)
    .order("fecha_evento", { ascending: true })
    .order("fecha", { ascending: true })
    .order("start_time", { ascending: true });

  if (error) {
    console.error("Error obteniendo eventos:", error);
    throw error;
  }

  return (data ?? [])
    .map((row) => normalizeEvento(row as EventoDbRow))
    .filter((row): row is EventoItem => Boolean(row));
}
