"use client"

import { useState, useCallback } from "react"
import {
  addMonths,
  subMonths,
  addWeeks,
  subWeeks,
  startOfToday,
  format,
} from "date-fns"
import { toast } from "sonner"
import { CalendarHeader } from "@/components/calendar/calendar-header"
import { MonthView } from "@/components/calendar/month-view"
import { WeekView } from "@/components/calendar/week-view"
import { EventModal } from "@/components/calendar/event-modal"
import { UpcomingPanel } from "@/components/calendar/sidebar-panel"
import { BottomNav, type TabId } from "@/components/calendar/bottom-nav"
import { DayDetailSheet } from "@/components/calendar/day-detail-sheet"
import { MembersTab } from "@/components/calendar/members-tab"
import { BoardTab } from "@/components/calendar/board-tab"
import { useMembers, useEvents, useBoardMemos } from "@/hooks/use-calendar-data"
import { useReminders } from "@/hooks/use-reminders"
import { isFirebaseConfigured, getFirebaseConfigStatus } from "@/lib/firebase"
import type { CalendarEvent } from "@/lib/firebase"

type ViewMode = "month" | "week"

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(startOfToday())
  const [viewMode, setViewMode] = useState<ViewMode>("month")
  const [activeTab, setActiveTab] = useState<TabId>("calendar")
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const [showEventModal, setShowEventModal] = useState(false)
  const [showDayDetail, setShowDayDetail] = useState(false)
  const [dayDetailDate, setDayDetailDate] = useState<Date | null>(null)

  const { members, add: addMember, update: updateMember, remove: removeMember } = useMembers()
  const { events, add: addEvent, update: updateEvent, remove: removeEvent } = useEvents()
  const { memos: boardMemos, add: addBoardMemo, update: updateBoardMemo, remove: removeBoardMemo } = useBoardMemos()

  useReminders(events, members)

  const handlePrev = useCallback(() => {
    setCurrentDate((d) => (viewMode === "month" ? subMonths(d, 1) : subWeeks(d, 1)))
  }, [viewMode])

  const handleNext = useCallback(() => {
    setCurrentDate((d) => (viewMode === "month" ? addMonths(d, 1) : addWeeks(d, 1)))
  }, [viewMode])

  const handleToday = useCallback(() => {
    setCurrentDate(startOfToday())
  }, [])

  // On mobile: tap date -> show day detail sheet
  // On desktop: tap date -> open event modal directly
  const handleDateClick = useCallback((date: Date) => {
    const isMobile = window.innerWidth < 768
    if (isMobile) {
      setDayDetailDate(date)
      setShowDayDetail(true)
    } else {
      setSelectedDate(date)
      setSelectedEvent(null)
      setShowEventModal(true)
    }
  }, [])

  const handleEventClick = useCallback((event: CalendarEvent) => {
    setSelectedEvent(event)
    setSelectedDate(null)
    setShowEventModal(true)
  }, [])

  const handleAddEventForDate = useCallback((date: Date) => {
    setSelectedDate(date)
    setSelectedEvent(null)
    setShowEventModal(true)
  }, [])

  const handleSaveEvent = useCallback(
    async (data: Omit<CalendarEvent, "id">) => {
      try {
        await addEvent(data)
        toast.success("予定を追加しました")
      } catch (err) {
        toast.error(`保存に失敗しました: ${err instanceof Error ? err.message : String(err)}`)
      }
    },
    [addEvent]
  )

  const handleUpdateEvent = useCallback(
    async (id: string, data: Partial<Omit<CalendarEvent, "id">>) => {
      try {
        await updateEvent(id, data)
        toast.success("予定を更新しました")
      } catch (err) {
        toast.error(`更新に失敗しました: ${err instanceof Error ? err.message : String(err)}`)
      }
    },
    [updateEvent]
  )

  const handleDeleteEvent = useCallback(
    async (id: string) => {
      try {
        await removeEvent(id)
        toast.success("予定を削除しました")
      } catch (err) {
        toast.error(`削除に失敗しました: ${err instanceof Error ? err.message : String(err)}`)
      }
    },
    [removeEvent]
  )

  const handleAddMember = useCallback(
    async (data: { name: string; color: string }) => {
      try {
        await addMember(data)
        toast.success(`${data.name}を追加しました`)
      } catch (err) {
        toast.error(`追加に失敗しました: ${err instanceof Error ? err.message : String(err)}`)
      }
    },
    [addMember]
  )

  const handleUpdateMember = useCallback(
    async (id: string, data: Partial<{ name: string; color: string }>) => {
      try {
        await updateMember(id, data)
        toast.success("メンバーを更新しました")
      } catch (err) {
        toast.error(`更新に失敗しました: ${err instanceof Error ? err.message : String(err)}`)
      }
    },
    [updateMember]
  )

  const handleDeleteMember = useCallback(
    async (id: string) => {
      const member = members.find((m) => m.id === id)
      try {
        await removeMember(id)
        toast.success(`${member?.name || "メンバー"}を削除しました`)
      } catch (err) {
        toast.error(`削除に失敗しました: ${err instanceof Error ? err.message : String(err)}`)
      }
    },
    [removeMember, members]
  )

  const handleAddBoardMemo = useCallback(
    async (data: { content: string; memberId: string }) => {
      try {
        await addBoardMemo(data)
        toast.success("メモを投稿しました")
      } catch (err) {
        toast.error(`投稿に失敗しました: ${err instanceof Error ? err.message : String(err)}`)
      }
    },
    [addBoardMemo]
  )

  const handleUpdateBoardMemo = useCallback(
    async (id: string, data: { content: string }) => {
      try {
        await updateBoardMemo(id, data)
        toast.success("メモを更新しました")
      } catch (err) {
        toast.error(`更新に失敗しました: ${err instanceof Error ? err.message : String(err)}`)
      }
    },
    [updateBoardMemo]
  )

  const handleDeleteBoardMemo = useCallback(
    async (id: string) => {
      try {
        await removeBoardMemo(id)
        toast.success("メモを削除しました")
      } catch (err) {
        toast.error(`削除に失敗しました: ${err instanceof Error ? err.message : String(err)}`)
      }
    },
    [removeBoardMemo]
  )

  const isDemo = !isFirebaseConfigured()
  const configStatus = getFirebaseConfigStatus()

  return (
    <div className="flex h-[100dvh] flex-col bg-background">
      {/* Demo banner */}
      {isDemo && (
        <div className="flex flex-col items-center justify-center gap-0.5 bg-accent/60 px-4 py-2 safe-top">
          <span className="text-[11px] font-medium text-accent-foreground">
            デモモード - Firebase環境変数を設定するとリアルタイム同期が有効になります
          </span>
          <span className="text-[10px] text-accent-foreground/80">
            API_KEY: {configStatus.apiKey ? "設定済み" : "未設定"} / PROJECT_ID: {configStatus.projectId ? "設定済み" : "未設定"}
          </span>
        </div>
      )}

      {/* Calendar Tab */}
      {activeTab === "calendar" && (
        <>
          <CalendarHeader
            currentDate={currentDate}
            viewMode={viewMode}
            onPrev={handlePrev}
            onNext={handleNext}
            onToday={handleToday}
            onViewModeChange={setViewMode}
          />
          <main className="flex flex-1 flex-col overflow-hidden">
            {viewMode === "month" ? (
              <MonthView
                currentDate={currentDate}
                events={events}
                members={members}
                onDateClick={handleDateClick}
                onEventClick={handleEventClick}
              />
            ) : (
              <WeekView
                currentDate={currentDate}
                events={events}
                members={members}
                onDateClick={handleDateClick}
                onEventClick={handleEventClick}
              />
            )}
          </main>
        </>
      )}

      {/* Upcoming Tab */}
      {activeTab === "upcoming" && (
        <>
          <header className="flex items-center justify-between bg-card px-4 py-3 border-b border-border safe-top">
            <h1 className="text-lg font-bold text-foreground">予定一覧</h1>
            <span className="text-xs text-muted-foreground">{format(new Date(), "yyyy年M月d日")}</span>
          </header>
          <UpcomingPanel
            events={events}
            members={members}
            onEventClick={handleEventClick}
          />
        </>
      )}

      {/* Shared Board Tab */}
      {activeTab === "board" && (
        <>
          <header className="flex items-center bg-card px-4 py-3 border-b border-border safe-top">
            <h1 className="text-lg font-bold text-foreground">共有ボード</h1>
          </header>
          <BoardTab
            memos={boardMemos}
            members={members}
            onAdd={handleAddBoardMemo}
            onUpdate={handleUpdateBoardMemo}
            onDelete={handleDeleteBoardMemo}
          />
        </>
      )}

      {/* Members Tab */}
      {activeTab === "members" && (
        <>
          <header className="flex items-center bg-card px-4 py-3 border-b border-border safe-top">
            <h1 className="text-lg font-bold text-foreground">メンバー管理</h1>
          </header>
          <MembersTab
            members={members}
            events={events}
            onAdd={handleAddMember}
            onUpdate={handleUpdateMember}
            onDelete={handleDeleteMember}
          />
        </>
      )}

      {/* Bottom Navigation */}
      <BottomNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onAddEvent={() => {
          setSelectedEvent(null)
          setSelectedDate(new Date())
          setShowEventModal(true)
        }}
      />

      {/* Day Detail Sheet (mobile only) */}
      <DayDetailSheet
        isOpen={showDayDetail}
        date={dayDetailDate}
        events={events}
        members={members}
        onClose={() => setShowDayDetail(false)}
        onEventClick={handleEventClick}
        onAddEvent={handleAddEventForDate}
      />

      {/* Event Modal */}
      <EventModal
        isOpen={showEventModal}
        onClose={() => setShowEventModal(false)}
        onSave={handleSaveEvent}
        onUpdate={handleUpdateEvent}
        onDelete={handleDeleteEvent}
        event={selectedEvent}
        selectedDate={selectedDate}
        members={members}
      />
    </div>
  )
}
