"use client"

import { useEffect, useState, useCallback } from "react"
import {
  isFirebaseConfigured,
  addMember,
  subscribeMemberChanges,
  updateMember,
  deleteMember,
  addEvent,
  subscribeEventChanges,
  updateEvent,
  deleteEvent,
  type FamilyMember,
  type CalendarEvent,
} from "@/lib/firebase"
import {
  localAddMember,
  localSubscribeMemberChanges,
  localUpdateMember,
  localDeleteMember,
  localAddEvent,
  localSubscribeEventChanges,
  localUpdateEvent,
  localDeleteEvent,
} from "@/lib/local-store"

const useFirebase = isFirebaseConfigured()

export function useMembers() {
  const [members, setMembers] = useState<FamilyMember[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let unsub: (() => void) | undefined
    if (useFirebase) {
      unsub = subscribeMemberChanges((data) => {
        setMembers(data)
        setLoading(false)
      })
    } else {
      unsub = localSubscribeMemberChanges((data) => {
        setMembers(data)
        setLoading(false)
      })
    }
    return () => unsub?.()
  }, [])

  const add = useCallback(async (member: Omit<FamilyMember, "id">) => {
    if (useFirebase) {
      return addMember(member)
    }
    return localAddMember(member)
  }, [])

  const update = useCallback(async (id: string, data: Partial<Omit<FamilyMember, "id">>) => {
    if (useFirebase) {
      return updateMember(id, data)
    }
    localUpdateMember(id, data)
  }, [])

  const remove = useCallback(async (id: string) => {
    if (useFirebase) {
      return deleteMember(id)
    }
    localDeleteMember(id)
  }, [])

  return { members, loading, add, update, remove }
}

export function useEvents() {
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let unsub: (() => void) | undefined
    if (useFirebase) {
      unsub = subscribeEventChanges((data) => {
        setEvents(data)
        setLoading(false)
      })
    } else {
      unsub = localSubscribeEventChanges((data) => {
        setEvents(data)
        setLoading(false)
      })
    }
    return () => unsub?.()
  }, [])

  const add = useCallback(async (event: Omit<CalendarEvent, "id">) => {
    if (useFirebase) {
      return addEvent(event)
    }
    return localAddEvent(event)
  }, [])

  const update = useCallback(async (id: string, data: Partial<Omit<CalendarEvent, "id">>) => {
    if (useFirebase) {
      return updateEvent(id, data)
    }
    localUpdateEvent(id, data)
  }, [])

  const remove = useCallback(async (id: string) => {
    if (useFirebase) {
      return deleteEvent(id)
    }
    localDeleteEvent(id)
  }, [])

  return { events, loading, add, update, remove }
}
