"use client"

import { format, isToday, isTomorrow, isBefore, startOfDay } from "date-fns"
import { ja } from "date-fns/locale"
import { Clock, Bell, CalendarDays } from "lucide-react"
import type { CalendarEvent, FamilyMember } from "@/lib/firebase"

interface UpcomingPanelProps {
  events: CalendarEvent[]
  members: FamilyMember[]
  onEventClick: (event: CalendarEvent) => void
}

export function UpcomingPanel({ events, members, onEventClick }: UpcomingPanelProps) {
  const today = startOfDay(new Date())
  const upcoming = events
    .filter((e) => !isBefore(new Date(e.date), today))
    .sort((a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime))
    .slice(0, 12)

  function getMemberColor(memberId: string): string {
    return members.find((m) => m.id === memberId)?.color || "#94a3b8"
  }

  function getMemberName(memberId: string): string {
    return members.find((m) => m.id === memberId)?.name || ""
  }

  function getDateLabel(dateStr: string): string {
    const date = new Date(dateStr)
    if (isToday(date)) return "今日"
    if (isTomorrow(date)) return "明日"
    return format(date, "M/d (EEE)", { locale: ja })
  }

  // Group events by date
  const grouped = upcoming.reduce<Record<string, CalendarEvent[]>>((acc, event) => {
    const label = getDateLabel(event.date)
    if (!acc[label]) acc[label] = []
    acc[label].push(event)
    return acc
  }, {})

  return (
    <div className="flex flex-1 flex-col overflow-y-auto bg-background">
      {/* Members summary */}
      <div className="flex gap-2 overflow-x-auto px-4 py-3 scrollbar-hide">
        {members.map((member) => {
          const count = events.filter(
            (e) => e.memberId === member.id && !isBefore(new Date(e.date), today)
          ).length
          return (
            <div
              key={member.id}
              className="flex flex-shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5"
              style={{ backgroundColor: `${member.color}12` }}
            >
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: member.color }}
              />
              <span className="text-xs font-medium text-foreground">{member.name}</span>
              <span className="text-[10px] text-muted-foreground">{count}</span>
            </div>
          )
        })}
      </div>

      {/* Events grouped by date */}
      <div className="flex flex-col gap-1 px-4 pb-24">
        {Object.entries(grouped).length === 0 && (
          <div className="flex flex-col items-center gap-3 py-12 text-center">
            <CalendarDays className="h-10 w-10 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">予定はありません</p>
          </div>
        )}
        {Object.entries(grouped).map(([dateLabel, dateEvents]) => (
          <div key={dateLabel}>
            <div className="sticky top-0 bg-background py-2">
              <span className={`text-xs font-bold ${dateLabel === "今日" ? "text-primary" : "text-muted-foreground"}`}>
                {dateLabel}
              </span>
            </div>
            <div className="flex flex-col gap-2">
              {dateEvents.map((event) => {
                const color = getMemberColor(event.memberId)
                return (
                  <button
                    key={event.id}
                    onClick={() => onEventClick(event)}
                    className="flex items-start gap-3 rounded-xl bg-card p-3 text-left shadow-sm active:bg-secondary transition-colors"
                    style={{ borderLeft: `3px solid ${color}` }}
                  >
                    <div className="flex flex-1 flex-col gap-0.5">
                      <span className="text-sm font-semibold text-foreground">{event.title}</span>
                      <div className="flex items-center gap-2">
                        <span
                          className="text-[11px] font-medium"
                          style={{ color }}
                        >
                          {getMemberName(event.memberId)}
                        </span>
                        <div className="flex items-center gap-0.5 text-[11px] text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {event.startTime} - {event.endTime}
                        </div>
                      </div>
                      {event.description && (
                        <span className="mt-0.5 text-[11px] text-muted-foreground line-clamp-1">
                          {event.description}
                        </span>
                      )}
                    </div>
                    {event.reminder && (
                      <Bell className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-primary" />
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
