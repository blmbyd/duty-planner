import { Participant, Shift } from '../types'

export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

export function calculateGapsBetweenShifts(schedule: Shift[], participantId: string): number[] {
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

export function calculateDiversity(schedule: Shift[]): number {
  const pairCounts = new Map<string, number>()

  schedule.forEach((shift) => {
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
  const variance =
    counts.reduce((sum, count) => sum + Math.pow(count - avg, 2), 0) / counts.length

  return -Math.sqrt(variance)
}

export function calculateSpecialDayFairness(schedule: Shift[], participants: Participant[]): number {
  const specialDayCounts = new Map<string, Map<string, number>>()

  schedule.forEach((shift) => {
    if (!shift.specialDayId) return
    if (!specialDayCounts.has(shift.specialDayId)) {
      specialDayCounts.set(shift.specialDayId, new Map())
    }
    const counts = specialDayCounts.get(shift.specialDayId)!
    shift.participants.forEach((participantId) => {
      counts.set(participantId, (counts.get(participantId) || 0) + 1)
    })
  })

  if (specialDayCounts.size === 0) return 0

  let totalPenalty = 0

  specialDayCounts.forEach((countsByParticipant) => {
    const allCounts = participants.map((p) => countsByParticipant.get(p.id) || 0)
    const avg = allCounts.reduce((a, b) => a + b, 0) / allCounts.length
    const variance =
      allCounts.reduce((sum, count) => sum + Math.pow(count - avg, 2), 0) / allCounts.length
    totalPenalty += -Math.sqrt(variance)
  })

  return totalPenalty
}

export function scoreSchedule(schedule: Shift[], participants: Participant[]): number {
  let score = 0

  participants.forEach((participant) => {
    const gaps = calculateGapsBetweenShifts(schedule, participant.id)
    const minGap = gaps.length > 0 ? Math.min(...gaps) : 999
    score += minGap * 100
  })

  const diversityScore = calculateDiversity(schedule)
  score += diversityScore * 50

  const specialDayFairnessScore = calculateSpecialDayFairness(schedule, participants)
  score += specialDayFairnessScore * 200

  return score
}
