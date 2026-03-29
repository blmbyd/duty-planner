import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  CalendarDots,
  ArrowsClockwise,
  ClockCounterClockwise,
  Trash,
  Key,
  Star,
} from '@phosphor-icons/react'
import { Participant, Shift, ShiftSettings } from '@/lib/types'
import { formatDatePL, isPastDate } from '@/lib/schedule/date-utils'
import { AddHistoricalShiftDialog } from '@/components/AddHistoricalShiftDialog'

const FREQUENCY_LABELS: Record<ShiftSettings['frequency'], string> = {
  daily: 'Codziennie',
  'every-2-days': 'Co 2 dni',
  'every-3-days': 'Co 3 dni',
  weekly: 'Raz w tygodniu',
}

interface SchedulePanelProps {
  participants: Participant[]
  schedule: Shift[]
  historicalShifts: Shift[]
  settings: ShiftSettings
  isGenerating: boolean
  historicalDialogOpen: boolean
  onGenerate: () => void
  onDeleteShift: (id: string, isHistorical: boolean) => void
  onAddHistorical: (shift: Shift) => void
  onHistoricalDialogChange: (open: boolean) => void
}

export function SchedulePanel({
  participants,
  schedule,
  historicalShifts,
  settings,
  isGenerating,
  historicalDialogOpen,
  onGenerate,
  onDeleteShift,
  onAddHistorical,
  onHistoricalDialogChange,
}: SchedulePanelProps) {
  const allShifts = [...historicalShifts, ...schedule].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  )

  const getParticipantName = (id: string) => {
    const p = participants.find((p) => p.id === id)
    return p ? `${p.firstName} ${p.lastName}` : 'Nieznany'
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CalendarDots className="text-primary" size={24} />
              <CardTitle>Harmonogram Dyzurow</CardTitle>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => onHistoricalDialogChange(true)}
                disabled={participants.length === 0}
              >
                <ClockCounterClockwise size={16} className="mr-2" />
                Dodaj przeszly dyzur
              </Button>
              <Button
                onClick={onGenerate}
                disabled={
                  participants.length < settings.peoplePerShift || isGenerating
                }
              >
                <ArrowsClockwise
                  size={16}
                  className={`mr-2 ${isGenerating ? 'animate-spin' : ''}`}
                />
                {schedule.length > 0 ? 'Uzupelnij harmonogram' : 'Generuj harmonogram'}
              </Button>
            </div>
          </div>
          {allShifts.length > 0 && (
            <CardDescription>
              {historicalShifts.length > 0 && `${historicalShifts.length} przeszlych`}
              {historicalShifts.length > 0 && schedule.length > 0 && ' \u2022 '}
              {schedule.length > 0 && `${schedule.length} zaplanowanych`}
              {schedule.length > 0 && ` \u2022 ${FREQUENCY_LABELS[settings.frequency]}`}
            </CardDescription>
          )}
        </CardHeader>
        <CardContent>
          {allShifts.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border bg-muted/20 p-12 text-center">
              <CalendarDots className="mx-auto mb-4 text-muted-foreground" size={48} />
              <h3 className="mb-2 text-lg font-semibold text-foreground">Brak harmonogramu</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Skonfiguruj uczestnikow i ustawienia, a nastepnie wygeneruj harmonogram dyzurow.
              </p>
              <Button
                onClick={onGenerate}
                disabled={participants.length < settings.peoplePerShift}
              >
                <ArrowsClockwise size={16} className="mr-2" />
                Generuj harmonogram
              </Button>
            </div>
          ) : (
            <ScrollArea className="h-[600px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">#</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Uczestnicy</TableHead>
                    <TableHead className="w-[120px]">Status</TableHead>
                    <TableHead className="w-[80px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allShifts.map((shift, index) => {
                    const isHistorical = shift.isHistorical || isPastDate(shift.date)
                    return (
                      <TableRow
                        key={shift.id}
                        className={isHistorical ? 'opacity-60' : ''}
                      >
                        <TableCell className="font-mono font-medium">
                          {String(index + 1).padStart(2, '0')}
                        </TableCell>
                        <TableCell className="font-mono">
                          <div className="flex items-center gap-2">
                            {formatDatePL(shift.date)}
                            {shift.specialDayId && (
                              <Badge
                                variant="outline"
                                className="bg-yellow-50 text-yellow-700 border-yellow-300"
                              >
                                <Star size={12} weight="fill" className="mr-1" />
                                {settings.specialDays.find(
                                  (sd) => sd.id === shift.specialDayId
                                )?.name || 'Dzien specjalny'}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-2">
                            {shift.participants.map((participantId) => {
                              const participant = participants.find(
                                (p) => p.id === participantId
                              )
                              return (
                                <Badge
                                  key={participantId}
                                  variant={participant?.hasKeys ? 'default' : 'secondary'}
                                  className={
                                    participant?.hasKeys
                                      ? 'bg-accent text-accent-foreground'
                                      : ''
                                  }
                                >
                                  {participant?.hasKeys && (
                                    <Key size={12} className="mr-1" />
                                  )}
                                  {getParticipantName(participantId)}
                                </Badge>
                              )
                            })}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={isHistorical ? 'outline' : 'default'}
                            className={isHistorical ? 'text-muted-foreground' : ''}
                          >
                            {isHistorical ? 'Wykonany' : 'Zaplanowany'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() =>
                              onDeleteShift(shift.id, shift.isHistorical || false)
                            }
                          >
                            <Trash size={16} />
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      <AddHistoricalShiftDialog
        open={historicalDialogOpen}
        onOpenChange={onHistoricalDialogChange}
        onAdd={onAddHistorical}
        participants={participants}
      />
    </>
  )
}
