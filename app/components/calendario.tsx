"use client"

import { useState, useMemo } from "react"
import type { Evento } from "@/lib/types"
import { Button } from "@/app/components/ui/button"
import { ChevronLeft, ChevronRight, CalendarDays, X } from "lucide-react"
import type { Filters } from "@/app/components/filter-bar"

const MONTHS = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
]
const DOW = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"]

const estadoColors: Record<string, string> = {
  LISTO: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100",
  GESTIONANDO: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100",
  AGENDADO: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100",
  SUSPENDIDO: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100",
}

interface CalendarioProps {
  eventos: Evento[]
  filters: Filters
}

export function Calendario({ eventos, filters }: CalendarioProps) {
  const today = new Date()
  const [calYear, setCalYear] = useState(today.getFullYear())
  const [calMonth, setCalMonth] = useState(today.getMonth())
  const [selectedDay, setSelectedDay] = useState<string | null>(null)
  const [popupDate, setPopupDate] = useState<string | null>(null)

  // Aplicar filtros
  const filtered = useMemo(() => {
    return eventos.filter((ev) => {
      if (filters.estado && ev.estado !== filters.estado) return false
      if (filters.prioridad && ev.prioridad !== filters.prioridad) return false
      if (filters.ambito && ev.ambito !== filters.ambito) return false
      if (filters.search) {
        const q = filters.search.toLowerCase()
        const match = ev.nombre.toLowerCase().includes(q) ||
          ev.contacto.toLowerCase().includes(q) ||
          ev.registro.toLowerCase().includes(q) ||
          ev.luces.toLowerCase().includes(q)
        if (!match) return false
      }
      return true
    })
  }, [eventos, filters])

  const eventosPorFecha = useMemo(() => {
    const map = new Map<string, Evento[]>()
    for (const ev of filtered) {
      const existing = map.get(ev.fecha) ?? []
      existing.push(ev)
      map.set(ev.fecha, existing)
    }
    return map
  }, [filtered])

  const changeMonth = (delta: number) => {
    let m = calMonth + delta
    let y = calYear
    if (m < 0) { m = 11; y-- }
    if (m > 11) { m = 0; y++ }
    setCalMonth(m)
    setCalYear(y)
    setSelectedDay(null)
  }

  const goToday = () => {
    setCalYear(today.getFullYear())
    setCalMonth(today.getMonth())
    setSelectedDay(today.toISOString().slice(0, 10))
  }

  const firstDay = new Date(calYear, calMonth, 1)
  let dow = firstDay.getDay()
  dow = dow === 0 ? 6 : dow - 1
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate()
  const totalCells = Math.ceil((dow + daysInMonth) / 7) * 7

  const cells = []
  const cursor = new Date(calYear, calMonth, 1 - dow)
  for (let i = 0; i < totalCells; i++) {
    const d = new Date(cursor)
    const isOtherMonth = d.getMonth() !== calMonth
    const isToday = d.toDateString() === today.toDateString()
    const ds = d.toISOString().slice(0, 10)
    const isSelected = ds === selectedDay
    const dayEvs = eventosPorFecha.get(ds) ?? []

    cells.push(
      <div
        key={i}
        onClick={() => {
          setSelectedDay(ds)
          setPopupDate(ds)
        }}
        className={`min-h-[72px] border rounded-md p-1 cursor-pointer transition-all ${
          isOtherMonth ? "opacity-30 bg-muted/20" : "bg-background hover:border-primary/50 hover:shadow-sm"
        } ${isToday ? "border-primary" : "border-border/50"} ${isSelected ? "ring-2 ring-primary/30" : ""}`}
      >
        <div className={`text-[11px] font-medium mb-0.5 flex items-center justify-between ${
          isToday ? "text-primary" : "text-foreground"
        }`}>
          <span>{d.getDate()}</span>
          {dayEvs.length > 0 && (
            <span className="text-[9px] text-muted-foreground bg-muted rounded-full px-1.5">{dayEvs.length}</span>
          )}
        </div>
        {dayEvs.slice(0, 2).map((ev) => (
          <div
            key={ev.id}
            className={`text-[9px] px-1 rounded-sm mb-[1px] truncate leading-4 ${estadoColors[ev.estado] || ""}`}
            title={ev.nombre}
          >
            {ev.nombre}
          </div>
        ))}
        {dayEvs.length > 2 && (
          <div className="text-[9px] text-muted-foreground pl-1">+{dayEvs.length - 2} más</div>
        )}
      </div>
    )
    cursor.setDate(cursor.getDate() + 1)
  }

  // Eventos del dia seleccionado
  const popupEvents = popupDate ? eventosPorFecha.get(popupDate) ?? [] : []

  return (
    <div>
      {/* Navegacion del calendario */}
      <div className="flex items-center gap-2 mb-3">
        <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => changeMonth(-1)}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="text-sm font-medium min-w-[160px] text-center text-foreground select-none">
          {MONTHS[calMonth]} {calYear}
        </span>
        <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => changeMonth(1)}>
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="sm" className="h-8" onClick={goToday}>
          <CalendarDays className="h-3.5 w-3.5 mr-1" /> Hoy
        </Button>
        <div className="flex-1" />
        <div className="text-xs text-muted-foreground">
          {filtered.length} de {eventos.length} eventos
        </div>
      </div>

      {/* Header dias de la semana */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {DOW.map((d) => (
          <div key={d} className="text-[11px] font-medium text-muted-foreground text-center py-1">{d}</div>
        ))}
      </div>

      {/* Grid de dias */}
      <div className="grid grid-cols-7 gap-1">
        {cells}
      </div>

      {/* Popup de eventos del dia */}
      {popupDate && popupEvents.length > 0 && (
        <div className="fixed inset-0 z-50 bg-black/20 flex items-start justify-center pt-[15vh] p-4"
          onClick={() => setPopupDate(null)}>
          <div
            className="bg-background border border-border rounded-lg shadow-lg w-full max-w-lg max-h-[60vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-3 border-b border-border sticky top-0 bg-background z-10">
              <h3 className="text-sm font-medium text-foreground">
                Eventos del {popupDate}
              </h3>
              <button className="text-muted-foreground hover:text-foreground" onClick={() => setPopupDate(null)}>
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="divide-y divide-border/50">
              {popupEvents.map((ev, i) => (
                <div key={ev.id} className="p-3 hover:bg-muted/30 transition-colors">
                  <div className="flex items-start gap-2">
                    <span className="text-xs text-muted-foreground w-6 flex-shrink-0 mt-0.5">{i + 1}.</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{ev.nombre || "—"}</p>
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-sm font-medium ${estadoColors[ev.estado] || ""}`}>
                          {ev.estado}
                        </span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-sm font-medium ${
                          ev.prioridad === "ALTA" ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100" :
                          ev.prioridad === "MEDIA" ? "bg-amber-100 text-amber-800" :
                          "bg-green-100 text-green-800"
                        }`}>
                          {ev.prioridad}
                        </span>
                        {ev.horario && (
                          <span className="text-[10px] text-muted-foreground px-1">{ev.horario}</span>
                        )}
                      </div>
                      <div className="text-[10px] text-muted-foreground mt-1 space-x-2">
                        {ev.contacto && <span>📞 {ev.contacto}</span>}
                        {ev.ambito && <span>📍 {ev.ambito}</span>}
                        {ev.traslado && <span>🚚 {ev.traslado}</span>}
                      </div>
                      <div className="text-[10px] text-muted-foreground mt-0.5 space-x-2 flex flex-wrap">
                        {ev.sonido && <span>🔊 {ev.sonido}</span>}
                        {ev.viandas && <span>🍽 {ev.viandas}</span>}
                        {ev.registro && <span>📋 {ev.registro}</span>}
                        {ev.luces && <span>💡 {ev.luces}</span>}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
