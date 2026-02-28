"use client"

import { useState, useEffect, useRef } from "react"
import { format } from "date-fns"
import { X, Trash2, Bell, BellOff, Clock, GripHorizontal } from "lucide-react"
import type { CalendarEvent, FamilyMember } from "@/lib/firebase"

interface EventModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (event: Omit<CalendarEvent, "id">) => void
  onUpdate: (id: string, event: Partial<Omit<CalendarEvent, "id">>) => void
  onDelete: (id: string) => void
  event: CalendarEvent | null
  selectedDate: Date | null
  members: FamilyMember[]
}

export function EventModal({
  isOpen,
  onClose,
  onSave,
  onUpdate,
  onDelete,
  event,
  selectedDate,
  members,
}: EventModalProps) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [date, setDate] = useState("")
  const [startTime, setStartTime] = useState("09:00")
  const [endTime, setEndTime] = useState("10:00")
  const [memberId, setMemberId] = useState("")
  const [reminder, setReminder] = useState(true)
  const [reminderMinutes, setReminderMinutes] = useState(30)
  const [isVisible, setIsVisible] = useState(false)
  const sheetRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (event) {
      setTitle(event.title)
      setDescription(event.description)
      setDate(event.date)
      setStartTime(event.startTime)
      setEndTime(event.endTime)
      setMemberId(event.memberId)
      setReminder(event.reminder)
      setReminderMinutes(event.reminderMinutes)
    } else {
      setTitle("")
      setDescription("")
      setDate(selectedDate ? format(selectedDate, "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd"))
      setStartTime("09:00")
      setEndTime("10:00")
      setMemberId(members[0]?.id || "")
      setReminder(true)
      setReminderMinutes(30)
    }
  }, [event, selectedDate, members])

  useEffect(() => {
    if (isOpen) {
      requestAnimationFrame(() => setIsVisible(true))
    } else {
      setIsVisible(false)
    }
  }, [isOpen])

  if (!isOpen) return null

  function handleClose() {
    setIsVisible(false)
    setTimeout(onClose, 200)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim() || !memberId) return

    const data = {
      title: title.trim(),
      description: description.trim(),
      date,
      startTime,
      endTime,
      memberId,
      reminder,
      reminderMinutes: reminder ? reminderMinutes : 0,
    }

    if (event) {
      onUpdate(event.id, data)
    } else {
      onSave(data)
    }
    handleClose()
  }

  function handleDelete() {
    if (event) {
      onDelete(event.id)
      handleClose()
    }
  }

  const selectedMember = members.find((m) => m.id === memberId)

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center md:justify-center" role="dialog" aria-modal="true" aria-label={event ? "予定を編集" : "予定を追加"}>
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-foreground/25 backdrop-blur-[2px] transition-opacity duration-200 ${isVisible ? "opacity-100" : "opacity-0"}`}
        onClick={handleClose}
      />

      {/* Bottom sheet on mobile, centered modal on desktop */}
      <div
        ref={sheetRef}
        className={`relative z-10 w-full max-h-[90vh] overflow-y-auto rounded-t-2xl md:rounded-2xl md:mx-4 md:max-w-md bg-card shadow-2xl transition-transform duration-200 ease-out ${
          isVisible ? "translate-y-0" : "translate-y-full md:translate-y-4"
        }`}
      >
        {/* Drag handle - mobile only */}
        <div className="flex justify-center pt-2 pb-0 md:hidden">
          <div className="h-1 w-10 rounded-full bg-border" />
        </div>

        <div className="px-5 pt-3 pb-2 flex items-center justify-between">
          <h2 className="text-lg font-bold text-foreground">
            {event ? "予定を編集" : "新しい予定"}
          </h2>
          <button
            onClick={handleClose}
            className="rounded-full p-2 text-muted-foreground active:bg-secondary"
            aria-label="閉じる"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 px-5 pb-5 safe-bottom">
          {/* Title */}
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="予定のタイトル"
            className="w-full rounded-xl border border-input bg-background px-4 py-3 text-base text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/20"
            required
            autoFocus
          />

          {/* Member chips */}
          <div className="flex flex-wrap gap-2">
            {members.map((member) => (
              <button
                key={member.id}
                type="button"
                onClick={() => setMemberId(member.id)}
                className={`flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium transition-all active:scale-95 ${
                  memberId === member.id
                    ? "ring-2 ring-offset-1 shadow-sm"
                    : "opacity-50"
                }`}
                style={{
                  backgroundColor: `${member.color}18`,
                  color: member.color,
                  ringColor: memberId === member.id ? member.color : undefined,
                }}
              >
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: member.color }}
                />
                {member.name}
              </button>
            ))}
          </div>

          {/* Date */}
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full rounded-xl border border-input bg-background px-4 py-3 text-base text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/20"
            required
          />

          {/* Time row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
                <Clock className="h-3 w-3" />
                開始
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full rounded-xl border border-input bg-background px-4 py-3 text-base text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/20"
                required
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
                <Clock className="h-3 w-3" />
                終了
              </label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full rounded-xl border border-input bg-background px-4 py-3 text-base text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/20"
                required
              />
            </div>
          </div>

          {/* Memo */}
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="メモ（任意）"
            rows={2}
            className="w-full resize-none rounded-xl border border-input bg-background px-4 py-3 text-base text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/20"
          />

          {/* Reminder */}
          <div className="flex items-center justify-between rounded-xl bg-secondary px-4 py-3">
            <div className="flex items-center gap-2">
              {reminder ? (
                <Bell className="h-4 w-4 text-primary" />
              ) : (
                <BellOff className="h-4 w-4 text-muted-foreground" />
              )}
              <span className="text-sm font-medium text-foreground">リマインダー</span>
            </div>
            <div className="flex items-center gap-2">
              {reminder && (
                <select
                  value={reminderMinutes}
                  onChange={(e) => setReminderMinutes(Number(e.target.value))}
                  className="rounded-lg border border-input bg-background px-2 py-1 text-xs text-foreground"
                  aria-label="リマインダーの時間"
                >
                  <option value={5}>5分前</option>
                  <option value={10}>10分前</option>
                  <option value={15}>15分前</option>
                  <option value={30}>30分前</option>
                  <option value={60}>1時間前</option>
                  <option value={1440}>1日前</option>
                </select>
              )}
              <button
                type="button"
                onClick={() => setReminder(!reminder)}
                className={`relative h-7 w-12 rounded-full transition-colors ${
                  reminder ? "bg-primary" : "bg-muted"
                }`}
                role="switch"
                aria-checked={reminder}
                aria-label="リマインダーを切り替え"
              >
                <span
                  className={`absolute top-0.5 h-6 w-6 rounded-full bg-card shadow transition-transform ${
                    reminder ? "left-[22px]" : "left-0.5"
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 pt-1">
            {event && (
              <button
                type="button"
                onClick={handleDelete}
                className="flex items-center gap-1.5 rounded-xl border border-destructive/30 px-4 py-3 text-sm font-medium text-destructive active:bg-destructive/10"
              >
                <Trash2 className="h-4 w-4" />
                削除
              </button>
            )}
            <div className="flex-1" />
            <button
              type="button"
              onClick={handleClose}
              className="rounded-xl border border-border px-5 py-3 text-sm font-medium text-foreground active:bg-secondary"
            >
              キャンセル
            </button>
            <button
              type="submit"
              className="rounded-xl px-5 py-3 text-sm font-bold text-card shadow-sm active:opacity-90"
              style={{
                backgroundColor: selectedMember?.color || "var(--primary)",
              }}
            >
              {event ? "更新" : "追加"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
