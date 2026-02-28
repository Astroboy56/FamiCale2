"use client"

import { format } from "date-fns"
import { ja } from "date-fns/locale"
import { ChevronLeft, ChevronRight } from "lucide-react"

type ViewMode = "month" | "week"

interface CalendarHeaderProps {
  currentDate: Date
  viewMode: ViewMode
  onPrev: () => void
  onNext: () => void
  onToday: () => void
  onViewModeChange: (mode: ViewMode) => void
}

export function CalendarHeader({
  currentDate,
  viewMode,
  onPrev,
  onNext,
  onToday,
  onViewModeChange,
}: CalendarHeaderProps) {
  const title =
    viewMode === "month"
      ? format(currentDate, "yyyy年 M月", { locale: ja })
      : format(currentDate, "M月", { locale: ja })

  return (
    <header className="flex items-center justify-between bg-card px-3 py-2.5 border-b border-border safe-top">
      {/* Left: nav */}
      <div className="flex items-center gap-0.5">
        <button
          onClick={onPrev}
          className="rounded-full p-2 text-muted-foreground active:bg-secondary"
          aria-label="前へ"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          onClick={onToday}
          className="px-1 text-base font-bold text-foreground tracking-tight active:opacity-70"
        >
          {title}
        </button>
        <button
          onClick={onNext}
          className="rounded-full p-2 text-muted-foreground active:bg-secondary"
          aria-label="次へ"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* Right: view toggle */}
      <div className="flex rounded-full bg-secondary p-0.5">
        <button
          onClick={() => onViewModeChange("month")}
          className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
            viewMode === "month"
              ? "bg-card text-foreground shadow-sm"
              : "text-muted-foreground"
          }`}
        >
          月
        </button>
        <button
          onClick={() => onViewModeChange("week")}
          className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
            viewMode === "week"
              ? "bg-card text-foreground shadow-sm"
              : "text-muted-foreground"
          }`}
        >
          週
        </button>
      </div>
    </header>
  )
}
