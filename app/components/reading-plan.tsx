"use client";

import { useSyncExternalStore } from "react";
import { BookOpen, CheckCircle2, Circle, Loader2 } from "lucide-react";
import useSWR from "swr";
import { getSupabaseClient, type ReadingPlan as ReadingPlanType } from "@/lib/supabase";

const fetcher = async (): Promise<ReadingPlanType[]> => {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("plan_lectura")
    .select("*")
    .order("fecha", { ascending: true });

  if (error) throw error;
  return data || [];
};

function formatDate(dateString: string): string {
  const date = new Date(dateString + "T00:00:00");
  return date.toLocaleDateString("es-MX", {
    weekday: "short",
    day: "2-digit",
    month: "short",
  });
}

function isToday(dateString: string, today: Date): boolean {
  const date = new Date(dateString + "T00:00:00");
  return (
    today.getDate() === date.getDate() &&
    today.getMonth() === date.getMonth() &&
    today.getFullYear() === date.getFullYear()
  );
}

function isPast(dateString: string, today: Date): boolean {
  const currentDay = new Date(today);
  currentDay.setHours(0, 0, 0, 0);
  const date = new Date(dateString + "T00:00:00");
  return date < currentDay;
}

export function ReadingPlan() {
  const hydrated = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
  const today = hydrated ? new Date() : null;
  const { data: readings, error, isLoading } = useSWR("plan_lectura", fetcher, {
    revalidateOnFocus: false,
  });

  const displayData = readings ?? [];

  return (
    <section id="plan-lectura" className="py-24 bg-secondary/30">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-6">
            <BookOpen className="w-4 h-4" />
            <span className="text-sm font-medium">Evangelio de San Juan</span>
          </div>
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-4">
            Plan de Lectura Diaria
          </h2>
          <div className="w-24 h-1 bg-primary mx-auto rounded-full mb-6" />
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Enero 2026 - Lunes a Viernes, 1 capítulo por día
          </p>
        </div>

        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        )}

        {!!error && !readings && (
          <div className="text-center py-8 text-muted-foreground">
            <p>Houston, tenemos un problema! 😵‍💫</p>
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {displayData.map((reading: ReadingPlanType) => {
            const isTodayCard = today ? isToday(reading.fecha, today) : false;
            const past = today ? isPast(reading.fecha, today) : false;

            return (
              <div
                key={reading.id}
                className={`relative p-4 rounded-xl border transition-all ${
                  isTodayCard
                    ? "bg-primary text-primary-foreground border-primary shadow-lg scale-105"
                    : past
                      ? "bg-card/50 border-border/50"
                      : "bg-card border-border hover:border-primary/30 hover:shadow-md"
                }`}
              >
                <div className="absolute top-2 right-2">
                  {past ? (
                    <CheckCircle2
                      className={`w-4 h-4 ${today ? "text-primary-foreground/70" : "text-primary/60"}`}
                    />
                  ) : (
                    <Circle
                      className={`w-4 h-4 ${today ? "text-primary-foreground/50" : "text-muted-foreground/30"}`}
                    />
                  )}
                </div>
                <p
                  className={`text-xs uppercase tracking-wide mb-1 ${
                    isTodayCard ? "text-primary-foreground/80" : "text-muted-foreground"
                  }`}
                >
                  {formatDate(reading.fecha)}
                </p>
                <p
                  className={`font-semibold ${
                    isTodayCard ? "text-primary-foreground" : past ? "text-muted-foreground" : "text-foreground"
                  }`}
                >
                  {reading.capitulo}
                </p>
                {isTodayCard && (
                  <span className="inline-block mt-2 text-xs bg-primary-foreground/20 px-2 py-0.5 rounded-full">
                    Hoy
                  </span>
                )}
              </div>
            );
          })}
        </div>

        <p className="text-center text-muted-foreground mt-8 text-sm">
          Cada capítulo debe leerse en el día correspondiente para mantener la
          constancia en la lectura.
        </p>
      </div>
    </section>
  );
}
