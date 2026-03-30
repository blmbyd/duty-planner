import { useState, useCallback } from 'react'
import { useLocalStorage } from './use-local-storage'
import { Shift, Participant, ShiftSettings, FillMode } from '@/lib/types'
import { generateSchedule } from '@/lib/schedule-generator'

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
      fillMode: FillMode = 'ignore-existing-positions'
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
          fillMode
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

  const reset = useCallback(() => {
    setSchedule([])
  }, [setSchedule])

  const replace = useCallback(
    (incoming: Shift[]) => {
      setSchedule(Array.isArray(incoming) ? incoming : [])
    },
    [setSchedule]
  )

  return { schedule: currentSchedule, isGenerating, generate, removeShift, reset, replace }
}
