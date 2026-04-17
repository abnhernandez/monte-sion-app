'use client'

import React from 'react'
import { useMeetingStatus } from '@/hooks/useMeetingStatus'
import type { Meeting } from '@/lib/meeting-types'
import { Clock, MapPin, Users, Video, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

type MeetingCardVariant = 'default' | 'compact'

interface MeetingCardProps {
  meeting: Meeting
  onJoin?: (meeting: Meeting) => void
  variant?: MeetingCardVariant
  hideButton?: boolean
}

const STATUS_CONFIG = {
  scheduled: {
    icon: Clock,
    label: 'Próximamente',
    classes: 'bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200',
  },
  live: {
    icon: Video,
    label: 'EN VIVO',
    classes: 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 animate-pulse',
  },
  ended: {
    icon: AlertCircle,
    label: 'Finalizado',
    classes: 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400',
  },
}

export const MeetingCard: React.FC<MeetingCardProps> = ({
  meeting,
  onJoin,
  variant = 'default',
  hideButton = false,
}) => {
  const { status, canJoin, formattedCountdown } = useMeetingStatus(meeting)

  const config = STATUS_CONFIG[status] as any
  const StatusIcon = config.icon

  if (variant === 'compact') {
    return (
      <div
        className={cn(
          'p-3 rounded-lg border bg-white dark:bg-slate-900',
          'transition-colors hover:bg-slate-50 dark:hover:bg-slate-800'
        )}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-sm truncate text-gray-900 dark:text-white">
              {meeting.title}
            </h3>
            {formattedCountdown && (
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {formattedCountdown}
              </p>
            )}
          </div>

          <div
            className={cn(
              'px-2 py-1 rounded-md text-xs font-semibold flex items-center gap-1',
              config.classes
            )}
          >
            <StatusIcon className="w-3 h-3" />
            {config.label}
          </div>
        </div>
      </div>
    )
  }

  // Default variant (full card)
  return (
    <article
      className="bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-700 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
      role="region"
      aria-label={meeting.title}
    >
      {/* Status Header */}
      <div
        className={cn(
          'px-6 py-3 flex items-center justify-between',
          config.classes
        )}
      >
        <div className="flex items-center gap-2">
          <StatusIcon className="w-5 h-5" />
          <span className="font-semibold text-sm">{config.label}</span>
        </div>
        {formattedCountdown && (
          <span className="text-sm font-medium">{formattedCountdown}</span>
        )}
      </div>

      {/* Content */}
      <div className="px-6 py-4">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
          {meeting.title}
        </h2>

        {meeting.description && (
          <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
            {meeting.description}
          </p>
        )}

        {/* Metadata Grid */}
        <div className="grid grid-cols-1 gap-3 mb-4 text-sm">
          <time
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400"
            dateTime={
              meeting.startAt instanceof Date
                ? meeting.startAt.toISOString()
                : meeting.startAt
            }
          >
            <Clock className="w-4 h-4" />
            {meeting.startAt instanceof Date
              ? meeting.startAt.toLocaleString('es-ES')
              : new Date(meeting.startAt).toLocaleString('es-ES')}
          </time>

          {meeting.location && (
            <address className="flex items-center gap-2 text-gray-600 dark:text-gray-400 not-italic">
              <MapPin className="w-4 h-4" />
              {meeting.location}
            </address>
          )}

          {meeting.currentParticipants !== undefined && meeting.maxParticipants && (
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <Users className="w-4 h-4" />
              {meeting.currentParticipants} / {meeting.maxParticipants} participantes
            </div>
          )}
        </div>
      </div>

      {/* Footer Actions */}
      <div className="px-6 py-4 bg-gray-50 dark:bg-slate-800 border-t border-gray-200 dark:border-slate-700 flex gap-2">
        {!hideButton && (
          <button
            onClick={() => onJoin?.(meeting)}
            disabled={!canJoin}
            className={cn(
              'flex-1 px-4 py-2 rounded-lg font-medium transition text-sm',
              canJoin
                ? 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer'
                : 'bg-gray-300 dark:bg-gray-700 text-gray-600 dark:text-gray-400 cursor-not-allowed'
            )}
            aria-label={
              canJoin
                ? `Unirse a ${meeting.title}`
                : formattedCountdown
                  ? `${formattedCountdown}. No disponible aún`
                  : 'La reunión ha finalizado'
            }
          >
            {canJoin ? (
              <span className="flex items-center justify-center gap-2">
                <Video className="w-4 h-4" />
                Unirse
              </span>
            ) : formattedCountdown ? (
              formattedCountdown
            ) : (
              'Finalizado'
            )}
          </button>
        )}

        {meeting.zoomUrl && canJoin && (
          <a
            href={meeting.zoomUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 rounded-lg bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-600 text-gray-900 dark:text-white font-medium hover:bg-gray-100 dark:hover:bg-slate-800 transition text-sm"
            aria-label={`Iniciar Zoom para ${meeting.title}`}
          >
            Zoom
          </a>
        )}
      </div>
    </article>
  )
}
