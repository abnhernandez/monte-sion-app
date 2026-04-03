"use client";

import { useState } from "react";
import { useTransition } from "react";
import { Send, Zap } from "lucide-react";
import { sendNotifyEmail } from "@/lib/notifications-actions";

export default function NotifyForm() {
  const [email, setEmail] = useState("");
  const [open, setOpen] = useState(false);
  const [, startTransition] = useTransition();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!re.test(email)) return;

    startTransition(async () => {
      const success = await sendNotifyEmail(email);
      if (success) {
      window.location.href = "?notified=1";
    } else {
      alert("No se pudo registrar el correo. Intenta de nuevo.");
    }
    })
  }

  return (
    <>
      {!open ? (
        <button
          onClick={() => setOpen(true)}
          className="flex h-12 w-full sm:w-auto items-center justify-center gap-2 rounded-full border border-black/10 px-5 transition-colors hover:bg-black/5 dark:border-white/15 dark:hover:bg-[#1a1a1a]"
        >
        <Zap size={16} />
          Avísenme cuando esté listo
        </button>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="flex items-center gap-3 w-full sm:w-auto"
        >
          <input
            type="email"
            required
            placeholder="usuario@dominio.com"
            className="h-12 min-w-0 flex-1 rounded-full border border-black/10 px-4 text-base placeholder:text-zinc-500 dark:border-white/10 dark:bg-transparent dark:placeholder:text-zinc-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-zinc-900 dark:focus-visible:ring-zinc-200"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <button
            type="submit"
            aria-label="Enviar correo"
            className="h-12 w-12 flex items-center justify-center rounded-full bg-foreground text-background transition-colors hover:bg-[#383838] dark:hover:bg-zinc-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-zinc-900 dark:focus-visible:ring-zinc-200"
          >
            <Send size={16} />
          </button>
        </form>
      )}
    </>
  );
}
