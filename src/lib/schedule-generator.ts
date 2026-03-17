import { Participant, ShiftSettings, Shift, SpecialDayType } from './types'

function getSpecialDaysInRange(startDate: string, endDate: string, specialDayType: SpecialDayType): string[] {
  if (specialDayType === 'none') return []
  
  const specialDays: string[] = []
  const start = new Date(startDate)
  const end = new Date(endDate)
  
  let currentMonth = new Date(start.getFullYear(), start.getMonth(), 1)
  
  while (currentMonth <= end) {
    const specialDay = getSpecialDayForMonth(currentMonth, specialDayType)
    if (specialDay && specialDay >= start && specialDay <= end) {
      specialDays.push(specialDay.toISOString().split('T')[0])
    }
    currentMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)
  }
  
  return specialDays
}

function getSpecialDayForMonth(monthDate: Date, specialDayType: SpecialDayType): Date | null {
  if (specialDayType === 'none') return null
  
  const year = monthDate.getFullYear()
  const month = monthDate.getMonth()
  
  const firstDay = new Date(year, month, 1)
  const firstMonday = new Date(firstDay)
  
  while (firstMonday.getDay() !== 1) {
    firstMonday.setDate(firstMonday.getDate() + 1)
  }
  
  switch (specialDayType) {
    case 'first-monday':
      return firstMonday
    case 'second-monday': {
      const secondMonday = new Date(firstMonday)
      secondMonday.setDate(secondMonday.getDate() + 7)
      return secondMonday
    }
    case 'third-monday': {
      const thirdMonday = new Date(firstMonday)
      thirdMonday.setDate(thirdMonday.getDate() + 14)
      return thirdMonday
    }
    case 'last-monday': {
      const lastMonday = new Date(year, month + 1, 0)
      while (lastMonday.getDay() !== 1) {
        lastMonday.setDate(lastMonday.getDate() - 1)
      }
      return lastMonday
    }
    default:
      return null
  }
}

