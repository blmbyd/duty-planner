import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Trash, Plus, Star } from '@phosphor-icons/react'
import { SpecialDay, SpecialDayWeekOccurrence, SpecialDayDayOfWeek } from '@/lib/types'
import { ScrollArea } from '@/components/ui/scroll-area'

interface SpecialDaysManagerProps {
  specialDays: SpecialDay[]
  onUpdate: (specialDays: SpecialDay[]) => void
  maxPeoplePerShift: number
}

const weekOccurrenceLabels: Record<SpecialDayWeekOccurrence, string> = {
  first: '1.',
  second: '2.',
  third: '3.',
  fourth: '4.',
  last: 'Ostatni(-a)',
}

const dayOfWeekLabels: Record<SpecialDayDayOfWeek, string> = {
  monday: 'poniedziałek',
  tuesday: 'wtorek',
  wednesday: 'środa',
  thursday: 'czwartek',
  friday: 'piątek',
}

const weekOccurrenceFieldLabel: Record<SpecialDayDayOfWeek, string> = {
  monday: 'Który poniedziałek miesiąca',
  tuesday: 'Który wtorek miesiąca',
  wednesday: 'Która środa miesiąca',
  thursday: 'Który czwartek miesiąca',
  friday: 'Który piątek miesiąca',
}

function buildFrequencyLabel(weekOccurrence: SpecialDayWeekOccurrence, dayOfWeek: SpecialDayDayOfWeek): string {
  return `${weekOccurrenceLabels[weekOccurrence]} ${dayOfWeekLabels[dayOfWeek]}`
}

export function SpecialDaysManager({ specialDays, onUpdate, maxPeoplePerShift }: SpecialDaysManagerProps) {
  const [newDayName, setNewDayName] = useState('')
  const [newDayWeekOccurrence, setNewDayWeekOccurrence] = useState<SpecialDayWeekOccurrence>('second')
  const [newDayDayOfWeek, setNewDayDayOfWeek] = useState<SpecialDayDayOfWeek>('monday')
  const [newDayPeople, setNewDayPeople] = useState(2)

  const handleAdd = () => {
    if (!newDayName.trim()) return

    const newSpecialDay: SpecialDay = {
      id: `special-day-${Date.now()}`,
      name: newDayName,
      weekOccurrence: newDayWeekOccurrence,
      dayOfWeek: newDayDayOfWeek,
      peopleCount: newDayPeople
    }

    onUpdate([...specialDays, newSpecialDay])
    setNewDayName('')
    setNewDayWeekOccurrence('second')
    setNewDayDayOfWeek('monday')
    setNewDayPeople(2)
  }

  const handleDelete = (id: string) => {
    onUpdate(specialDays.filter(sd => sd.id !== id))
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Star className="text-primary" size={24} weight="fill" />
          <CardTitle>Dni Specjalne</CardTitle>
        </div>
        <CardDescription>
          {specialDays.length === 0 ? 'Brak dni specjalnych' : `${specialDays.length} ${specialDays.length === 1 ? 'dzień' : 'dni'} specjalnych`}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {specialDays.length > 0 && (
          <ScrollArea className="h-[200px]">
            <div className="flex flex-col gap-2">
              {specialDays.map((sd) => (
                <div
                  key={sd.id}
                  className="flex items-center justify-between rounded-lg border border-border bg-card p-3"
                >
                  <div className="flex flex-col gap-1">
                    <div className="font-medium text-card-foreground">{sd.name}</div>
                    <div className="flex gap-2 text-sm text-muted-foreground">
                      <Badge variant="outline" className="text-xs">
                        {buildFrequencyLabel(sd.weekOccurrence, sd.dayOfWeek)}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {sd.peopleCount} {sd.peopleCount === 1 ? 'osoba' : 'osób'}
                      </Badge>
                    </div>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleDelete(sd.id)}
                  >
                    <Trash size={16} />
                  </Button>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}

        <div className="border-t border-border pt-4 flex flex-col gap-3">
          <div className="flex flex-col gap-2">
            <Label htmlFor="specialDayName">Nazwa dnia specjalnego</Label>
            <Input
              id="specialDayName"
              value={newDayName}
              onChange={(e) => setNewDayName(e.target.value)}
              placeholder="np. Sprzątanie, Inwentaryzacja"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-2">
              <Label htmlFor="specialDayWeekOccurrence">{weekOccurrenceFieldLabel[newDayDayOfWeek]}</Label>
              <Select
                value={newDayWeekOccurrence}
                onValueChange={(value) => setNewDayWeekOccurrence(value as SpecialDayWeekOccurrence)}
              >
                <SelectTrigger id="specialDayWeekOccurrence">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="first">1.</SelectItem>
                  <SelectItem value="second">2.</SelectItem>
                  <SelectItem value="third">3.</SelectItem>
                  <SelectItem value="fourth">4.</SelectItem>
                  <SelectItem value="last">Ostatni(-a)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="specialDayDayOfWeek">Dzień tygodnia</Label>
              <Select
                value={newDayDayOfWeek}
                onValueChange={(value) => setNewDayDayOfWeek(value as SpecialDayDayOfWeek)}
              >
                <SelectTrigger id="specialDayDayOfWeek">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monday">Poniedziałek</SelectItem>
                  <SelectItem value="tuesday">Wtorek</SelectItem>
                  <SelectItem value="wednesday">Środa</SelectItem>
                  <SelectItem value="thursday">Czwartek</SelectItem>
                  <SelectItem value="friday">Piątek</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="specialDayPeople">Liczba osób</Label>
            <Input
              id="specialDayPeople"
              type="number"
              min="1"
              max={maxPeoplePerShift}
              value={newDayPeople}
              onChange={(e) => setNewDayPeople(Math.max(1, parseInt(e.target.value) || 1))}
            />
          </div>

          <Button onClick={handleAdd} disabled={!newDayName.trim()}>
            <Plus size={16} className="mr-2" />
            Dodaj dzień specjalny
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

