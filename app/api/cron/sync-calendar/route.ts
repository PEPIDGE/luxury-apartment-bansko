import { NextResponse } from 'next/server'

// This endpoint is called by Vercel Cron every 30 minutes (configured in vercel.json).
// It revalidates the /api/calendar cache so the next visitor gets fresh Booking.com data.
// Protect it so only Vercel's cron runner can trigger it.
export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const bookingUrl = process.env.BOOKING_ICAL_URL
  if (!bookingUrl) {
    return NextResponse.json({ ok: false, reason: 'BOOKING_ICAL_URL not set' })
  }

  try {
    // Force a fresh fetch so Next.js ISR cache is updated
    const res = await fetch(bookingUrl, {
      cache: 'no-store',
      headers: { 'User-Agent': 'bansko-apartment.com/calendar-sync' },
    })

    if (!res.ok) {
      throw new Error(`Status ${res.status}`)
    }

    return NextResponse.json({
      ok: true,
      syncedAt: new Date().toISOString(),
      status: res.status,
    })
  } catch (err) {
    console.error('[cron/sync-calendar]', err)
    return NextResponse.json({ ok: false, error: String(err) }, { status: 502 })
  }
}
