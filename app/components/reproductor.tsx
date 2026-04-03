'use client'
import { useCallback, useEffect, useMemo, useRef } from 'react'
import Link from 'next/link'
import type { ReactNode } from 'react'
import Material from '@/app/components/material'
import { recordLessonView } from '@/lib/lessons-actions'

type VideoPlayerProps = {
  title?: string
  bucket: string
  prefix?: string
  videoUrl?: string
  children?: ReactNode
  lessonId?: string
  prevHref?: string
  nextHref?: string
  prevLabel?: string
  nextLabel?: string
}

const VIEW_THRESHOLD_SECONDS = 60
const VIEW_PERCENT_THRESHOLD = 0.9
const VIEW_TTL_MS = 24 * 60 * 60 * 1000

type YouTubePlayer = {
  getDuration?: () => number
  destroy?: () => void
}

type YouTubePlayerConstructor = new (
  element: HTMLIFrameElement,
  options: {
    events: {
      onReady: () => void
      onStateChange: (event: { data: number }) => void
    }
  }
) => YouTubePlayer

type YouTubeAPI = {
  Player: YouTubePlayerConstructor
  PlayerState?: {
    PLAYING: number
    PAUSED: number
    ENDED: number
  }
}

declare global {
  interface Window {
    YT?: YouTubeAPI
    onYouTubeIframeAPIReady?: () => void
  }
}

export default function VideoPlayer({
  title = 'Reproductor de video',
  bucket,
  prefix,
  videoUrl = 'about:blank',
  children,
  lessonId,
  prevHref,
  nextHref,
  prevLabel = 'Anterior',
  nextLabel = 'Siguiente',
}: VideoPlayerProps) {
  const iframeRef = useRef<HTMLIFrameElement | null>(null)
  const playerRef = useRef<YouTubePlayer | null>(null)
  const watchIntervalRef = useRef<number | null>(null)
  const watchedSecondsRef = useRef(0)
  const durationRef = useRef<number>(0)
  const thresholdRef = useRef<number>(VIEW_THRESHOLD_SECONDS)
  const hasRecordedRef = useRef(false)

  const isYouTube = useMemo(
    () => /youtube\.com\/embed\//i.test(videoUrl),
    [videoUrl]
  )

  const recordView = useCallback(async () => {
    if (!lessonId || hasRecordedRef.current) return

    const storageKey = `lesson-viewed-${lessonId}`
    const stored = typeof window !== 'undefined' ? localStorage.getItem(storageKey) : null
    if (stored) {
      const lastSeen = Number(stored)
      if (!Number.isNaN(lastSeen) && Date.now() - lastSeen < VIEW_TTL_MS) {
        hasRecordedRef.current = true
        return
      }
    }

    try {
        const success = await recordLessonView(lessonId)
        if (success && typeof window !== 'undefined') {
        localStorage.setItem(storageKey, String(Date.now()))
        hasRecordedRef.current = true
      }
    } catch {
      // Silenciar errores de red para no romper la UX
    }
  }, [lessonId])

  const resolvedUrl = useMemo(() => {
    if (!isYouTube || typeof window === 'undefined') return videoUrl

    try {
      const url = new URL(videoUrl)
      url.searchParams.set('enablejsapi', '1')
      url.searchParams.set('playsinline', '1')
      url.searchParams.set('origin', window.location.origin)
      return url.toString()
    } catch {
      return videoUrl
    }
  }, [isYouTube, videoUrl])

  useEffect(() => {
    if (!isYouTube || !lessonId) return
    if (typeof window === 'undefined') return

    const iframe = iframeRef.current
    if (!iframe) return

    const setupPlayer = () => {
      if (!window.YT?.Player || playerRef.current) return

      playerRef.current = new window.YT.Player(iframe, {
        events: {
          onReady: () => {
            try {
              const duration = Number(playerRef.current?.getDuration?.() ?? 0)
              if (!Number.isNaN(duration) && duration > 0) {
                durationRef.current = duration
                thresholdRef.current = Math.max(
                  VIEW_THRESHOLD_SECONDS,
                  Math.floor(duration * VIEW_PERCENT_THRESHOLD)
                )
              }
            } catch {
              thresholdRef.current = VIEW_THRESHOLD_SECONDS
            }
          },
          onStateChange: (event: { data: number }) => {
            const YTState = window.YT?.PlayerState
            if (!YTState) return

            if (event.data === YTState.PLAYING) {
              if (watchIntervalRef.current !== null) return
              watchIntervalRef.current = window.setInterval(() => {
                watchedSecondsRef.current += 1
                if (watchedSecondsRef.current >= thresholdRef.current) {
                  recordView()
                  if (watchIntervalRef.current !== null) {
                    clearInterval(watchIntervalRef.current)
                    watchIntervalRef.current = null
                  }
                }
              }, 1000)
            }

            if (
              event.data === YTState.PAUSED ||
              event.data === YTState.ENDED
            ) {
              if (watchIntervalRef.current !== null) {
                clearInterval(watchIntervalRef.current)
                watchIntervalRef.current = null
              }
            }
          },
        },
      })
    }

    if (window.YT?.Player) {
      setupPlayer()
      return
    }

    const existingScript = document.querySelector<HTMLScriptElement>(
      'script[src="https://www.youtube.com/iframe_api"]'
    )

    if (!existingScript) {
      const script = document.createElement('script')
      script.src = 'https://www.youtube.com/iframe_api'
      script.async = true
      document.body.appendChild(script)
    }

    const previousReady = window.onYouTubeIframeAPIReady
    window.onYouTubeIframeAPIReady = () => {
      previousReady?.()
      setupPlayer()
    }

    return () => {
      if (watchIntervalRef.current !== null) {
        clearInterval(watchIntervalRef.current)
        watchIntervalRef.current = null
      }
      if (playerRef.current?.destroy) {
        playerRef.current.destroy()
        playerRef.current = null
      }
    }
  }, [isYouTube, lessonId, recordView, videoUrl])
  return (
    <section className="w-full max-w-6xl mx-auto px-4">
      {/* Título */}
      <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100 leading-tight">
        {title}
      </h1>

      {/* Línea separadora */}
      <div className="mt-4 mb-6 h-[3px] w-full rounded-full bg-blue-500" />

      {/* Navegación */}
      {(prevHref || nextHref) && (
        <div className="mb-6 flex items-center justify-between">
          {prevHref ? (
            <Link
              href={prevHref}
              className="inline-flex items-center gap-2 rounded-lg bg-gray-200 px-4 py-2 text-sm font-medium text-gray-800 shadow hover:bg-gray-300 dark:bg-neutral-800 dark:text-gray-100 dark:hover:bg-neutral-700"
            >
              « {prevLabel}
            </Link>
          ) : (
            <span />
          )}

          {nextHref ? (
            <Link
              href={nextHref}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-blue-700"
            >
              {nextLabel} »
            </Link>
          ) : null}
        </div>
      )}

      {/* Video */}
      <div className="relative w-full overflow-hidden rounded-xl bg-black shadow-lg aspect-video">
        <iframe
          ref={iframeRef}
          src={resolvedUrl}
          title={title}
          className="absolute inset-0 h-full w-full border-0"
          style={{ border: 0 }}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
          loading="lazy"
        />
      </div>
      {children}
      <br /><br /><br /><br />
        {/* Línea separadora */}
      <div className="mt-4 mb-6 h-[3px] w-full rounded-full bg-blue-500" />
      <Material bucket={bucket} prefix={prefix} />
    </section>
  )
}
