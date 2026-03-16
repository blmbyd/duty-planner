import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { toast } from 'sonner'
import { 
  Users, 
  CalendarDots, 
  Gear, 
  Plus, 
  Key, 
  ArrowsClockwise, 
  Download, 
  Upload,
  Trash,
  Pencil,
  ClockCounterClockwise 
} from '@phosphor-icons/react'
import { AddParticipantDialog } from '@/components/AddParticipantDialog'
import { AddHistoricalShiftDialog } from '@/components/AddHistoricalShiftDialog'
import { StatsCard } from '@/components/StatsCard'
import { Participant, ShiftSettings, Shift, DEFAULT_SETTINGS } from '@/lib/types'
import { generateSchedule, exportToJSON, importFromJSON } from '@/lib/schedule-generator'
import { motion } from 'framer-motion'

function App() {
  const [participants, setParticipants] = useKV<Participant[]>('participants', [])
  const [settings, setSettings] = useKV<ShiftSettings>('settings', DEFAULT_SETTINGS)
  const [schedule, setSchedule] = useKV<Shift[]>('schedule', [])
  const [historicalShifts, setHistoricalShifts] = useKV<Shift[]>('historicalShifts', [])
  
  const [dialogOpen, setDialogOpen] = useState(false)
  const [historicalDialogOpen, setHistoricalDialogOpen] = useState(false)
  const [editingParticipant, setEditingParticipant] = useState<Participant | undefined>()
  const [isGenerating, setIsGenerating] = useState(false)

  const participantsList = participants || []
  const currentSettings = settings || DEFAULT_SETTINGS
  const currentSchedule = schedule || []
  const currentHistoricalShifts = historicalShifts || []

  const handleAddParticipant = (participant: Participant) => {
    setParticipants((current) => {
      const list = current || []
      const existing = list.findIndex(p => p.id === participant.id)
      if (existing !== -1) {
        const updated = [...list]
        updated[existing] = participant
        return updated
      }
      return [...list, participant]
    })
    setEditingParticipant(undefined)
    toast.success(editingParticipant ? 'Uczestnik zaktualizowany' : 'Uczestnik dodany')
  }

  const handleEditParticipant = (participant: Participant) => {
    setEditingParticipant(participant)
    setDialogOpen(true)
  }

  const handleDeleteParticipant = (id: string) => {
    setParticipants((current) => (current || []).filter(p => p.id !== id))
    toast.success('Uczestnik usunięty')
  }

  const handleAddHistoricalShift = (shift: Shift) => {
    setHistoricalShifts((current) => [...(current || []), { ...shift, isHistorical: true }])
    toast.success('Przeszły dyżur dodany')
  }

  const handleDeleteHistoricalShift = (id: string) => {
    setHistoricalShifts((current) => (current || []).filter(s => s.id !== id))
    toast.success('Przeszły dyżur usunięty')
  }

  const handleGenerateSchedule = async () => {
    if (participantsList.length < currentSettings.peoplePerShift) {
      toast.error('Za mało uczestników dla wymaganej liczby osób na dyżurze')
      return
    }

    const specialPeople = participantsList.filter(p => p.hasKeys)
    if (specialPeople.length === 0) {
      toast.error('Dodaj przynajmniej jedną osobę z kluczami')
      return
    }

    setIsGenerating(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      const newSchedule = generateSchedule(participantsList, currentSettings, currentHistoricalShifts)
      setSchedule(newSchedule)
      toast.success(`Wygenerowano harmonogram - ${newSchedule.length} dyżurów`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Błąd generowania harmonogramu')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleExport = () => {
    exportToJSON({ 
      participants: participantsList, 
      settings: currentSettings, 
      schedule: currentSchedule,
      historicalShifts: currentHistoricalShifts 
    })
    toast.success('Harmonogram wyeksportowany')
  }

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      const data = await importFromJSON(file)
      setParticipants(data.participants || [])
      setSettings(data.settings || DEFAULT_SETTINGS)
      setSchedule(data.schedule || [])
      setHistoricalShifts(data.historicalShifts || [])
      toast.success('Dane zaimportowane')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Błąd importu')
    }
    e.target.value = ''
  }

  const handleAddSampleParticipants = async () => {
    const sampleParticipants: Participant[] = [
      { id: 'p1', firstName: 'Anna', lastName: 'Kowalska', hasKeys: true },
      { id: 'p2', firstName: 'Jan', lastName: 'Nowak', hasKeys: false },
      { id: 'p3', firstName: 'Maria', lastName: 'Wiśniewska', hasKeys: true },
      { id: 'p4', firstName: 'Piotr', lastName: 'Wójcik', hasKeys: false },
      { id: 'p5', firstName: 'Katarzyna', lastName: 'Kamińska', hasKeys: false },
      { id: 'p6', firstName: 'Tomasz', lastName: 'Lewandowski', hasKeys: false },
      { id: 'p7', firstName: 'Agnieszka', lastName: 'Zielińska', hasKeys: false },
      { id: 'p8', firstName: 'Michał', lastName: 'Szymański', hasKeys: false },
      { id: 'p9', firstName: 'Magdalena', lastName: 'Dąbrowska', hasKeys: true },
      { id: 'p10', firstName: 'Krzysztof', lastName: 'Mazur', hasKeys: false },
    ]

    let updatedParticipants: Participant[] = []
    
    setParticipants((current) => {
      const existing = current || []
      const newParticipants = sampleParticipants.filter(
        sample => !existing.some(p => p.id === sample.id)
      )
      updatedParticipants = [...existing, ...newParticipants]
      return updatedParticipants
    })

    toast.success(`Dodano ${sampleParticipants.length} przykładowych uczestników`)

    setTimeout(() => {
      if (updatedParticipants.length >= currentSettings.peoplePerShift) {
        setIsGenerating(true)
        setTimeout(async () => {
          try {
            const newSchedule = generateSchedule(updatedParticipants, currentSettings, currentHistoricalShifts)
            setSchedule(newSchedule)
            toast.success(`Automatycznie wygenerowano harmonogram - ${newSchedule.length} dyżurów`)
          } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Błąd generowania harmonogramu')
          } finally {
            setIsGenerating(false)
          }
        }, 500)
      }
    }, 100)
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('pl-PL', { 
      weekday: 'short', 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    })
  }

  const getParticipantName = (id: string) => {
    const participant = participantsList.find(p => p.id === id)
    return participant ? `${participant.firstName} ${participant.lastName}` : 'Nieznany'
  }

  const frequencyLabels = {
    'daily': 'Codziennie',
    'every-2-days': 'Co 2 dni',
    'every-3-days': 'Co 3 dni',
    'weekly': 'Raz w tygodniu'
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight text-foreground">
            Planer Dyżurów
          </h1>
          <p className="mt-2 text-muted-foreground">
            Inteligentne planowanie i optymalizacja dyżurów w grupie
          </p>
        </header>

        <div className="flex flex-col gap-6 lg:flex-row">
          <div className="flex flex-col gap-6 lg:w-1/3">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Users className="text-primary" size={24} />
                  <CardTitle>Uczestnicy</CardTitle>
                </div>
                <CardDescription>
                  {participantsList.length} {participantsList.length === 1 ? 'osoba' : 'osób'} w systemie
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2 mb-4">
                  <Button 
                    className="flex-1" 
                    onClick={() => {
                      setEditingParticipant(undefined)
                      setDialogOpen(true)
                    }}
                  >
                    <Plus className="mr-2" />
                    Dodaj uczestnika
                  </Button>
                  <Button 
                    variant="secondary"
                    onClick={handleAddSampleParticipants}
                    disabled={participantsList.length >= 10}
                  >
                    <Users className="mr-2" />
                    Wypełnij przykładami
                  </Button>
                </div>

                {participantsList.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-border bg-muted/20 p-8 text-center">
                    <Users className="mx-auto mb-2 text-muted-foreground" size={32} />
                    <p className="text-sm text-muted-foreground">
                      Brak uczestników. Dodaj pierwszego uczestnika aby rozpocząć.
                    </p>
                  </div>
                ) : (
                  <ScrollArea className="h-[300px]">
                    <div className="flex flex-col gap-2">
                      {participantsList.map((participant, index) => (
                        <motion.div
                          key={participant.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="flex items-center justify-between rounded-lg border border-border bg-card p-3"
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-medium">
                              {participant.firstName[0]}{participant.lastName[0]}
                            </div>
                            <div>
                              <div className="font-medium text-card-foreground">
                                {participant.firstName} {participant.lastName}
                              </div>
                              {participant.hasKeys && (
                                <Badge variant="default" className="mt-1 bg-accent text-accent-foreground">
                                  <Key size={12} className="mr-1" />
                                  Klucze
                                </Badge>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <Button 
                              size="icon" 
                              variant="ghost" 
                              onClick={() => handleEditParticipant(participant)}
                            >
                              <Pencil size={16} />
                            </Button>
                            <Button 
                              size="icon" 
                              variant="ghost" 
                              onClick={() => handleDeleteParticipant(participant.id)}
                            >
                              <Trash size={16} />
                            </Button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Gear className="text-primary" size={24} />
                  <CardTitle>Ustawienia</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="frequency">Częstotliwość dyżurów</Label>
                  <Select
                    value={currentSettings.frequency}
                    onValueChange={(value) => 
                      setSettings((current) => ({ ...(current || DEFAULT_SETTINGS), frequency: value as ShiftSettings['frequency'] }))
                    }
                  >
                    <SelectTrigger id="frequency">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Codziennie</SelectItem>
                      <SelectItem value="every-2-days">Co 2 dni</SelectItem>
                      <SelectItem value="every-3-days">Co 3 dni</SelectItem>
                      <SelectItem value="weekly">Raz w tygodniu</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="peoplePerShift">Liczba osób na dyżurze</Label>
                  <Input
                    id="peoplePerShift"
                    type="number"
                    min="1"
                    max={participantsList.length || 10}
                    value={currentSettings.peoplePerShift}
                    onChange={(e) => 
                      setSettings((current) => ({ 
                        ...(current || DEFAULT_SETTINGS), 
                        peoplePerShift: Math.max(1, parseInt(e.target.value) || 1) 
                      }))
                    }
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="startDate">Data początkowa</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={currentSettings.startDate}
                    onChange={(e) => 
                      setSettings((current) => ({ ...(current || DEFAULT_SETTINGS), startDate: e.target.value }))
                    }
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="endDate">Data końcowa</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={currentSettings.endDate}
                    onChange={(e) => 
                      setSettings((current) => ({ ...(current || DEFAULT_SETTINGS), endDate: e.target.value }))
                    }
                  />
                </div>

                <Separator />

                <div className="flex gap-2">
                  <Button 
                    className="flex-1" 
                    variant="outline"
                    onClick={handleExport}
                    disabled={participantsList.length === 0}
                  >
                    <Download size={16} className="mr-2" />
                    Eksport
                  </Button>
                  <Button 
                    className="flex-1" 
                    variant="outline"
                    onClick={() => document.getElementById('import-file')?.click()}
                  >
                    <Upload size={16} className="mr-2" />
                    Import
                  </Button>
                  <input
                    id="import-file"
                    type="file"
                    accept=".json"
                    className="hidden"
                    onChange={handleImport}
                  />
                </div>
              </CardContent>
            </Card>

            <StatsCard 
              participants={participantsList}
              schedule={currentSchedule}
              historicalShifts={currentHistoricalShifts}
            />

            {currentHistoricalShifts.length > 0 && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ClockCounterClockwise className="text-primary" size={24} />
                      <CardTitle>Przeszłe Dyżury</CardTitle>
                    </div>
                    <Button 
                      size="sm"
                      onClick={() => setHistoricalDialogOpen(true)}
                    >
                      <Plus size={16} className="mr-2" />
                      Dodaj
                    </Button>
                  </div>
                  <CardDescription>
                    {currentHistoricalShifts.length} {currentHistoricalShifts.length === 1 ? 'dyżur' : 'dyżurów'} w historii
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[250px]">
                    <div className="flex flex-col gap-2">
                      {currentHistoricalShifts.map((shift) => (
                        <div
                          key={shift.id}
                          className="flex items-center justify-between rounded-lg border border-border bg-card p-3"
                        >
                          <div className="flex flex-col gap-1">
                            <div className="font-mono text-sm font-medium">
                              {formatDate(shift.date)}
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {shift.participants.map((participantId) => {
                                const participant = participantsList.find(p => p.id === participantId)
                                return participant ? (
                                  <Badge key={participantId} variant="outline" className="text-xs">
                                    {participant.firstName[0]}. {participant.lastName}
                                  </Badge>
                                ) : null
                              })}
                            </div>
                          </div>
                          <Button 
                            size="icon" 
                            variant="ghost"
                            onClick={() => handleDeleteHistoricalShift(shift.id)}
                          >
                            <Trash size={16} />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            )}

            {currentHistoricalShifts.length === 0 && (
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <ClockCounterClockwise className="text-primary" size={24} />
                    <CardTitle>Przeszłe Dyżury</CardTitle>
                  </div>
                  <CardDescription>
                    Dodaj dyżury, które już się odbyły
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-lg border border-dashed border-border bg-muted/20 p-8 text-center">
                    <ClockCounterClockwise className="mx-auto mb-2 text-muted-foreground" size={32} />
                    <p className="text-sm text-muted-foreground mb-4">
                      Brak przeszłych dyżurów. Dodaj dyżury, które już się odbyły, aby były uwzględnione w statystykach.
                    </p>
                    <Button 
                      onClick={() => setHistoricalDialogOpen(true)}
                      disabled={participantsList.length === 0}
                    >
                      <Plus size={16} className="mr-2" />
                      Dodaj przeszły dyżur
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="flex-1">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CalendarDots className="text-primary" size={24} />
                    <CardTitle>Harmonogram Dyżurów</CardTitle>
                  </div>
                  <Button 
                    onClick={handleGenerateSchedule}
                    disabled={participantsList.length < currentSettings.peoplePerShift || isGenerating}
                  >
                    <ArrowsClockwise 
                      size={16} 
                      className={`mr-2 ${isGenerating ? 'animate-spin' : ''}`} 
                    />
                    Generuj harmonogram
                  </Button>
                </div>
                {currentSchedule.length > 0 && (
                  <CardDescription>
                    Wygenerowano {currentSchedule.length} {currentSchedule.length === 1 ? 'dyżur' : 'dyżurów'} • {frequencyLabels[currentSettings.frequency]}
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent>
                {currentSchedule.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-border bg-muted/20 p-12 text-center">
                    <CalendarDots className="mx-auto mb-4 text-muted-foreground" size={48} />
                    <h3 className="mb-2 text-lg font-semibold text-foreground">
                      Brak harmonogramu
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Skonfiguruj uczestników i ustawienia, a następnie wygeneruj harmonogram dyżurów.
                    </p>
                    <Button 
                      onClick={handleGenerateSchedule}
                      disabled={participantsList.length < currentSettings.peoplePerShift}
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
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {currentSchedule.map((shift, index) => (
                          <TableRow key={shift.id}>
                            <TableCell className="font-mono font-medium">
                              {String(index + 1).padStart(2, '0')}
                            </TableCell>
                            <TableCell className="font-mono">
                              {formatDate(shift.date)}
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-wrap gap-2">
                                {shift.participants.map((participantId) => {
                                  const participant = participantsList.find(p => p.id === participantId)
                                  return (
                                    <Badge 
                                      key={participantId}
                                      variant={participant?.hasKeys ? "default" : "secondary"}
                                      className={participant?.hasKeys ? "bg-accent text-accent-foreground" : ""}
                                    >
                                      {participant?.hasKeys && <Key size={12} className="mr-1" />}
                                      {getParticipantName(participantId)}
                                    </Badge>
                                  )
                                })}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <AddParticipantDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open)
          if (!open) setEditingParticipant(undefined)
        }}
        onAdd={handleAddParticipant}
        editParticipant={editingParticipant}
      />

      <AddHistoricalShiftDialog
        open={historicalDialogOpen}
        onOpenChange={setHistoricalDialogOpen}
        onAdd={handleAddHistoricalShift}
        participants={participantsList}
      />
    </div>
  )
}

export default App
