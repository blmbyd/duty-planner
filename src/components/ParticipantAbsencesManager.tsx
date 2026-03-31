import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Trash, Plus, CalendarX } from '@phosphor-icons/react'
import { ParticipantAbsence } from '@/lib/types'
import { useTranslation } from '@/lib/i18n'
import { formatDate } from '@/lib/schedule/date-utils'
import { toast } from 'sonner'

interface ParticipantAbsencesManagerProps {
  participantId: string
  absences: ParticipantAbsence[]
  onAdd: (absence: ParticipantAbsence) => void
  onRemove: (id: string) => void
}

export function ParticipantAbsencesManager({
  participantId,
  absences,
  onAdd,
  onRemove,
}: ParticipantAbsencesManagerProps) {
  const { t, locale } = useTranslation()
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  const handleAdd = () => {
    if (!startDate) return
    const effectiveEnd = endDate || startDate
    if (effectiveEnd < startDate) {
      toast.error(t.participantAbsences.validationEndBeforeStart)
      return
    }
    const absence: ParticipantAbsence = {
      id: `absence-${Date.now()}`,
      participantId,
      startDate,
      endDate: effectiveEnd,
    }
    onAdd(absence)
    toast.success(t.participantAbsences.toast.added)
    setStartDate('')
    setEndDate('')
  }

  return (
    <div className="flex flex-col gap-3 pt-2">
      {absences.length > 0 && (
        <div className="flex flex-col gap-1">
          {absences
            .slice()
            .sort((a, b) => a.startDate.localeCompare(b.startDate))
            .map((abs) => (
              <div
                key={abs.id}
                className="flex items-center justify-between rounded-md border border-border bg-muted/30 px-3 py-2"
              >
                <div className="flex items-center gap-2 flex-wrap">
                  <CalendarX size={14} className="text-muted-foreground shrink-0" />
                  {abs.startDate === abs.endDate ? (
                    <Badge variant="outline" className="font-mono text-xs">
                      {formatDate(abs.startDate, locale)}
                    </Badge>
                  ) : (
                    <>
                      <Badge variant="outline" className="font-mono text-xs">
                        {formatDate(abs.startDate, locale)}
                      </Badge>
                      <span className="text-xs text-muted-foreground">—</span>
                      <Badge variant="outline" className="font-mono text-xs">
                        {formatDate(abs.endDate, locale)}
                      </Badge>
                    </>
                  )}
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7 shrink-0"
                  onClick={() => {
                    onRemove(abs.id)
                    toast.success(t.participantAbsences.toast.deleted)
                  }}
                >
                  <Trash size={14} />
                </Button>
              </div>
            ))}
        </div>
      )}

      <div className="flex flex-col gap-2">
        <div className="grid grid-cols-2 gap-2">
          <div className="flex flex-col gap-1">
            <Label className="text-xs">{t.participantAbsences.startDateLabel}</Label>
            <Input
              type="date"
              className="h-8 text-sm"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value)
                if (endDate && e.target.value > endDate) setEndDate(e.target.value)
              }}
            />
          </div>
          <div className="flex flex-col gap-1">
            <Label className="text-xs">{t.participantAbsences.endDateLabel}</Label>
            <Input
              type="date"
              className="h-8 text-sm"
              value={endDate}
              min={startDate || undefined}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={handleAdd}
          disabled={!startDate}
        >
          <Plus size={14} className="mr-1" />
          {t.participantAbsences.addBtn}
        </Button>
      </div>
    </div>
  )
}
