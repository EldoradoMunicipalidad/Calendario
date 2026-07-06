"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import type { Evento } from "@/lib/types"

const COLLECTION = "eventos_logistica"
const LS_KEY = "logistica_eventos"
let nextId = Date.now()

type StorageBackend = "firebase" | "localstorage"

// Storage backend basado en localStorage (fallback cuando Firebase no está disponible)
function localStorageBackend() {
  const load = (): Evento[] => {
    try {
      const raw = localStorage.getItem(LS_KEY)
      if (raw) return JSON.parse(raw)
    } catch {}
    return []
  }

  const save = (eventos: Evento[]) => {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(eventos))
    } catch {}
  }

  const getAll = (): Evento[] => load()

  const add = (data: Omit<Evento, "id" | "createdAt" | "updatedAt">): string => {
    const eventos = load()
    const id = (nextId++).toString()
    const now = new Date().toISOString()
    eventos.push({ ...data, id, createdAt: now, updatedAt: now })
    save(eventos)
    return id
  }

  const update = (id: string, data: Partial<Evento>) => {
    const eventos = load()
    const idx = eventos.findIndex((e) => e.id === id)
    if (idx >= 0) {
      eventos[idx] = { ...eventos[idx], ...data, updatedAt: new Date().toISOString() }
      save(eventos)
    }
  }

  const remove = (id: string) => {
    const eventos = load().filter((e) => e.id !== id)
    save(eventos)
  }

  const seed = (data: Omit<Evento, "id" | "createdAt" | "updatedAt">[]) => {
    const eventos = load()
    if (eventos.length === 0) {
      const now = new Date().toISOString()
      const items = data.map((ev) => ({
        ...ev,
        id: (nextId++).toString(),
        createdAt: now,
        updatedAt: now,
      }))
      save(items)
      return items
    }
    return eventos
  }

  return { getAll, add, update, remove, seed }
}

export function useEventos() {
  const [eventos, setEventos] = useState<Evento[]>([])
  const [loading, setLoading] = useState(true)
  const [backend, setBackend] = useState<StorageBackend>("localstorage")
  const fbRef = useRef<any>(null)

  useEffect(() => {
    let cancelled = false
    let unsub: (() => void) | null = null

    async function init() {
      try {
        const { db } = await import("@/lib/firebase")
        const {
          collection,
          query,
          orderBy,
          onSnapshot,
          addDoc,
          updateDoc,
          deleteDoc,
          doc,
          writeBatch,
          Timestamp,
        } = await import("firebase/firestore")

        fbRef.current = { db, collection, query, orderBy, onSnapshot, addDoc, updateDoc, deleteDoc, doc, writeBatch, Timestamp }

        const q = query(collection(db, COLLECTION), orderBy("nombre"))
        unsub = onSnapshot(
          q,
          (snapshot: any) => {
            if (cancelled) return
            const items = snapshot.docs.map((d: any) => {
              const data = d.data()
              return {
                id: d.id,
                nombre: data.nombre ?? "",
                fecha: data.fecha ?? "",
                horario: data.horario ?? "",
                estado: data.estado ?? "LISTO",
                prioridad: data.prioridad ?? "MEDIA",
                ambito: data.ambito ?? "EXTERNO",
                traslado: data.traslado ?? "",
                registro: data.registro ?? "",
                contacto: data.contacto ?? "",
                sonido: data.sonido ?? "",
                viandas: data.viandas ?? "",
                sillas: data.sillas ?? "",
                mesas: data.mesas ?? "",
                gazebos: data.gazebos ?? "",
                tarimas: data.tarimas ?? "",
                gradas: data.gradas ?? "",
                banos: data.banos ?? "",
                luces: data.luces ?? "",
                luminarias: data.luminarias ?? "",
                transito: data.transito ?? "",
                ambulancia: data.ambulancia ?? "",
                contingencia: data.contingencia ?? "",
                ambiente: data.ambiente ?? "",
                autMunicipal: data.autMunicipal ?? "",
                autCde: data.autCde ?? "",
                autExpendio: data.autExpendio ?? "",
                planeta: data.planeta ?? "",
                createdAt: data.createdAt?.toDate?.()?.toISOString() ?? data.createdAt ?? undefined,
                updatedAt: data.updatedAt?.toDate?.()?.toISOString() ?? data.updatedAt ?? undefined,
              } as Evento
            })
            setEventos(items)
            setBackend("firebase")
            setLoading(false)
          },
          (error: any) => {
            console.warn("Firebase no disponible, usando localStorage:", error.message)
            fallbackToLocal()
          }
        )
      } catch (e: any) {
        console.warn("Firebase no disponible, usando localStorage:", e?.message)
        fallbackToLocal()
      }
    }

    function fallbackToLocal() {
      if (cancelled) return
      const local = localStorageBackend()
      const items = local.getAll()
      setEventos(items)
      setBackend("localstorage")
      setLoading(false)
    }

    init()

    return () => {
      cancelled = true
      if (unsub) unsub()
    }
  }, [])

  const addEvento = useCallback(async (data: Omit<Evento, "id" | "createdAt" | "updatedAt">) => {
    if (fbRef.current && backend === "firebase") {
      const { db, addDoc, collection, Timestamp } = fbRef.current
      const ref = await addDoc(collection(db, COLLECTION), {
        ...data,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      })
      return ref.id
    }
    const id = localStorageBackend().add(data)
    setEventos([...localStorageBackend().getAll()])
    return id
  }, [backend])

  const updateEvento = useCallback(async (id: string, data: Partial<Evento>) => {
    if (fbRef.current && backend === "firebase") {
      const { db, updateDoc, doc, Timestamp } = fbRef.current
      await updateDoc(doc(db, COLLECTION, id), { ...data, updatedAt: Timestamp.now() })
      return
    }
    localStorageBackend().update(id, data)
    // Refresh local state
    setEventos([...localStorageBackend().getAll()])
  }, [backend])

  const deleteEvento = useCallback(async (id: string) => {
    if (fbRef.current && backend === "firebase") {
      const { db, deleteDoc, doc } = fbRef.current
      await deleteDoc(doc(db, COLLECTION, id))
      return
    }
    localStorageBackend().remove(id)
    setEventos([...localStorageBackend().getAll()])
  }, [backend])

  const seedEventos = useCallback(async (eventosData: Omit<Evento, "id" | "createdAt" | "updatedAt">[]) => {
    if (fbRef.current && backend === "firebase") {
      const { db, writeBatch, doc, collection, Timestamp } = fbRef.current
      const batch = writeBatch(db)
      for (const ev of eventosData) {
        const ref = doc(collection(db, COLLECTION))
        batch.set(ref, { ...ev, createdAt: Timestamp.now(), updatedAt: Timestamp.now() })
      }
      await batch.commit()
      return
    }
    const local = localStorageBackend()
    local.seed(eventosData)
    setEventos([...local.getAll()])
  }, [backend])

  return { eventos, loading, backend, addEvento, updateEvento, deleteEvento, seedEventos }
}
