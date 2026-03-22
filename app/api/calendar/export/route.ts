import { NextResponse } from 'next/server'

// Manual blocks can be set via environment variable as a JSON array.
// Example in Vercel dashboard → Settings → Environment Variables:
//   MANUAL_CALENDAR_BLOCKS = [{"start":"2026-04-01","end":"2026-04-07","summary":"Maintenance"}]
function getManualBlocks(): Array<{ start: string; end: string; summary: string }> {
  try {
    return JSON.parse(process.env.MANUAL_CALENDAR_BLOCKS || '[]')
  } catch {
    return []
  }
}

function toIcalDate(dateStr: string): string {
  return dateStr.replace(/-/g, '')
}

function nowStamp(): string {
  return new Date().toISOString().replace(/[-:.]/g, '').slice(0, 15) + 'Z'
}

function generateIcal(
  events: Array<{ start: string; end: string; summary: string; uid: string }>
): string {
  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//bansko-apartment.com//Apartment Calendar//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:Bansko Apartment – Св. Иван Рилски',
    'X-WR-TIMEZONE:Europe/Sofia',
  ]

  for (const ev of events) {
    lines.push(
      'BEGIN:VEVENT',
      `DTSTART;VALUE=DATE:${toIcalDate(ev.start)}`,
      `DTEND;VALUE=DATE:${toIcalDate(ev.end)}`,
      `SUMMARY:${ev.summary}`,
      `UID:${ev.uid}`,
      `DTSTAMP:${nowStamp()}`,
      'END:VEVENT'
    )
  }

  lines.push('END:VCALENDAR')
  // iCal spec requires CRLF line endings
  return lines.join('\r\n')
}

export async function GET() {
  const manual = getManualBlocks()

  const events = manual.map((b, i) => ({
    start: b.start,
    end: b.end,
    summary: b.summary || 'Reserved',
    uid: `manual-${i}-${b.start}@bansko-apartment.com`,
  }))

  const ical = generateIcal(events)

  return new NextResponse(ical, {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': 'attachment; filename="bansko-apartment.ics"',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  })
}
