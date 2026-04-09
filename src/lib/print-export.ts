import { AppData } from './types'
import { formatDate, isPastDate } from './schedule/date-utils'

export interface PrintExportLabels {
  pageTitle: string
  appTitle: string
  periodLabel: string
  noData: string
  offDayLabel: string
  column: {
    no: string
    date: string
    participants: string
    specialDay: string
  }
  keyHolder: string
}

interface ParticipantEntry {
  name: string
  isKeyHolder: boolean
}

interface PrintRow {
  kind: 'historical' | 'planned' | 'offDay'
  date: string
  participants: ParticipantEntry[]
  specialDayName: string | null
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function inRange(dateStr: string, startDate: string, endDate: string): boolean {
  return dateStr >= startDate && dateStr <= endDate
}

function buildPrintRows(data: AppData): PrintRow[] {
  const { settings, participants, schedule, historicalShifts, offDays } = data
  const { startDate, endDate } = settings

  const resolveParticipants = (ids: string[]): ParticipantEntry[] =>
    ids.map((id) => {
      const p = participants.find((x) => x.id === id)
      return {
        name: p ? `${p.firstName} ${p.lastName}` : '',
        isKeyHolder: p?.hasKeys ?? false,
      }
    })

  const resolveSpecialDay = (specialDayId?: string): string | null => {
    if (!specialDayId) return null
    return settings.specialDays.find((sd) => sd.id === specialDayId)?.name ?? null
  }

  const historicalRows: PrintRow[] = historicalShifts
    .filter((s) => inRange(s.date, startDate, endDate))
    .map((s) => ({
      kind: 'historical' as const,
      date: s.date,
      participants: resolveParticipants(s.participants),
      specialDayName: resolveSpecialDay(s.specialDayId),
    }))

  const scheduleRows: PrintRow[] = schedule
    .filter((s) => inRange(s.date, startDate, endDate))
    .map((s) => ({
      kind: (s.isHistorical || isPastDate(s.date) ? 'historical' : 'planned') as
        | 'historical'
        | 'planned',
      date: s.date,
      participants: resolveParticipants(s.participants),
      specialDayName: resolveSpecialDay(s.specialDayId),
    }))

  const offDayRows: PrintRow[] = offDays
    .filter((od) => inRange(od.date, startDate, endDate))
    .map((od) => ({
      kind: 'offDay' as const,
      date: od.date,
      participants: [],
      specialDayName: null,
    }))

  const all = [...historicalRows, ...scheduleRows, ...offDayRows]
  all.sort((a, b) => a.date.localeCompare(b.date))
  return all
}

function renderRow(row: PrintRow, index: number, labels: PrintExportLabels, locale: string): string {
  const rowClass =
    row.kind === 'historical' ? 'row-historical' : row.kind === 'offDay' ? 'row-offday' : 'row-planned'

  const participantsHtml =
    row.kind === 'offDay'
      ? `<span class="offday-label">${escapeHtml(labels.offDayLabel)}</span>`
      : row.participants
          .map((p) => {
            const escapedName = escapeHtml(p.name)
            return p.isKeyHolder
              ? `<span class="participant key-holder">${escapedName} <span class="key-badge">[${escapeHtml(labels.keyHolder)}]</span></span>`
              : `<span class="participant">${escapedName}</span>`
          })
          .join('')

  const specialDayHtml = row.specialDayName
    ? `<span class="special-day-badge">${escapeHtml(row.specialDayName)}</span>`
    : ''

  return `      <tr class="${rowClass}">
        <td class="cell-no">${String(index + 1).padStart(2, '0')}</td>
        <td class="cell-date">${escapeHtml(formatDate(row.date, locale))}</td>
        <td class="cell-participants">${participantsHtml}</td>
        <td class="cell-special">${specialDayHtml}</td>
      </tr>`
}

export function generateScheduleHTML(
  data: AppData,
  locale: string,
  labels: PrintExportLabels
): string {
  const { settings } = data
  const rows = buildPrintRows(data)

  const startFormatted = escapeHtml(formatDate(settings.startDate, locale))
  const endFormatted = escapeHtml(formatDate(settings.endDate, locale))

  const tableRowsHtml = rows.map((row, idx) => renderRow(row, idx, labels, locale)).join('\n')

  const tableHtml =
    rows.length === 0
      ? `<p class="no-data">${escapeHtml(labels.noData)}</p>`
      : `<table>
    <thead>
      <tr>
        <th class="cell-no">${escapeHtml(labels.column.no)}</th>
        <th class="cell-date">${escapeHtml(labels.column.date)}</th>
        <th class="cell-participants">${escapeHtml(labels.column.participants)}</th>
        <th class="cell-special">${escapeHtml(labels.column.specialDay)}</th>
      </tr>
    </thead>
    <tbody>
${tableRowsHtml}
    </tbody>
  </table>`

  return `<!DOCTYPE html>
<html lang="pl">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(labels.pageTitle)}</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      font-size: 13px;
      color: #111;
      background: #fff;
      padding: 24px 32px;
    }
    header {
      margin-bottom: 24px;
      padding-bottom: 16px;
      border-bottom: 2px solid #111;
    }
    header h1 {
      font-size: 22px;
      font-weight: 700;
      margin-bottom: 8px;
    }
    .meta {
      display: flex;
      flex-wrap: wrap;
      gap: 16px;
      font-size: 12px;
      color: #555;
    }
    .meta-item { display: flex; gap: 4px; }
    .meta-label { font-weight: 600; color: #333; }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 12px;
    }
    thead { background: #f5f5f5; }
    th {
      text-align: left;
      padding: 8px 10px;
      font-weight: 600;
      border-bottom: 2px solid #ccc;
      white-space: nowrap;
    }
    td {
      padding: 7px 10px;
      border-bottom: 1px solid #e5e5e5;
      vertical-align: top;
    }
    tr:last-child td { border-bottom: none; }
    .cell-no { width: 40px; font-family: monospace; font-weight: 600; }
    .cell-date { width: 160px; font-family: monospace; white-space: nowrap; }
    .cell-special { width: 160px; }
    .row-historical td { opacity: 0.65; }
    .row-offday td { background: #fffbf0; }
    .participant {
      display: inline-block;
      margin: 2px 4px 2px 0;
      padding: 2px 6px;
      border: 1px solid #ccc;
      border-radius: 4px;
      background: #f9f9f9;
      font-size: 11px;
    }
    .participant.key-holder {
      border-color: #888;
      background: #f0f0f0;
      font-weight: 600;
    }
    .key-badge {
      font-size: 10px;
      font-weight: 700;
      color: #555;
    }
    .offday-label {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 11px;
      font-weight: 600;
      color: #c2410c;
      border: 1px solid #fdba74;
      background: #fff7ed;
    }
    .special-day-badge {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 11px;
      font-weight: 500;
      background: #fefce8;
      border: 1px solid #fde047;
      color: #854d0e;
    }
    .no-data {
      text-align: center;
      padding: 48px;
      color: #888;
      font-style: italic;
    }
    @media print {
      body { padding: 0; font-size: 11px; }
      thead { display: table-header-group; }
      tr { page-break-inside: avoid; }
      .row-offday td { background: transparent !important; }
      .row-historical td { opacity: 1 !important; color: #666; }
    }
  </style>
</head>
<body>
  <header>
    <h1>${escapeHtml(labels.appTitle)}</h1>
    <div class="meta">
      <div class="meta-item">
        <span class="meta-label">${escapeHtml(labels.periodLabel)}:</span>
        <span>${startFormatted} &ndash; ${endFormatted}</span>
      </div>
    </div>
  </header>
  ${tableHtml}
</body>
</html>`
}
