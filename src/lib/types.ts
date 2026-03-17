export interface Participant {
  id: string
  firstName: string
  lastName: string
  hasKeys: boolean
}

export type SpecialDayFrequency = 'none' | 'first-monday' | 'second-monday' | 'third-monday' | 'fourth-monday' | 'last-monday' | 'first-tuesday' | 'second-tuesday' | 'third-tuesday' | 'fourth-tuesday' | 'last-tuesday' | 'first-wednesday' | 'second-wednesday' | 'third-wednesday' | 'fourth-wednesday' | 'last-wednesday' | 'first-thursday' | 'second-thursday' | 'third-thursday' | 'fourth-thursday' | 'last-thursday' | 'first-friday' | 'second-friday' | 'third-friday' | 'fourth-friday' | 'last-friday'

export interface SpecialDay {
  id: string
  name: string
  frequency: SpecialDayFrequency
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
