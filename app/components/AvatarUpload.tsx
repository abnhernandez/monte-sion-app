"use client";

import type { ChangeEvent } from "react";
import { useRef, useState } from "react";
import Image from "next/image";
import { Loader2, Pencil, Upload, X, ZoomIn } from "lucide-react";
import { toast } from "sonner";
import { uploadAvatar } from "@/lib/avatar-actions";

type AvatarUploadProps = {
  avatarUrl?: string | null;
  name?: string;
  disabled?: boolean;
  onUpload?: (url: string) => void;
  onUploadingChange?: (uploading: boolean) => void;
};

function getInitials(name?: string) {
  return (
    name
      ?.split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "TU"
  );
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "No pudimos subir tu imagen.";
}

export default function AvatarUpload({
  avatarUrl,
  name,
  disabled = false,
  onUpload,
  onUploadingChange,
}: AvatarUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  const openFilePicker = () => {
    if (!disabled && !uploading) {
      inputRef.current?.click();
    }
  };

  const handleUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    onUploadingChange?.(true);

    try {
      const url = await uploadAvatar(file);
      onUpload?.(url);
      toast.success("Foto cargada. Guarda los cambios para publicarla.");
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setUploading(false);
      onUploadingChange?.(false);
      event.target.value = "";
    }
  };

  return (
    <>
      <div className="space-y-4">
        <div className="relative mx-auto h-32 w-32">
          <button
            type="button"
            onClick={() =>
              avatarUrl && !uploading ? setPreviewOpen(true) : openFilePicker()
            }
            className="group relative flex h-32 w-32 items-center justify-center overflow-hidden rounded-[2rem] border border-border bg-background text-center shadow-sm transition hover:border-primary/35"
            aria-label={
              avatarUrl ? "Ver foto de perfil" : "Seleccionar foto de perfil"
            }
          >
            {avatarUrl ? (
              <Image
                src={avatarUrl}
                alt="Foto de perfil"
                width={128}
                height={128}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-primary/10 text-2xl font-semibold text-primary">
                {getInitials(name)}
              </div>
            )}

            <div className="pointer-events-none absolute inset-0 bg-black/0 transition group-hover:bg-black/10" />

            {uploading ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-background/90 text-sm font-medium text-foreground">
                <Loader2 className="h-5 w-5 animate-spin" />
                Subiendo...
              </div>
            ) : null}
          </button>

          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              openFilePicker();
            }}
            disabled={disabled || uploading}
            className="absolute -bottom-2 -right-2 inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-border bg-background text-foreground shadow-md transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Cambiar foto de perfil"
          >
            {uploading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Pencil className="h-4 w-4" />
            )}
          </button>

          <input
            ref={inputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif,image/avif"
            onChange={handleUpload}
            className="hidden"
          />
        </div>

        <div className="flex flex-wrap justify-center gap-2">
          <button
            type="button"
            onClick={openFilePicker}
            disabled={disabled || uploading}
            className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-medium text-foreground transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
          >
            {uploading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Upload className="h-4 w-4" />
            )}
            {uploading ? "Subiendo" : avatarUrl ? "Cambiar foto" : "Subir foto"}
          </button>

          {avatarUrl ? (
            <button
              type="button"
              onClick={() => setPreviewOpen(true)}
              className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-medium text-foreground transition hover:bg-muted"
            >
              <ZoomIn className="h-4 w-4" />
              Ver imagen
            </button>
          ) : null}
        </div>

        <p className="text-center text-xs text-muted-foreground">
          PNG, JPG, WEBP, GIF o AVIF de hasta 5 MB.
        </p>
      </div>

      {previewOpen && avatarUrl ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onClick={() => setPreviewOpen(false)}
        >
          <button
            type="button"
            onClick={() => setPreviewOpen(false)}
            className="absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-background/90 text-foreground shadow-md transition hover:bg-background"
            aria-label="Cerrar vista previa"
          >
            <X className="h-4 w-4" />
          </button>

          <div
            className="max-h-[85vh] max-w-[85vw] overflow-hidden rounded-[2rem] border border-white/10 bg-background shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <Image
              src={avatarUrl}
              alt="Vista previa del avatar"
              width={480}
              height={480}
              className="max-h-[85vh] w-auto object-contain"
            />
          </div>
        </div>
      ) : null}
    </>
  );
}
