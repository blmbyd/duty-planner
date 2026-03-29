import { ShiftSettings } from '../types'

export function getDaysBetweenDates(
  startDate: string,
  endDate: string,
  frequency: ShiftSettings['frequency']
): string[] {
  const dates: string[] = []
  const start = new Date(startDate)
  const end = new Date(endDate)

  let increment: number
  switch (frequency) {
    case 'daily':
      increment = 1
      break
    case 'every-2-days':
      increment = 2
      break
    case 'every-3-days':
      increment = 3
      break
    case 'weekly':
      increment = 7
      break
  }

  let current = new Date(start)
  while (current <= end) {
    dates.push(current.toISOString().split('T')[0])
    current = new Date(current.getTime() + increment * 24 * 60 * 60 * 1000)
  }

  return dates
}

export function isPastDate(dateStr: string): boolean {
  const date = new Date(dateStr)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return date < today
}

export function formatDatePL(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('pl-PL', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}
