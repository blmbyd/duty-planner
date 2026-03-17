import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Participant } from '@/lib/types'

interface AddParticipantDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAdd: (participant: Participant) => void
  editParticipant?: Participant
}

export function AddParticipantDialog({ 
  open, 
  onOpenChange, 
  onAdd,
  editParticipant 
}: AddParticipantDialogProps) {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [hasKeys, setHasKeys] = useState(false)

  useEffect(() => {
    if (open) {
      if (editParticipant) {
        setFirstName(editParticipant.firstName)
        setLastName(editParticipant.lastName)
        setHasKeys(editParticipant.hasKeys)
      } else {
        setFirstName('')
        setLastName('')
        setHasKeys(false)
      }
    }
  }, [open, editParticipant])

  const handleSubmit = () => {
    if (!firstName.trim() || !lastName.trim()) return
    
    const participant: Participant = {
      id: editParticipant?.id || `participant-${Date.now()}`,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      hasKeys
    }
    
    onAdd(participant)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editParticipant ? 'Edytuj uczestnika' : 'Dodaj uczestnika'}</DialogTitle>
          <DialogDescription>
            Wprowadź dane uczestnika dyżurów. Osoby z kluczami muszą być obecne na każdym dyżurze.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="firstName">Imię</Label>
            <Input
              id="firstName"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Jan"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="lastName">Nazwisko</Label>
            <Input
              id="lastName"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Kowalski"
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <Label htmlFor="hasKeys">Posiada klucze</Label>
              <p className="text-sm text-muted-foreground">
                Osoba specjalna, która musi być na każdym dyżurze
              </p>
            </div>
            <Switch
              id="hasKeys"
              checked={hasKeys}
              onCheckedChange={setHasKeys}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Anuluj
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={!firstName.trim() || !lastName.trim()}
          >
            {editParticipant ? 'Zapisz' : 'Dodaj'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
