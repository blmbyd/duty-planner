import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Users, Plus, Key, Pencil, Trash, CalendarX } from '@phosphor-icons/react'
import { motion } from 'framer-motion'
import { Participant, ParticipantAbsence } from '@/lib/types'
import { AddParticipantDialog } from '@/components/AddParticipantDialog'
import { ParticipantAbsencesManager } from '@/components/ParticipantAbsencesManager'
import { useTranslation } from '@/lib/i18n'

interface ParticipantsPanelProps {
  participants: Participant[]
  dialogOpen: boolean
  editingParticipant: Participant | undefined
  absences: ParticipantAbsence[]
  onOpenAdd: () => void
  onOpenEdit: (participant: Participant) => void
  onCloseDialog: (open: boolean) => void
  onAddOrUpdate: (participant: Participant) => void
  onDelete: (id: string) => void
  onAddSamples: () => void
  onAddAbsence: (absence: ParticipantAbsence) => void
  onRemoveAbsence: (id: string) => void
}

export function ParticipantsPanel({
  participants,
  dialogOpen,
  editingParticipant,
  absences,
  onOpenAdd,
  onOpenEdit,
  onCloseDialog,
  onAddOrUpdate,
  onDelete,
  onAddSamples,
  onAddAbsence,
  onRemoveAbsence,
}: ParticipantsPanelProps) {
  const { t } = useTranslation()
  const [expandedAbsences, setExpandedAbsences] = useState<Set<string>>(new Set())

  const toggleAbsences = (participantId: string) => {
    setExpandedAbsences((prev) => {
      const next = new Set(prev)
      if (next.has(participantId)) {
        next.delete(participantId)
      } else {
        next.add(participantId)
      }
      return next
    })
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Users className="text-primary" size={24} />
            <CardTitle>{t.participants.title}</CardTitle>
          </div>
          <CardDescription>
            {t.participants.countLabel(participants.length)}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-4">
            <Button className="flex-1" onClick={onOpenAdd}>
              <Plus className="mr-2" />
              {t.participants.addBtn}
            </Button>
            <Button
              variant="secondary"
              onClick={onAddSamples}
              disabled={participants.length >= 10}
            >
              <Users className="mr-2" />
              {t.participants.fillSamplesBtn}
            </Button>
          </div>

          {participants.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border bg-muted/20 p-8 text-center">
              <Users className="mx-auto mb-2 text-muted-foreground" size={32} />
              <p className="text-sm text-muted-foreground">
                {t.participants.empty}
              </p>
            </div>
          ) : (
            <ScrollArea className="h-[300px]">
              <div className="flex flex-col gap-2">
                {participants.map((participant, index) => {
                  const participantAbsences = absences.filter(
                    (a) => a.participantId === participant.id
                  )
                  const isExpanded = expandedAbsences.has(participant.id)
                  return (
                    <motion.div
                      key={participant.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="rounded-lg border border-border bg-card"
                    >
                      <div className="flex items-center justify-between p-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-medium">
                            {participant.firstName[0]}
                            {participant.lastName[0]}
                          </div>
                          <div>
                            <div className="font-medium text-card-foreground">
                              {participant.firstName} {participant.lastName}
                            </div>
                            <div className="flex items-center gap-1 flex-wrap">
                              {participant.hasKeys && (
                                <Badge
                                  variant="default"
                                  className="mt-1 bg-accent text-accent-foreground"
                                >
                                  <Key size={12} className="mr-1" />
                                  {t.participants.keys}
                                </Badge>
                              )}
                              {participantAbsences.length > 0 && (
                                <Badge
                                  variant="outline"
                                  className="mt-1 text-muted-foreground"
                                >
                                  <CalendarX size={12} className="mr-1" />
                                  {participantAbsences.length}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            title={t.participantAbsences.title}
                            onClick={() => toggleAbsences(participant.id)}
                          >
                            <CalendarX size={16} />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => onOpenEdit(participant)}
                          >
                            <Pencil size={16} />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => onDelete(participant.id)}
                          >
                            <Trash size={16} />
                          </Button>
                        </div>
                      </div>
                      {isExpanded && (
                        <div className="border-t border-border px-3 pb-3">
                          <p className="text-xs font-medium text-muted-foreground pt-2 mb-1">
                            {t.participantAbsences.title}
                            {participantAbsences.length === 0 && (
                              <span className="font-normal ml-1">— {t.participantAbsences.none}</span>
                            )}
                          </p>
                          <ParticipantAbsencesManager
                            participantId={participant.id}
                            absences={participantAbsences}
                            onAdd={onAddAbsence}
                            onRemove={onRemoveAbsence}
                          />
                        </div>
                      )}
                    </motion.div>
                  )
                })}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      <AddParticipantDialog
        open={dialogOpen}
        onOpenChange={onCloseDialog}
        onAdd={onAddOrUpdate}
        editParticipant={editingParticipant}
      />
    </>
  )
}
