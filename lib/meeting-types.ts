// Meeting/Event status types and utilities
// Provides type-safe state machine for meeting lifecycle

export type MeetingStatus = 'scheduled' | 'live' | 'ended'

export interface Meeting {
  id: string
  title: string
  description?: string
  startAt: Date | string
  endAt?: Date | string
  zoomUrl?: string
  location?: string
  maxParticipants?: number
  currentParticipants?: number
}

export interface MeetingStatusInfo {
  status: MeetingStatus
  timeUntilStart?: number // ms
  timeUntilEnd?: number // ms
  canJoin: boolean
}

export class MeetingStateMachine {
  /**
   * Validates that a state transition is allowed
   * Valid transitions: scheduled → live → ended
   */
  static isValidTransition(from: MeetingStatus, to: MeetingStatus): boolean {
    const validTransitions: Record<MeetingStatus, MeetingStatus[]> = {
      scheduled: ['live'],
      live: ['ended'],
      ended: [],
    }
    return validTransitions[from].includes(to)
  }

  /**
   * Determines current meeting status based on current time
   */
  static determineMeetingStatus(
    meeting: Meeting
  ): MeetingStatusInfo {
    const now = new Date().getTime()
    const startTime =
      meeting.startAt instanceof Date
        ? meeting.startAt.getTime()
        : new Date(meeting.startAt).getTime()
    const endTime = meeting.endAt
      ? meeting.endAt instanceof Date
        ? meeting.endAt.getTime()
        : new Date(meeting.endAt).getTime()
      : startTime + 60 * 60 * 1000 // Default 1 hour

    if (now < startTime) {
      return {
        status: 'scheduled',
        timeUntilStart: startTime - now,
        canJoin: false,
      }
    }

    if (now >= startTime && now < endTime) {
      return {
        status: 'live',
        timeUntilEnd: endTime - now,
        canJoin: true,
      }
    }

    return {
      status: 'ended',
      canJoin: false,
    }
  }
}

/**
 * Formats milliseconds to readable duration
 * @example formatTimeDuration(3723000) => "1h 2m 3s"
 */
export function formatTimeDuration(ms: number): string {
  if (ms <= 0) return '0s'

  const seconds = Math.floor((ms / 1000) % 60)
  const minutes = Math.floor((ms / (1000 * 60)) % 60)
  const hours = Math.floor(ms / (1000 * 60 * 60))

  const parts: string[] = []
  if (hours > 0) parts.push(`${hours}h`)
  if (minutes > 0) parts.push(`${minutes}m`)
  if (seconds > 0 || parts.length === 0) parts.push(`${seconds}s`)

  return parts.join(' ')
}

/**
 * Formats time remaining in Spanish
 * @example formatCountdown(3600000) => "Se abre en 1h"
 */
export function formatCountdown(ms: number): string {
  if (ms <= 0) return 'Ya está disponible'

  const minutes = Math.floor(ms / (1000 * 60))
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60

  if (hours > 0) {
    return `Se abre en ${hours}h${remainingMinutes > 0 ? ` ${remainingMinutes}m` : ''}`
  }

  if (minutes > 0) {
    return `Se abre en ${minutes}m`
  }

  const seconds = Math.floor(ms / 1000)
  return `Se abre en ${seconds}s`
}
