import { useState, useCallback } from 'react'
import { useLocalStorage } from './use-local-storage'
import { Shift, Participant, ShiftSettings, FillMode, OffDay, ParticipantAbsence } from '@/lib/types'
import { generateSchedule, fillSinglePlannedShift } from '@/lib/schedule-generator'

export function useSchedule() {
  const [schedule, setSchedule] = useLocalStorage<Shift[]>('schedule', [])
  const [isGenerating, setIsGenerating] = useState(false)

  const currentSchedule = schedule || []

  const generate = useCallback(
    async (
      participants: Participant[],
      settings: ShiftSettings,
      historicalShifts: Shift[],
      manualShifts: Shift[],
      fillMode: FillMode = 'ignore-existing-positions',
      offDays: OffDay[] = [],
      participantAbsences: ParticipantAbsence[] = []
    ): Promise<{ added: number; updated: number; total: number; updatedManualShifts: import('@/lib/types').Shift[] }> => {
      setIsGenerating(true)
      try {
        await new Promise<void>((resolve) => setTimeout(resolve, 500))
        const result = generateSchedule(
          participants,
          settings,
          historicalShifts,
          currentSchedule,
          manualShifts,
          fillMode,
          offDays,
          participantAbsences
        )
        setSchedule(result.schedule)
        return {
          added: result.newDatesCount,
          updated: result.updatedShiftsCount,
          total: result.schedule.length,
          updatedManualShifts: result.updatedManualShifts,
        }
      } finally {
        setIsGenerating(false)
      }
    },
    [currentSchedule, setSchedule]
  )

  const removeShift = useCallback(
    (id: string) => {
      setSchedule((current) => (current || []).filter((s) => s.id !== id))
    },
    [setSchedule]
  )

  const updateShift = useCallback(
    (id: string, participants: string[], specialDayId?: string | null) => {
      setSchedule((current) =>
        (current || []).map((s) =>
          s.id === id
            ? { ...s, participants, specialDayId: specialDayId === null ? undefined : specialDayId ?? s.specialDayId }
            : s
        )
      )
    },
    [setSchedule]
  )

  const reset = useCallback(() => {
    setSchedule([])
  }, [setSchedule])

  const replace = useCallback(
    (incoming: Shift[]) => {
      setSchedule(Array.isArray(incoming) ? incoming : [])
    },
    [setSchedule]
  )

  const fillSingleDay = useCallback(
    (
      shiftId: string,
      participants: Participant[],
      settings: ShiftSettings,
      historicalShifts: Shift[],
      manualShifts: Shift[],
      absences: ParticipantAbsence[]
    ): { changed: boolean } => {
      const shift = currentSchedule.find((s) => s.id === shiftId)
      if (!shift) return { changed: false }
      const result = fillSinglePlannedShift(
        shift,
        participants,
        settings,
        historicalShifts,
        currentSchedule,
        manualShifts,
        absences
      )
      if (result.changed) {
        setSchedule((current) =>
          (current || []).map((s) => (s.id === shiftId ? result.updatedShift : s))
        )
      }
      return { changed: result.changed }
    },
    [currentSchedule, setSchedule]
  )

  return { schedule: currentSchedule, isGenerating, generate, removeShift, updateShift, reset, replace, fillSingleDay }
}
