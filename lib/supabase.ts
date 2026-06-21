import { createClient } from '@supabase/supabase-js'

export function createServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export type Event = {
  id: string
  title: string
  description: string | null
  event_date: string
  reminder_value: number
  reminder_unit: 'hours' | 'days'
  category: string | null
  notified: boolean
  created_at: string
}
