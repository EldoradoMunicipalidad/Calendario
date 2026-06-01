"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import { useEventos } from "@/hooks/use-eventos"
import { Toolbar } from "@/app/components/toolbar"
import { StatsBar } from "@/app/components/stats-bar"
import { TablaExcel } from "@/app/components/tabla-excel"
import { Calendario } from "@/app/components/calendario"
import { toast } from "@/hooks/use-toast"
import { EVENTOS_COMPLETOS } from "@/lib/data"
import type { Evento } from "@/lib/types"

export default function Home() {
  const { eventos, loading, backend, addEvento, updateEvento, deleteEvento, seedEventos } = useEventos()
  const [activeTab, setActiveTab] = useState<"tabla" | "calendario">("tabla")
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set())
  const [focusFirstCell, setFocusFirstCell] = useState<string | null>(null)
  const [seeding, setSeeding] = useState(false)
  const [confirmState, setConfirmState] = useState<{
    message: string; onConfirm: () => void; onCancel?: () => void
  } | null>(null)
  const undoRef = useRef<(() => void) | null>(null)

  // Seed initial data
  useEffect(() => {
    if (!loading && eventos.length === 0 && !seeding) {
      setSeeding(true)
      seedEventos(EVENTOS_COMPLETOS)
        .then(() => toast({ title: "Datos cargados", description: "36 eventos de ejemplo" }))
        .catch(() => {/* ya hay fallback a localStorage */})
    }
  }, [loading, eventos.length, seedEventos, seeding])

  // Keyboard listener for Delete key
  useEffect(() => {
    const handler = () => {
      if (selectedRows.size > 0 && !confirmState) {
        setConfirmState({
          message: `¿Eliminar ${selectedRows.size} evento(s) seleccionado(s)?`,
          onConfirm: () => handleDeleteSelected(),
        })
      }
    }
    window.addEventListener("delete-selected", handler)
    return () => window.removeEventListener("delete-selected", handler)
  }, [selectedRows, confirmState])

  // Undo delete: restore from backup
  const deleteWithUndo = useCallback(async (id: string, name: string) => {
    // Save backup before deleting
    const backup = eventos.find(e => e.id === id)
    await deleteEvento(id)
    selectedRows.delete(id)

    toast({
      title: "Evento eliminado",
      description: name || "Evento",
      action: backup ? {
        altText: "Deshacer",
        onClick: () => {
          // Re-add the event (use localStorage-friendly approach)
          if (backend === "localstorage") {
            const localData = localStorage.getItem("logistica_eventos")
            if (localData) {
              const items = JSON.parse(localData)
              items.push(backup)
              localStorage.setItem("logistica_eventos", JSON.stringify(items))
              window.location.reload()
            }
          }
        }
      } as any : undefined,
      duration: 5000,
    })
  }, [deleteEvento, selectedRows, eventos, backend])

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
    // Focus the new row
    setFocusFirstCell(id)
    setTimeout(() => setFocusFirstCell(null), 3000)
    toast({ title: "Nueva fila agregada", description: "Completá los datos del evento" })
  }, [addEvento])

  const handleDelete = useCallback(async (id: string) => {
    const ev = eventos.find(e => e.id === id)
    const name = ev?.nombre || ""
    if (!confirm(`¿Eliminar "${name.slice(0, 60)}${name.length > 60 ? "…" : ""}"?`)) return
    await deleteEvento(id)
    selectedRows.delete(id)
    toast({ title: "Evento eliminado", duration: 3000 })
  }, [deleteEvento, eventos, selectedRows])

  const handleDeleteSelected = useCallback(async () => {
    if (!selectedRows.size) return
    const ids = [...selectedRows]
    for (const id of ids) await deleteEvento(id)
    const count = ids.length
    setSelectedRows(new Set())
    setConfirmState(null)
    toast({ title: `${count} evento(s) eliminado(s)`, duration: 3000 })
  }, [selectedRows, deleteEvento])

  const handleToggleSelect = useCallback((id: string) => {
    setSelectedRows((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const handleSelectAll = useCallback(() => {
    setSelectedRows(new Set(eventos.map((e) => e.id)))
  }, [eventos])

  const handleDeselectAll = useCallback(() => {
    setSelectedRows(new Set())
  }, [])

  return (
    <main className="min-h-screen p-3 sm:p-4 max-w-[1600px] mx-auto">
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

      <StatsBar eventos={eventos} />

      {activeTab === "tabla" ? (
        <TablaExcel
          eventos={eventos}
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
        <Calendario eventos={eventos} />
      )}

      {/* Custom confirm dialog */}
      {confirmState && (
        <div
          className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
          onClick={() => setConfirmState(null)}
        >
          <div
            className="bg-background border border-border rounded-lg shadow-lg p-5 max-w-sm w-full"
            onClick={(e) => e.stopPropagation()}
          >
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
              <button
                className="px-3 py-1.5 text-xs font-medium rounded-md border border-input bg-background text-foreground hover:bg-accent transition-colors"
                onClick={() => setConfirmState(null)}
              >
                Cancelar
              </button>
              <button
                className="px-3 py-1.5 text-xs font-medium rounded-md bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors"
                onClick={() => { confirmState.onConfirm(); }}
              >
                Eliminar
              </button>
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
