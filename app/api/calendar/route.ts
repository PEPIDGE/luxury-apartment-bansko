import { NextResponse } from 'next/server'

// Next.js ISR — re-fetch from Booking.com at most once every 30 minutes
export const revalidate = 1800

type OccupiedRange = { start: string; end: string; source: 'booking' | 'airbnb' | 'manual' }

function formatIcalDate(val: string): string {
  // Handles both YYYYMMDD and YYYYMMDDTHHMMSSZ
  const clean = val.split('T')[0].replace(/-/g, '')
  const y = clean.slice(0, 4)
  const m = clean.slice(4, 6)
  const d = clean.slice(6, 8)
  return `${y}-${m}-${d}`
}

function parseIcal(icsText: string): OccupiedRange[] {
  const ranges: OccupiedRange[] = []
  // Unfold long lines (RFC 5545: lines starting with space/tab are continuations)
  const unfolded = icsText.replace(/\r\n[ \t]/g, '').replace(/\r\n/g, '\n').replace(/\r/g, '\n')
  const lines = unfolded.split('\n')

  let inEvent = false
  let start = ''
  let end = ''

  for (const line of lines) {
    if (line.trim() === 'BEGIN:VEVENT') {
      inEvent = true
      start = ''
      end = ''
    } else if (line.trim() === 'END:VEVENT') {
      if (start && end) {
        ranges.push({ start, end, source: 'booking' })
      }
      inEvent = false
    } else if (inEvent) {
      // DTSTART may have params like DTSTART;VALUE=DATE:20260101
      if (line.startsWith('DTSTART')) {
        const val = line.includes(':') ? line.split(':').slice(1).join(':').trim() : ''
        if (val) start = formatIcalDate(val)
      } else if (line.startsWith('DTEND')) {
        const val = line.includes(':') ? line.split(':').slice(1).join(':').trim() : ''
        if (val) end = formatIcalDate(val)
      }
    }
  }

  return ranges
}

export async function GET() {
  const bookingUrl = process.env.BOOKING_ICAL_URL

  if (!bookingUrl) {
    // Return empty — no URL configured yet
    return NextResponse.json({ ranges: [], source: 'no-url-configured' })
  }

  try {
    const res = await fetch(bookingUrl, {
      next: { revalidate: 1800 },
      headers: { 'User-Agent': 'bansko-apartment.com/calendar-sync' },
    })

    if (!res.ok) {
      throw new Error(`Booking.com iCal returned ${res.status}`)
    }

    const icsText = await res.text()
    const ranges = parseIcal(icsText)

    return NextResponse.json({
      ranges,
      fetchedAt: new Date().toISOString(),
      count: ranges.length,
    })
  } catch (err) {
    console.error('[calendar sync]', err)
    return NextResponse.json(
      { ranges: [], error: 'Failed to fetch calendar' },
      { status: 502 }
    )
  }
}
