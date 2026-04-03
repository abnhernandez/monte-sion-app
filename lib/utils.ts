import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function displayNameFrom(value?: string | null) {
  if (!value) return ""
  const trimmed = value.trim()
  if (!trimmed) return ""

  const base = trimmed.includes("@") ? trimmed.split("@")[0] : trimmed
  const cleaned = base.replace(/[._-]+/g, " ").replace(/\s+/g, " ").trim()
  if (!cleaned) return base

  return cleaned.replace(/\b\w/g, (c) => c.toUpperCase())
}
