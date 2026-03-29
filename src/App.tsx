import { toast } from 'sonner'
import { Toaster } from '@/components/ui/sonner'
import { useParticipants } from '@/hooks/use-participants'
import { useSettings } from '@/hooks/use-settings'
import { useSchedule } from '@/hooks/use-schedule'
import { useHistoricalShifts } from '@/hooks/use-historical-shifts'
import { ParticipantsPanel } from '@/components/ParticipantsPanel'
import { SettingsPanel } from '@/components/SettingsPanel'
import { SchedulePanel } from '@/components/SchedulePanel'
import { StatsCard } from '@/components/StatsCard'
import { SpecialDaysManager } from '@/components/SpecialDaysManager'
import { Participant, Shift } from '@/lib/types'
import { exportBackup, parseBackup } from '@/lib/backup'

function App() {
  const participantsState = useParticipants()
  const { settings, update: updateSettings, updateSpecialDays, replace: replaceSettings } = useSettings()
  const scheduleState = useSchedule()
  const historyState = useHistoricalShifts()

  const handleGenerate = async () => {
    const { participants } = participantsState
    if (participants.length < settings.peoplePerShift) {
      toast.error('Za malo uczestnikow dla wymaganej liczby osob na dyzurze')
      return
    }
    if (!participants.some((p) => p.hasKeys)) {
      toast.error('Dodaj przynajmniej jedna osobe z kluczami')
      return
    }
    try {
      const { added, total } = await scheduleState.generate(
        participants,
        settings,
        historyState.historicalShifts
      )
      if (added > 0) {
        toast.success(`Dodano ${added} nowych dyzurow (lacznie: ${total})`)
      } else {
        toast.info('Harmonogram jest juz kompletny')
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Blad generowania harmonogramu')
    }
  }

  const handleAddOrUpdateParticipant = (participant: Participant) => {
    const isEdit = !!participantsState.editingParticipant
    participantsState.addOrUpdate(participant)
    toast.success(isEdit ? 'Uczestnik zaktualizowany' : 'Uczestnik dodany')
  }

  const handleDeleteParticipant = (id: string) => {
    participantsState.remove(id)
    toast.success('Uczestnik usuniety')
  }

  const handleAddSamples = async () => {
    const result = participantsState.addSampleParticipants()
    toast.success('Dodano przykladowych uczestnikow')
    if (result.length >= settings.peoplePerShift) {
      try {
        await scheduleState.generate(result, settings, historyState.historicalShifts)
        toast.success('Automatycznie wygenerowano harmonogram')
      } catch {
        // przykladowi uczestnicy zostali dodani, generowanie jest opcjonalne
      }
    }
  }

  const handleAddHistorical = (shift: Shift) => {
    historyState.add(shift)
    toast.success('Przeszly dyzur dodany')
  }

  const handleDeleteShift = (id: string, isHistorical: boolean) => {
    if (isHistorical) {
      historyState.remove(id)
    } else {
      scheduleState.removeShift(id)
    }
    toast.success('Dyzur usuniety')
  }

  const handleExport = () => {
    try {
      exportBackup({
        participants: participantsState.participants,
        settings,
        schedule: scheduleState.schedule,
        historicalShifts: historyState.historicalShifts,
      })
      toast.success('Dane wyeksportowane do pliku')
    } catch {
      toast.error('Blad podczas eksportu danych')
    }
  }

  const handleImport = (file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const raw = e.target?.result
        if (typeof raw !== 'string') throw new Error('Nie mozna odczytac pliku.')
        const appData = parseBackup(raw)
        // Restore in order: participants first (IDs used by shifts), then the rest
        participantsState.replace(appData.participants)
        replaceSettings(appData.settings)
        scheduleState.replace(appData.schedule)
        historyState.replace(appData.historicalShifts)
        toast.success('Dane przywrocone z pliku')
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Blad podczas importu danych')
      }
    }
    reader.onerror = () => {
      toast.error('Blad odczytu pliku')
    }
    reader.readAsText(file)
  }

  return (
    <>
      <Toaster />
      <div className="min-h-screen bg-background p-4 md:p-8">
        <div className="mx-auto max-w-7xl">
          <header className="mb-8">
            <h1 className="text-4xl font-bold tracking-tight text-foreground">
              Planer Dyzurow
            </h1>
            <p className="mt-2 text-muted-foreground">
              Inteligentne planowanie i optymalizacja dyzurow w grupie
            </p>
          </header>

          <div className="flex flex-col gap-6 lg:flex-row">
            <div className="flex flex-col gap-6 lg:w-1/3">
              <ParticipantsPanel
                participants={participantsState.participants}
                dialogOpen={participantsState.dialogOpen}
                editingParticipant={participantsState.editingParticipant}
                onOpenAdd={participantsState.openAdd}
                onOpenEdit={participantsState.openEdit}
                onCloseDialog={(open) => {
                  participantsState.setDialogOpen(open)
                  if (!open) participantsState.closeDialog()
                }}
                onAddOrUpdate={handleAddOrUpdateParticipant}
                onDelete={handleDeleteParticipant}
                onAddSamples={handleAddSamples}
              />

              <SettingsPanel
                settings={settings}
                maxPeople={participantsState.participants.length}
                onUpdate={updateSettings}
                onExport={handleExport}
                onImport={handleImport}
              />

              <SpecialDaysManager
                specialDays={settings.specialDays || []}
                onUpdate={updateSpecialDays}
                maxPeoplePerShift={participantsState.participants.length || 10}
              />
            </div>

            <div className="flex-1 flex flex-col gap-6">
              <StatsCard
                participants={participantsState.participants}
                schedule={scheduleState.schedule}
                historicalShifts={historyState.historicalShifts}
              />

              <SchedulePanel
                participants={participantsState.participants}
                schedule={scheduleState.schedule}
                historicalShifts={historyState.historicalShifts}
                settings={settings}
                isGenerating={scheduleState.isGenerating}
                historicalDialogOpen={historyState.dialogOpen}
                onGenerate={handleGenerate}
                onDeleteShift={handleDeleteShift}
                onAddHistorical={handleAddHistorical}
                onHistoricalDialogChange={historyState.setDialogOpen}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default App
