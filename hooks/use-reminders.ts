"use client"

import { useEffect, useRef, useCallback } from "react"
import { toast } from "sonner"
import type { CalendarEvent, FamilyMember } from "@/lib/firebase"

export function useReminders(events: CalendarEvent[], members: FamilyMember[]) {
  const notifiedRef = useRef<Set<string>>(new Set())
  const permissionRef = useRef<NotificationPermission>("default")

  const requestPermission = useCallback(async () => {
    if (typeof window === "undefined" || !("Notification" in window)) return
    try {
      const perm = await Notification.requestPermission()
      permissionRef.current = perm
    } catch {
      // Notification API not available
    }
  }, [])

  useEffect(() => {
    requestPermission()
  }, [requestPermission])

  useEffect(() => {
    function getMemberName(memberId: string): string {
      const member = members.find((m) => m.id === memberId)
      return member?.name || ""
    }

    function checkReminders() {
      const now = new Date()
      events.forEach((event) => {
        if (!event.reminder) return
        const key = `${event.id}-${event.date}-${event.startTime}`
        if (notifiedRef.current.has(key)) return

        const [hours, minutes] = event.startTime.split(":").map(Number)
        const eventTime = new Date(`${event.date}T${event.startTime}:00`)
        const reminderTime = new Date(eventTime.getTime() - event.reminderMinutes * 60 * 1000)

        if (now >= reminderTime && now < eventTime) {
          notifiedRef.current.add(key)
          const memberName = getMemberName(event.memberId)
          const message = `${memberName}の「${event.title}」が${event.reminderMinutes}分後に始まります`

          // Show toast notification
          toast.info(message, {
            duration: 8000,
            description: `${event.startTime} - ${event.endTime}`,
          })

          // Show browser notification if permitted
          if (permissionRef.current === "granted" && typeof window !== "undefined" && "Notification" in window) {
            try {
              new Notification("家族カレンダー", {
                body: message,
                icon: "/icon.svg",
              })
            } catch {
              // Notification creation failed
            }
          }
        }
      })
    }

    const interval = setInterval(checkReminders, 30000) // Check every 30 seconds
    checkReminders() // Check immediately
    return () => clearInterval(interval)
  }, [events, members])

  return { requestPermission }
}
