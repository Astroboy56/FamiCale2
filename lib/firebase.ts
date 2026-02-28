import { initializeApp, getApps } from "firebase/app"
import {
  getFirestore,
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  query,
  orderBy,
  onSnapshot,
  type Unsubscribe,
} from "firebase/firestore"

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]
const db = getFirestore(app)

export type FamilyMember = {
  id: string
  name: string
  color: string
}

export type CalendarEvent = {
  id: string
  title: string
  description: string
  date: string
  startTime: string
  endTime: string
  memberId: string
  reminder: boolean
  reminderMinutes: number
}

// Check if Firebase is configured
export function isFirebaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
  )
}

// Family Members
export async function addMember(member: Omit<FamilyMember, "id">): Promise<string> {
  const docRef = await addDoc(collection(db, "members"), member)
  return docRef.id
}

export async function getMembers(): Promise<FamilyMember[]> {
  const q = query(collection(db, "members"), orderBy("name"))
  const snapshot = await getDocs(q)
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as FamilyMember)
}

export function subscribeMemberChanges(callback: (members: FamilyMember[]) => void): Unsubscribe {
  const q = query(collection(db, "members"), orderBy("name"))
  return onSnapshot(q, (snapshot) => {
    const members = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as FamilyMember)
    callback(members)
  })
}

export async function updateMember(id: string, data: Partial<Omit<FamilyMember, "id">>): Promise<void> {
  await updateDoc(doc(db, "members", id), data)
}

export async function deleteMember(id: string): Promise<void> {
  await deleteDoc(doc(db, "members", id))
}

// Events
export async function addEvent(event: Omit<CalendarEvent, "id">): Promise<string> {
  const docRef = await addDoc(collection(db, "events"), event)
  return docRef.id
}

export async function getEvents(): Promise<CalendarEvent[]> {
  const q = query(collection(db, "events"), orderBy("date"))
  const snapshot = await getDocs(q)
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as CalendarEvent)
}

export function subscribeEventChanges(callback: (events: CalendarEvent[]) => void): Unsubscribe {
  const q = query(collection(db, "events"), orderBy("date"))
  return onSnapshot(q, (snapshot) => {
    const events = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as CalendarEvent)
    callback(events)
  })
}

export async function updateEvent(id: string, data: Partial<Omit<CalendarEvent, "id">>): Promise<void> {
  await updateDoc(doc(db, "events", id), data)
}

export async function deleteEvent(id: string): Promise<void> {
  await deleteDoc(doc(db, "events", id))
}

export { db }
