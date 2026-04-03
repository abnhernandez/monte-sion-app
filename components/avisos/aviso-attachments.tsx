/* eslint-disable @next/next/no-img-element */
"use client"

import { Download, ExternalLink, FileText, PlayCircle } from "lucide-react"
import type { AvisoAttachmentRecord } from "@/lib/avisos/types"

function getYoutubeEmbedUrl(src: string) {
  try {
    const url = new URL(src)

    if (url.hostname.includes("youtu.be")) {
      return `https://www.youtube.com/embed/${url.pathname.replace("/", "")}`
    }

    if (url.hostname.includes("youtube.com")) {
      const videoId = url.searchParams.get("v")
      if (videoId) {
        return `https://www.youtube.com/embed/${videoId}`
      }
    }
  } catch {
    return src
  }

  return src
}

export default function AvisoAttachments({
  attachments,
}: {
  attachments: AvisoAttachmentRecord[]
}) {
  if (attachments.length === 0) return null

  return (
    <div className="grid gap-3">
      {attachments.map((attachment) => {
        const resolvedUrl = attachment.resolved_url ?? attachment.external_url ?? "#"

        if (attachment.kind === "image") {
          return (
            <figure
              key={attachment.id}
              className="overflow-hidden rounded-3xl border border-border bg-muted/20 shadow-sm"
            >
              <img
                src={resolvedUrl}
                alt={attachment.title || attachment.file_name || "Imagen del aviso"}
                className="h-auto w-full object-cover"
              />
              {(attachment.title || attachment.file_name) && (
                <figcaption className="px-4 py-2.5 text-sm text-muted-foreground">
                  {attachment.title || attachment.file_name}
                </figcaption>
              )}
            </figure>
          )
        }

        if (attachment.kind === "video") {
          return (
            <div
              key={attachment.id}
              className="overflow-hidden rounded-3xl border border-border bg-background shadow-sm"
            >
              <div className="flex items-center gap-2 border-b border-border/70 px-4 py-2.5 text-xs font-medium text-muted-foreground">
                <PlayCircle size={14} /> Video
              </div>
              <video
                controls
                preload="metadata"
                className="aspect-video w-full bg-black"
                src={resolvedUrl}
              />
              {attachment.title && (
                <div className="px-4 py-2.5 text-sm text-muted-foreground">
                  {attachment.title}
                </div>
              )}
            </div>
          )
        }

        if (attachment.kind === "embed") {
          return (
            <div
              key={attachment.id}
              className="overflow-hidden rounded-3xl border border-border bg-background shadow-sm"
            >
              <div className="flex items-center gap-2 border-b border-border/70 px-4 py-2.5 text-xs font-medium text-muted-foreground">
                <ExternalLink size={14} /> Video embebido
              </div>
              <iframe
                title={attachment.title || "Contenido embebido"}
                src={getYoutubeEmbedUrl(resolvedUrl)}
                className="aspect-video w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          )
        }

        return (
          <a
            key={attachment.id}
            href={resolvedUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-background px-4 py-3 text-sm shadow-sm transition hover:border-primary/25"
          >
            <div className="min-w-0">
              <div className="flex items-center gap-2 font-semibold text-foreground">
                <FileText className="h-4 w-4" />
                <span className="truncate">{attachment.title || attachment.file_name || "Archivo"}</span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{attachment.mime_type || "Adjunto"}</p>
            </div>
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/20 px-3 py-1.5 text-xs font-medium text-muted-foreground">
              <Download className="h-3.5 w-3.5" />
              Abrir
            </span>
          </a>
        )
      })}
    </div>
  )
}
