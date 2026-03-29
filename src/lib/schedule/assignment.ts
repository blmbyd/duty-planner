import { Participant, ShiftSettings, Shift } from '../types'
import { getDaysBetweenDates } from './date-utils'
import { getSpecialDaysInRange, SpecialDayOccurrence } from './special-days'
import { shuffleArray, scoreSchedule } from './scoring'

function buildShiftForSpecialDay(
  date: string,
  occurrence: SpecialDayOccurrence,
  participants: Participant[],
  participantShiftCounts: Map<string, number>,
  participantSpecialDayCountsPerDay: Map<string, Map<string, number>>,
  recentShifts: Shift[]
): string[] {
  const shiftParticipants: string[] = []
  const peopleCount = occurrence.peopleCount
  const specialDayCounts = participantSpecialDayCountsPerDay.get(occurrence.specialDayId)!

  const available = shuffleArray(
    participants.filter((p) => {
      const lastTwo = recentShifts.slice(-2)
      return !lastTwo.some((s) => s.participants.includes(p.id))
    })
  ).sort((a, b) => {
    const sa = specialDayCounts.get(a.id) || 0
    const sb = specialDayCounts.get(b.id) || 0
    if (sa !== sb) return sa - sb
    return (participantShiftCounts.get(a.id) || 0) - (participantShiftCounts.get(b.id) || 0)
  })

  const personWithKeys = available.find((p) => p.hasKeys)
  if (personWithKeys) {
    shiftParticipants.push(personWithKeys.id)
    participantShiftCounts.set(personWithKeys.id, (participantShiftCounts.get(personWithKeys.id) || 0) + 1)
    specialDayCounts.set(personWithKeys.id, (specialDayCounts.get(personWithKeys.id) || 0) + 1)
  }

  for (const person of available) {
    if (shiftParticipants.length >= peopleCount) break
    if (!shiftParticipants.includes(person.id)) {
      shiftParticipants.push(person.id)
      participantShiftCounts.set(person.id, (participantShiftCounts.get(person.id) || 0) + 1)
      specialDayCounts.set(person.id, (specialDayCounts.get(person.id) || 0) + 1)
    }
  }

  if (shiftParticipants.length < peopleCount) {
    const fallback = shuffleArray(
      participants.filter((p) => !shiftParticipants.includes(p.id))
    ).sort((a, b) => (specialDayCounts.get(a.id) || 0) - (specialDayCounts.get(b.id) || 0))

    for (const person of fallback) {
      if (shiftParticipants.length >= peopleCount) break
      shiftParticipants.push(person.id)
      participantShiftCounts.set(person.id, (participantShiftCounts.get(person.id) || 0) + 1)
      specialDayCounts.set(person.id, (specialDayCounts.get(person.id) || 0) + 1)
    }
  }

  return shiftParticipants
}

function buildShiftForRegularDay(
  date: string,
  peopleCount: number,
  specialPeople: Participant[],
  regularPeople: Participant[],
  participants: Participant[],
  participantShiftCounts: Map<string, number>,
  recentShifts: Shift[]
): string[] {
  const shiftParticipants: string[] = []

  const availableSpecial = shuffleArray(
    specialPeople.filter((p) => {
      const lastTwo = recentShifts.slice(-2)
      return !lastTwo.some((s) => s.participants.includes(p.id))
    })
  ).sort(
    (a, b) =>
      (participantShiftCounts.get(a.id) || 0) - (participantShiftCounts.get(b.id) || 0)
  )

  if (availableSpecial.length > 0) {
    shiftParticipants.push(availableSpecial[0].id)
    participantShiftCounts.set(
      availableSpecial[0].id,
      (participantShiftCounts.get(availableSpecial[0].id) || 0) + 1
    )
  } else if (specialPeople.length > 0) {
    const fallbackSpecial = shuffleArray(specialPeople).sort(
      (a, b) =>
        (participantShiftCounts.get(a.id) || 0) - (participantShiftCounts.get(b.id) || 0)
    )[0]
    shiftParticipants.push(fallbackSpecial.id)
    participantShiftCounts.set(
      fallbackSpecial.id,
      (participantShiftCounts.get(fallbackSpecial.id) || 0) + 1
    )
  }

  const remainingSlots = peopleCount - shiftParticipants.length

  const availableRegular = shuffleArray(
    regularPeople.filter((p) => {
      const lastTwo = recentShifts.slice(-2)
      return !lastTwo.some((s) => s.participants.includes(p.id))
    })
  ).sort(
    (a, b) =>
      (participantShiftCounts.get(a.id) || 0) - (participantShiftCounts.get(b.id) || 0)
  )

  for (let i = 0; i < remainingSlots && i < availableRegular.length; i++) {
    shiftParticipants.push(availableRegular[i].id)
    participantShiftCounts.set(
      availableRegular[i].id,
      (participantShiftCounts.get(availableRegular[i].id) || 0) + 1
    )
  }

  if (shiftParticipants.length < peopleCount) {
    const allAvailable = shuffleArray(
      participants.filter((p) => !shiftParticipants.includes(p.id))
    ).sort(
      (a, b) =>
        (participantShiftCounts.get(a.id) || 0) - (participantShiftCounts.get(b.id) || 0)
    )

    for (const person of allAvailable) {
      if (shiftParticipants.length >= peopleCount) break
      shiftParticipants.push(person.id)
      participantShiftCounts.set(
        person.id,
        (participantShiftCounts.get(person.id) || 0) + 1
      )
    }
  }

  return shiftParticipants
}

