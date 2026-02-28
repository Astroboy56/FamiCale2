"use client"

import { useState, useEffect } from "react"
import { X, Plus, Pencil, Trash2, Check } from "lucide-react"
import type { FamilyMember } from "@/lib/firebase"

const PRESET_COLORS = [
  "#3B82F6", // blue
  "#EC4899", // pink
  "#10B981", // emerald
  "#F59E0B", // amber
  "#8B5CF6", // violet
  "#EF4444", // red
  "#06B6D4", // cyan
  "#F97316", // orange
]

interface MemberManagerProps {
  isOpen: boolean
  onClose: () => void
  members: FamilyMember[]
  onAdd: (member: Omit<FamilyMember, "id">) => void
  onUpdate: (id: string, data: Partial<Omit<FamilyMember, "id">>) => void
  onDelete: (id: string) => void
}

export function MemberManager({ isOpen, onClose, members, onAdd, onUpdate, onDelete }: MemberManagerProps) {
  const [newName, setNewName] = useState("")
  const [newColor, setNewColor] = useState(PRESET_COLORS[0])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState("")
  const [editColor, setEditColor] = useState("")
  const [isVisible, setIsVisible] = useState(false)

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
    <div className="fixed inset-0 z-50 flex items-end md:items-center md:justify-center" role="dialog" aria-modal="true" aria-label="メンバー管理">
      <div
        className={`absolute inset-0 bg-foreground/25 backdrop-blur-[2px] transition-opacity duration-200 ${isVisible ? "opacity-100" : "opacity-0"}`}
        onClick={handleClose}
      />
      <div
        className={`relative z-10 w-full max-h-[85vh] overflow-y-auto rounded-t-2xl md:rounded-2xl md:mx-4 md:max-w-md bg-card shadow-2xl transition-transform duration-200 ease-out ${
          isVisible ? "translate-y-0" : "translate-y-full md:translate-y-4"
        }`}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-2 pb-0 md:hidden">
          <div className="h-1 w-10 rounded-full bg-border" />
        </div>

        <div className="px-5 pt-3 pb-2 flex items-center justify-between">
          <h2 className="text-lg font-bold text-foreground">家族メンバー</h2>
          <button
            onClick={handleClose}
            className="rounded-full p-2 text-muted-foreground active:bg-secondary"
            aria-label="閉じる"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-5 pb-5 safe-bottom">
          {/* Members list */}
          <div className="mb-4 flex flex-col gap-2">
            {members.map((member) => (
              <div key={member.id} className="flex items-center gap-3 rounded-xl bg-secondary p-3">
                {editingId === member.id ? (
                  <>
                    <div className="flex flex-1 flex-col gap-2.5">
                      <div className="flex flex-wrap gap-2">
                        {PRESET_COLORS.map((color) => (
                          <button
                            key={color}
                            type="button"
                            onClick={() => setEditColor(color)}
                            className={`h-7 w-7 rounded-full active:scale-95 ${
                              editColor === color ? "ring-2 ring-offset-1" : ""
                            }`}
                            style={{ backgroundColor: color, ringColor: color }}
                            aria-label={`色を選択: ${color}`}
                          />
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <input
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/20"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === "Enter") saveEdit()
                            if (e.key === "Escape") setEditingId(null)
                          }}
                        />
                        <button
                          onClick={saveEdit}
                          className="rounded-lg bg-primary p-2 text-primary-foreground active:opacity-90"
                          aria-label="保存"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="rounded-lg p-2 text-muted-foreground active:bg-muted"
                          aria-label="キャンセル"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <span
                      className="h-5 w-5 flex-shrink-0 rounded-full"
                      style={{ backgroundColor: member.color }}
                    />
                    <span className="flex-1 text-sm font-semibold text-foreground">{member.name}</span>
                    <button
                      onClick={() => startEdit(member)}
                      className="rounded-lg p-2 text-muted-foreground active:bg-muted"
                      aria-label={`${member.name}を編集`}
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onDelete(member.id)}
                      className="rounded-lg p-2 text-muted-foreground active:bg-destructive/10 active:text-destructive"
                      aria-label={`${member.name}を削除`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </>
                )}
              </div>
            ))}

            {members.length === 0 && (
              <p className="py-6 text-center text-sm text-muted-foreground">
                メンバーがいません
              </p>
            )}
          </div>

          {/* Add new member */}
          <form onSubmit={handleAdd} className="flex flex-col gap-3 rounded-xl border border-dashed border-border p-4">
            <p className="text-sm font-semibold text-foreground">メンバーを追加</p>
            <div className="flex flex-wrap gap-2">
              {PRESET_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setNewColor(color)}
                  className={`h-8 w-8 rounded-full active:scale-95 ${
                    newColor === color ? "ring-2 ring-offset-2" : ""
                  }`}
                  style={{ backgroundColor: color, ringColor: color }}
                  aria-label={`色を選択: ${color}`}
                />
              ))}
            </div>
            <div className="flex gap-2">
              <input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="名前を入力"
                className="flex-1 rounded-xl border border-input bg-background px-4 py-3 text-base text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/20"
              />
              <button
                type="submit"
                disabled={!newName.trim()}
                className="flex items-center gap-1 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground active:opacity-90 disabled:opacity-40"
              >
                <Plus className="h-4 w-4" />
                追加
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
