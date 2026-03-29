import { useCallback, useState } from 'react'
import { useLocalStorage } from './use-local-storage'
import { Participant } from '@/lib/types'

export function useParticipants() {
  const [participants, setParticipants] = useLocalStorage<Participant[]>('participants', [])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingParticipant, setEditingParticipant] = useState<Participant | undefined>()

  const list = participants || []

  const addOrUpdate = useCallback(
    (participant: Participant) => {
      setParticipants((current) => {
        const arr = current || []
        const idx = arr.findIndex((p) => p.id === participant.id)
        if (idx !== -1) {
          const updated = [...arr]
          updated[idx] = participant
          return updated
        }
        return [...arr, participant]
      })
      setEditingParticipant(undefined)
    },
    [setParticipants]
  )

  const remove = useCallback(
    (id: string) => {
      setParticipants((current) => (current || []).filter((p) => p.id !== id))
    },
    [setParticipants]
  )

  const openEdit = useCallback((participant: Participant) => {
    setEditingParticipant(participant)
    setDialogOpen(true)
  }, [])

  const openAdd = useCallback(() => {
    setEditingParticipant(undefined)
    setDialogOpen(true)
  }, [])

  const closeDialog = useCallback(() => {
    setDialogOpen(false)
    setEditingParticipant(undefined)
  }, [])

  const replace = useCallback(
    (incoming: Participant[]) => {
      setParticipants(Array.isArray(incoming) ? incoming : [])
    },
    [setParticipants]
  )

  const addSampleParticipants = useCallback(() => {
    const samples: Participant[] = [
      { id: 'p1', firstName: 'Anna', lastName: 'Kowalska', hasKeys: true },
      { id: 'p2', firstName: 'Jan', lastName: 'Nowak', hasKeys: false },
      { id: 'p3', firstName: 'Maria', lastName: 'Wisniewska', hasKeys: true },
      { id: 'p4', firstName: 'Piotr', lastName: 'Wojcik', hasKeys: false },
      { id: 'p5', firstName: 'Katarzyna', lastName: 'Kaminska', hasKeys: false },
      { id: 'p6', firstName: 'Tomasz', lastName: 'Lewandowski', hasKeys: false },
      { id: 'p7', firstName: 'Agnieszka', lastName: 'Zielinska', hasKeys: false },
      { id: 'p8', firstName: 'Michal', lastName: 'Szymanski', hasKeys: false },
      { id: 'p9', firstName: 'Magdalena', lastName: 'Dabrowska', hasKeys: true },
      { id: 'p10', firstName: 'Krzysztof', lastName: 'Mazur', hasKeys: false },
    ]
    let result: Participant[] = []
    setParticipants((current) => {
      const existing = current || []
      const newOnes = samples.filter((s) => !existing.some((p) => p.id === s.id))
      result = [...existing, ...newOnes]
      return result
    })
    return result
  }, [setParticipants])

  const getName = useCallback(
    (id: string) => {
      const p = list.find((p) => p.id === id)
      return p ? `${p.firstName} ${p.lastName}` : 'Nieznany'
    },
    [list]
  )

  return {
    participants: list,
    dialogOpen,
    editingParticipant,
    addOrUpdate,
    remove,
    replace,
    openEdit,
    openAdd,
    closeDialog,
    setDialogOpen,
    addSampleParticipants,
    getName,
  }
}
