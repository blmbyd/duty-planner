import { useState, useCallback } from 'react'
import { useLocalStorage } from './use-local-storage'
import { Shift } from '@/lib/types'

export function useHistoricalShifts() {
  const [historicalShifts, setHistoricalShifts] = useLocalStorage<Shift[]>(
    'historicalShifts',
    []
  )
  const [dialogOpen, setDialogOpen] = useState(false)

  const current = historicalShifts || []

  const add = useCallback(
    (shift: Shift) => {
      setHistoricalShifts((existing) => {
        const arr = existing || []
        if (arr.some((s) => s.id === shift.id)) return arr
        return [...arr, { ...shift, isHistorical: true }]
      })
    },
    [setHistoricalShifts]
  )

  const remove = useCallback(
    (id: string) => {
      setHistoricalShifts((existing) => (existing || []).filter((s) => s.id !== id))
    },
    [setHistoricalShifts]
  )

  const update = useCallback(
    (id: string, participants: string[]) => {
      setHistoricalShifts((existing) =>
        (existing || []).map((s) => (s.id === id ? { ...s, participants } : s))
      )
    },
    [setHistoricalShifts]
  )

  const replace = useCallback(
    (incoming: Shift[]) => {
      setHistoricalShifts(
        (Array.isArray(incoming) ? incoming : []).map((s) => ({ ...s, isHistorical: true }))
      )
    },
    [setHistoricalShifts]
  )

  return { historicalShifts: current, dialogOpen, setDialogOpen, add, remove, update, replace }
}
