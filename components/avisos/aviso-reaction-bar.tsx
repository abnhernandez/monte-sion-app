"use client"

import { useTransition } from "react"
import { cn } from "@/lib/utils"
import type { AvisoReactionSummary, ReactionType } from "@/lib/avisos/types"

const reactionLabels: Record<ReactionType, { emoji: string; label: string }> = {
  like: { emoji: "👍", label: "Me gusta" },
  love: { emoji: "❤️", label: "Me encanta" },
  laugh: { emoji: "😂", label: "Me divierte" },
  wow: { emoji: "😮", label: "Me sorprendió" },
}

export default function AvisoReactionBar({
  reactions,
  disabled,
  onReact,
  compact = false,
}: {
  reactions: AvisoReactionSummary[]
  disabled?: boolean
  onReact: (type: ReactionType) => Promise<void> | void
  compact?: boolean
}) {
  const [isPending, startTransition] = useTransition()

  return (
    <div className={cn("flex flex-wrap gap-2", compact ? "text-xs" : "text-sm")}>
      {reactions.map((reaction) => {
        const meta = reactionLabels[reaction.type]
        return (
          <button
            key={reaction.type}
            type="button"
            disabled={disabled || isPending}
            onClick={() =>
              startTransition(async () => {
                await onReact(reaction.type)
              })
            }
            className={cn(
              "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 font-medium transition",
              reaction.reacted
                ? "border-primary/30 bg-primary/10 text-foreground"
                : "border-border bg-background text-muted-foreground hover:border-primary/25 hover:text-foreground",
              disabled || isPending ? "cursor-not-allowed opacity-60" : ""
            )}
            title={meta.label}
          >
            <span>{meta.emoji}</span>
            <span>{reaction.count}</span>
          </button>
        )
      })}
    </div>
  )
}
