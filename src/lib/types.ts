export interface Participant {
  id: string
  firstName: string
  lastName: string
  hasKeys: boolean
}

export type SpecialDayType = 'none' | 'second-monday' | 'first-monday' | 'third-monday' | 'last-monday'

export interface ShiftSettings {
  frequency: 'daily' | 'every-2-days' | 'every-3-days' | 'weekly'
  peoplePerShift: number
  startDate: string
  endDate: string
  specialDayType: SpecialDayType
  specialDayPeopleCount?: number
}

export interface Shift {
  id: string
  date: string
  participants: string[]
  isHistorical?: boolean
  isSpecialDay?: boolean
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
  specialDayType: 'none',
  specialDayPeopleCount: 2
}
