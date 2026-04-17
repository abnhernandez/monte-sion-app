'use client'

import { useState, useEffect, useCallback } from 'react'
import { Meeting, MeetingStateMachine, formatCountdown } from '@/lib/meeting-types'
import { logger } from '@/lib/logger'

export interface MeetingStatusHookResult {
  status: 'scheduled' | 'live' | 'ended'
  timeUntilStart?: number
  timeUntilEnd?: number
  canJoin: boolean
  isScheduled: boolean
  isLive: boolean
  isEnded: boolean
  formattedCountdown: string
}

/**
 * Hook for real-time meeting status tracking
 * Automatically polls and updates countdown
 *
 * @example
 * const { status, canJoin, formattedCountdown } = useMeetingStatus(meeting)
 */
export function useMeetingStatus(
  meeting: Meeting | null,
  options: { pollInterval?: number; onStatusChange?: (status: 'scheduled' | 'live' | 'ended') => void } = {}
): MeetingStatusHookResult {
  const { pollInterval = 30000, onStatusChange } = options

  const [result, setResult] = useState<MeetingStatusHookResult>({
    status: 'ended',
    canJoin: false,
    isScheduled: false,
    isLive: false,
    isEnded: true,
    formattedCountdown: '',
  })

  const updateStatus = useCallback(() => {
    if (!meeting) {
      setResult((prev) => ({
        ...prev,
        status: 'ended',
        canJoin: false,
        isScheduled: false,
        isLive: false,
        isEnded: true,
      }))
      return
    }

    const statusInfo = MeetingStateMachine.determineMeetingStatus(meeting)

    setResult((prev) => {
      const newStatus = statusInfo.status
      const prevStatus = prev.status

      if (newStatus !== prevStatus && onStatusChange) {
        onStatusChange(newStatus)
        logger.info('Meeting status changed', 'useMeetingStatus', {
          from: prevStatus,
          to: newStatus,
          meetingId: meeting.id,
        })
      }

      return {
        status: newStatus,
        timeUntilStart: statusInfo.timeUntilStart,
        timeUntilEnd: statusInfo.timeUntilEnd,
        canJoin: statusInfo.canJoin,
        isScheduled: newStatus === 'scheduled',
        isLive: newStatus === 'live',
        isEnded: newStatus === 'ended',
        formattedCountdown:
          newStatus === 'scheduled' && statusInfo.timeUntilStart
            ? formatCountdown(statusInfo.timeUntilStart)
            : '',
      }
    })
  }, [meeting, onStatusChange])

  useEffect(() => {
    updateStatus()
    const interval = setInterval(updateStatus, pollInterval)

    return () => clearInterval(interval)
  }, [meeting?.id, pollInterval, updateStatus])

  return result
}
