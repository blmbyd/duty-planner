import { AppData, DEFAULT_SETTINGS } from './types'

export interface BackupFile {
  version: 1
  exportedAt: string
  data: AppData
}

export function exportBackup(data: AppData): void {
  const backup: BackupFile = {
    version: 1,
    exportedAt: new Date().toISOString(),
    data,
  }
  const json = JSON.stringify(backup, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const date = new Date().toISOString().slice(0, 10)
  const a = document.createElement('a')
  a.href = url
  a.download = `duty-planner-backup-${date}.json`
  a.click()
  URL.revokeObjectURL(url)
}

export function parseBackup(raw: string): AppData {
  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    throw new Error('Plik nie jest poprawnym dokumentem JSON.')
  }

  // Accept both the wrapped {version, data} format and a plain AppData object
  // (for backwards compatibility or manually crafted files)
  let candidate: unknown
  if (
    parsed !== null &&
    typeof parsed === 'object' &&
    'data' in (parsed as object) &&
    (parsed as { version?: unknown }).version === 1
  ) {
    candidate = (parsed as BackupFile).data
  } else {
    candidate = parsed
  }

  if (candidate === null || typeof candidate !== 'object') {
    throw new Error('Nieprawidlowa struktura pliku backupu.')
  }

  const obj = candidate as Record<string, unknown>

  if (!Array.isArray(obj.participants)) {
    throw new Error('Brakuje pola "participants" (tablica) w pliku backupu.')
  }
  if (typeof obj.settings !== 'object' || obj.settings === null || Array.isArray(obj.settings)) {
    throw new Error('Brakuje pola "settings" (obiekt) w pliku backupu.')
  }
  if (!Array.isArray(obj.schedule)) {
    throw new Error('Brakuje pola "schedule" (tablica) w pliku backupu.')
  }
  if (!Array.isArray(obj.historicalShifts)) {
    throw new Error('Brakuje pola "historicalShifts" (tablica) w pliku backupu.')
  }

  const settings = obj.settings as Record<string, unknown>

  return {
    participants: obj.participants as AppData['participants'],
    settings: {
      ...DEFAULT_SETTINGS,
      ...(settings as Partial<AppData['settings']>),
      specialDays: Array.isArray(settings.specialDays) ? settings.specialDays as AppData['settings']['specialDays'] : [],
    },
    schedule: obj.schedule as AppData['schedule'],
    historicalShifts: obj.historicalShifts as AppData['historicalShifts'],
    manualShifts: Array.isArray(obj.manualShifts) ? obj.manualShifts as AppData['manualShifts'] : [],
    offDays: Array.isArray(obj.offDays) ? obj.offDays as AppData['offDays'] : [],
  }
}
