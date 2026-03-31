import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
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
  PencilSimple,
} from '@phosphor-icons/react'
import { Participant, Shift, ShiftSettings, FillMode, OffDay } from '@/lib/types'
import { formatDate, isPastDate } from '@/lib/schedule/date-utils'
import { AddHistoricalShiftDialog } from '@/components/AddHistoricalShiftDialog'
import { AddShiftDialog } from '@/components/AddShiftDialog'
import { useTranslation } from '@/lib/i18n'

interface SchedulePanelProps {
  participants: Participant[]
  schedule: Shift[]
  historicalShifts: Shift[]
  manualShifts: Shift[]
  offDays: OffDay[]
  settings: ShiftSettings
  isGenerating: boolean
  historicalDialogOpen: boolean
  manualDialogOpen: boolean
  onGenerate: (fillMode: FillMode) => void
  onDeleteShift: (id: string, isHistorical: boolean, isManual: boolean) => void
  onDeleteOffDay: (id: string) => void
  onUpdateShift: (id: string, participants: string[], isHistorical: boolean, isManual: boolean, specialDayId?: string | null) => void
  onAddHistorical: (shift: Shift) => void
  onAddManual: (shift: Shift) => 'ok' | 'conflict'
  onHistoricalDialogChange: (open: boolean) => void
  onManualDialogChange: (open: boolean) => void
}

