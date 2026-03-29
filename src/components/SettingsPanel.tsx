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
import { AppLanguage, LANGUAGE_LABELS } from '@/lib/i18n'
import { useTranslation } from '@/lib/i18n'

interface SettingsPanelProps {
  settings: ShiftSettings
  maxPeople: number
  language: AppLanguage
  onUpdate: (patch: Partial<ShiftSettings>) => void
  onLanguageChange: (lang: AppLanguage) => void
  onExport: () => void
  onImport: (file: File) => void
}

export function SettingsPanel({ settings, maxPeople, language, onUpdate, onLanguageChange, onExport, onImport }: SettingsPanelProps) {
  const { t } = useTranslation()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      onImport(file)
    }
    e.target.value = ''
  }

  const availableLanguages = Object.entries(LANGUAGE_LABELS) as [AppLanguage, string][]

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Gear className="text-primary" size={24} />
          <CardTitle>{t.settings.title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="frequency">{t.settings.frequency}</Label>
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
              <SelectItem value="daily">{t.schedule.frequency.daily}</SelectItem>
              <SelectItem value="every-2-days">{t.schedule.frequency['every-2-days']}</SelectItem>
              <SelectItem value="every-3-days">{t.schedule.frequency['every-3-days']}</SelectItem>
              <SelectItem value="weekly">{t.schedule.frequency.weekly}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="peoplePerShift">{t.settings.peoplePerShift}</Label>
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
          <Label htmlFor="startDate">{t.settings.startDate}</Label>
          <Input
            id="startDate"
            type="date"
            value={settings.startDate}
            onChange={(e) => onUpdate({ startDate: e.target.value })}
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="endDate">{t.settings.endDate}</Label>
          <Input
            id="endDate"
            type="date"
            value={settings.endDate}
            onChange={(e) => onUpdate({ endDate: e.target.value })}
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="language">{t.settings.language}</Label>
          <Select
            value={language}
            onValueChange={(value) => onLanguageChange(value as AppLanguage)}
          >
            <SelectTrigger id="language">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {availableLanguages.map(([code, label]) => (
                <SelectItem key={code} value={code}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Separator />

        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <DownloadSimple className="text-primary" size={20} />
            <span className="text-sm font-medium">{t.settings.backup.title}</span>
          </div>

          <Button variant="outline" size="sm" className="w-full" onClick={onExport}>
            <DownloadSimple size={16} className="mr-2" />
            {t.settings.backup.export}
          </Button>

          <div className="flex flex-col gap-1">
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => fileInputRef.current?.click()}
            >
              <UploadSimple size={16} className="mr-2" />
              {t.settings.backup.import}
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
              {t.settings.backup.importWarning}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