function getDaysBetweenDates(startDate: string, endDate: string, frequency: ShiftSettings['frequency']): string[] {
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

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

function calculateGapsBetweenShifts(schedule: Shift[], participantId: string): number[] {
  const shiftIndices: number[] = []
  schedule.forEach((shift, index) => {
    if (shift.participants.includes(participantId)) {
      shiftIndices.push(index)
    }
  })
  
  const gaps: number[] = []
  for (let i = 1; i < shiftIndices.length; i++) {
    gaps.push(shiftIndices[i] - shiftIndices[i - 1])
  }
  
  return gaps
}

function calculateDiversity(schedule: Shift[]): number {
  const pairCounts = new Map<string, number>()
  
  schedule.forEach(shift => {
    for (let i = 0; i < shift.participants.length; i++) {
      for (let j = i + 1; j < shift.participants.length; j++) {
        const pair = [shift.participants[i], shift.participants[j]].sort().join('-')
        pairCounts.set(pair, (pairCounts.get(pair) || 0) + 1)
      }
    }
  })
  
  const counts = Array.from(pairCounts.values())
  if (counts.length === 0) return 0
  
  const avg = counts.reduce((a, b) => a + b, 0) / counts.length
  const variance = counts.reduce((sum, count) => sum + Math.pow(count - avg, 2), 0) / counts.length
  
  return -Math.sqrt(variance)
}

function scoreSchedule(schedule: Shift[], participants: Participant[]): number {
  let score = 0
  
  participants.forEach(participant => {
    const gaps = calculateGapsBetweenShifts(schedule, participant.id)
    const minGap = gaps.length > 0 ? Math.min(...gaps) : 999
    score += minGap * 100
  })
  
  const diversityScore = calculateDiversity(schedule)
  score += diversityScore * 50
  
  return score
}

export function generateSchedule(
  participants: Participant[],
  settings: ShiftSettings,
  historicalShifts: Shift[] = [],
  existingSchedule: Shift[] = []
): Shift[] {
  const allDates = getDaysBetweenDates(settings.startDate, settings.endDate, settings.frequency)
  const specialDays = getSpecialDaysInRange(settings.startDate, settings.endDate, settings.specialDayType)
  const specialDaysSet = new Set(specialDays)
  
  const specialPeople = participants.filter(p => p.hasKeys)
  const regularPeople = participants.filter(p => !p.hasKeys)
  
  if (participants.length < settings.peoplePerShift) {
    throw new Error('Za mało uczestników dla wymaganej liczby osób na dyżurze')
  }
  
  if (specialPeople.length === 0 && settings.peoplePerShift > 0) {
    throw new Error('Brak osób z kluczami. Dodaj przynajmniej jedną osobę specjalną.')
  }
  
  const existingDatesSet = new Set(existingSchedule.map(s => s.date))
  const existingScheduleMap = new Map(existingSchedule.map(s => [s.date, s]))
  
  const allRequiredDates = [...new Set([...allDates, ...specialDays])].sort()
  const missingDates = allRequiredDates.filter(date => !existingDatesSet.has(date))
  
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
    const participantSpecialDayCounts = new Map<string, number>()
    participants.forEach(p => {
      participantShiftCounts.set(p.id, 0)
      participantSpecialDayCounts.set(p.id, 0)
    })
    
    allHistoricalShifts.forEach(shift => {
      shift.participants.forEach(participantId => {
        if (participantShiftCounts.has(participantId)) {
          participantShiftCounts.set(participantId, (participantShiftCounts.get(participantId) || 0) + 1)
          if (shift.isSpecialDay) {
            participantSpecialDayCounts.set(participantId, (participantSpecialDayCounts.get(participantId) || 0) + 1)
          }
        }
      })
    })
    
    const combinedSchedule = [...allHistoricalShifts]
    
    for (const date of missingDates) {
      const isSpecialDay = specialDaysSet.has(date)
      const peopleCount = isSpecialDay && settings.specialDayPeopleCount 
        ? settings.specialDayPeopleCount 
        : settings.peoplePerShift
      
      const shiftParticipants: string[] = []
      
      const recentShifts = combinedSchedule.slice(-5)
      
      if (isSpecialDay) {
        const availableForSpecialDay = shuffleArray(participants.filter(p => {
          const lastTwoShifts = recentShifts.slice(-2)
          return !lastTwoShifts.some(shift => shift.participants.includes(p.id))
        })).sort((a, b) => {
          const specialCountA = participantSpecialDayCounts.get(a.id) || 0
          const specialCountB = participantSpecialDayCounts.get(b.id) || 0
          if (specialCountA !== specialCountB) {
            return specialCountA - specialCountB
          }
          const countA = participantShiftCounts.get(a.id) || 0
          const countB = participantShiftCounts.get(b.id) || 0
          return countA - countB
        })
        
        const hasKeysInSelection = availableForSpecialDay.some(p => p.hasKeys)
        if (hasKeysInSelection) {
          const personWithKeys = availableForSpecialDay.find(p => p.hasKeys)!
          shiftParticipants.push(personWithKeys.id)
          participantShiftCounts.set(personWithKeys.id, (participantShiftCounts.get(personWithKeys.id) || 0) + 1)
          participantSpecialDayCounts.set(personWithKeys.id, (participantSpecialDayCounts.get(personWithKeys.id) || 0) + 1)
        }
        
        for (const person of availableForSpecialDay) {
          if (shiftParticipants.length >= peopleCount) break
          if (!shiftParticipants.includes(person.id)) {
            shiftParticipants.push(person.id)
            participantShiftCounts.set(person.id, (participantShiftCounts.get(person.id) || 0) + 1)
            participantSpecialDayCounts.set(person.id, (participantSpecialDayCounts.get(person.id) || 0) + 1)
          }
        }
        
        if (shiftParticipants.length < peopleCount) {
          const fallbackAvailable = shuffleArray(
            participants.filter(p => !shiftParticipants.includes(p.id))
          ).sort((a, b) => {
            const specialCountA = participantSpecialDayCounts.get(a.id) || 0
            const specialCountB = participantSpecialDayCounts.get(b.id) || 0
            return specialCountA - specialCountB
          })
          
          for (const person of fallbackAvailable) {
            if (shiftParticipants.length >= peopleCount) break
            shiftParticipants.push(person.id)
            participantShiftCounts.set(person.id, (participantShiftCounts.get(person.id) || 0) + 1)
            participantSpecialDayCounts.set(person.id, (participantSpecialDayCounts.get(person.id) || 0) + 1)
          }
        }
      } else {
        const availableSpecial = shuffleArray(
          specialPeople.filter(p => {
            const lastTwoShifts = recentShifts.slice(-2)
            return !lastTwoShifts.some(shift => shift.participants.includes(p.id))
          })
        ).sort((a, b) => {
          const countA = participantShiftCounts.get(a.id) || 0
          const countB = participantShiftCounts.get(b.id) || 0
          return countA - countB
        })
        
        if (availableSpecial.length > 0) {
          shiftParticipants.push(availableSpecial[0].id)
          participantShiftCounts.set(availableSpecial[0].id, (participantShiftCounts.get(availableSpecial[0].id) || 0) + 1)
        } else if (specialPeople.length > 0) {
          const fallbackSpecial = shuffleArray(specialPeople).sort((a, b) => {
            const countA = participantShiftCounts.get(a.id) || 0
            const countB = participantShiftCounts.get(b.id) || 0
            return countA - countB
          })[0]
          shiftParticipants.push(fallbackSpecial.id)
          participantShiftCounts.set(fallbackSpecial.id, (participantShiftCounts.get(fallbackSpecial.id) || 0) + 1)
        }
        
        const remainingSlots = peopleCount - shiftParticipants.length
        
        const availableRegular = shuffleArray(
          regularPeople.filter(p => {
            const lastTwoShifts = recentShifts.slice(-2)
            return !lastTwoShifts.some(shift => shift.participants.includes(p.id))
          })
        ).sort((a, b) => {
          const countA = participantShiftCounts.get(a.id) || 0
          const countB = participantShiftCounts.get(b.id) || 0
          return countA - countB
        })
        
        for (let i = 0; i < remainingSlots && i < availableRegular.length; i++) {
          shiftParticipants.push(availableRegular[i].id)
          participantShiftCounts.set(availableRegular[i].id, (participantShiftCounts.get(availableRegular[i].id) || 0) + 1)
        }
        
        if (shiftParticipants.length < peopleCount) {
          const allAvailable = shuffleArray(
            participants.filter(p => !shiftParticipants.includes(p.id))
          ).sort((a, b) => {
            const countA = participantShiftCounts.get(a.id) || 0
            const countB = participantShiftCounts.get(b.id) || 0
            return countA - countB
          })
          
          for (const person of allAvailable) {
            if (shiftParticipants.length >= peopleCount) break
            shiftParticipants.push(person.id)
            participantShiftCounts.set(person.id, (participantShiftCounts.get(person.id) || 0) + 1)
          }
        }
      }
      
      const newShift: Shift = {
        id: `shift-${date}`,
        date,
        participants: shiftParticipants,
        isSpecialDay
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
  
  const finalSchedule = [...existingSchedule, ...bestNewShifts].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  )
  
  return finalSchedule
}

export function exportParticipantsToJSON(data: { participants: Participant[], settings: ShiftSettings }): void {
  const json = JSON.stringify(data, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `uczestnicy-ustawienia-${new Date().toISOString().split('T')[0]}.json`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export function exportScheduleToJSON(data: { schedule: Shift[], historicalShifts: Shift[] }): void {
  const json = JSON.stringify(data, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `harmonogram-dyzurow-${new Date().toISOString().split('T')[0]}.json`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export function importFromJSON(file: File): Promise<{ participants: Participant[], settings: ShiftSettings, schedule: Shift[], historicalShifts?: Shift[] }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string)
        if (!data.participants || !data.settings) {
          reject(new Error('Nieprawidłowy format pliku'))
          return
        }
        resolve(data)
      } catch (error) {
        reject(new Error('Błąd parsowania pliku JSON'))
      }
    }
    reader.onerror = () => reject(new Error('Błąd wczytywania pliku'))
    reader.readAsText(file)
  })
}
