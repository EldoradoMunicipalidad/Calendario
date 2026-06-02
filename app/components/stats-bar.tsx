"use client"

import type { Evento } from "@/lib/types"

interface StatsBarProps {
  eventos: Evento[]
  backend: "firebase" | "localstorage"
}

export function StatsBar({ eventos, backend }: StatsBarProps) {
  const listo = eventos.filter(e => e.estado === "LISTO").length
  const gest = eventos.filter(e => e.estado === "GESTIONANDO").length
  const agenda = eventos.filter(e => e.estado === "AGENDADO").length
  const susp = eventos.filter(e => e.estado === "SUSPENDIDO").length

  return (
    <div className="flex gap-2 flex-wrap mb-3 items-center">
      <Stat value={listo} label="Listos" color="text-green-700 dark:text-green-400" />
      <Stat value={gest} label="Gestionando" color="text-amber-700 dark:text-amber-400" />
      <Stat value={agenda} label="Agendados" color="text-blue-700 dark:text-blue-400" />
      <Stat value={susp} label="Suspendidos" color="text-red-700 dark:text-red-400" />
      <Stat value={eventos.length} label="Total" color="text-foreground" />
      <div className="ml-auto text-[10px] text-muted-foreground">
        {backend === "firebase" ? (
          <span className="text-green-600 dark:text-green-400">● Firebase</span>
        ) : (
          <span className="text-amber-600 dark:text-amber-400">● LocalStorage</span>
        )}
      </div>
    </div>
  )
}

function Stat({ value, label, color }: { value: number; label: string; color: string }) {
  return (
    <div className="bg-muted rounded-md px-3 py-1.5 flex items-center gap-1.5 text-xs text-muted-foreground">
      <strong className={`text-sm font-medium ${color}`}>{value}</strong>
      {label}
    </div>
  )
}