export function SchedulePanel({
  participants,
  schedule,
  historicalShifts,
  manualShifts,
  offDays,
  settings,
  isGenerating,
  historicalDialogOpen,
  manualDialogOpen,
  onGenerate,
  onDeleteShift,
  onDeleteOffDay,
  onUpdateShift,
  onAddHistorical,
  onAddManual,
  onHistoricalDialogChange,
  onManualDialogChange,
}: SchedulePanelProps) {
  const { t, locale } = useTranslation()
  const [fillMode, setFillMode] = useState<FillMode>('ignore-existing-positions')
  const [editingShift, setEditingShift] = useState<Shift | undefined>()
  const [editShiftDialogOpen, setEditShiftDialogOpen] = useState(false)
  const [editHistoricalDialogOpen, setEditHistoricalDialogOpen] = useState(false)

  const handleOpenEdit = (shift: Shift) => {
    const status = getRowStatus(shift)
    setEditingShift(shift)
    if (status === 'historical') {
      setEditHistoricalDialogOpen(true)
    } else {
      setEditShiftDialogOpen(true)
    }
  }

  const handleEditSave = (updatedShift: Shift) => {
    if (!editingShift) return
    const status = getRowStatus(editingShift)
    onUpdateShift(
      editingShift.id,
      updatedShift.participants,
      status === 'historical',
      status === 'manual',
      updatedShift.specialDayId !== undefined ? updatedShift.specialDayId : null
    )
    setEditingShift(undefined)
  }

  type DisplayItem =
    | { kind: 'shift'; data: Shift }
    | { kind: 'offDay'; data: OffDay }

  const allItems: DisplayItem[] = [
    ...historicalShifts.map((s) => ({ kind: 'shift' as const, data: s })),
    ...manualShifts.map((s) => ({ kind: 'shift' as const, data: s })),
    ...schedule.map((s) => ({ kind: 'shift' as const, data: s })),
    ...offDays.map((d) => ({ kind: 'offDay' as const, data: d })),
  ].sort((a, b) => new Date(a.data.date).getTime() - new Date(b.data.date).getTime())

  const getParticipantName = (id: string) => {
    const p = participants.find((p) => p.id === id)
    return p ? `${p.firstName} ${p.lastName}` : t.schedule.unknown
  }

  const getRowStatus = (shift: Shift): 'historical' | 'manual' | 'planned' => {
    if (shift.isHistorical || (isPastDate(shift.date) && !manualShifts.some((m) => m.id === shift.id)))
      return 'historical'
    if (manualShifts.some((m) => m.id === shift.id)) return 'manual'
    return 'planned'
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CalendarDots className="text-primary" size={24} />
              <CardTitle>{t.schedule.title}</CardTitle>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => onManualDialogChange(true)}
                disabled={participants.length === 0}
              >
                <PencilSimple size={16} className="mr-2" />
                {t.schedule.addManualBtn}
              </Button>
              <Button
                onClick={() => onGenerate(fillMode)}
                disabled={
                  participants.length < settings.peoplePerShift || isGenerating
                }
              >
                <ArrowsClockwise
                  size={16}
                  className={`mr-2 ${isGenerating ? 'animate-spin' : ''}`}
                />
                {schedule.length > 0 ? t.schedule.refillBtn : t.schedule.generateBtn}
              </Button>
            </div>
          </div>
          <div className="flex items-center gap-2 pt-1">
              <Switch
                id="fill-mode"
                checked={fillMode === 'fill-missing-people'}
                onCheckedChange={(checked) =>
                  setFillMode(checked ? 'fill-missing-people' : 'ignore-existing-positions')
                }
              />
              <Label htmlFor="fill-mode" className="cursor-pointer text-sm font-normal">
                {t.schedule.fillMode.label}
              </Label>
            </div>
          {allItems.length > 0 && (
            <CardDescription>
              {historicalShifts.length > 0 && t.schedule.historical(historicalShifts.length)}
              {historicalShifts.length > 0 && (manualShifts.length > 0 || schedule.length > 0) && ' \u2022 '}
              {manualShifts.length > 0 && t.schedule.manual(manualShifts.length)}
              {manualShifts.length > 0 && schedule.length > 0 && ' \u2022 '}
              {schedule.length > 0 && t.schedule.planned(schedule.length)}
              {schedule.length > 0 && ` \u2022 ${t.schedule.frequency[settings.frequency]}`}
            </CardDescription>
          )}
        </CardHeader>
        <CardContent>
          {allItems.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border bg-muted/20 p-12 text-center">
              <CalendarDots className="mx-auto mb-4 text-muted-foreground" size={48} />
              <h3 className="mb-2 text-lg font-semibold text-foreground">{t.schedule.empty.title}</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {t.schedule.empty.desc}
              </p>
              <Button
                onClick={() => onGenerate(fillMode)}
                disabled={participants.length < settings.peoplePerShift}
              >
                <ArrowsClockwise size={16} className="mr-2" />
                {t.schedule.generateBtn}
              </Button>
            </div>
          ) : (
            <ScrollArea className="h-[600px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">{t.schedule.column.no}</TableHead>
                    <TableHead>{t.schedule.column.date}</TableHead>
                    <TableHead>{t.schedule.column.participants}</TableHead>
                    <TableHead className="w-[120px]">{t.schedule.column.status}</TableHead>
                    <TableHead className="w-[80px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allItems.map((item, index) => {
                    if (item.kind === 'offDay') {
                      const od = item.data
                      return (
                        <TableRow key={od.id}>
                          <TableCell className="font-mono font-medium">
                            {String(index + 1).padStart(2, '0')}
                          </TableCell>
                          <TableCell className="font-mono">
                            {formatDate(od.date, locale)}
                          </TableCell>
                          <TableCell>
                            <span className="text-sm text-muted-foreground">&mdash;</span>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-orange-600 border-orange-300 bg-orange-50">
                              {t.schedule.status.offDay}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => onDeleteOffDay(od.id)}
                              >
                                <Trash size={16} />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    }

                    const shift = item.data
                    const rowStatus = getRowStatus(shift)
                    const isDimmed = rowStatus === 'historical'
                    return (
                      <TableRow
                        key={shift.id}
                        className={isDimmed ? 'opacity-60' : ''}
                      >
                        <TableCell className="font-mono font-medium">
                          {String(index + 1).padStart(2, '0')}
                        </TableCell>
                        <TableCell className="font-mono">
                          <div className="flex flex-col items-start gap-1">
                            {formatDate(shift.date, locale)}
                            {shift.specialDayId && (
                              <Badge
                                variant="outline"
                                className="bg-yellow-50 text-yellow-700 border-yellow-300"
                              >
                                <Star size={12} weight="fill" className="mr-1" />
                                {settings.specialDays.find(
                                  (sd) => sd.id === shift.specialDayId
                                )?.name || t.schedule.specialDay}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
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
                          {rowStatus === 'historical' && (
                            <Badge variant="outline" className="text-muted-foreground">
                              {t.schedule.status.done}
                            </Badge>
                          )}
                          {rowStatus === 'manual' && (
                            <Badge variant="outline" className="text-blue-600 border-blue-300 bg-blue-50">
                              {t.schedule.status.manual}
                            </Badge>
                          )}
                          {rowStatus === 'planned' && (
                            <Badge variant="default">
                              {t.schedule.status.planned}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => handleOpenEdit(shift)}
                            >
                              <PencilSimple size={16} />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() =>
                                onDeleteShift(
                                  shift.id,
                                  rowStatus === 'historical',
                                  rowStatus === 'manual'
                                )
                              }
                            >
                              <Trash size={16} />
                            </Button>
                          </div>
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
        specialDays={settings.specialDays}
      />

      <AddHistoricalShiftDialog
        open={editHistoricalDialogOpen}
        onOpenChange={(open) => {
          setEditHistoricalDialogOpen(open)
          if (!open) setEditingShift(undefined)
        }}
        onAdd={handleEditSave}
        participants={participants}
        specialDays={settings.specialDays}
        editShift={editingShift}
      />

      <AddShiftDialog
        open={manualDialogOpen}
        onOpenChange={onManualDialogChange}
        onAdd={onAddManual}
        participants={participants}
        specialDays={settings.specialDays}
      />

      <AddShiftDialog
        open={editShiftDialogOpen}
        onOpenChange={(open) => {
          setEditShiftDialogOpen(open)
          if (!open) setEditingShift(undefined)
        }}
        onAdd={(shift) => {
          handleEditSave(shift)
          return 'ok'
        }}
        participants={participants}
        specialDays={settings.specialDays}
        editShift={editingShift}
      />
    </>
  )
}

