/**
 * Lógica pura para calcular cuándo debe dispararse el aviso de un evento.
 * Separada del endpoint del cron para poder testearla de forma aislada.
 */

export type ReminderUnit = 'hours' | 'days'

/** Devuelve el instante en el que debe enviarse el recordatorio. */
export function computeReminderTime(
  eventDate: Date,
  value: number,
  unit: ReminderUnit
): Date {
  const ms =
    unit === 'days'
      ? value * 24 * 60 * 60 * 1000
      : value * 60 * 60 * 1000
  return new Date(eventDate.getTime() - ms)
}

/**
 * Indica si en el momento `now` toca avisar: ya hemos pasado la hora del
 * recordatorio pero el evento todavía no ha ocurrido.
 */
export function shouldNotify(
  now: Date,
  eventDate: Date,
  reminderTime: Date
): boolean {
  return now >= reminderTime && now < eventDate
}

/** Texto legible de la antelación, ej: "2 días", "1 hora". */
export function reminderText(value: number, unit: ReminderUnit): string {
  if (unit === 'days') {
    return `${value} día${value !== 1 ? 's' : ''}`
  }
  return `${value} hora${value !== 1 ? 's' : ''}`
}
