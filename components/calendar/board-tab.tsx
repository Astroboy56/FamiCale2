"use client"

import { useState } from "react"
import { Pencil, Trash2, Check, X, Send } from "lucide-react"
import { format } from "date-fns"
import { ja } from "date-fns/locale"
import type { FamilyMember } from "@/lib/firebase"
import type { BoardMemo } from "@/lib/firebase"

interface BoardTabProps {
  memos: BoardMemo[]
  members: FamilyMember[]
  onAdd: (data: { content: string; memberId: string }) => void
  onUpdate: (id: string, data: { content: string }) => void
  onDelete: (id: string) => void
}

export function BoardTab({ memos, members, onAdd, onUpdate, onDelete }: BoardTabProps) {
  const [newContent, setNewContent] = useState("")
  const [selectedMemberId, setSelectedMemberId] = useState<string>(members[0]?.id ?? "")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editContent, setEditContent] = useState("")

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault()
    const content = newContent.trim()
    if (!content || members.length === 0) return
    const memberId = selectedMemberId || members[0]?.id
    if (!memberId) return
    onAdd({ content, memberId })
    setNewContent("")
  }

  const startEdit = (memo: BoardMemo) => {
    setEditingId(memo.id)
    setEditContent(memo.content)
  }

  const saveEdit = () => {
    if (!editingId || !editContent.trim()) return
    onUpdate(editingId, { content: editContent.trim() })
    setEditingId(null)
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditContent("")
  }

  const getMemberName = (memberId: string) => members.find((m) => m.id === memberId)?.name ?? "不明"

  const getMemberColor = (memberId: string) => members.find((m) => m.id === memberId)?.color ?? "#94a3b8"

  return (
    <div className="flex flex-1 flex-col overflow-y-auto bg-background pb-28">
      <div className="px-4 pt-4 pb-2">
        <h2 className="text-base font-bold text-foreground">家族で共有するメモ</h2>
        <p className="text-xs text-muted-foreground mt-0.5">メンバー全員が閲覧・追記できます</p>
      </div>

      {/* Add memo form */}
      <form onSubmit={handleAdd} className="flex flex-col gap-3 px-4 py-3 border-b border-border bg-card/50">
        {members.length === 0 ? (
          <p className="text-sm text-muted-foreground">メンバーを追加してから共有ボードに投稿できます。</p>
        ) : (
          <>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">投稿者:</span>
              <select
                value={selectedMemberId || members[0]?.id}
                onChange={(e) => setSelectedMemberId(e.target.value)}
                className="rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/20"
              >
                {members.map((m) => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
            </div>
        <div className="flex gap-2">
          <textarea
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            placeholder="メモを書く…"
            rows={2}
            className="flex-1 resize-none rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/20"
          />
          <button
            type="submit"
            disabled={!newContent.trim()}
            className="self-end flex items-center gap-1 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground active:opacity-90 disabled:opacity-40"
            aria-label="投稿"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
          </>
        )}
      </form>

      {/* Memo list */}
      <div className="flex flex-col gap-2 px-4 pt-4">
        {memos.length === 0 && (
          <p className="py-8 text-center text-sm text-muted-foreground">
            まだメモがありません。上のフォームから投稿してください。
          </p>
        )}
        {memos.map((memo) => (
          <div key={memo.id} className="rounded-xl bg-card p-3 shadow-sm border border-border">
            {editingId === memo.id ? (
              <div className="flex flex-col gap-2">
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  rows={3}
                  className="w-full resize-none rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/20"
                  autoFocus
                />
                <div className="flex gap-2 justify-end">
                  <button
                    type="button"
                    onClick={cancelEdit}
                    className="rounded-lg p-2.5 text-muted-foreground active:bg-muted"
                    aria-label="キャンセル"
                  >
                    <X className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={saveEdit}
                    disabled={!editContent.trim()}
                    className="rounded-lg bg-primary p-2.5 text-primary-foreground active:opacity-90 disabled:opacity-40"
                    aria-label="保存"
                  >
                    <Check className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ) : (
              <>
                <p className="text-sm text-foreground whitespace-pre-wrap break-words">{memo.content}</p>
                <div className="mt-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className="h-5 w-5 flex-shrink-0 rounded-full"
                      style={{ backgroundColor: getMemberColor(memo.memberId) }}
                      aria-hidden
                    />
                    <span className="text-[11px] text-muted-foreground">
                      {getMemberName(memo.memberId)} · {format(new Date(memo.updatedAt), "M/d HH:mm", { locale: ja })}
                    </span>
                  </div>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => startEdit(memo)}
                      className="rounded-lg p-2 text-muted-foreground active:bg-muted"
                      aria-label="編集"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(memo.id)}
                      className="rounded-lg p-2 text-muted-foreground active:bg-destructive/10 active:text-destructive"
                      aria-label="削除"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
