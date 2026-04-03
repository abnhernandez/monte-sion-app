import type { AppRole } from "@/lib/roles"

export type BirthdayOccurrenceStatus =
  | "pending"
  | "prayed"
  | "ready"
  | "celebrated"

export type BirthdayReminderChannel = "notification" | "email"

export type BirthdayProfileOption = {
  id: string
  name: string | null
  email: string | null
  role: AppRole
}

export type BirthdayLeaderOption = BirthdayProfileOption

export type BirthdayRecord = {
  id: string
  profileId: string | null
  name: string
  birthDate: string
  ministryName: string
  leaderId: string | null
  cakeNote: string
  generalNote: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export type BirthdayOccurrenceRecord = {
  id: string
  birthdayId: string
  celebrationYear: number
  birthdayDateForYear: string
  turningAge: number
  scriptureReference: string
  scriptureText: string
  prayerFocus: string
  celebrationNote: string
  status: BirthdayOccurrenceStatus
  prayedAt: string | null
  celebratedAt: string | null
  createdAt: string
  updatedAt: string
}

export type BirthdayGiftRecord = {
  id: string
  occurrenceId: string
  title: string
  description: string
  reservedByProfileId: string | null
  reservedByName: string | null
  createdByProfileId: string | null
  createdByName: string | null
  createdAt: string
}

export type BirthdayCommentRecord = {
  id: string
  birthdayId: string
  parentCommentId: string | null
  authorProfileId: string
  authorName: string
  authorRole: AppRole
  content: string
  createdAt: string
  updatedAt: string
}

export type BirthdaySummary = {
  id: string
  profileId: string | null
  name: string
  birthDate: string
  ministryName: string
  leaderId: string | null
  leaderName: string | null
  cakeNote: string
  generalNote: string
  isActive: boolean
  nextOccurrence: BirthdayOccurrenceRecord
  daysUntil: number
  monthKey: string
  monthLabel: string
  giftCount: number
  reservedGiftCount: number
}

export type BirthdayDashboardData = {
  role: AppRole
  currentUserId: string
  birthdays: BirthdaySummary[]
  upcomingBirthdays: BirthdaySummary[]
  leaders: BirthdayLeaderOption[]
  profileOptions: BirthdayProfileOption[]
}

export type BirthdayAdminData = {
  role: AppRole
  currentUserId: string
  birthdays: BirthdaySummary[]
  leaders: BirthdayLeaderOption[]
  profileOptions: BirthdayProfileOption[]
  stats: {
    total: number
    active: number
    inactive: number
    upcoming30: number
    withoutLeader: number
  }
}

export type BirthdayDetailData = {
  role: AppRole
  currentUserId: string
  currentUserName: string
  birthday: BirthdayRecord & {
    leaderName: string | null
    linkedProfileName: string | null
    linkedProfileEmail: string | null
  }
  currentOccurrence: BirthdayOccurrenceRecord
  upcomingOccurrence: BirthdayOccurrenceRecord
  otherOccurrences: BirthdayOccurrenceRecord[]
  gifts: BirthdayGiftRecord[]
  comments: BirthdayCommentRecord[]
}

export type SaveBirthdayInput = {
  id?: string
  profileId?: string | null
  name: string
  birthDate: string
  ministryName: string
  leaderId?: string | null
  cakeNote?: string
  generalNote?: string
  isActive?: boolean
}

export type SaveBirthdayOccurrenceInput = {
  occurrenceId: string
  scriptureReference: string
  scriptureText: string
  prayerFocus: string
  celebrationNote: string
}

export type SaveBirthdayGiftInput = {
  giftId?: string
  occurrenceId: string
  title: string
  description?: string
}

export type SaveBirthdayCommentInput = {
  birthdayId: string
  content: string
  parentCommentId?: string | null
  commentId?: string
}
