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

interface AddHistoricalShiftDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAdd: (shift: Shift) => void
  participants: Participant[]
}

export function AddHistoricalShiftDialog({ 
  open, 
  onOpenChange, 
  onAdd,
  participants 
}: AddHistoricalShiftDialogProps) {
  const [date, setDate] = useState(formatLocalDate(new Date()))
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([])

  useEffect(() => {
    if (open) {
      setDate(formatLocalDate(new Date()))
      setSelectedParticipants([])
    }
  }, [open])

  const handleToggleParticipant = (participantId: string) => {
    setSelectedParticipants(current => 
      current.includes(participantId)
        ? current.filter(id => id !== participantId)
        : [...current, participantId]
    )
  }

  const handleSubmit = () => {
    if (!date || selectedParticipants.length === 0) return

    onAdd({
      id: `historical-shift-${Date.now()}`,
      date,
      participants: selectedParticipants,
    })

    setDate(formatLocalDate(new Date()))
    setSelectedParticipants([])
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Dodaj przeszły dyżur</DialogTitle>
          <DialogDescription>
            Wprowadź informacje o dyżurze, który już się odbył. Te dane będą uwzględnione w statystykach i przy generowaniu nowych harmonogramów.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="shiftDate">Data dyżuru</Label>
            <Input
              id="shiftDate"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              max={formatLocalDate(new Date())}
            />
          </div>
          
          <div className="flex flex-col gap-2">
            <Label>Uczestnicy dyżuru ({selectedParticipants.length} wybrano)</Label>
            {participants.length === 0 ? (
              <div className="rounded-lg border border-dashed border-border bg-muted/20 p-4 text-center">
                <p className="text-sm text-muted-foreground">
                  Brak uczestników w systemie. Dodaj uczestników aby móc przypisać ich do przeszłych dyżurów.
                </p>
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
                          <div className={`flex h-10 w-10 items-center justify-center rounded-full font-medium text-sm ${
                            isSelected 
                              ? 'bg-primary text-primary-foreground' 
                              : 'bg-primary/10 text-primary'
                          }`}>
                            {participant.firstName[0]}{participant.lastName[0]}
                          </div>
                          <div className="text-left">
                            <div className="font-medium text-card-foreground">
                              {participant.firstName} {participant.lastName}
                            </div>
                            {participant.hasKeys && (
                              <Badge variant="default" className="mt-1 bg-accent text-accent-foreground text-xs">
                                <Key size={10} className="mr-1" />
                                Klucze
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
            Anuluj
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={!date || selectedParticipants.length === 0}
          >
            Dodaj dyżur
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
