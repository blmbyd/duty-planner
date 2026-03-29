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
import { useTranslation } from '@/lib/i18n'

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
  const { t } = useTranslation()
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
          <DialogTitle>{editParticipant ? t.dialog.addParticipant.editTitle : t.dialog.addParticipant.title}</DialogTitle>
          <DialogDescription>
            {t.dialog.addParticipant.desc}
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="firstName">{t.dialog.addParticipant.firstName}</Label>
            <Input
              id="firstName"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Jan"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="lastName">{t.dialog.addParticipant.lastName}</Label>
            <Input
              id="lastName"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Kowalski"
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <Label htmlFor="hasKeys">{t.dialog.addParticipant.hasKeys}</Label>
              <p className="text-sm text-muted-foreground">
                {t.dialog.addParticipant.hasKeysDesc}
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
            {t.dialog.addParticipant.btnCancel}
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={!firstName.trim() || !lastName.trim()}
          >
            {editParticipant ? t.dialog.addParticipant.btnSave : t.dialog.addParticipant.btnAdd}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
