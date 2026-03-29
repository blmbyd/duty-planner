import { SpecialDay, SpecialDayFrequency } from '../types'

export interface SpecialDayOccurrence {
  date: string
  specialDayId: string
  peopleCount: number
}

function getTargetDayOfWeek(frequency: SpecialDayFrequency): number {
  if (frequency.includes('monday')) return 1
  if (frequency.includes('tuesday')) return 2
  if (frequency.includes('wednesday')) return 3
  if (frequency.includes('thursday')) return 4
  if (frequency.includes('friday')) return 5
  return 1
}

function getWeekOccurrence(
  frequency: SpecialDayFrequency
): 'first' | 'second' | 'third' | 'fourth' | 'last' {
  if (frequency.includes('first')) return 'first'
  if (frequency.includes('second')) return 'second'
  if (frequency.includes('third')) return 'third'
  if (frequency.includes('fourth')) return 'fourth'
  if (frequency.includes('last')) return 'last'
  return 'first'
}

export function getSpecialDayForMonth(
  monthDate: Date,
  frequency: SpecialDayFrequency
): Date | null {
  if (frequency === 'none') return null

  const year = monthDate.getFullYear()
  const month = monthDate.getMonth()
  const targetDayOfWeek = getTargetDayOfWeek(frequency)
  const weekOccurrence = getWeekOccurrence(frequency)

  if (weekOccurrence === 'last') {
    const lastDayOfMonth = new Date(year, month + 1, 0)
    const lastTargetDay = new Date(lastDayOfMonth)

    while (lastTargetDay.getDay() !== targetDayOfWeek) {
      lastTargetDay.setDate(lastTargetDay.getDate() - 1)
    }

    return lastTargetDay
  }

  const firstDay = new Date(year, month, 1)
  const firstTargetDay = new Date(firstDay)

  while (firstTargetDay.getDay() !== targetDayOfWeek) {
    firstTargetDay.setDate(firstTargetDay.getDate() + 1)
  }

  const occurrenceMap: Record<string, number> = {
    first: 0,
    second: 7,
    third: 14,
    fourth: 21,
  }

  const daysToAdd = occurrenceMap[weekOccurrence]
  const targetDate = new Date(firstTargetDay)
  targetDate.setDate(targetDate.getDate() + daysToAdd)

  if (targetDate.getMonth() !== month) {
    return null
  }

  return targetDate
}

export function getSpecialDaysInRange(
  startDate: string,
  endDate: string,
  specialDays: SpecialDay[]
): SpecialDayOccurrence[] {
  if (!specialDays || !Array.isArray(specialDays) || specialDays.length === 0) return []

  const occurrences: SpecialDayOccurrence[] = []
  const start = new Date(startDate)
  const end = new Date(endDate)

  for (const specialDay of specialDays) {
    if (specialDay.frequency === 'none') continue

    let currentMonth = new Date(start.getFullYear(), start.getMonth(), 1)

    while (currentMonth <= end) {
      const date = getSpecialDayForMonth(currentMonth, specialDay.frequency)
      if (date && date >= start && date <= end) {
        occurrences.push({
          date: date.toISOString().split('T')[0],
          specialDayId: specialDay.id,
          peopleCount: specialDay.peopleCount,
        })
      }
      currentMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)
    }
  }

  return occurrences
}
