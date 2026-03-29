import { SpecialDay, SpecialDayDayOfWeek, SpecialDayWeekOccurrence } from '../types'

export interface SpecialDayOccurrence {
  date: string
  specialDayId: string
  peopleCount: number
}

const dayOfWeekIndex: Record<SpecialDayDayOfWeek, number> = {
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
}

export function getSpecialDayForMonth(
  monthDate: Date,
  weekOccurrence: SpecialDayWeekOccurrence,
  dayOfWeek: SpecialDayDayOfWeek
): Date | null {
  const year = monthDate.getFullYear()
  const month = monthDate.getMonth()
  const targetDayOfWeek = dayOfWeekIndex[dayOfWeek]

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

  const occurrenceOffset: Record<Exclude<SpecialDayWeekOccurrence, 'last'>, number> = {
    first: 0,
    second: 7,
    third: 14,
    fourth: 21,
  }

  const targetDate = new Date(firstTargetDay)
  targetDate.setDate(targetDate.getDate() + occurrenceOffset[weekOccurrence])

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
    let currentMonth = new Date(start.getFullYear(), start.getMonth(), 1)

    while (currentMonth <= end) {
      const date = getSpecialDayForMonth(currentMonth, specialDay.weekOccurrence, specialDay.dayOfWeek)
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
