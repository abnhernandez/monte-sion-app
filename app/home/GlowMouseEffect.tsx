"use client"

import { useEffect } from "react"

export default function GlowMouseEffect() {
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const modes = document.querySelectorAll<HTMLElement>(
        ".worship-mode, .prayer-mode, .night-service-mode, .vigilia-mode"
      )
      modes.forEach((el) => {
        const rect = el.getBoundingClientRect()
        const x = ((e.clientX - rect.left) / rect.width) * 100
        const y = ((e.clientY - rect.top) / rect.height) * 100
        el.style.setProperty("--glow-x", `${x}%`)
        el.style.setProperty("--glow-y", `${y}%`)
      })
    }

    document.addEventListener("mousemove", handleMouseMove)
    return () => document.removeEventListener("mousemove", handleMouseMove)
  }, [])

  return null
}
