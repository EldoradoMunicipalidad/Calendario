"use client"

import { useState, useCallback, useEffect, useMemo } from "react"
import { useEventos } from "@/hooks/use-eventos"
import { Toolbar } from "@/app/components/toolbar"
import { StatsBar } from "@/app/components/stats-bar"
import { TablaExcel } from "@/app/components/tabla-excel"
import { Calendario } from "@/app/components/calendario"
import { FilterBar, type Filters } from "@/app/components/filter-bar"
import { toast } from "@/hooks/use-toast"
import { EVENTOS_COMPLETOS } from "@/lib/data"

const defaultFilters: Filters = { estado: "", prioridad: "", ambito: "", search: "" }

export default function Home() {
  const { eventos, loading, backend, addEvento, updateEvento, deleteEvento, seedEventos } = useEventos()
  const [activeTab, setActiveTab] = useState<"tabla" | "calendario">("tabla")
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set())
  const [focusFirstCell, setFocusFirstCell] = useState<string | null>(null)
  const [seeding, setSeeding] = useState(false)
  const [filters, setFilters] = useState<Filters>(defaultFilters)
  const [confirmState, setConfirmState] = useState<{message: string; onConfirm: () => void} | null>(null)

  const filteredEventos = useMemo(() => {
    return eventos.filter((ev) => {
      if (filters.estado && ev.estado !== filters.estado) return false
      if (filters.prioridad && ev.prioridad !== filters.prioridad) return false
      if (filters.ambito && ev.ambito !== filters.ambito) return false
      if (filters.search) {
        const q = filters.search.toLowerCase()
        return ev.nombre.toLowerCase().includes(q) ||
          ev.contacto.toLowerCase().includes(q) ||
          ev.registro.toLowerCase().includes(q) ||
          ev.luces.toLowerCase().includes(q)
      }
      return true
    })
  }, [eventos, filters])

  useEffect(() => {
    if (!loading && eventos.length === 0 && !seeding) {
      setSeeding(true)
      seedEventos(EVENTOS_COMPLETOS)
        .then(() => toast({ title: "Datos cargados", description: "36 eventos de ejemplo" }))
        .catch(() => {})
    }
  }, [loading, eventos.length, seedEventos, seeding])

  // Keyboard: Delete key and Add row events
  useEffect(() => {
    const delHandler = () => {
      if (selectedRows.size > 0 && !confirmState) {
        setConfirmState({
          message: `¿Eliminar ${selectedRows.size} evento(s) seleccionado(s)?`,
          onConfirm: () => handleDeleteSelected(),
        })
      }
    }
    window.addEventListener("delete-selected", delHandler)
    return () => window.removeEventListener("delete-selected", delHandler)
  }, [selectedRows, confirmState])

  const handleAdd = useCallback(async () => {
    const today = new Date().toISOString().slice(0, 10)
    const id = await addEvento({
      nombre: "", fecha: today, horario: "", estado: "LISTO",
      prioridad: "MEDIA", ambito: "EXTERNO", traslado: "", registro: "",
      contacto: "", sonido: "", viandas: "", sillas: "", mesas: "",
      gazebos: "", tarimas: "", gradas: "", banos: "", luces: "",
      luminarias: "", transito: "", ambulancia: "", contingencia: "",
      ambiente: "", autMunicipal: "", autCde: "", autExpendio: "", planeta: "",
    })
    setFocusFirstCell(id)
    setTimeout(() => setFocusFirstCell(null), 3000)
    toast({ title: "Nueva fila agregada", description: "Completá los datos del evento" })
  }, [addEvento])

  // Escuchar evento add-new-row desde la tabla
  useEffect(() => {
    const addHandler = () => handleAdd()
    window.addEventListener("add-new-row", addHandler)
    return () => window.removeEventListener("add-new-row", addHandler)
  }, [handleAdd])

  const handleDelete = useCallback(async (id: string) => {
    const ev = eventos.find(e => e.id === id)
    if (!confirm(`¿Eliminar "${(ev?.nombre || "").slice(0, 60)}"?`)) return
    await deleteEvento(id)
    // Si la fila estaba seleccionada, limpiarla
    setSelectedRows((prev) => {
      const next = new Set(prev)
      next.delete(id)
      return next
    })
    toast({ title: "Evento eliminado", duration: 3000 })
  }, [deleteEvento, eventos])

  const handleDeleteSelected = useCallback(async () => {
    if (!selectedRows.size) return
    for (const id of [...selectedRows]) await deleteEvento(id)
    setSelectedRows(new Set())
    setConfirmState(null)
    toast({ title: `${selectedRows.size} evento(s) eliminado(s)`, duration: 3000 })
  }, [selectedRows, deleteEvento])

  const handleToggleSelect = useCallback((id: string) => {
    setSelectedRows((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id); else next.add(id)
      return next
    })
  }, [])

  const handleSelectAll = useCallback(() => setSelectedRows(new Set(eventos.map(e => e.id))), [eventos])
  const handleDeselectAll = useCallback(() => setSelectedRows(new Set()), [])
  const handlePrint = useCallback(() => window.print(), [])

  return (
    <main className="min-h-screen p-3 sm:p-4 max-w-[1600px] mx-auto">

      {/* ===== SECCION NO IMPRIMIBLE ===== */}
      <div className="no-print">
        <Toolbar
          totalEventos={eventos.length}
          selectedCount={selectedRows.size}
          onAdd={handleAdd}
          onDeleteSelected={() => {
            if (selectedRows.size > 0) {
              setConfirmState({
                message: `¿Eliminar ${selectedRows.size} evento(s) seleccionado(s)?`,
                onConfirm: () => handleDeleteSelected(),
              })
            }
          }}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        <StatsBar eventos={eventos} backend={backend} />

        <FilterBar filters={filters} onChange={setFilters} onPrint={handlePrint} />
      </div>

      {/* ===== SECCION IMPRIMIBLE ===== */}
      {activeTab === "tabla" ? (
        <TablaExcel
          eventos={filteredEventos}
          onUpdate={updateEvento}
          onDelete={handleDelete}
          selectedRows={selectedRows}
          onToggleSelect={handleToggleSelect}
          onSelectAll={handleSelectAll}
          onDeselectAll={handleDeselectAll}
          focusFirstCell={focusFirstCell}
          loading={loading}
        />
      ) : (
        <Calendario eventos={eventos} filters={filters} />
      )}

      {/* Confirm dialog */}
      {confirmState && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
          onClick={() => setConfirmState(null)}>
          <div className="bg-background border border-border rounded-lg shadow-lg p-5 max-w-sm w-full"
            onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start gap-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-destructive/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <TrashIcon />
              </div>
              <div>
                <h3 className="text-sm font-medium text-foreground">Confirmar eliminación</h3>
                <p className="text-xs text-muted-foreground mt-1">{confirmState.message}</p>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button className="px-3 py-1.5 text-xs font-medium rounded-md border border-input bg-background text-foreground hover:bg-accent transition-colors"
                onClick={() => setConfirmState(null)}>Cancelar</button>
              <button className="px-3 py-1.5 text-xs font-medium rounded-md bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors"
                onClick={() => { confirmState.onConfirm() }}>Eliminar</button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}

function TrashIcon() {
  return (
    <svg className="w-4 h-4 text-destructive" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  )
}
