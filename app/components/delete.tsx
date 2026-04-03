"use client";

import { useState, useTransition } from "react";
import { Loader2, ShieldAlert, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { deleteAccount } from "@/lib/delete-account";

function getErrorMessage(error: unknown) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "No pudimos eliminar tu cuenta.";
}

export default function DeleteAccountButton({
  disabled = false,
}: {
  disabled?: boolean;
}) {
  const [confirming, setConfirming] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    startTransition(async () => {
      try {
        await deleteAccount();
        toast.success("Tu cuenta fue eliminada. Redirigiendo...");
        window.location.assign("/");
      } catch (error) {
        toast.error(getErrorMessage(error));
      }
    });
  };

  return (
    <div className="rounded-[1.5rem] border border-destructive/20 bg-destructive/5 p-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="space-y-2">
          <p className="inline-flex items-center gap-2 text-sm font-semibold text-foreground">
            <ShieldAlert className="h-4 w-4 text-destructive" />
            Eliminar cuenta
          </p>
          <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
            Esta accion borra tu perfil, cierra tu sesion y no se puede
            deshacer.
          </p>
        </div>

        {!confirming ? (
          <button
            type="button"
            onClick={() => setConfirming(true)}
            disabled={disabled || isPending}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-destructive/30 bg-background px-4 py-2 text-sm font-semibold text-destructive transition hover:bg-destructive/10 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Trash2 className="h-4 w-4" />
            Quiero eliminar mi cuenta
          </button>
        ) : (
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setConfirming(false)}
              disabled={isPending}
              className="inline-flex items-center justify-center rounded-full border border-border px-4 py-2 text-sm font-medium text-foreground transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={disabled || isPending}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-destructive px-4 py-2 text-sm font-semibold text-destructive-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
              {isPending ? "Eliminando..." : "Confirmar eliminacion"}
            </button>
          </div>
        )}
      </div>

      {confirming ? (
        <p className="mt-4 rounded-2xl border border-destructive/20 bg-background/80 px-4 py-3 text-xs leading-5 text-destructive">
          Confirma solo si estas totalmente seguro. Perderas el acceso y el
          contenido asociado a esta cuenta.
        </p>
      ) : null}
    </div>
  );
}
