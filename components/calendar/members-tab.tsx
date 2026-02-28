"use client"

import { useState } from "react"
import { Plus, Pencil, Trash2, Check, X } from "lucide-react"
import { isBefore, startOfDay } from "date-fns"
import type { FamilyMember, CalendarEvent } from "@/lib/firebase"

const PRESET_COLORS = [
  "#3B82F6", "#EC4899", "#10B981", "#F59E0B",
  "#8B5CF6", "#EF4444", "#06B6D4", "#F97316",
]

interface MembersTabProps {
  members: FamilyMember[]
  events: CalendarEvent[]
  onAdd: (member: Omit<FamilyMember, "id">) => void
  onUpdate: (id: string, data: Partial<Omit<FamilyMember, "id">>) => void
  onDelete: (id: string) => void
}

export function MembersTab({ members, events, onAdd, onUpdate, onDelete }: MembersTabProps) {
  const [newName, setNewName] = useState("")
  const [newColor, setNewColor] = useState(PRESET_COLORS[0])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState("")
  const [editColor, setEditColor] = useState("")

  const today = startOfDay(new Date())

  function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!newName.trim()) return
    onAdd({ name: newName.trim(), color: newColor })
    setNewName("")
    setNewColor(PRESET_COLORS[(members.length + 1) % PRESET_COLORS.length])
  }

  function startEdit(member: FamilyMember) {
    setEditingId(member.id)
    setEditName(member.name)
    setEditColor(member.color)
  }

  function saveEdit() {
    if (!editingId || !editName.trim()) return
    onUpdate(editingId, { name: editName.trim(), color: editColor })
    setEditingId(null)
  }

  return (
    <div className="flex flex-1 flex-col overflow-y-auto bg-background pb-24">
      <div className="px-4 pt-4 pb-2">
        <h2 className="text-base font-bold text-foreground">家族メンバー</h2>
      </div>

      <div className="flex flex-col gap-2 px-4">
        {members.map((member) => {
          const upcomingCount = events.filter(
            (e) => e.memberId === member.id && !isBefore(new Date(e.date), today)
          ).length

          return (
            <div key={member.id} className="rounded-xl bg-card p-3 shadow-sm">
              {editingId === member.id ? (
                <div className="flex flex-col gap-3">
                  <div className="flex flex-wrap gap-2">
                    {PRESET_COLORS.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setEditColor(color)}
                        className={`h-8 w-8 rounded-full active:scale-95 ${
                          editColor === color ? "ring-2 ring-offset-2" : ""
                        }`}
                        style={{ backgroundColor: color, ringColor: color }}
                        aria-label={`色を選択`}
                      />
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="flex-1 rounded-xl border border-input bg-background px-4 py-3 text-base text-foreground focus:outline-none focus:ring-2 focus:ring-ring/20"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === "Enter") saveEdit()
                        if (e.key === "Escape") setEditingId(null)
                      }}
                    />
                    <button
                      onClick={saveEdit}
                      className="rounded-xl bg-primary p-3 text-primary-foreground active:opacity-90"
                      aria-label="保存"
                    >
                      <Check className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="rounded-xl p-3 text-muted-foreground active:bg-muted"
                      aria-label="キャンセル"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <span
                    className="h-8 w-8 flex-shrink-0 rounded-full"
                    style={{ backgroundColor: member.color }}
                  />
                  <div className="flex flex-1 flex-col">
                    <span className="text-sm font-semibold text-foreground">{member.name}</span>
                    <span className="text-[11px] text-muted-foreground">
                      {upcomingCount > 0 ? `${upcomingCount}件の予定` : "予定なし"}
                    </span>
                  </div>
                  <button
                    onClick={() => startEdit(member)}
                    className="rounded-lg p-2.5 text-muted-foreground active:bg-muted"
                    aria-label={`${member.name}を編集`}
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => onDelete(member.id)}
                    className="rounded-lg p-2.5 text-muted-foreground active:bg-destructive/10 active:text-destructive"
                    aria-label={`${member.name}を削除`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          )
        })}

        {members.length === 0 && (
          <p className="py-8 text-center text-sm text-muted-foreground">
            メンバーを追加してください
          </p>
        )}
      </div>

      {/* Add form */}
      <form onSubmit={handleAdd} className="flex flex-col gap-3 px-4 pt-4">
        <p className="text-sm font-bold text-foreground">メンバーを追加</p>
        <div className="flex flex-wrap gap-2">
          {PRESET_COLORS.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => setNewColor(color)}
              className={`h-9 w-9 rounded-full active:scale-95 ${
                newColor === color ? "ring-2 ring-offset-2" : ""
              }`}
              style={{ backgroundColor: color, ringColor: color }}
              aria-label={`色を選択`}
            />
          ))}
        </div>
        <div className="flex gap-2">
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="名前を入力"
            className="flex-1 rounded-xl border border-input bg-card px-4 py-3 text-base text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/20"
          />
          <button
            type="submit"
            disabled={!newName.trim()}
            className="flex items-center gap-1 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-primary-foreground active:opacity-90 disabled:opacity-40"
          >
            <Plus className="h-4 w-4" />
            追加
          </button>
        </div>
      </form>
    </div>
  )
}
