import { useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Gear, DownloadSimple, UploadSimple, Warning } from '@phosphor-icons/react'
import { ShiftSettings } from '@/lib/types'

interface SettingsPanelProps {
  settings: ShiftSettings
  maxPeople: number
  onUpdate: (patch: Partial<ShiftSettings>) => void
  onExport: () => void
  onImport: (file: File) => void
}

export function SettingsPanel({ settings, maxPeople, onUpdate, onExport, onImport }: SettingsPanelProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      onImport(file)
    }
    // reset so the same file can be selected again
    e.target.value = ''
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Gear className="text-primary" size={24} />
          <CardTitle>Ustawienia</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="frequency">Czestotliwosc dyzurow</Label>
          <Select
            value={settings.frequency}
            onValueChange={(value) =>
              onUpdate({ frequency: value as ShiftSettings['frequency'] })
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
          <Label htmlFor="peoplePerShift">Liczba osob na dyzurze</Label>
          <Input
            id="peoplePerShift"
            type="number"
            min="1"
            max={maxPeople || 10}
            value={settings.peoplePerShift}
            onChange={(e) =>
              onUpdate({ peoplePerShift: Math.max(1, parseInt(e.target.value) || 1) })
            }
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="startDate">Data poczatkowa</Label>
          <Input
            id="startDate"
            type="date"
            value={settings.startDate}
            onChange={(e) => onUpdate({ startDate: e.target.value })}
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="endDate">Data koncowa</Label>
          <Input
            id="endDate"
            type="date"
            value={settings.endDate}
            onChange={(e) => onUpdate({ endDate: e.target.value })}
          />
        </div>

        <Separator />

        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <DownloadSimple className="text-primary" size={20} />
            <span className="text-sm font-medium">Backup danych</span>
          </div>

          <Button variant="outline" size="sm" className="w-full" onClick={onExport}>
            <DownloadSimple size={16} className="mr-2" />
            Eksportuj dane do pliku
          </Button>

          <div className="flex flex-col gap-1">
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => fileInputRef.current?.click()}
            >
              <UploadSimple size={16} className="mr-2" />
              Importuj dane z pliku
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json,application/json"
              className="hidden"
              onChange={handleFileChange}
            />
            <p className="flex items-center gap-1 text-xs text-muted-foreground">
              <Warning size={12} className="shrink-0 text-amber-500" />
              Import calkowicie nadpisuje obecne dane
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
