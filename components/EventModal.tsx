'use client'

import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import type { Event } from '@/lib/supabase'
import { DEFAULT_CATEGORIES, getCategoryStyle } from '@/lib/categories'

type Props = {
  isOpen: boolean
  selectedDate?: Date
  event?: Event | null
  onClose: () => void
  onSave: (data: EventFormData) => Promise<void>
  onDelete?: (id: string) => Promise<void>
}

export type EventFormData = {
  title: string
  description: string
  event_date: string
  reminder_value: number
  reminder_unit: 'hours' | 'days'
  category: string
}

export default function EventModal({
  isOpen,
  selectedDate,
  event,
  onClose,
  onSave,
  onDelete,
}: Props) {
  const [form, setForm] = useState<EventFormData>({
    title: '',
    description: '',
    event_date: '',
    reminder_value: 1,
    reminder_unit: 'days',
    category: '',
  })
  const [customCategory, setCustomCategory] = useState('')
  const [showCustom, setShowCustom] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (event) {
      const date = new Date(event.event_date)
      const cat = event.category ?? ''
      const isCustom = cat !== '' && !DEFAULT_CATEGORIES.includes(cat)
      setForm({
        title: event.title,
        description: event.description ?? '',
        event_date: format(date, "yyyy-MM-dd'T'HH:mm"),
        reminder_value: event.reminder_value,
        reminder_unit: event.reminder_unit,
        category: isCustom ? '__custom__' : cat,
      })
      setCustomCategory(isCustom ? cat : '')
      setShowCustom(isCustom)
    } else if (selectedDate) {
      setForm({
        title: '',
        description: '',
        event_date: format(selectedDate, "yyyy-MM-dd'T'09:00"),
        reminder_value: 1,
        reminder_unit: 'days',
        category: '',
      })
      setCustomCategory('')
      setShowCustom(false)
    }
    setError('')
  }, [event, selectedDate, isOpen])

  if (!isOpen) return null

  const resolvedCategory = form.category === '__custom__' ? customCategory : form.category

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title.trim()) {
      setError('El título es obligatorio')
      return
    }
    setLoading(true)
    setError('')
    try {
      await onSave({ ...form, category: resolvedCategory })
      onClose()
    } catch {
      setError('Error al guardar el evento')
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete() {
    if (!event || !onDelete) return
    if (!confirm('¿Eliminar este evento?')) return
    setLoading(true)
    try {
      await onDelete(event.id)
      onClose()
    } catch {
      setError('Error al eliminar el evento')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-slate-800">
            {event ? 'Editar evento' : 'Nuevo evento'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xl leading-none">
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Título <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Ej: Renovación de contrato"
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Categoría
            </label>
            <div className="flex flex-wrap gap-2">
              {DEFAULT_CATEGORIES.map((cat) => {
                const style = getCategoryStyle(cat)
                const selected = form.category === cat
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => {
                      setForm({ ...form, category: cat })
                      setShowCustom(false)
                    }}
                    className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
                      selected
                        ? `${style.bg} ${style.text} ${style.border}`
                        : `${style.lightBg} ${style.lightText} border-transparent hover:opacity-80`
                    }`}
                  >
                    {cat}
                  </button>
                )
              })}
              <button
                type="button"
                onClick={() => {
                  setShowCustom(true)
                  setForm({ ...form, category: '__custom__' })
                }}
                className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
                  form.category === '__custom__'
                    ? 'bg-slate-700 text-white border-slate-700'
                    : 'bg-slate-100 text-slate-600 border-transparent hover:bg-slate-200'
                }`}
              >
                + Personalizada
              </button>
            </div>
            {showCustom && (
              <input
                type="text"
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                placeholder="Nombre de la categoría"
                autoFocus
                className="mt-2 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Descripción
            </label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Detalles adicionales..."
              rows={2}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          {/* Date & time */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Fecha y hora
            </label>
            <input
              type="datetime-local"
              value={form.event_date}
              onChange={(e) => setForm({ ...form, event_date: e.target.value })}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Reminder */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Avisar con
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                min={1}
                max={365}
                value={form.reminder_value}
                onChange={(e) =>
                  setForm({ ...form, reminder_value: parseInt(e.target.value) || 1 })
                }
                className="w-24 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <select
                value={form.reminder_unit}
                onChange={(e) =>
                  setForm({ ...form, reminder_unit: e.target.value as 'hours' | 'days' })
                }
                className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="hours">hora(s) antes</option>
                <option value="days">día(s) antes</option>
              </select>
            </div>
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            {event && onDelete && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
              >
                Eliminar
              </button>
            )}
            <div className="flex-1" />
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
