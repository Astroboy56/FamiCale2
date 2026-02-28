"use client"

import { useEffect, useState } from "react"
import { format, isToday } from "date-fns"
import { ja } from "date-fns/locale"
import { X, Plus, Clock, Bell } from "lucide-react"
import type { CalendarEvent, FamilyMember } from "@/lib/firebase"

interface DayDetailSheetProps {
  isOpen: boolean
  date: Date | null
  events: CalendarEvent[]
  members: FamilyMember[]
  onClose: () => void
  onEventClick: (event: CalendarEvent) => void
  onAddEvent: (date: Date) => void
}

export function DayDetailSheet({ isOpen, date, events, members, onClose, onEventClick, onAddEvent }: DayDetailSheetProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (isOpen) {
      requestAnimationFrame(() => setIsVisible(true))
    } else {
      setIsVisible(false)
    }
  }, [isOpen])

  if (!isOpen || !date) return null

  const dateStr = format(date, "yyyy-MM-dd")
  const dayEvents = events
    .filter((e) => e.date === dateStr)
    .sort((a, b) => a.startTime.localeCompare(b.startTime))

  function getMemberColor(memberId: string): string {
    return members.find((m) => m.id === memberId)?.color || "#94a3b8"
  }

  function getMemberName(memberId: string): string {
    return members.find((m) => m.id === memberId)?.name || ""
  }

  function handleClose() {
    setIsVisible(false)
    setTimeout(onClose, 200)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end md:hidden" role="dialog" aria-modal="true" aria-label="日の詳細">
      <div
        className={`absolute inset-0 bg-foreground/25 backdrop-blur-[2px] transition-opacity duration-200 ${isVisible ? "opacity-100" : "opacity-0"}`}
        onClick={handleClose}
      />
      <div
        className={`relative z-10 w-full max-h-[70vh] overflow-y-auto rounded-t-2xl bg-card shadow-2xl transition-transform duration-200 ease-out ${
          isVisible ? "translate-y-0" : "translate-y-full"
        }`}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-2">
          <div className="h-1 w-10 rounded-full bg-border" />
        </div>

        <div className="flex items-center justify-between px-5 pt-3 pb-2">
          <div className="flex items-center gap-2">
            <span className={`text-lg font-bold ${isToday(date) ? "text-primary" : "text-foreground"}`}>
              {format(date, "M月d日 (EEE)", { locale: ja })}
            </span>
            {isToday(date) && (
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                TODAY
              </span>
            )}
          </div>
          <button onClick={handleClose} className="rounded-full p-2 text-muted-foreground active:bg-secondary" aria-label="閉じる">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex flex-col gap-2 px-5 pb-5 safe-bottom">
          {dayEvents.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">この日の予定はありません</p>
          ) : (
            dayEvents.map((event) => {
              const color = getMemberColor(event.memberId)
              return (
                <button
                  key={event.id}
                  onClick={() => {
                    handleClose()
                    setTimeout(() => onEventClick(event), 250)
                  }}
                  className="flex items-start gap-3 rounded-xl bg-secondary p-3.5 text-left active:bg-muted transition-colors"
                  style={{ borderLeft: `3px solid ${color}` }}
                >
                  <div className="flex flex-1 flex-col gap-0.5">
                    <span className="text-sm font-semibold text-foreground">{event.title}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-medium" style={{ color }}>
                        {getMemberName(event.memberId)}
                      </span>
                      <div className="flex items-center gap-0.5 text-[11px] text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {event.startTime} - {event.endTime}
                      </div>
                    </div>
                    {event.description && (
                      <span className="mt-0.5 text-[11px] text-muted-foreground">{event.description}</span>
                    )}
                  </div>
                  {event.reminder && <Bell className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-primary" />}
                </button>
              )
            })
          )}

          <button
            onClick={() => {
              handleClose()
              setTimeout(() => onAddEvent(date), 250)
            }}
            className="flex items-center justify-center gap-1.5 rounded-xl border border-dashed border-border py-3 text-sm font-medium text-muted-foreground active:bg-secondary"
          >
            <Plus className="h-4 w-4" />
            予定を追加
          </button>
        </div>
      </div>
    </div>
  )
}
