'use client'

import { useState, useEffect, useCallback } from 'react'
import Calendar from '@/components/Calendar'
import EventModal, { type EventFormData } from '@/components/EventModal'
import LogoutButton from '@/components/LogoutButton'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import type { Event } from '@/lib/supabase'
import { getCategoryStyle } from '@/lib/categories'

export default function Home() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>()
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [activeFilter, setActiveFilter] = useState<string | null>(null)

  const fetchEvents = useCallback(async () => {
    try {
      const res = await fetch('/api/events')
      const data = await res.json()
      setEvents(data)
    } catch (err) {
      console.error('Error fetching events', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchEvents()
  }, [fetchEvents])

  function handleDayClick(date: Date) {
    setSelectedEvent(null)
    setSelectedDate(date)
    setModalOpen(true)
  }

  function handleEventClick(event: Event) {
    setSelectedEvent(event)
    setSelectedDate(undefined)
    setModalOpen(true)
  }

  async function handleSave(data: EventFormData) {
    const method = selectedEvent ? 'PUT' : 'POST'
    const url = selectedEvent ? `/api/events/${selectedEvent.id}` : '/api/events'
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!res.ok) throw new Error('Error saving event')
    await fetchEvents()
  }

  async function handleDelete(id: string) {
    const res = await fetch(`/api/events/${id}`, { method: 'DELETE' })
    if (!res.ok) throw new Error('Error deleting event')
    await fetchEvents()
  }

  // All unique categories from existing events
  const usedCategories = Array.from(
    new Set(events.map((e) => e.category).filter(Boolean) as string[])
  )

  // Filtered events for calendar and sidebar
  const filteredEvents = activeFilter
    ? events.filter((e) => e.category === activeFilter)
    : events

  // Upcoming events (next 7 days) from filtered set
  const now = new Date()
  const in7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
  const upcomingEvents = filteredEvents
    .filter((e) => {
      const d = new Date(e.event_date)
      return d >= now && d <= in7Days
    })
    .sort((a, b) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime())

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top bar */}
      <header className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-800">📅 Calendario de Avisos</h1>
            <p className="text-sm text-slate-500">Haz clic en un día para añadir un evento</p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                setSelectedEvent(null)
                setSelectedDate(new Date())
                setModalOpen(true)
              }}
              className="bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
            >
              + Nuevo evento
            </button>
            <LogoutButton />
          </div>
        </div>
      </header>

      {/* Category filter bar */}
      {usedCategories.length > 0 && (
        <div className="bg-white border-b border-slate-100 px-6 py-2.5">
          <div className="max-w-6xl mx-auto flex items-center gap-2 flex-wrap">
            <span className="text-xs text-slate-400 font-medium mr-1">Filtrar:</span>
            <button
              onClick={() => setActiveFilter(null)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                activeFilter === null
                  ? 'bg-slate-800 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Todos ({events.length})
            </button>
            {usedCategories.map((cat) => {
              const style = getCategoryStyle(cat)
              const count = events.filter((e) => e.category === cat).length
              return (
                <button
                  key={cat}
                  onClick={() => setActiveFilter(activeFilter === cat ? null : cat)}
                  className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
                    activeFilter === cat
                      ? `${style.bg} ${style.text} ${style.border}`
                      : `${style.lightBg} ${style.lightText} border-transparent hover:opacity-80`
                  }`}
                >
                  {cat} ({count})
                </button>
              )
            })}
          </div>
        </div>
      )}

      <main className="max-w-6xl mx-auto px-6 py-6 flex flex-col lg:flex-row gap-6">
        {/* Calendar */}
        <div className="flex-1">
          {loading ? (
            <div className="bg-white rounded-2xl border border-slate-200 h-96 flex items-center justify-center text-slate-400">
              Cargando...
            </div>
          ) : (
            <Calendar
              events={filteredEvents}
              onDayClick={handleDayClick}
              onEventClick={handleEventClick}
            />
          )}
        </div>

        {/* Sidebar */}
        <aside className="w-full lg:w-72 flex flex-col gap-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-4">
            <h2 className="text-sm font-semibold text-slate-700 mb-3">
              Próximos 7 días
              {activeFilter && (
                <span className="ml-2 font-normal text-slate-400">· {activeFilter}</span>
              )}
            </h2>
            {upcomingEvents.length === 0 ? (
              <p className="text-sm text-slate-400">No hay eventos próximos</p>
            ) : (
              <div className="flex flex-col gap-2">
                {upcomingEvents.map((event) => {
                  const style = getCategoryStyle(event.category)
                  return (
                    <button
                      key={event.id}
                      onClick={() => handleEventClick(event)}
                      className={`text-left p-3 rounded-xl transition-colors hover:opacity-90 ${style.lightBg}`}
                    >
                      {event.category && (
                        <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full mb-1 ${style.bg} ${style.text}`}>
                          {event.category}
                        </span>
                      )}
                      <p className={`text-sm font-medium truncate ${style.lightText}`}>
                        {event.title}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {format(parseISO(event.event_date), "EEE d MMM · HH:mm", { locale: es })}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Aviso: {event.reminder_value}{' '}
                        {event.reminder_unit === 'days' ? 'día(s)' : 'hora(s)'} antes
                      </p>
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-4">
            <h2 className="text-sm font-semibold text-slate-700 mb-3">Por categoría</h2>
            {usedCategories.length === 0 ? (
              <p className="text-sm text-slate-400">Sin categorías aún</p>
            ) : (
              <div className="flex flex-col gap-1.5">
                {usedCategories.map((cat) => {
                  const style = getCategoryStyle(cat)
                  const count = events.filter((e) => e.category === cat).length
                  return (
                    <button
                      key={cat}
                      onClick={() => setActiveFilter(activeFilter === cat ? null : cat)}
                      className={`flex items-center justify-between px-3 py-1.5 rounded-lg text-sm transition-all ${
                        activeFilter === cat
                          ? `${style.bg} ${style.text}`
                          : `${style.lightBg} ${style.lightText} hover:opacity-80`
                      }`}
                    >
                      <span className="font-medium">{cat}</span>
                      <span className="text-xs opacity-70">{count}</span>
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-4">
            <h2 className="text-sm font-semibold text-slate-700 mb-1">Total de eventos</h2>
            <p className="text-3xl font-bold text-blue-600">
              {activeFilter ? filteredEvents.length : events.length}
            </p>
            {activeFilter && (
              <p className="text-xs text-slate-400 mt-0.5">de {events.length} totales</p>
            )}
          </div>
        </aside>
      </main>

      <EventModal
        isOpen={modalOpen}
        selectedDate={selectedDate}
        event={selectedEvent}
        onClose={() => {
          setModalOpen(false)
          setSelectedEvent(null)
          setSelectedDate(undefined)
        }}
        onSave={handleSave}
        onDelete={handleDelete}
      />
    </div>
  )
}
