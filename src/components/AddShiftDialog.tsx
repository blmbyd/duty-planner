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
import { Participant, Shift } from '@/lib/types'
import { formatLocalDate } from '@/lib/schedule/date-utils'
import { Badge } from '@/components/ui/badge'
import { Key, X } from '@phosphor-icons/react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useTranslation } from '@/lib/i18n'

interface AddShiftDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAdd: (shift: Shift) => 'ok' | 'conflict'
  participants: Participant[]
  editShift?: Shift
}

export function AddShiftDialog({
  open,
  onOpenChange,
  onAdd,
  participants,
  editShift,
}: AddShiftDialogProps) {
  const { t } = useTranslation()
  const [date, setDate] = useState(formatLocalDate(new Date()))
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([])

  useEffect(() => {
    if (open) {
      if (editShift) {
        setDate(editShift.date)
        setSelectedParticipants(editShift.participants)
      } else {
        setDate(formatLocalDate(new Date()))
        setSelectedParticipants([])
      }
    }
  }, [open, editShift])

  const handleToggleParticipant = (participantId: string) => {
    setSelectedParticipants((current) =>
      current.includes(participantId)
        ? current.filter((id) => id !== participantId)
        : [...current, participantId]
    )
  }

  const handleSubmit = () => {
    if (!date || selectedParticipants.length === 0) return

    const result = onAdd({
      id: editShift ? editShift.id : `manual-shift-${Date.now()}`,
      date,
      participants: selectedParticipants,
    })

    if (result === 'ok') {
      setDate(formatLocalDate(new Date()))
      setSelectedParticipants([])
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{editShift ? t.dialog.addShift.editTitle : t.dialog.addShift.title}</DialogTitle>
          <DialogDescription>{t.dialog.addShift.desc}</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="shiftDate">{t.dialog.addShift.shiftDate}</Label>
            <Input
              id="shiftDate"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              disabled={!!editShift}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label>{t.dialog.addShift.participantsLabel(selectedParticipants.length)}</Label>
            {participants.length === 0 ? (
              <div className="rounded-lg border border-dashed border-border bg-muted/20 p-4 text-center">
                <p className="text-sm text-muted-foreground">{t.dialog.addShift.noParticipants}</p>
              </div>
            ) : (
              <ScrollArea className="h-[300px] rounded-lg border border-border bg-muted/10 p-3">
                <div className="flex flex-col gap-2">
                  {participants.map((participant) => {
                    const isSelected = selectedParticipants.includes(participant.id)
                    return (
                      <button
                        key={participant.id}
                        onClick={() => handleToggleParticipant(participant.id)}
                        className={`flex items-center justify-between rounded-lg border p-3 transition-all ${
                          isSelected
                            ? 'border-primary bg-primary/10'
                            : 'border-border bg-card hover:border-primary/50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`flex h-10 w-10 items-center justify-center rounded-full font-medium text-sm ${
                              isSelected
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-primary/10 text-primary'
                            }`}
                          >
                            {participant.firstName[0]}
                            {participant.lastName[0]}
                          </div>
                          <div className="text-left">
                            <div className="font-medium text-card-foreground">
                              {participant.firstName} {participant.lastName}
                            </div>
                            {participant.hasKeys && (
                              <Badge
                                variant="default"
                                className="mt-1 bg-accent text-accent-foreground text-xs"
                              >
                                <Key size={10} className="mr-1" />
                                {t.participants.keys}
                              </Badge>
                            )}
                          </div>
                        </div>
                        {isSelected && (
                          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
                            <X size={14} weight="bold" />
                          </div>
                        )}
                      </button>
                    )
                  })}
                </div>
              </ScrollArea>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t.dialog.addShift.btnCancel}
          </Button>
          <Button onClick={handleSubmit} disabled={!date || selectedParticipants.length === 0}>
            {editShift ? t.dialog.addShift.btnSave : t.dialog.addShift.btnAdd}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
