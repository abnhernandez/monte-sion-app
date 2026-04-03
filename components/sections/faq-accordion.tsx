"use client"

import { useState } from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

type FaqItem = {
  id: string
  question: string
  answer: string
}

type FaqAccordionProps = {
  items: FaqItem[]
}

export function FaqAccordion({ items }: FaqAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <div className="mx-auto mt-12 max-w-3xl space-y-3">
      {items.map((item, index) => (
        <div
          key={item.id}
          className="overflow-hidden rounded-xl border border-border bg-card transition-all hover:border-accent/30"
        >
          <button
            onClick={() => toggleFaq(index)}
            className="flex w-full items-center justify-between gap-4 p-5 text-left"
            aria-expanded={openIndex === index}
            aria-controls={`faq-answer-${index}`}
          >
            <span className="font-semibold text-card-foreground">
              {item.question}
            </span>
            <ChevronDown
              className={cn(
                "h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-200",
                openIndex === index && "rotate-180"
              )}
            />
          </button>
          <div
            id={`faq-answer-${index}`}
            className={cn(
              "grid transition-all duration-200",
              openIndex === index
                ? "grid-rows-[1fr] opacity-100"
                : "grid-rows-[0fr] opacity-0"
            )}
          >
            <div className="overflow-hidden">
              <p className="px-5 pb-5 text-sm leading-relaxed text-muted-foreground">
                {item.answer}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
