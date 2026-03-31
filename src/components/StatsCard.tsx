import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ChartBar, Key, TrendUp, TrendDown, Minus, Star } from '@phosphor-icons/react'
import { Participant, Shift } from '@/lib/types'
import { motion } from 'framer-motion'
import { useTranslation } from '@/lib/i18n'

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
  specialDaysCount: number
  percentage: number
}

export function StatsCard({ participants, schedule, historicalShifts = [] }: StatsCardProps) {
  const { t } = useTranslation()
  const calculateStats = (): ParticipantStats[] => {
    const allShifts = [...schedule, ...historicalShifts]
    
    const stats = participants.map(participant => {
      const shiftsCount = schedule.filter(shift => 
        shift.participants.includes(participant.id)
      ).length

      const historicalCount = historicalShifts.filter(shift => 
        shift.participants.includes(participant.id)
      ).length
      
      const specialDaysCount = allShifts.filter(shift =>
        shift.specialDayId && shift.participants.includes(participant.id)
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
        specialDaysCount,
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
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ChartBar className="text-primary" size={20} />
            <CardTitle className="text-base">{t.stats.title}</CardTitle>
          </div>
          {stats.length > 0 && (totalShifts > 0 || totalHistorical > 0) && (
            <div className="flex gap-3 text-xs">
              <div className="flex items-center gap-1">
                <span className="font-mono font-semibold text-foreground">{totalShifts + totalHistorical}</span>
                <span className="text-muted-foreground">{t.stats.total}</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="font-mono font-semibold text-foreground">{avgShiftsPerPerson.toFixed(1)}</span>
                <span className="text-muted-foreground">{t.stats.avg}</span>
              </div>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {stats.length === 0 || (totalShifts === 0 && totalHistorical === 0) ? (
          <div className="rounded-lg border border-dashed border-border bg-muted/20 p-6 text-center">
            <ChartBar className="mx-auto mb-2 text-muted-foreground" size={24} />
            <p className="text-xs text-muted-foreground">
              {t.stats.empty}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-1.5">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.03 }}
                className="flex items-center gap-2 rounded-md border border-border bg-card px-2.5 py-1.5 hover:bg-muted/50 transition-colors"
              >
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-medium text-xs">
                  {stat.firstName[0]}{stat.lastName[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-medium text-sm text-card-foreground truncate">
                      {stat.firstName} {stat.lastName}
                    </span>
                    {stat.hasKeys && (
                      <Badge variant="default" className="bg-accent text-accent-foreground h-4 px-1 text-[10px] gap-0.5">
                        <Key size={9} />K
                      </Badge>
                    )}
                    {stat.specialDaysCount > 0 && (
                      <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300 h-4 px-1 text-[10px] gap-0.5">
                        <Star size={9} weight="fill" />{stat.specialDaysCount}
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <div className="h-1.5 w-16 rounded-full bg-muted overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: getBarWidth(stat.totalCount) }}
                      transition={{ delay: index * 0.03 + 0.1, duration: 0.4 }}
                      className="h-full bg-accent"
                    />
                  </div>
                  {getTrendIcon(stat.totalCount)}
                  <div className="text-right">
                    <div className="text-sm font-bold font-mono text-foreground">
                      {stat.totalCount}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
