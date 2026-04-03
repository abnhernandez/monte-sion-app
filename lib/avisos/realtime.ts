"use client"

import { getSupabaseClient } from "@/lib/supabase"

export function subscribeToAvisosRealtime(onInvalidate: () => void) {
  const supabase = getSupabaseClient()

  const channel = supabase
    .channel("avisos-hub")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "avisos" },
      () => onInvalidate()
    )
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "aviso_comments" },
      () => onInvalidate()
    )
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "aviso_reactions" },
      () => onInvalidate()
    )
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "notifications" },
      () => onInvalidate()
    )
    .subscribe()

  return () => {
    void supabase.removeChannel(channel)
  }
}
