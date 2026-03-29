export interface Participant {
  id: string
  firstName: string
  lastName: string
  hasKeys: boolean
}

export type SpecialDayWeekOccurrence = 'first' | 'second' | 'third' | 'fourth' | 'last'
export type SpecialDayDayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday'

export interface SpecialDay {
  id: string
  name: string
  weekOccurrence: SpecialDayWeekOccurrence
  dayOfWeek: SpecialDayDayOfWeek
  peopleCount: number
}

export interface ShiftSettings {
  frequency: 'daily' | 'every-2-days' | 'every-3-days' | 'weekly'
  peoplePerShift: number
  startDate: string
  endDate: string
  specialDays: SpecialDay[]
}

export interface Shift {
  id: string
  date: string
  participants: string[]
  isHistorical?: boolean
  specialDayId?: string
}

export interface AppData {
  participants: Participant[]
  settings: ShiftSettings
  schedule: Shift[]
  historicalShifts: Shift[]
}

export const DEFAULT_SETTINGS: ShiftSettings = {
  frequency: 'weekly',
  peoplePerShift: 2,
  startDate: new Date().toISOString().split('T')[0],
  endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  specialDays: []
}
