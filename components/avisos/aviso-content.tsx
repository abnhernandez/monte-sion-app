/* eslint-disable @next/next/no-img-element */
"use client"

import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { ExternalLink, FileImage, PlayCircle, Quote } from "lucide-react"
import { cn } from "@/lib/utils"
import type { AvisoMediaBlock } from "@/lib/avisos-types"

type Props = {
  content: string
  mediaBlocks?: AvisoMediaBlock[]
  className?: string
  compact?: boolean
}

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

function BlockCard({ block }: { block: AvisoMediaBlock }) {
  switch (block.type) {
    case "image":
      return (
        <figure className="overflow-hidden rounded-3xl border border-border bg-muted/25 shadow-sm">
          <div className="flex items-center gap-2 border-b border-border/70 px-4 py-2.5 text-xs font-medium text-muted-foreground">
            <FileImage size={14} /> Imagen
          </div>
          <img src={block.src} alt={block.alt} className="h-auto w-full object-cover" />
          {block.caption ? (
            <figcaption className="px-4 py-2.5 text-sm text-muted-foreground">{block.caption}</figcaption>
          ) : null}
        </figure>
      )
    case "video":
      return (
        <div className="overflow-hidden rounded-3xl border border-border bg-background shadow-sm">
          <div className="flex items-center gap-2 border-b border-border/70 px-4 py-2.5 text-xs font-medium text-muted-foreground">
            <PlayCircle size={14} /> Video
          </div>
          <div className="bg-black/5">
            <iframe
              title={block.title || "Video del aviso"}
              src={getYoutubeEmbedUrl(block.src)}
              className="aspect-video w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
          {block.title ? <div className="px-4 py-2.5 text-sm text-muted-foreground">{block.title}</div> : null}
        </div>
      )
    case "quote":
      return (
        <blockquote className="rounded-3xl border border-border bg-muted/30 px-5 py-4 shadow-sm">
          <div className="flex items-start gap-3">
            <Quote className="mt-1 h-4 w-4 shrink-0 text-primary" />
            <div className="space-y-2">
              <p className="text-sm leading-6 text-foreground">{block.text}</p>
              {block.author ? <p className="text-xs font-medium text-muted-foreground">{block.author}</p> : null}
            </div>
          </div>
        </blockquote>
      )
    case "callout": {
      const toneStyles: Record<typeof block.tone, string> = {
        info: "border-sky-500/20 bg-sky-500/6 text-sky-950 dark:text-sky-50",
        success: "border-emerald-500/20 bg-emerald-500/6 text-emerald-950 dark:text-emerald-50",
        warning: "border-amber-500/20 bg-amber-500/6 text-amber-950 dark:text-amber-50",
      }

      return (
        <section className={cn("rounded-3xl border px-5 py-4 shadow-sm", toneStyles[block.tone])}>
          {block.title ? <h3 className="text-sm font-semibold">{block.title}</h3> : null}
          <p className="mt-2 text-sm leading-6">{block.text}</p>
        </section>
      )
    }
    case "link":
      return (
        <a
          href={block.href}
          target="_blank"
          rel="noreferrer"
          className="flex items-start gap-3 rounded-3xl border border-border bg-background px-4 py-3 shadow-sm transition hover:border-primary/30 hover:bg-primary/5"
        >
          <ExternalLink className="mt-1 h-4 w-4 shrink-0 text-primary" />
          <div className="min-w-0">
            <div className="text-sm font-semibold text-foreground">{block.label}</div>
            {block.description ? <p className="mt-1 text-sm text-muted-foreground">{block.description}</p> : null}
            <p className="mt-2 break-all text-xs text-primary">{block.href}</p>
          </div>
        </a>
      )
  }
}

export default function AvisoContent({ content, mediaBlocks = [], className, compact = false }: Props) {
  return (
    <div className={cn(compact ? "space-y-3" : "space-y-5", className)}>
      {content ? (
        <div className={cn("space-y-2.5 text-sm leading-7 text-foreground", compact ? "text-[0.95rem]" : "text-base")}>
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              h1: ({ children }) => <h2 className={cn("font-bold tracking-tight text-foreground", compact ? "text-xl" : "text-2xl")}>{children}</h2>,
              h2: ({ children }) => <h3 className={cn("font-semibold tracking-tight text-foreground", compact ? "text-lg" : "text-xl")}>{children}</h3>,
              h3: ({ children }) => <h4 className={cn("font-semibold text-foreground", compact ? "text-base" : "text-lg")}>{children}</h4>,
              p: ({ children }) => <p className={cn("leading-7 text-foreground", compact ? "leading-6" : "")}>{children}</p>,
              ul: ({ children }) => <ul className={cn("list-disc pl-5", compact ? "space-y-1.5" : "space-y-2")}>{children}</ul>,
              ol: ({ children }) => <ol className={cn("list-decimal pl-5", compact ? "space-y-1.5" : "space-y-2")}>{children}</ol>,
              blockquote: ({ children }) => (
                <blockquote className="border-l-4 border-primary/30 pl-4 text-muted-foreground">{children}</blockquote>
              ),
              strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
              em: ({ children }) => <em className="italic text-foreground">{children}</em>,
              code: ({ children }) => (
                <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[0.92em] text-foreground">
                  {children}
                </code>
              ),
              pre: ({ children }) => (
                <pre className="overflow-x-auto rounded-2xl border border-border bg-muted/30 p-4 font-mono text-sm text-foreground">
                  {children}
                </pre>
              ),
              a: ({ href, children }) => (
                <a href={href ?? "#"} target="_blank" rel="noreferrer" className="text-primary underline underline-offset-4">
                  {children}
                </a>
              ),
            }}
          >
            {content}
          </ReactMarkdown>
        </div>
      ) : null}

      {mediaBlocks.length > 0 ? (
        <div className={cn(compact ? "grid gap-3" : "grid gap-4")}>
          {mediaBlocks.map((block) => (
            <BlockCard key={block.id} block={block} />
          ))}
        </div>
      ) : null}
    </div>
  )
}
