// In-memory store for demo mode (when Firebase is not configured)
// This allows the app to work without Firebase for testing/demo purposes

import type { FamilyMember, CalendarEvent } from "./firebase"

let members: FamilyMember[] = [
  { id: "m1", name: "パパ", color: "#3B82F6" },
  { id: "m2", name: "ママ", color: "#EC4899" },
  { id: "m3", name: "太郎", color: "#10B981" },
  { id: "m4", name: "花子", color: "#F59E0B" },
]

let events: CalendarEvent[] = [
  {
    id: "e1",
    title: "家族ミーティング",
    description: "月初の家族会議",
    date: new Date().toISOString().split("T")[0],
    startTime: "19:00",
    endTime: "20:00",
    memberId: "m1",
    reminder: true,
    reminderMinutes: 30,
  },
  {
    id: "e2",
    title: "サッカー練習",
    description: "学校のグラウンドで",
    date: new Date(Date.now() + 86400000).toISOString().split("T")[0],
    startTime: "16:00",
    endTime: "18:00",
    memberId: "m3",
    reminder: true,
    reminderMinutes: 60,
  },
  {
    id: "e3",
    title: "ピアノレッスン",
    description: "山田先生のお宅",
    date: new Date(Date.now() + 86400000 * 2).toISOString().split("T")[0],
    startTime: "15:00",
    endTime: "16:00",
    memberId: "m4",
    reminder: true,
    reminderMinutes: 30,
  },
  {
    id: "e4",
    title: "買い物",
    description: "週末の食材",
    date: new Date(Date.now() + 86400000 * 3).toISOString().split("T")[0],
    startTime: "10:00",
    endTime: "12:00",
    memberId: "m2",
    reminder: false,
    reminderMinutes: 0,
  },
]

let nextMemberId = 5
let nextEventId = 5
let memberListeners: ((members: FamilyMember[]) => void)[] = []
let eventListeners: ((events: CalendarEvent[]) => void)[] = []

function notifyMemberListeners() {
  memberListeners.forEach((cb) => cb([...members]))
}

function notifyEventListeners() {
  eventListeners.forEach((cb) => cb([...events]))
}

// Members
export function localAddMember(member: Omit<FamilyMember, "id">): string {
  const id = `m${nextMemberId++}`
  members = [...members, { ...member, id }]
  notifyMemberListeners()
  return id
}

export function localGetMembers(): FamilyMember[] {
  return [...members]
}

export function localSubscribeMemberChanges(callback: (members: FamilyMember[]) => void): () => void {
  memberListeners.push(callback)
  callback([...members])
  return () => {
    memberListeners = memberListeners.filter((cb) => cb !== callback)
  }
}

export function localUpdateMember(id: string, data: Partial<Omit<FamilyMember, "id">>): void {
  members = members.map((m) => (m.id === id ? { ...m, ...data } : m))
  notifyMemberListeners()
}

export function localDeleteMember(id: string): void {
  members = members.filter((m) => m.id !== id)
  events = events.filter((e) => e.memberId !== id)
  notifyMemberListeners()
  notifyEventListeners()
}

// Events
export function localAddEvent(event: Omit<CalendarEvent, "id">): string {
  const id = `e${nextEventId++}`
  events = [...events, { ...event, id }]
  notifyEventListeners()
  return id
}

export function localGetEvents(): CalendarEvent[] {
  return [...events]
}

export function localSubscribeEventChanges(callback: (events: CalendarEvent[]) => void): () => void {
  eventListeners.push(callback)
  callback([...events])
  return () => {
    eventListeners = eventListeners.filter((cb) => cb !== callback)
  }
}

export function localUpdateEvent(id: string, data: Partial<Omit<CalendarEvent, "id">>): void {
  events = events.map((e) => (e.id === id ? { ...e, ...data } : e))
  notifyEventListeners()
}

export function localDeleteEvent(id: string): void {
  events = events.filter((e) => e.id !== id)
  notifyEventListeners()
}
