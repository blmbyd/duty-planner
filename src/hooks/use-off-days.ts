import { useCallback } from 'react'
import { useLocalStorage } from './use-local-storage'
import { OffDay } from '@/lib/types'

export function useOffDays() {
  const [offDays, setOffDays] = useLocalStorage<OffDay[]>('offDays', [])

  const current = offDays || []

  const add = useCallback(
    (offDay: OffDay, occupiedDates: Set<string>): 'ok' | 'conflict' => {
      const existingDates = new Set([
        ...(offDays || []).map((d) => d.date),
        ...occupiedDates,
      ])
      if (existingDates.has(offDay.date)) return 'conflict'
      setOffDays((existing) => [...(existing || []), offDay])
      return 'ok'
    },
    [offDays, setOffDays]
  )

  const remove = useCallback(
    (id: string) => {
      setOffDays((existing) => (existing || []).filter((d) => d.id !== id))
    },
    [setOffDays]
  )

  const replace = useCallback(
    (incoming: OffDay[]) => {
      setOffDays(Array.isArray(incoming) ? incoming : [])
    },
    [setOffDays]
  )

  return { offDays: current, add, remove, replace }
}
