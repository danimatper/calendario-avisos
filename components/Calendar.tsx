'use client'

import { useState } from 'react'
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  getDay,
} from 'date-fns'
import { es } from 'date-fns/locale'
import type { Event } from '@/lib/supabase'
import { getCategoryStyle } from '@/lib/categories'

type Props = {
  events: Event[]
  onDayClick: (date: Date) => void
  onEventClick: (event: Event) => void
}

const WEEKDAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']

export default function Calendar({ events, onDayClick, onEventClick }: Props) {
  const [currentMonth, setCurrentMonth] = useState(new Date())

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd })

  const startPadding = (getDay(monthStart) + 6) % 7
  const today = new Date()

  function getEventsForDay(day: Date) {
    return events.filter((e) => isSameDay(new Date(e.event_date), day))
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
        <button
          onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          className="p-2 rounded-lg hover:bg-slate-100 transition-colors text-slate-600"
        >
          ‹
        </button>
        <h2 className="text-lg font-semibold text-slate-800 capitalize">
          {format(currentMonth, 'MMMM yyyy', { locale: es })}
        </h2>
        <button
          onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          className="p-2 rounded-lg hover:bg-slate-100 transition-colors text-slate-600"
        >
          ›
        </button>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 border-b border-slate-100">
        {WEEKDAYS.map((d) => (
          <div
            key={d}
            className="py-2 text-center text-xs font-medium text-slate-400 uppercase tracking-wide"
          >
            {d}
          </div>
        ))}
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7">
        {Array.from({ length: startPadding }).map((_, i) => (
          <div key={`pad-${i}`} className="h-28 border-b border-r border-slate-50" />
        ))}

        {days.map((day) => {
          const dayEvents = getEventsForDay(day)
          const isToday = isSameDay(day, today)
          const isCurrentMonth = isSameMonth(day, currentMonth)
          const colIndex = (getDay(day) + 6) % 7

          return (
            <div
              key={day.toISOString()}
              onClick={() => onDayClick(day)}
              className={`h-28 border-b border-r border-slate-50 p-1.5 cursor-pointer hover:bg-blue-50 transition-colors flex flex-col ${
                !isCurrentMonth ? 'opacity-40' : ''
              } ${colIndex === 6 ? 'border-r-0' : ''}`}
            >
              <span
                className={`text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full mb-1 ${
                  isToday ? 'bg-blue-600 text-white' : 'text-slate-700'
                }`}
              >
                {format(day, 'd')}
              </span>
              <div className="flex flex-col gap-0.5 overflow-hidden">
                {dayEvents.slice(0, 3).map((event) => {
                  const style = getCategoryStyle(event.category)
                  return (
                    <button
                      key={event.id}
                      onClick={(e) => {
                        e.stopPropagation()
                        onEventClick(event)
                      }}
                      className={`text-left text-xs rounded px-1.5 py-0.5 truncate transition-colors hover:opacity-80 ${style.lightBg} ${style.lightText}`}
                      title={event.title}
                    >
                      {event.category && (
                        <span className={`inline-block w-1.5 h-1.5 rounded-full mr-1 ${style.bg}`} />
                      )}
                      {event.title}
                    </button>
                  )
                })}
                {dayEvents.length > 3 && (
                  <span className="text-xs text-slate-400 px-1">
                    +{dayEvents.length - 3} más
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
