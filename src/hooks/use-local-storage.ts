import { useState, useCallback } from 'react'

const STORAGE_PREFIX = 'duty-planner:v1:'

function readFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const raw = window.localStorage.getItem(STORAGE_PREFIX + key)
    if (raw === null) return defaultValue
    return JSON.parse(raw) as T
  } catch {
    return defaultValue
  }
}

export function useLocalStorage<T>(
  key: string,
  defaultValue: T
): [T, (value: T | ((current: T) => T)) => void] {
  const [state, setState] = useState<T>(() => readFromStorage(key, defaultValue))

  const setValue = useCallback(
    (value: T | ((current: T) => T)) => {
      setState((current) => {
        const next =
          typeof value === 'function'
            ? (value as (current: T) => T)(current)
            : value
        try {
          window.localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(next))
        } catch {
          // storage quota exceeded or unavailable — state still updates in memory
        }
        return next
      })
    },
    [key]
  )

  return [state, setValue]
}
