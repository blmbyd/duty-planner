import { Participant, ShiftSettings, Shift, FillMode, OffDay, ParticipantAbsence } from '../types'
import { getDaysBetweenDates } from './date-utils'
import { getSpecialDaysInRange, SpecialDayOccurrence } from './special-days'
import { shuffleArray, scoreSchedule } from './scoring'

export interface GenerateResult {
  schedule: Shift[]
  newDatesCount: number
  updatedShiftsCount: number
}

function buildAbsenceLookup(absences: ParticipantAbsence[]): Map<string, Set<string>> {
  const lookup = new Map<string, Set<string>>()
  for (const absence of absences) {
    if (!lookup.has(absence.participantId)) {
      lookup.set(absence.participantId, new Set())
    }
    const dates = lookup.get(absence.participantId)!
    const current = new Date(absence.startDate)
    const end = new Date(absence.endDate)
    while (current <= end) {
      dates.add(
        `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}-${String(current.getDate()).padStart(2, '0')}`
      )
      current.setDate(current.getDate() + 1)
    }
  }
  return lookup
}

function buildShiftForSpecialDay(
  date: string,
  occurrence: SpecialDayOccurrence,
  participants: Participant[],
  participantShiftCounts: Map<string, number>,
  participantSpecialDayCountsPerDay: Map<string, Map<string, number>>,
  recentShifts: Shift[],
  absenceLookup: Map<string, Set<string>>
): string[] {
  const shiftParticipants: string[] = []
  const peopleCount = occurrence.peopleCount
  const specialDayCounts = participantSpecialDayCountsPerDay.get(occurrence.specialDayId)!

  const available = shuffleArray(
    participants.filter((p) => {
      if (absenceLookup.get(p.id)?.has(date)) return false
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
      participants.filter((p) => !shiftParticipants.includes(p.id) && !absenceLookup.get(p.id)?.has(date))
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
  recentShifts: Shift[],
  absenceLookup: Map<string, Set<string>>
): string[] {
  const shiftParticipants: string[] = []

  const availableSpecial = shuffleArray(
    specialPeople.filter((p) => {
      if (absenceLookup.get(p.id)?.has(date)) return false
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
    const fallbackSpecial = shuffleArray(
      specialPeople.filter((p) => !absenceLookup.get(p.id)?.has(date))
    ).sort(
      (a, b) =>
        (participantShiftCounts.get(a.id) || 0) - (participantShiftCounts.get(b.id) || 0)
    )[0]
    if (fallbackSpecial) {
      shiftParticipants.push(fallbackSpecial.id)
      participantShiftCounts.set(
        fallbackSpecial.id,
        (participantShiftCounts.get(fallbackSpecial.id) || 0) + 1
      )
    }
  }

  const remainingSlots = peopleCount - shiftParticipants.length

  const availableRegular = shuffleArray(
    regularPeople.filter((p) => {
      if (absenceLookup.get(p.id)?.has(date)) return false
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
      participants.filter(
        (p) => !shiftParticipants.includes(p.id) && !absenceLookup.get(p.id)?.has(date)
      )
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

function isShiftIncomplete(
  shift: Shift,
  specialPeople: Participant[],
  specialDaysMap: Map<string, SpecialDayOccurrence>,
  peoplePerShift: number
): boolean {
  const specialDayOcc = specialDaysMap.get(shift.date)
  const requiredCount = specialDayOcc ? specialDayOcc.peopleCount : peoplePerShift
  const hasKeyHolder = specialDayOcc
    ? true
    : shift.participants.some((id) => specialPeople.some((p) => p.id === id))
  return shift.participants.length < requiredCount || (!specialDayOcc && !hasKeyHolder)
}

function fillParticipantsForShift(
  shift: Shift,
  specialPeople: Participant[],
  participants: Participant[],
  specialDaysMap: Map<string, SpecialDayOccurrence>,
  peoplePerShift: number,
  fillCounts: Map<string, number>,
  absenceLookup: Map<string, Set<string>>
): { updatedShift: Shift; changed: boolean } {
  const specialDayOcc = specialDaysMap.get(shift.date)
  const requiredCount = specialDayOcc ? specialDayOcc.peopleCount : peoplePerShift
  const currentParticipants = [...shift.participants]

  if (!specialDayOcc) {
    const hasKeyHolder = currentParticipants.some((id) =>
      specialPeople.some((p) => p.id === id)
    )
    if (!hasKeyHolder) {
      const available = shuffleArray(
        specialPeople.filter(
          (p) => !currentParticipants.includes(p.id) && !absenceLookup.get(p.id)?.has(shift.date)
        )
      ).sort((a, b) => (fillCounts.get(a.id) || 0) - (fillCounts.get(b.id) || 0))
      if (available.length > 0) {
        currentParticipants.push(available[0].id)
        fillCounts.set(available[0].id, (fillCounts.get(available[0].id) || 0) + 1)
      }
    }
  }

  if (currentParticipants.length < requiredCount) {
    const available = shuffleArray(
      participants.filter(
        (p) => !currentParticipants.includes(p.id) && !absenceLookup.get(p.id)?.has(shift.date)
      )
    ).sort((a, b) => (fillCounts.get(a.id) || 0) - (fillCounts.get(b.id) || 0))
    for (const person of available) {
      if (currentParticipants.length >= requiredCount) break
      currentParticipants.push(person.id)
      fillCounts.set(person.id, (fillCounts.get(person.id) || 0) + 1)
    }
  }

  return {
    updatedShift: { ...shift, participants: currentParticipants },
    changed: currentParticipants.length !== shift.participants.length,
  }
}

export function generateSchedule(
  participants: Participant[],
  settings: ShiftSettings,
  historicalShifts: Shift[] = [],
  existingSchedule: Shift[] = [],
  fillMode: FillMode = 'ignore-existing-positions',
  offDays: OffDay[] = [],
  participantAbsences: ParticipantAbsence[] = []
): GenerateResult {
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
  const offDaysSet = new Set(offDays.map((d) => d.date))
  const absenceLookup = buildAbsenceLookup(participantAbsences)
  const specialDayDates = specialDayOccurrences.map((occ) => occ.date)
  const allRequiredDates = [...new Set([...allDates, ...specialDayDates])].sort()
  const missingDates = allRequiredDates.filter(
    (date) => !existingDatesSet.has(date) && !offDaysSet.has(date)
  )

  const incompleteShiftDates = new Set<string>()
  if (fillMode === 'fill-missing-people') {
    for (const shift of existingSchedule) {
      if (shift.date < safeSettings.startDate || shift.date > safeSettings.endDate) continue
      if (isShiftIncomplete(shift, specialPeople, specialDaysMap, safeSettings.peoplePerShift)) {
        incompleteShiftDates.add(shift.date)
      }
    }
  }

  if (missingDates.length === 0 && incompleteShiftDates.size === 0) {
    return { schedule: existingSchedule, newDatesCount: 0, updatedShiftsCount: 0 }
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
            recentShifts,
            absenceLookup
          )
        : buildShiftForRegularDay(
            date,
            peopleCount,
            specialPeople,
            regularPeople,
            participants,
            participantShiftCounts,
            recentShifts,
            absenceLookup
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

  const filledExistingShifts: Shift[] = []
  let updatedShiftsCount = 0

  const needsFill =
    fillMode === 'fill-missing-people' && incompleteShiftDates.size > 0

  if (needsFill) {
    const fillCounts = new Map<string, number>()
    participants.forEach((p) => fillCounts.set(p.id, 0))
    ;[...historicalShifts, ...existingSchedule, ...bestNewShifts].forEach(
      (shift) => {
        shift.participants.forEach((id) => {
          if (fillCounts.has(id)) {
            fillCounts.set(id, (fillCounts.get(id) || 0) + 1)
          }
        })
      }
    )

    for (const shift of existingSchedule) {
      if (!incompleteShiftDates.has(shift.date)) {
        filledExistingShifts.push(shift)
        continue
      }
      const { updatedShift } = fillParticipantsForShift(
        shift,
        specialPeople,
        participants,
        specialDaysMap,
        safeSettings.peoplePerShift,
        fillCounts,
        absenceLookup
      )
      filledExistingShifts.push(updatedShift)
      updatedShiftsCount++
    }
  } else {
    filledExistingShifts.push(...existingSchedule)
  }

  return {
    schedule: [...filledExistingShifts, ...bestNewShifts].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    ),
    newDatesCount: bestNewShifts.length,
    updatedShiftsCount,
  }
}

export interface FillSingleResult {
  updatedShift: Shift
  changed: boolean
}

export function fillSinglePlannedShift(
  shift: Shift,
  participants: Participant[],
  settings: ShiftSettings,
  historicalShifts: Shift[],
  existingSchedule: Shift[],
  absences: ParticipantAbsence[]
): FillSingleResult {
  const safeSettings: ShiftSettings = {
    ...settings,
    specialDays: Array.isArray(settings.specialDays) ? settings.specialDays : [],
  }

  const specialPeople = participants.filter((p) => p.hasKeys)
  const specialDayOccurrences = getSpecialDaysInRange(
    safeSettings.startDate,
    safeSettings.endDate,
    safeSettings.specialDays
  )
  const specialDaysMap = new Map(specialDayOccurrences.map((occ) => [occ.date, occ]))
  const absenceLookup = buildAbsenceLookup(absences)

  if (!isShiftIncomplete(shift, specialPeople, specialDaysMap, safeSettings.peoplePerShift)) {
    return { updatedShift: shift, changed: false }
  }

  const fillCounts = new Map<string, number>()
  participants.forEach((p) => fillCounts.set(p.id, 0))
  ;[...historicalShifts, ...existingSchedule].forEach((s) => {
    s.participants.forEach((id) => {
      if (fillCounts.has(id)) {
        fillCounts.set(id, (fillCounts.get(id) || 0) + 1)
      }
    })
  })

  return fillParticipantsForShift(
    shift,
    specialPeople,
    participants,
    specialDaysMap,
    safeSettings.peoplePerShift,
    fillCounts,
    absenceLookup
  )
}
