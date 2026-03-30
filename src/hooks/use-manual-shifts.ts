import { useState, useCallback } from 'react'
import { useLocalStorage } from './use-local-storage'
import { Shift } from '@/lib/types'

export function useManualShifts() {
  const [manualShifts, setManualShifts] = useLocalStorage<Shift[]>('manualShifts', [])
  const [dialogOpen, setDialogOpen] = useState(false)

  const current = manualShifts || []

  const add = useCallback(
    (shift: Shift, existingScheduleDates: Set<string>): 'ok' | 'conflict' => {
      const allDates = new Set([
        ...(manualShifts || []).map((s) => s.date),
        ...existingScheduleDates,
      ])
      if (allDates.has(shift.date)) return 'conflict'
      setManualShifts((existing) => {
        const arr = existing || []
        return [...arr, shift]
      })
      return 'ok'
    },
    [manualShifts, setManualShifts]
  )

  const remove = useCallback(
    (id: string) => {
      setManualShifts((existing) => (existing || []).filter((s) => s.id !== id))
    },
    [setManualShifts]
  )

  const update = useCallback(
    (id: string, participants: string[], specialDayId?: string | null) => {
      setManualShifts((existing) =>
        (existing || []).map((s) =>
          s.id === id
            ? { ...s, participants, specialDayId: specialDayId === null ? undefined : specialDayId ?? s.specialDayId }
            : s
        )
      )
    },
    [setManualShifts]
  )

  const replace = useCallback(
    (incoming: Shift[]) => {
      setManualShifts(Array.isArray(incoming) ? incoming : [])
    },
    [setManualShifts]
  )

  return { manualShifts: current, dialogOpen, setDialogOpen, add, remove, update, replace }
}
