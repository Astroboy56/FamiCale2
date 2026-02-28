"use client"

import { Calendar, ListTodo, Users, Plus } from "lucide-react"

export type TabId = "calendar" | "upcoming" | "members"

interface BottomNavProps {
  activeTab: TabId
  onTabChange: (tab: TabId) => void
  onAddEvent: () => void
}

export function BottomNav({ activeTab, onTabChange, onAddEvent }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-card safe-bottom" aria-label="メインナビゲーション">
      <div className="flex items-center justify-around px-2 pt-1.5 pb-1">
        <TabButton
          icon={<Calendar className="h-5 w-5" />}
          label="カレンダー"
          isActive={activeTab === "calendar"}
          onClick={() => onTabChange("calendar")}
        />
        <TabButton
          icon={<ListTodo className="h-5 w-5" />}
          label="予定一覧"
          isActive={activeTab === "upcoming"}
          onClick={() => onTabChange("upcoming")}
        />

        {/* Center FAB */}
        <div className="relative -mt-5">
          <button
            onClick={onAddEvent}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg active:scale-95 transition-transform"
            aria-label="予定を追加"
          >
            <Plus className="h-6 w-6" />
          </button>
        </div>

        <TabButton
          icon={<Users className="h-5 w-5" />}
          label="メンバー"
          isActive={activeTab === "members"}
          onClick={() => onTabChange("members")}
        />

        {/* Empty slot for balance */}
        <div className="w-14" />
      </div>
    </nav>
  )
}

function TabButton({
  icon,
  label,
  isActive,
  onClick,
}: {
  icon: React.ReactNode
  label: string
  isActive: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`flex w-14 flex-col items-center gap-0.5 py-1 transition-colors ${
        isActive ? "text-primary" : "text-muted-foreground"
      }`}
      aria-current={isActive ? "page" : undefined}
    >
      {icon}
      <span className="text-[10px] font-medium">{label}</span>
    </button>
  )
}
