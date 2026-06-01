"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import type { Evento, Columna } from "@/lib/types"
import { COLUMNAS } from "@/lib/types"
import { Badge } from "@/app/components/ui/badge"
import { Button } from "@/app/components/ui/button"
import { Trash2, GripVertical } from "lucide-react"

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
  const [editingCell, setEditingCell] = useState<{ id: string; key: string } | null>(null)
  const editRef = useRef<HTMLInputElement | HTMLSelectElement>(null)
  const newRowRef = useRef<HTMLTableRowElement>(null)
  const lastClickRef = useRef<{ id: string; time: number } | null>(null)

  // Auto-focus on newly added row
  useEffect(() => {
    if (focusFirstCell && newRowRef.current) {
      const firstInput = newRowRef.current.querySelector('input, select, div[tabindex]')
      if (firstInput instanceof HTMLElement) {
        firstInput.click()
        firstInput.focus()
      }
      newRowRef.current.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
    }
  }, [focusFirstCell, eventos.length])

  useEffect(() => {
    if (editingCell && editRef.current) {
      editRef.current.focus()
    }
  }, [editingCell])

  // Keyboard: Delete key removes selected rows
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Delete" && selectedRows.size > 0) {
        // Only fire if not in an input/select
        const tag = (e.target as HTMLElement).tagName
        if (tag !== "INPUT" && tag !== "SELECT" && tag !== "TEXTAREA") {
          // Dispatch custom event so parent can handle
          window.dispatchEvent(new CustomEvent("delete-selected"))
        }
      }
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [selectedRows.size])

  const handleCellChange = useCallback((id: string, key: keyof Evento, value: string) => {
    onUpdate(id, { [key]: value })
    setEditingCell(null)
  }, [onUpdate])

  const handleRowClick = useCallback((e: React.MouseEvent, id: string) => {
    // Ignore clicks on inputs/selects/buttons
    const tag = (e.target as HTMLElement).tagName
    if (tag === "INPUT" || tag === "SELECT" || tag === "BUTTON") return

    const now = Date.now()
    const last = lastClickRef.current

    // Double-click → edit first cell
    if (last && last.id === id && now - last.time < 400) {
      setEditingCell({ id, key: "nombre" })
      lastClickRef.current = null
      return
    }

    lastClickRef.current = { id, time: now }
    onToggleSelect(id)
  }, [onToggleSelect])

  if (loading) {
    return (
      <div className="border rounded-md p-8 text-center text-muted-foreground text-sm">
        Cargando eventos...
      </div>
    )
  }

  if (eventos.length === 0) {
    return (
      <div className="border rounded-md p-8 text-center text-muted-foreground text-sm">
        No hay eventos. Hacé clic en <strong>"Nueva fila"</strong> para agregar uno.
      </div>
    )
  }

  const allSelected = eventos.length > 0 && selectedRows.size === eventos.length
  const badgeVariant = (val: string, type: "estado" | "prioridad") => {
    const k = val.toLowerCase().replace(/[éó]/g, (c) => c === "é" ? "e" : "o")
    return k as any
  }

  const renderCell = (ev: Evento, col: Columna, i: number) => {
    const val = (ev[col.key] as string) ?? ""
    const isEditing = editingCell?.id === ev.id && editingCell?.key === col.key

    if (col.type === "select") {
      return (
        <td key={col.key} className="border-r border-border/50 px-0" style={{ minWidth: col.w }}>
          {isEditing ? (
            <select
              ref={editRef as any}
              className="w-full text-xs bg-background border border-primary rounded-none px-1.5 py-1 outline-none min-h-[26px]"
              defaultValue={val}
              autoFocus
              onChange={(e) => handleCellChange(ev.id, col.key, e.target.value)}
              onBlur={() => setEditingCell(null)}
              onKeyDown={(e) => {
                if (e.key === "Escape") setEditingCell(null)
              }}
            >
              {col.opts?.map((o) => (
                <option key={o} value={o}>{o || "—"}</option>
              ))}
            </select>
          ) : (
            <div
              className="px-1.5 py-1 cursor-pointer min-h-[26px] flex items-center hover:bg-accent/30"
              onClick={(e) => { e.stopPropagation(); setEditingCell({ id: ev.id, key: col.key }) }}
            >
              {col.key === "estado" || col.key === "prioridad" ? (
                val ? <Badge variant={badgeVariant(val, col.key)} className="text-[10px]">{val}</Badge> : <span className="text-muted-foreground text-[11px]">—</span>
              ) : (
                <span className="truncate block max-w-full text-[11px]" title={val}>
                  {val || <span className="text-muted-foreground">—</span>}
                </span>
              )}
            </div>
          )}
        </td>
      )
    }

    return (
      <td key={col.key} className="border-r border-border/50 px-0" style={{ minWidth: col.w }}>
        {isEditing ? (
          <input
            ref={editRef as any}
            type={col.type === "date" ? "date" : "text"}
            className="w-full text-xs bg-background border border-primary rounded-none px-1.5 py-1 outline-none min-h-[26px]"
            defaultValue={val}
            autoFocus
            onBlur={(e) => handleCellChange(ev.id, col.key, e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleCellChange(ev.id, col.key, (e.target as HTMLInputElement).value)
              if (e.key === "Escape") setEditingCell(null)
              // Tab → move to next cell
              if (e.key === "Tab") {
                e.preventDefault()
                handleCellChange(ev.id, col.key, (e.target as HTMLInputElement).value)
                const colIdx = COLUMNAS.indexOf(col)
                const nextCol = COLUMNAS[colIdx + 1]
                if (nextCol) {
                  setEditingCell({ id: ev.id, key: nextCol.key })
                }
              }
            }}
          />
        ) : (
          <div
            className="px-1.5 py-1 cursor-pointer min-h-[26px] flex items-center hover:bg-accent/30"
            onClick={(e) => { e.stopPropagation(); setEditingCell({ id: ev.id, key: col.key }) }}
          >
            <span className="truncate block max-w-full text-[11px]" title={val}>
              {val || <span className="text-muted-foreground">—</span>}
            </span>
          </div>
        )}
      </td>
    )
  }

  return (
    <div className="border rounded-md overflow-auto" style={{ maxHeight: "560px" }}>
      <table className="w-max min-w-full border-collapse">
        <thead>
          <tr className="bg-muted/50">
            <th className="sticky top-0 bg-muted/50 z-10 border-r border-b border-border px-1 py-1.5 text-center w-9">
              {/* Checkbox para seleccionar todo */}
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
                className="sticky top-0 bg-muted/50 z-10 border-r border-b border-border px-2 py-1.5 text-left text-muted-foreground font-medium text-[11px] whitespace-nowrap select-none"
                style={{ minWidth: col.w, width: col.w }}
              >
                {col.label}
              </th>
            ))}
            <th className="sticky top-0 bg-muted/50 z-10 border-b border-border px-2 py-1.5 text-center text-muted-foreground font-medium text-[11px] w-14">
              <Trash2 className="h-3 w-3 inline-block opacity-40" />
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
                className={`border-b border-border/50 transition-colors ${
                  selectedRows.has(ev.id)
                    ? "bg-blue-50 dark:bg-blue-950/30"
                    : "hover:bg-muted/30"
                } ${isNewRow ? "animate-pulse" : ""}`}
                onClick={(e) => handleRowClick(e, ev.id)}
              >
                <td className="border-r border-border/50 px-1 py-1 text-center align-middle w-9 bg-muted/20">
                  <input
                    type="checkbox"
                    className="accent-primary cursor-pointer"
                    checked={selectedRows.has(ev.id)}
                    onChange={() => onToggleSelect(ev.id)}
                    onClick={(e) => e.stopPropagation()}
                  />
                </td>
                {COLUMNAS.map((col) => renderCell(ev, col, i))}
                <td className="px-1 py-0.5 text-center w-14">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    onClick={(e) => { e.stopPropagation(); onDelete(ev.id) }}
                    title="Eliminar fila"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
