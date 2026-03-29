import { Participant, ShiftSettings, Shift } from '../types'

export function exportParticipantsToJSON(data: {
  participants: Participant[]
  settings: ShiftSettings
}): void {
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

export function exportScheduleToJSON(data: {
  schedule: Shift[]
  historicalShifts: Shift[]
}): void {
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

export function importFromJSON(
  file: File
): Promise<{
  participants: Participant[]
  settings: ShiftSettings
  schedule: Shift[]
  historicalShifts?: Shift[]
}> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string)
        if (!data.participants || !data.settings) {
          reject(new Error('Nieprawidlowy format pliku'))
          return
        }
        resolve(data)
      } catch {
        reject(new Error('Blad parsowania pliku JSON'))
      }
    }
    reader.onerror = () => reject(new Error('Blad wczytywania pliku'))
    reader.readAsText(file)
  })
}
