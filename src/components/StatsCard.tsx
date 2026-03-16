import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ChartBar, Key, TrendUp, TrendDown, Minus } from '@phosphor-icons/react'
import { Participant, Shift } from '@/lib/types'
import { motion } from 'framer-motion'

interface StatsCardProps {
  participants: Participant[]
  schedule: Shift[]
  historicalShifts?: Shift[]
}

interface ParticipantStats {
  id: string
  firstName: string
  lastName: string
  hasKeys: boolean
  shiftsCount: number
  historicalCount: number
  totalCount: number
  percentage: number
}

export function StatsCard({ participants, schedule, historicalShifts = [] }: StatsCardProps) {
  const calculateStats = (): ParticipantStats[] => {
    const stats = participants.map(participant => {
      const shiftsCount = schedule.filter(shift => 
        shift.participants.includes(participant.id)
      ).length

      const historicalCount = historicalShifts.filter(shift => 
        shift.participants.includes(participant.id)
      ).length

      const totalCount = shiftsCount + historicalCount

      return {
        id: participant.id,
        firstName: participant.firstName,
        lastName: participant.lastName,
        hasKeys: participant.hasKeys,
        shiftsCount,
        historicalCount,
        totalCount,
        percentage: schedule.length > 0 ? (shiftsCount / schedule.length) * 100 : 0
      }
    })

    return stats.sort((a, b) => b.totalCount - a.totalCount)
  }

  const stats = calculateStats()
  const totalShifts = schedule.length
  const totalHistorical = historicalShifts.length
  const avgShiftsPerPerson = stats.length > 0 
    ? stats.reduce((sum, s) => sum + s.totalCount, 0) / stats.length 
    : 0

  const getTrendIcon = (count: number) => {
    if (count > avgShiftsPerPerson) return <TrendUp size={14} className="text-accent" />
    if (count < avgShiftsPerPerson) return <TrendDown size={14} className="text-muted-foreground" />
    return <Minus size={14} className="text-muted-foreground" />
  }

  const getBarWidth = (count: number) => {
    const maxCount = Math.max(...stats.map(s => s.totalCount), 1)
    return `${(count / maxCount) * 100}%`
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <ChartBar className="text-primary" size={24} />
          <CardTitle>Statystyki</CardTitle>
        </div>
        <CardDescription>
          Rozkład dyżurów pomiędzy uczestnikami
        </CardDescription>
      </CardHeader>
      <CardContent>
        {stats.length === 0 || (totalShifts === 0 && totalHistorical === 0) ? (
          <div className="rounded-lg border border-dashed border-border bg-muted/20 p-8 text-center">
            <ChartBar className="mx-auto mb-2 text-muted-foreground" size={32} />
            <p className="text-sm text-muted-foreground">
              Brak danych do wyświetlenia. Wygeneruj harmonogram lub dodaj przeszłe dyżury aby zobaczyć statystyki.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="flex gap-4 rounded-lg bg-muted/30 p-4">
              <div className="flex-1">
                <div className="text-2xl font-bold text-foreground">{totalShifts + totalHistorical}</div>
                <div className="text-xs text-muted-foreground">Łącznie dyżurów</div>
              </div>
              <div className="flex-1">
                <div className="text-2xl font-bold text-foreground">{avgShiftsPerPerson.toFixed(1)}</div>
                <div className="text-xs text-muted-foreground">Średnia na osobę</div>
              </div>
              <div className="flex-1">
                <div className="text-2xl font-bold text-foreground">{stats.length}</div>
                <div className="text-xs text-muted-foreground">Uczestników</div>
              </div>
            </div>

            <ScrollArea className="h-[400px]">
              <div className="flex flex-col gap-3">
                {stats.map((stat, index) => (
                  <motion.div
                    key={stat.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex flex-col gap-2 rounded-lg border border-border bg-card p-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-medium text-sm">
                          {stat.firstName[0]}{stat.lastName[0]}
                        </div>
                        <div>
                          <div className="font-medium text-card-foreground">
                            {stat.firstName} {stat.lastName}
                          </div>
                          {stat.hasKeys && (
                            <Badge variant="default" className="mt-1 bg-accent text-accent-foreground text-xs">
                              <Key size={10} className="mr-1" />
                              Klucze
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getTrendIcon(stat.totalCount)}
                        <div className="text-right">
                          <div className="text-lg font-bold font-mono text-foreground">
                            {stat.totalCount}
                          </div>
                          {stat.historicalCount > 0 && (
                            <div className="text-xs text-muted-foreground">
                              {stat.shiftsCount} + {stat.historicalCount} przeszłych
                            </div>
                          )}
                          {stat.historicalCount === 0 && totalShifts > 0 && (
                            <div className="text-xs text-muted-foreground">
                              {stat.percentage.toFixed(0)}%
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: getBarWidth(stat.totalCount) }}
                        transition={{ delay: index * 0.05 + 0.2, duration: 0.5 }}
                        className="h-full bg-accent"
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
