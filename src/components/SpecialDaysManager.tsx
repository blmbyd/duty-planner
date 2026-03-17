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
import { SpecialDay, SpecialDayFrequency } from '@/lib/types'
import { ScrollArea } from '@/components/ui/scroll-area'

interface SpecialDaysManagerProps {
  specialDays: SpecialDay[]
  onUpdate: (specialDays: SpecialDay[]) => void
  maxPeoplePerShift: number
}

export function SpecialDaysManager({ specialDays, onUpdate, maxPeoplePerShift }: SpecialDaysManagerProps) {
  const [newDayName, setNewDayName] = useState('')
  const [newDayFrequency, setNewDayFrequency] = useState<SpecialDayFrequency>('second-monday')
  const [newDayPeople, setNewDayPeople] = useState(2)

  const handleAdd = () => {
    if (!newDayName.trim()) return
    
    const newSpecialDay: SpecialDay = {
      id: `special-day-${Date.now()}`,
      name: newDayName,
      frequency: newDayFrequency,
      peopleCount: newDayPeople
    }
    
    onUpdate([...specialDays, newSpecialDay])
    setNewDayName('')
    setNewDayFrequency('second-monday')
    setNewDayPeople(2)
  }

  const handleDelete = (id: string) => {
    onUpdate(specialDays.filter(sd => sd.id !== id))
  }

  const frequencyLabels: Record<SpecialDayFrequency, string> = {
    'none': 'Brak',
    'first-monday': '1. poniedziałek',
    'second-monday': '2. poniedziałek',
    'third-monday': '3. poniedziałek',
    'fourth-monday': '4. poniedziałek',
    'last-monday': 'Ostatni poniedziałek',
    'first-tuesday': '1. wtorek',
    'second-tuesday': '2. wtorek',
    'third-tuesday': '3. wtorek',
    'fourth-tuesday': '4. wtorek',
    'last-tuesday': 'Ostatni wtorek',
    'first-wednesday': '1. środa',
    'second-wednesday': '2. środa',
    'third-wednesday': '3. środa',
    'fourth-wednesday': '4. środa',
    'last-wednesday': 'Ostatnia środa',
    'first-thursday': '1. czwartek',
    'second-thursday': '2. czwartek',
    'third-thursday': '3. czwartek',
    'fourth-thursday': '4. czwartek',
    'last-thursday': 'Ostatni czwartek',
    'first-friday': '1. piątek',
    'second-friday': '2. piątek',
    'third-friday': '3. piątek',
    'fourth-friday': '4. piątek',
    'last-friday': 'Ostatni piątek',
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
                        {frequencyLabels[sd.frequency]}
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

          <div className="flex flex-col gap-2">
            <Label htmlFor="specialDayFrequency">Częstotliwość</Label>
            <Select
              value={newDayFrequency}
              onValueChange={(value) => setNewDayFrequency(value as SpecialDayFrequency)}
            >
              <SelectTrigger id="specialDayFrequency">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="first-monday">Pierwszy poniedziałek miesiąca</SelectItem>
                <SelectItem value="second-monday">Drugi poniedziałek miesiąca</SelectItem>
                <SelectItem value="third-monday">Trzeci poniedziałek miesiąca</SelectItem>
                <SelectItem value="fourth-monday">Czwarty poniedziałek miesiąca</SelectItem>
                <SelectItem value="last-monday">Ostatni poniedziałek miesiąca</SelectItem>
                <SelectItem value="first-tuesday">Pierwszy wtorek miesiąca</SelectItem>
                <SelectItem value="second-tuesday">Drugi wtorek miesiąca</SelectItem>
                <SelectItem value="third-tuesday">Trzeci wtorek miesiąca</SelectItem>
                <SelectItem value="fourth-tuesday">Czwarty wtorek miesiąca</SelectItem>
                <SelectItem value="last-tuesday">Ostatni wtorek miesiąca</SelectItem>
                <SelectItem value="first-wednesday">Pierwsza środa miesiąca</SelectItem>
                <SelectItem value="second-wednesday">Druga środa miesiąca</SelectItem>
                <SelectItem value="third-wednesday">Trzecia środa miesiąca</SelectItem>
                <SelectItem value="fourth-wednesday">Czwarta środa miesiąca</SelectItem>
                <SelectItem value="last-wednesday">Ostatnia środa miesiąca</SelectItem>
                <SelectItem value="first-thursday">Pierwszy czwartek miesiąca</SelectItem>
                <SelectItem value="second-thursday">Drugi czwartek miesiąca</SelectItem>
                <SelectItem value="third-thursday">Trzeci czwartek miesiąca</SelectItem>
                <SelectItem value="fourth-thursday">Czwarty czwartek miesiąca</SelectItem>
                <SelectItem value="last-thursday">Ostatni czwartek miesiąca</SelectItem>
                <SelectItem value="first-friday">Pierwszy piątek miesiąca</SelectItem>
                <SelectItem value="second-friday">Drugi piątek miesiąca</SelectItem>
                <SelectItem value="third-friday">Trzeci piątek miesiąca</SelectItem>
                <SelectItem value="fourth-friday">Czwarty piątek miesiąca</SelectItem>
                <SelectItem value="last-friday">Ostatni piątek miesiąca</SelectItem>
              </SelectContent>
            </Select>
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
