import { useState } from 'react'
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
import { Button } from '@/components/ui/button'
import { useTranslation } from '@/lib/i18n'

interface SpecialDaysManagerProps {
  specialDays: SpecialDay[]
  onUpdate: (specialDays: SpecialDay[]) => void
  maxPeoplePerShift: number
}

export function SpecialDaysManager({ specialDays, onUpdate, maxPeoplePerShift }: SpecialDaysManagerProps) {
  const { t } = useTranslation()
  const [newDayName, setNewDayName] = useState('')
  const [newDayWeekOccurrence, setNewDayWeekOccurrence] = useState<SpecialDayWeekOccurrence>('second')
  const [newDayDayOfWeek, setNewDayDayOfWeek] = useState<SpecialDayDayOfWeek>('monday')
  const [newDayPeople, setNewDayPeople] = useState(2)

  const buildFrequencyLabel = (weekOccurrence: SpecialDayWeekOccurrence, dayOfWeek: SpecialDayDayOfWeek): string => {
    return `${t.specialDays.weekOccurrence[weekOccurrence]} ${t.specialDays.dayName[dayOfWeek]}`
  }

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
          <CardTitle>{t.specialDays.title}</CardTitle>
        </div>
        <CardDescription>
          {specialDays.length === 0
            ? t.specialDays.none
            : t.specialDays.countLabel(specialDays.length)}
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
                        {t.specialDays.peopleLabel(sd.peopleCount)}
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
            <Label htmlFor="specialDayName">{t.specialDays.nameLabel}</Label>
            <Input
              id="specialDayName"
              value={newDayName}
              onChange={(e) => setNewDayName(e.target.value)}
              placeholder={t.specialDays.placeholder}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-2">
              <Label htmlFor="specialDayWeekOccurrence">{t.specialDays.weekOccurrenceField[newDayDayOfWeek]}</Label>
              <Select
                value={newDayWeekOccurrence}
                onValueChange={(value) => setNewDayWeekOccurrence(value as SpecialDayWeekOccurrence)}
              >
                <SelectTrigger id="specialDayWeekOccurrence">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="first">{t.specialDays.weekOccurrence.first}</SelectItem>
                  <SelectItem value="second">{t.specialDays.weekOccurrence.second}</SelectItem>
                  <SelectItem value="third">{t.specialDays.weekOccurrence.third}</SelectItem>
                  <SelectItem value="fourth">{t.specialDays.weekOccurrence.fourth}</SelectItem>
                  <SelectItem value="last">{t.specialDays.weekOccurrence.last}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="specialDayDayOfWeek">{t.specialDays.dayOfWeek}</Label>
              <Select
                value={newDayDayOfWeek}
                onValueChange={(value) => setNewDayDayOfWeek(value as SpecialDayDayOfWeek)}
              >
                <SelectTrigger id="specialDayDayOfWeek">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monday">{t.specialDays.dayName.monday}</SelectItem>
                  <SelectItem value="tuesday">{t.specialDays.dayName.tuesday}</SelectItem>
                  <SelectItem value="wednesday">{t.specialDays.dayName.wednesday}</SelectItem>
                  <SelectItem value="thursday">{t.specialDays.dayName.thursday}</SelectItem>
                  <SelectItem value="friday">{t.specialDays.dayName.friday}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="specialDayPeople">{t.specialDays.peopleCount}</Label>
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
            {t.specialDays.addBtn}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

