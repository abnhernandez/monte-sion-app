"use client"

import { useEffect, useMemo, useState } from "react"

type UseExamTimerInput = {
  endAtEpochMs: number | null
  isRunning: boolean
  onTimesUp: () => void
}

export function useExamTimer(input: UseExamTimerInput) {
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    if (!input.isRunning || !input.endAtEpochMs) return

    const timer = window.setInterval(() => {
      setNow(Date.now())
    }, 1000)

    return () => window.clearInterval(timer)
  }, [input.isRunning, input.endAtEpochMs])

  const remainingSeconds = useMemo(() => {
    if (!input.endAtEpochMs) return 0
    const diff = input.endAtEpochMs - now
    return Math.max(0, Math.ceil(diff / 1000))
  }, [input.endAtEpochMs, now])

  useEffect(() => {
    if (!input.isRunning) return
    if (remainingSeconds !== 0) return
    input.onTimesUp()
  }, [input, remainingSeconds])

  const minutes = Math.floor(remainingSeconds / 60)
  const seconds = remainingSeconds % 60
  const label = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`

  return {
    remainingSeconds,
    label,
  }
}
