import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'
import { sendTelegramMessage } from '@/lib/telegram'
import { computeReminderTime, shouldNotify, reminderText } from '@/lib/reminders'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  // Verify the cron secret to avoid unauthorized calls
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createServiceClient()

  // Fetch all events not yet notified
  const { data: events, error } = await supabase
    .from('events')
    .select('*')
    .eq('notified', false)

  if (error) {
    console.error('Supabase error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const now = new Date()
  const notifiedIds: string[] = []

  for (const event of events ?? []) {
    const eventDate = parseISO(event.event_date)
    const reminderTime = computeReminderTime(
      eventDate,
      event.reminder_value,
      event.reminder_unit
    )

    if (shouldNotify(now, eventDate, reminderTime)) {
      const formattedDate = format(eventDate, "EEEE d 'de' MMMM 'a las' HH:mm", {
        locale: es,
      })

      const message =
        `⏰ <b>Recordatorio de trámite</b>\n\n` +
        `📌 <b>${event.title}</b>\n` +
        `🗓 ${formattedDate}\n` +
        (event.description ? `📝 ${event.description}\n` : '') +
        `\n⚠️ Faltan ${reminderText(event.reminder_value, event.reminder_unit)} para este trámite.`

      try {
        await sendTelegramMessage(message)
        notifiedIds.push(event.id)
      } catch (err) {
        console.error(`Failed to send Telegram for event ${event.id}:`, err)
      }
    }
  }

  // Mark notified events
  if (notifiedIds.length > 0) {
    await supabase
      .from('events')
      .update({ notified: true })
      .in('id', notifiedIds)
  }

  return NextResponse.json({
    checked: events?.length ?? 0,
    notified: notifiedIds.length,
  })
}
