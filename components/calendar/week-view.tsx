"use client"

import { startOfWeek, addDays, format, isToday } from "date-fns"
import { ja } from "date-fns/locale"
import { useRef, useEffect } from "react"
import type { CalendarEvent, FamilyMember } from "@/lib/firebase"

interface WeekViewProps {
  currentDate: Date
  events: CalendarEvent[]
  members: FamilyMember[]
  onDateClick: (date: Date) => void
  onEventClick: (event: CalendarEvent) => void
}

const HOURS = Array.from({ length: 18 }, (_, i) => i + 5) // 5:00 - 22:00

export function WeekView({ currentDate, events, members, onDateClick, onEventClick }: WeekViewProps) {
  const weekStart = startOfWeek(currentDate, { locale: ja })
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))
  const scrollRef = useRef<HTMLDivElement>(null)

  // Scroll to current hour on mount
  useEffect(() => {
    if (scrollRef.current) {
      const currentHour = new Date().getHours()
      const offset = Math.max(0, (currentHour - 6) * 56)
      scrollRef.current.scrollTop = offset
    }
  }, [])

  function getMemberColor(memberId: string): string {
    return members.find((m) => m.id === memberId)?.color || "#94a3b8"
  }

  function getEventsForDay(date: Date): CalendarEvent[] {
    const dateStr = format(date, "yyyy-MM-dd")
    return events.filter((e) => e.date === dateStr)
  }

  function getEventPosition(event: CalendarEvent) {
    const [startH, startM] = event.startTime.split(":").map(Number)
    const [endH, endM] = event.endTime.split(":").map(Number)
    const startOffset = (startH - 5) * 56 + (startM / 60) * 56
    const duration = (endH - startH) * 56 + ((endM - startM) / 60) * 56
    return { top: Math.max(0, startOffset), height: Math.max(24, duration) }
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* Day header - scrollable horizontally on mobile */}
      <div className="overflow-x-auto scrollbar-hide">
        <div className="grid min-w-[540px] grid-cols-[44px_repeat(7,1fr)] border-b border-border bg-card">
          <div className="border-r border-border/60" />
          {weekDays.map((day) => {
            const today = isToday(day)
            const dayOfWeek = day.getDay()
            return (
              <button
                key={day.toISOString()}
                onClick={() => onDateClick(day)}
                className="flex flex-col items-center gap-0.5 border-r border-border/60 py-2 active:bg-secondary/50"
              >
                <span
                  className={`text-[10px] font-semibold ${
                    dayOfWeek === 0 ? "text-destructive" : dayOfWeek === 6 ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  {format(day, "EEE", { locale: ja })}
                </span>
                <span
                  className={`flex h-7 w-7 items-center justify-center rounded-full text-sm font-bold ${
                    today ? "bg-primary text-primary-foreground" : "text-foreground"
                  }`}
                >
                  {format(day, "d")}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Time grid - scrollable both directions */}
      <div ref={scrollRef} className="flex-1 overflow-auto">
        <div className="overflow-x-auto scrollbar-hide">
          <div
            className="relative grid min-w-[540px] grid-cols-[44px_repeat(7,1fr)]"
            style={{ minHeight: `${HOURS.length * 56}px` }}
          >
            {/* Time labels */}
            <div className="relative border-r border-border/60">
              {HOURS.map((hour) => (
                <div
                  key={hour}
                  className="absolute flex h-0 w-full items-center justify-end pr-1.5"
                  style={{ top: `${(hour - 5) * 56}px` }}
                >
                  <span className="text-[10px] tabular-nums text-muted-foreground">{`${hour}:00`}</span>
                </div>
              ))}
            </div>

            {/* Day columns */}
            {weekDays.map((day) => {
              const dayEvents = getEventsForDay(day)
              const today = isToday(day)
              return (
                <div
                  key={day.toISOString()}
                  className={`relative border-r border-border/60 ${today ? "bg-primary/[0.03]" : ""}`}
                >
                  {/* Hour lines */}
                  {HOURS.map((hour) => (
                    <div
                      key={hour}
                      className="absolute w-full border-t border-border/30"
                      style={{ top: `${(hour - 5) * 56}px`, height: "56px" }}
                    />
                  ))}

                  {/* Events */}
                  {dayEvents.map((event) => {
                    const pos = getEventPosition(event)
                    const color = getMemberColor(event.memberId)
                    return (
                      <button
                        key={event.id}
                        onClick={() => onEventClick(event)}
                        className="absolute inset-x-[2px] overflow-hidden rounded-md px-1 py-0.5 text-left active:opacity-80"
                        style={{
                          top: `${pos.top}px`,
                          height: `${pos.height}px`,
                          backgroundColor: `${color}20`,
                          borderLeft: `3px solid ${color}`,
                        }}
                      >
                        <p className="truncate text-[10px] font-bold text-foreground leading-tight">{event.title}</p>
                        <p className="truncate text-[9px] text-muted-foreground leading-tight">
                          {event.startTime}
                        </p>
                      </button>
                    )
                  })}
                </div>
              )
            })}

            {/* Current time indicator */}
            <CurrentTimeIndicator />
          </div>
        </div>
      </div>
    </div>
  )
}

function CurrentTimeIndicator() {
  const now = new Date()
  const hours = now.getHours()
  const minutes = now.getMinutes()

  if (hours < 5 || hours > 22) return null

  const top = (hours - 5) * 56 + (minutes / 60) * 56
  const todayIndex = now.getDay() // 0 = Sunday

  return (
    <div
      className="pointer-events-none absolute h-0.5 bg-destructive"
      style={{
        top: `${top}px`,
        left: `calc(44px + ${todayIndex} * ((100% - 44px) / 7))`,
        width: `calc((100% - 44px) / 7)`,
      }}
    >
      <div className="absolute -left-1 -top-[3px] h-2 w-2 rounded-full bg-destructive" />
    </div>
  )
}
