import { describe, it, expect } from 'vitest'
import { computeReminderTime, shouldNotify, reminderText } from '../lib/reminders'

describe('computeReminderTime', () => {
  it('resta días correctamente', () => {
    const evento = new Date('2026-01-10T12:00:00Z')
    const r = computeReminderTime(evento, 2, 'days')
    expect(r.toISOString()).toBe('2026-01-08T12:00:00.000Z')
  })

  it('resta horas correctamente', () => {
    const evento = new Date('2026-01-10T12:00:00Z')
    const r = computeReminderTime(evento, 3, 'hours')
    expect(r.toISOString()).toBe('2026-01-10T09:00:00.000Z')
  })
})

describe('shouldNotify', () => {
  const evento = new Date('2026-01-10T12:00:00Z')
  const reminder = computeReminderTime(evento, 1, 'days') // 2026-01-09T12:00Z

  it('no avisa antes de la hora del recordatorio', () => {
    const now = new Date('2026-01-09T11:59:00Z')
    expect(shouldNotify(now, evento, reminder)).toBe(false)
  })

  it('avisa entre el recordatorio y el evento', () => {
    const now = new Date('2026-01-09T18:00:00Z')
    expect(shouldNotify(now, evento, reminder)).toBe(true)
  })

  it('no avisa una vez pasado el evento', () => {
    const now = new Date('2026-01-10T12:30:00Z')
    expect(shouldNotify(now, evento, reminder)).toBe(false)
  })
})

describe('reminderText', () => {
  it('usa singular y plural en días', () => {
    expect(reminderText(1, 'days')).toBe('1 día')
    expect(reminderText(3, 'days')).toBe('3 días')
  })
  it('usa singular y plural en horas', () => {
    expect(reminderText(1, 'hours')).toBe('1 hora')
    expect(reminderText(5, 'hours')).toBe('5 horas')
  })
})
