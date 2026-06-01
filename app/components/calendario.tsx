"use client"

import { useState, useMemo } from "react"
import type { Evento } from "@/lib/types"
import { Button } from "@/app/components/ui/button"
import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react"

const MONTHS = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
]
const DOW = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"]

interface CalendarioProps {
  eventos: Evento[]
}

export function Calendario({ eventos }: CalendarioProps) {
  const today = new Date()
  const [calYear, setCalYear] = useState(today.getFullYear())
  const [calMonth, setCalMonth] = useState(today.getMonth())

  const eventosPorFecha = useMemo(() => {
    const map = new Map<string, Evento[]>()
    for (const ev of eventos) {
      const existing = map.get(ev.fecha) ?? []
      existing.push(ev)
      map.set(ev.fecha, existing)
    }
    return map
  }, [eventos])

  const changeMonth = (delta: number) => {
    let m = calMonth + delta
    let y = calYear
    if (m < 0) { m = 11; y-- }
    if (m > 11) { m = 0; y++ }
    setCalMonth(m)
    setCalYear(y)
  }

  const goToday = () => {
    setCalYear(today.getFullYear())
    setCalMonth(today.getMonth())
  }

  const firstDay = new Date(calYear, calMonth, 1)
  let dow = firstDay.getDay()
  dow = dow === 0 ? 6 : dow - 1 // Monday = 0
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate()
  const totalCells = Math.ceil((dow + daysInMonth) / 7) * 7

  const cells = []
  const cursor = new Date(calYear, calMonth, 1 - dow)
  for (let i = 0; i < totalCells; i++) {
    const d = new Date(cursor)
    const isOtherMonth = d.getMonth() !== calMonth
    const isToday = d.toDateString() === today.toDateString()
    const ds = d.toISOString().slice(0, 10)
    const dayEvs = eventosPorFecha.get(ds) ?? []

    cells.push(
      <div
        key={i}
        className={`min-h-[72px] border border-border/50 rounded-md p-1 cursor-pointer transition-colors ${
          isOtherMonth ? "opacity-40 bg-muted/30" : "bg-background hover:border-primary/50"
        } ${isToday ? "border-primary" : ""}`}
      >
        <div className={`text-[11px] font-medium mb-0.5 ${isToday ? "text-primary" : "text-foreground"}`}>
          {d.getDate()}
        </div>
        {dayEvs.slice(0, 3).map((ev) => (
          <div
            key={ev.id}
            className={`text-[10px] px-1 rounded-sm mb-[1px] truncate leading-4 cursor-pointer ${
              ev.estado === "LISTO" ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100" :
              ev.estado === "GESTIONANDO" ? "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100" :
              ev.estado === "AGENDADO" ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100" :
              "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100"
            }`}
            title={ev.nombre}
          >
            {ev.nombre}
          </div>
        ))}
        {dayEvs.length > 3 && (
          <div className="text-[10px] text-muted-foreground">+{dayEvs.length - 3} más</div>
        )}
      </div>
    )
    cursor.setDate(cursor.getDate() + 1)
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => changeMonth(-1)}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="text-sm font-medium min-w-[140px] text-center text-foreground">
          {MONTHS[calMonth]} {calYear}
        </span>
        <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => changeMonth(1)}>
          <ChevronRight className="h-4 w-4" />
        </Button>
        <div className="flex-1" />
        <Button variant="outline" size="sm" className="h-8" onClick={goToday}>
          <CalendarDays className="h-3.5 w-3.5 mr-1" /> Hoy
        </Button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-1">
        {DOW.map((d) => (
          <div key={d} className="text-[11px] font-medium text-muted-foreground text-center py-1">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells}
      </div>
    </div>
  )
}
