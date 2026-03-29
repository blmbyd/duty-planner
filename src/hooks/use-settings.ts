import { useLocalStorage } from './use-local-storage'
import { ShiftSettings, DEFAULT_SETTINGS } from '@/lib/types'
import { useCallback } from 'react'

export function useSettings() {
  const [settings, setSettings] = useLocalStorage<ShiftSettings>('settings', DEFAULT_SETTINGS)

  const current: ShiftSettings = {
    ...DEFAULT_SETTINGS,
    ...(settings || {}),
    specialDays: settings?.specialDays || [],
  }

  const update = useCallback(
    (patch: Partial<ShiftSettings>) => {
      setSettings((s) => ({ ...(s || DEFAULT_SETTINGS), ...patch }))
    },
    [setSettings]
  )

  const updateSpecialDays = useCallback(
    (specialDays: ShiftSettings['specialDays']) => {
      setSettings((s) => ({ ...(s || DEFAULT_SETTINGS), specialDays }))
    },
    [setSettings]
  )

  const replace = useCallback(
    (incoming: ShiftSettings) => {
      setSettings({
        ...DEFAULT_SETTINGS,
        ...incoming,
        specialDays: Array.isArray(incoming?.specialDays) ? incoming.specialDays : [],
      })
    },
    [setSettings]
  )

  return { settings: current, update, updateSpecialDays, replace }
}