export function generateSchedule(
  participants: Participant[],
  settings: ShiftSettings,
  historicalShifts: Shift[] = [],
  existingSchedule: Shift[] = []
): Shift[] {
  const safeSettings: ShiftSettings = {
    ...settings,
    specialDays: Array.isArray(settings.specialDays) ? settings.specialDays : [],
  }

  if (participants.length < safeSettings.peoplePerShift) {
    throw new Error('Za malo uczestnikow dla wymaganej liczby osob na dyzurze')
  }

  const specialPeople = participants.filter((p) => p.hasKeys)
  const regularPeople = participants.filter((p) => !p.hasKeys)

  if (specialPeople.length === 0 && safeSettings.peoplePerShift > 0) {
    throw new Error('Brak osob z kluczami. Dodaj przynajmniej jedna osobe specjalna.')
  }

  const allDates = getDaysBetweenDates(safeSettings.startDate, safeSettings.endDate, safeSettings.frequency)
  const specialDayOccurrences = getSpecialDaysInRange(
    safeSettings.startDate,
    safeSettings.endDate,
    safeSettings.specialDays
  )
  const specialDaysMap = new Map(specialDayOccurrences.map((occ) => [occ.date, occ]))

  const existingDatesSet = new Set(existingSchedule.map((s) => s.date))
  const specialDayDates = specialDayOccurrences.map((occ) => occ.date)
  const allRequiredDates = [...new Set([...allDates, ...specialDayDates])].sort()
  const missingDates = allRequiredDates.filter((date) => !existingDatesSet.has(date))

  if (missingDates.length === 0) {
    return existingSchedule
  }

  const allHistoricalShifts = [...historicalShifts, ...existingSchedule]

  let bestNewShifts: Shift[] = []
  let bestScore = -Infinity

  const attempts = Math.min(100, missingDates.length * 10)

  for (let attempt = 0; attempt < attempts; attempt++) {
    const newShifts: Shift[] = []
    const participantShiftCounts = new Map<string, number>()
    const participantSpecialDayCountsPerDay = new Map<string, Map<string, number>>()

    participants.forEach((p) => {
      participantShiftCounts.set(p.id, 0)
    })

    safeSettings.specialDays.forEach((sd) => {
      participantSpecialDayCountsPerDay.set(sd.id, new Map())
      participants.forEach((p) => {
        participantSpecialDayCountsPerDay.get(sd.id)!.set(p.id, 0)
      })
    })

    allHistoricalShifts.forEach((shift) => {
      shift.participants.forEach((participantId) => {
        if (participantShiftCounts.has(participantId)) {
          participantShiftCounts.set(
            participantId,
            (participantShiftCounts.get(participantId) || 0) + 1
          )
          if (shift.specialDayId && participantSpecialDayCountsPerDay.has(shift.specialDayId)) {
            const counts = participantSpecialDayCountsPerDay.get(shift.specialDayId)!
            counts.set(participantId, (counts.get(participantId) || 0) + 1)
          }
        }
      })
    })

    const combinedSchedule = [...allHistoricalShifts]

    for (const date of missingDates) {
      const specialDayOccurrence = specialDaysMap.get(date)
      const peopleCount = specialDayOccurrence
        ? specialDayOccurrence.peopleCount
        : safeSettings.peoplePerShift

      const recentShifts = combinedSchedule.slice(-5)

      const shiftParticipants = specialDayOccurrence
        ? buildShiftForSpecialDay(
            date,
            specialDayOccurrence,
            participants,
            participantShiftCounts,
            participantSpecialDayCountsPerDay,
            recentShifts
          )
        : buildShiftForRegularDay(
            date,
            peopleCount,
            specialPeople,
            regularPeople,
            participants,
            participantShiftCounts,
            recentShifts
          )

      const newShift: Shift = {
        id: `shift-${date}`,
        date,
        participants: shiftParticipants,
        specialDayId: specialDayOccurrence?.specialDayId,
      }

      newShifts.push(newShift)
      combinedSchedule.push(newShift)
    }

    const score = scoreSchedule(combinedSchedule, participants)
    if (score > bestScore) {
      bestScore = score
      bestNewShifts = newShifts
    }
  }

  return [...existingSchedule, ...bestNewShifts].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  )
}
