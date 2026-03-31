import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Trash, Plus, Prohibit } from '@phosphor-icons/react'
import { OffDay } from '@/lib/types'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { useTranslation } from '@/lib/i18n'
import { formatDate } from '@/lib/schedule/date-utils'

interface OffDaysManagerProps {
  offDays: OffDay[]
  onAdd: (offDay: OffDay, occupiedDates: Set<string>) => 'ok' | 'conflict'
  onRemove: (id: string) => void
  occupiedDates: Set<string>
}

export function OffDaysManager({ offDays, onAdd, onRemove, occupiedDates }: OffDaysManagerProps) {
  const { t, locale } = useTranslation()
  const [newDate, setNewDate] = useState('')

  const handleAdd = () => {
    if (!newDate) return
    const offDay: OffDay = {
      id: `off-day-${Date.now()}`,
      date: newDate,
    }
    onAdd(offDay, occupiedDates)
    setNewDate('')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleAdd()
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Prohibit className="text-primary" size={24} weight="fill" />
          <CardTitle>{t.offDays.title}</CardTitle>
        </div>
        <CardDescription>
          {offDays.length === 0
            ? t.offDays.none
            : t.offDays.countLabel(offDays.length)}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {offDays.length > 0 && (
          <ScrollArea className="h-[160px]">
            <div className="flex flex-col gap-2">
              {offDays
                .slice()
                .sort((a, b) => a.date.localeCompare(b.date))
                .map((od) => (
                  <div
                    key={od.id}
                    className="flex items-center justify-between rounded-lg border border-border bg-card p-3"
                  >
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="font-mono text-xs">
                        {formatDate(od.date, locale)}
                      </Badge>
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => onRemove(od.id)}
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
            <Label htmlFor="offDayDate">{t.offDays.dateLabel}</Label>
            <Input
              id="offDayDate"
              type="date"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </div>

          <Button onClick={handleAdd} disabled={!newDate}>
            <Plus size={16} className="mr-2" />
            {t.offDays.addBtn}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
