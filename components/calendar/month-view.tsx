"use client"

import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameMonth,
  isToday,
} from "date-fns"
import { ja } from "date-fns/locale"
import type { CalendarEvent, FamilyMember } from "@/lib/firebase"

interface MonthViewProps {
  currentDate: Date
  events: CalendarEvent[]
  members: FamilyMember[]
  onDateClick: (date: Date) => void
  onEventClick: (event: CalendarEvent) => void
}

const WEEKDAYS = ["日", "月", "火", "水", "木", "金", "土"]

export function MonthView({ currentDate, events, members, onDateClick, onEventClick }: MonthViewProps) {
  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const calendarStart = startOfWeek(monthStart, { locale: ja })
  const calendarEnd = endOfWeek(monthEnd, { locale: ja })
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd })
  const weeks = Math.ceil(days.length / 7)

  function getMemberColor(memberId: string): string {
    return members.find((m) => m.id === memberId)?.color || "#94a3b8"
  }

  function getMemberName(memberId: string): string {
    return members.find((m) => m.id === memberId)?.name || ""
  }

  function getEventsForDay(date: Date): CalendarEvent[] {
    const dateStr = format(date, "yyyy-MM-dd")
    return events.filter((e) => e.date === dateStr)
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* Weekday header */}
      <div className="grid grid-cols-7 bg-card border-b border-border">
        {WEEKDAYS.map((day, i) => (
          <div
            key={day}
            className={`py-1.5 text-center text-[11px] font-semibold ${
              i === 0 ? "text-destructive" : i === 6 ? "text-primary" : "text-muted-foreground"
            }`}
          >
            {day}
          </div>
        ))}
      </div>

      {/* Days grid */}
      <div
        className="grid flex-1 grid-cols-7"
        style={{ gridTemplateRows: `repeat(${weeks}, minmax(0, 1fr))` }}
      >
        {days.map((day) => {
          const dayEvents = getEventsForDay(day)
          const isCurrentMonth = isSameMonth(day, currentDate)
          const today = isToday(day)
          const dayOfWeek = day.getDay()

          return (
            <button
              key={day.toISOString()}
              onClick={() => onDateClick(day)}
              className={`group relative flex flex-col items-center border-b border-r border-border/60 py-1 active:bg-primary/5 ${
                !isCurrentMonth ? "bg-muted/20" : "bg-card"
              }`}
              aria-label={format(day, "yyyy年M月d日", { locale: ja })}
            >
              {/* Date number */}
              <span
                className={`flex h-7 w-7 items-center justify-center rounded-full text-[13px] font-semibold ${
                  today
                    ? "bg-primary text-primary-foreground"
                    : !isCurrentMonth
                      ? "text-muted-foreground/40"
                      : dayOfWeek === 0
                        ? "text-destructive"
                        : dayOfWeek === 6
                          ? "text-primary"
                          : "text-foreground"
                }`}
              >
                {format(day, "d")}
              </span>

              {/* Event dots - mobile */}
              {dayEvents.length > 0 && (
                <div className="mt-0.5 flex items-center justify-center gap-[3px] md:hidden">
                  {dayEvents.slice(0, 3).map((event) => (
                    <span
                      key={event.id}
                      className="h-[5px] w-[5px] rounded-full"
                      style={{ backgroundColor: getMemberColor(event.memberId) }}
                    />
                  ))}
                  {dayEvents.length > 3 && (
                    <span className="text-[8px] leading-none text-muted-foreground">
                      {`+${dayEvents.length - 3}`}
                    </span>
                  )}
                </div>
              )}

              {/* Event labels - desktop */}
              <div className="mt-0.5 hidden w-full flex-col gap-px overflow-hidden px-0.5 md:flex">
                {dayEvents.slice(0, 2).map((event) => (
                  <div
                    key={event.id}
                    onClick={(e) => {
                      e.stopPropagation()
                      onEventClick(event)
                    }}
                    className="flex items-center gap-1 rounded px-1 py-px text-[10px] leading-tight hover:opacity-80 cursor-pointer"
                    style={{
                      backgroundColor: `${getMemberColor(event.memberId)}15`,
                      borderLeft: `2px solid ${getMemberColor(event.memberId)}`,
                    }}
                    role="button"
                    tabIndex={0}
                    aria-label={`${event.title} - ${getMemberName(event.memberId)}`}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.stopPropagation()
                        onEventClick(event)
                      }
                    }}
                  >
                    <span className="truncate text-foreground">{event.title}</span>
                  </div>
                ))}
                {dayEvents.length > 2 && (
                  <span className="px-1 text-[9px] text-muted-foreground">
                    {`+${dayEvents.length - 2}件`}
                  </span>
                )}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
