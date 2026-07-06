"use client"

import { useState, useCallback, useRef, useEffect, useMemo } from "react"
import type { Evento } from "@/lib/types"
import { COLUMNAS } from "@/lib/types"
import { Badge } from "@/app/components/ui/badge"
import { Plus } from "lucide-react"

interface TablaExcelProps {
  eventos: Evento[]
  onUpdate: (id: string, data: Partial<Evento>) => Promise<void>
  onDelete: (id: string) => Promise<void>
  selectedRows: Set<string>
  onToggleSelect: (id: string) => void
  onSelectAll: () => void
  onDeselectAll: () => void
  focusFirstCell: string | null
  loading: boolean
}

export function TablaExcel({
  eventos, onUpdate, onDelete, selectedRows,
  onToggleSelect, onSelectAll, onDeselectAll,
  focusFirstCell, loading
}: TablaExcelProps) {
  const [activeCell, setActiveCell] = useState<{ id: string; col: string } | null>(null)
  const [editValue, setEditValue] = useState<string>("")
  const [editing, setEditing] = useState(false)
  const inputRef = useRef<HTMLInputElement | HTMLSelectElement>(null)
  const tableRef = useRef<HTMLDivElement>(null)
  const newRowRef = useRef<HTMLTableRowElement>(null)

  // Auto-focus when new row is added
  useEffect(() => {
    if (focusFirstCell && newRowRef.current) {
      setActiveCell({ id: focusFirstCell, col: "nombre" })
      setEditing(true)
      setEditValue("")
      newRowRef.current.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
    }
  }, [focusFirstCell])

  // Focus input when entering edit mode
  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus()
      if (inputRef.current instanceof HTMLInputElement) {
        inputRef.current.select()
      }
    }
  }, [editing, activeCell])

  // Click on cell → activate + edit
  const handleCellClick = useCallback((id: string, col: string, e: React.MouseEvent) => {
    e.stopPropagation()
    const ev = eventos.find(ev => ev.id === id)
    if (!ev) return
    setActiveCell({ id, col })
    setEditValue((ev[col as keyof Evento] as string) ?? "")
    setEditing(true)
  }, [eventos])

  // Confirm edit
  const confirmEdit = useCallback(() => {
    if (!activeCell) return
    const ev = eventos.find(ev => ev.id === activeCell.id)
    if (!ev) return
    const oldVal = (ev[activeCell.col as keyof Evento] as string) ?? ""
    if (editValue !== oldVal) {
      onUpdate(activeCell.id, { [activeCell.col as keyof Evento]: editValue })
    }
    setEditing(false)
  }, [activeCell, editValue, eventos, onUpdate])

  // Keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!activeCell) return

    if (e.key === "Enter") {
      e.preventDefault()
      confirmEdit()
      // Move down to next row
      const colIdx = COLUMNAS.findIndex(c => c.key === activeCell.col)
      if (colIdx >= 0) {
        const currentIdx = eventos.findIndex(ev => ev.id === activeCell.id)
        if (currentIdx >= 0 && currentIdx < eventos.length - 1) {
          const nextEv = eventos[currentIdx + 1]
          setActiveCell({ id: nextEv.id, col: activeCell.col })
          setEditValue((nextEv[activeCell.col as keyof Evento] as string) ?? "")
          setEditing(true)
        }
      }
      return
    }

    if (e.key === "Tab") {
      e.preventDefault()
      confirmEdit()
      const colIdx = COLUMNAS.findIndex(c => c.key === activeCell.col)
      if (colIdx >= 0) {
        const nextCol = e.shiftKey ? COLUMNAS[colIdx - 1] : COLUMNAS[colIdx + 1]
        if (nextCol) {
          const ev = eventos.find(ev => ev.id === activeCell.id)
          if (ev) {
            setActiveCell({ id: activeCell.id, col: nextCol.key })
            setEditValue((ev[nextCol.key as keyof Evento] as string) ?? "")
            setEditing(true)
          }
        }
      }
      return
    }

    if (e.key === "Escape") {
      setEditing(false)
      setActiveCell(null)
      return
    }

    // Arrow keys for navigation when not editing (or after confirming)
    if ((e.key === "ArrowUp" || e.key === "ArrowDown") && !editing) {
      e.preventDefault()
      const colIdx = COLUMNAS.findIndex(c => c.key === activeCell.col)
      if (colIdx >= 0) {
        const currentIdx = eventos.findIndex(ev => ev.id === activeCell.id)
        let nextIdx = e.key === "ArrowDown" ? currentIdx + 1 : currentIdx - 1
        if (nextIdx >= 0 && nextIdx < eventos.length) {
          const nextEv = eventos[nextIdx]
          setActiveCell({ id: nextEv.id, col: activeCell.col })
          setEditValue((nextEv[activeCell.col as keyof Evento] as string) ?? "")
        }
      }
      return
    }

    if ((e.key === "ArrowLeft" || e.key === "ArrowRight") && !editing) {
      e.preventDefault()
      const colIdx = COLUMNAS.findIndex(c => c.key === activeCell.col)
      if (colIdx >= 0) {
        const nextCol = e.key === "ArrowRight" ? COLUMNAS[colIdx + 1] : COLUMNAS[colIdx - 1]
        if (nextCol) {
          const ev = eventos.find(ev => ev.id === activeCell.id)
          if (ev) {
            setActiveCell({ id: activeCell.id, col: nextCol.key })
            setEditValue((ev[nextCol.key as keyof Evento] as string) ?? "")
          }
        }
      }
      return
    }

    // Start editing on any key press when not in edit mode
    if (!editing && e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
      setEditing(true)
      setEditValue("")
    }
  }, [activeCell, eventos, confirmEdit, editing])

  // Handle input change
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setEditValue(e.target.value)
  }, [])

  // Handle checkbox click (don't propagate to row)
  const handleCheckClick = useCallback((e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    onToggleSelect(id)
  }, [onToggleSelect])

  if (loading) {
    return (
      <div className="border rounded-lg p-12 text-center text-muted-foreground text-sm bg-muted/10">
        <div className="animate-pulse">Cargando eventos...</div>
      </div>
    )
  }

  if (eventos.length === 0) {
    return (
      <div className="border rounded-lg p-12 text-center">
        <div className="text-muted-foreground text-sm mb-4">
          No hay eventos que coincidan con los filtros.
        </div>
      </div>
    )
  }

  const allSelected = selectedRows.size === eventos.length

  const renderCell = (ev: Evento, col: typeof COLUMNAS[0]) => {
    const isActive = activeCell?.id === ev.id && activeCell?.col === col.key
    const val = (ev[col.key as keyof Evento] as string) ?? ""
    const isEditing = isActive && editing

    if (col.type === "select") {
      return (
        <td
          key={col.key}
          className={`border-r border-border/30 px-0 relative ${
            isActive ? "ring-2 ring-inset ring-primary/40 z-10" : ""
          }`}
          style={{ minWidth: col.w, width: col.w }}
          onClick={(e) => handleCellClick(ev.id, col.key, e)}
        >
          {isEditing ? (
            <select
              ref={inputRef as any}
              className="w-full h-full min-h-[30px] text-xs bg-white border-0 outline-none px-2 py-1 cursor-pointer appearance-none"
              value={editValue}
              onChange={handleInputChange}
              onBlur={confirmEdit}
              onKeyDown={handleKeyDown}
              autoFocus
            >
              {(col.opts || []).map(o => (
                <option key={o} value={o}>{o || "—"}</option>
              ))}
            </select>
          ) : (
            <div
              className="px-2 py-1.5 min-h-[30px] flex items-center cursor-pointer hover:bg-accent/20 transition-colors text-xs"
              title={val}
            >
              {col.key === "estado" || col.key === "prioridad" ? (
                val ? <Badge variant={val.toLowerCase().replace(/[éó]/g, c => c === "é" ? "e" : "o") as any} className="text-[10px] px-1.5 py-0">{val}</Badge>
                    : <span className="text-muted-foreground/50">—</span>
              ) : (
                <span className="truncate block max-w-full">{val || <span className="text-muted-foreground/50">—</span>}</span>
              )}
            </div>
          )}
        </td>
      )
    }

    return (
      <td
        key={col.key}
        className={`border-r border-border/30 px-0 relative ${
          isActive ? "ring-2 ring-inset ring-primary/40 z-10" : ""
        }`}
        style={{ minWidth: col.w, width: col.w }}
        onClick={(e) => handleCellClick(ev.id, col.key, e)}
      >
        {isEditing ? (
          <input
            ref={inputRef as any}
            type={col.type === "date" ? "date" : "text"}
            className="w-full h-full min-h-[30px] text-xs bg-white border-0 outline-none px-2 py-1"
            value={editValue}
            onChange={handleInputChange}
            onBlur={confirmEdit}
            onKeyDown={handleKeyDown}
            autoFocus
          />
        ) : (
          <div className="px-2 py-1.5 min-h-[30px] flex items-center cursor-pointer hover:bg-accent/20 transition-colors text-xs" title={val}>
            <span className="truncate block max-w-full">{val || <span className="text-muted-foreground/50">—</span>}</span>
          </div>
        )}
      </td>
    )
  }

  return (
    <div
      ref={tableRef}
      className="border border-border rounded-lg overflow-auto shadow-sm"
      style={{ maxHeight: "580px" }}
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      <table className="w-max min-w-full border-collapse">
        <thead>
          <tr className="bg-muted/40 sticky top-0 z-20">
            <th className="sticky top-0 bg-muted/40 z-20 border-r border-b border-border/50 px-1 py-0 text-center w-[36px] min-w-[36px]">
              <input
                type="checkbox"
                className="accent-primary cursor-pointer"
                checked={allSelected}
                onChange={allSelected ? onDeselectAll : onSelectAll}
                title="Seleccionar todo"
              />
            </th>
            {COLUMNAS.map((col) => (
              <th
                key={col.key}
                className="sticky top-0 bg-muted/40 z-20 border-r border-b border-border/50 px-2 py-2 text-left text-muted-foreground font-medium text-[11px] whitespace-nowrap select-none"
                style={{ minWidth: col.w, width: col.w }}
              >
                {col.label}
              </th>
            ))}
            <th className="sticky top-0 bg-muted/40 z-20 border-b border-border/50 px-2 py-2 text-center text-muted-foreground/40 font-medium text-[11px] w-[40px] min-w-[40px]">
              ✕
            </th>
          </tr>
        </thead>
        <tbody>
          {eventos.map((ev, i) => {
            const isNewRow = ev.id === focusFirstCell
            return (
              <tr
                key={ev.id}
                ref={isNewRow ? newRowRef : undefined}
                className={`border-b border-border/20 transition-all text-[12px] ${
                  selectedRows.has(ev.id)
                    ? "bg-blue-50/80 dark:bg-blue-950/40"
                    : i % 2 === 0
                    ? "bg-background"
                    : "bg-muted/10"
                } hover:bg-blue-50/40 dark:hover:bg-blue-950/20 cursor-pointer ${
                  isNewRow ? "ring-2 ring-inset ring-green-400/40 bg-green-50/30" : ""
                }`}
                onClick={() => onToggleSelect(ev.id)}
              >
                <td className="border-r border-border/20 px-1 py-0 text-center align-middle w-[36px] min-w-[36px] bg-muted/5">
                  <input
                    type="checkbox"
                    className="accent-primary cursor-pointer"
                    checked={selectedRows.has(ev.id)}
                    onChange={(e) => { e.stopPropagation(); onToggleSelect(ev.id) }}
                    onClick={(e) => e.stopPropagation()}
                  />
                </td>
                {COLUMNAS.map((col) => renderCell(ev, col))}
                <td className="px-0.5 py-0 text-center w-[40px] min-w-[40px]">
                  <button
                    className="opacity-0 group-hover:opacity-100 hover:opacity-100 text-muted-foreground/40 hover:text-destructive transition-all text-[11px] p-1"
                    onClick={(e) => { e.stopPropagation(); onDelete(ev.id) }}
                    title="Eliminar fila"
                  >
                    ✕
                  </button>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>

      {/* Add row button at bottom */}
      <div
        className="flex items-center gap-2 px-4 py-2.5 text-xs text-muted-foreground hover:text-foreground hover:bg-accent/20 cursor-pointer transition-colors border-t border-border/30"
        onClick={() => {
          window.dispatchEvent(new CustomEvent("add-new-row"))
        }}
      >
        <Plus className="h-3.5 w-3.5" />
        Agregar nueva fila
      </div>
    </div>
  )
}
