import { useCallback } from 'react'
import { useLocalStorage } from './use-local-storage'
import { ParticipantAbsence } from '@/lib/types'

export function useParticipantAbsences() {
  const [absences, setAbsences] = useLocalStorage<ParticipantAbsence[]>('participantAbsences', [])

  const current = absences || []

  const add = useCallback(
    (absence: ParticipantAbsence) => {
      setAbsences((existing) => [...(existing || []), absence])
    },
    [setAbsences]
  )

  const remove = useCallback(
    (id: string) => {
      setAbsences((existing) => (existing || []).filter((a) => a.id !== id))
    },
    [setAbsences]
  )

  const removeByParticipant = useCallback(
    (participantId: string) => {
      setAbsences((existing) => (existing || []).filter((a) => a.participantId !== participantId))
    },
    [setAbsences]
  )

  const replace = useCallback(
    (incoming: ParticipantAbsence[]) => {
      setAbsences(Array.isArray(incoming) ? incoming : [])
    },
    [setAbsences]
  )

  const forParticipant = useCallback(
    (participantId: string) => {
      return current.filter((a) => a.participantId === participantId)
    },
    [current]
  )

  return { absences: current, add, remove, removeByParticipant, replace, forParticipant }
}
