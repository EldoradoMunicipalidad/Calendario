"use client"

import type { EstadoEvento, Prioridad, Ambito } from "@/lib/types"
import { Search, X } from "lucide-react"

export interface Filters {
  estado: EstadoEvento | ""
  prioridad: Prioridad | ""
  ambito: Ambito | ""
  search: string
}

interface FilterBarProps {
  filters: Filters
  onChange: (filters: Filters) => void
  onPrint: () => void
}

const ESTADOS: { value: EstadoEvento | ""; label: string }[] = [
  { value: "", label: "Todos" },
  { value: "LISTO", label: "Listo" },
  { value: "GESTIONANDO", label: "Gestionando" },
  { value: "AGENDADO", label: "Agendado" },
  { value: "SUSPENDIDO", label: "Suspendido" },
]

const PRIORIDADES: { value: Prioridad | ""; label: string }[] = [
  { value: "", label: "Todas" },
  { value: "ALTA", label: "Alta" },
  { value: "MEDIA", label: "Media" },
  { value: "BAJA", label: "Baja" },
]

const AMBITOS: { value: Ambito | ""; label: string }[] = [
  { value: "", label: "Todos" },
  { value: "EXTERNO", label: "Externo" },
  { value: "INSTITUCIONAL", label: "Institucional" },
]

export function FilterBar({ filters, onChange, onPrint }: FilterBarProps) {
  const hasFilters = filters.estado || filters.prioridad || filters.ambito || filters.search

  return (
    <div className="flex items-center gap-2 flex-wrap mb-3">
      {/* Busqueda */}
      <div className="relative flex-1 min-w-[160px] max-w-[280px]">
        <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
        <input
          type="text"
          placeholder="Buscar evento..."
          className="w-full h-8 pl-7 pr-7 text-xs rounded-md border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          value={filters.search}
          onChange={(e) => onChange({ ...filters, search: e.target.value })}
        />
        {filters.search && (
          <button
            className="absolute right-1 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            onClick={() => onChange({ ...filters, search: "" })}
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Filtro Estado */}
      <select
        className="h-8 text-xs rounded-md border border-input bg-background text-foreground px-2 focus:outline-none focus:ring-1 focus:ring-ring"
        value={filters.estado}
        onChange={(e) => onChange({ ...filters, estado: e.target.value as any })}
      >
        {ESTADOS.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>

      {/* Filtro Prioridad */}
      <select
        className="h-8 text-xs rounded-md border border-input bg-background text-foreground px-2 focus:outline-none focus:ring-1 focus:ring-ring"
        value={filters.prioridad}
        onChange={(e) => onChange({ ...filters, prioridad: e.target.value as any })}
      >
        {PRIORIDADES.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>

      {/* Filtro Ambito */}
      <select
        className="h-8 text-xs rounded-md border border-input bg-background text-foreground px-2 focus:outline-none focus:ring-1 focus:ring-ring"
        value={filters.ambito}
        onChange={(e) => onChange({ ...filters, ambito: e.target.value as any })}
      >
        {AMBITOS.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>

      {/* Boton imprimir / PDF */}
      <button
        className="h-8 px-3 text-xs font-medium rounded-md border border-input bg-background text-foreground hover:bg-accent transition-colors flex items-center gap-1.5"
        onClick={onPrint}
        title="Imprimir / Exportar PDF"
      >
        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
        </svg>
        PDF
      </button>

      {/* Badge de filtros activos */}
      {hasFilters && (
        <button
          className="h-8 px-2 text-xs font-medium rounded-md bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
          onClick={() => onChange({ estado: "", prioridad: "", ambito: "", search: "" })}
        >
          <X className="h-3 w-3 inline-block mr-1" />
          Limpiar filtros
        </button>
      )}
    </div>
  )
}
