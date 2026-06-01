"use client"

import { Button } from "@/app/components/ui/button"
import { Plus, Trash2, Table, Calendar } from "lucide-react"

interface ToolbarProps {
  totalEventos: number
  selectedCount: number
  onAdd: () => void
  onDeleteSelected: () => void
  activeTab: "tabla" | "calendario"
  onTabChange: (tab: "tabla" | "calendario") => void
}

export function Toolbar({ totalEventos, selectedCount, onAdd, onDeleteSelected, activeTab, onTabChange }: ToolbarProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-sm font-medium text-foreground flex-1 min-w-[150px]">
          <span className="text-primary mr-1">⏣</span>
          Logística de eventos
        </span>

        <Button variant="default" size="sm" onClick={onAdd} className="gap-1">
          <Plus className="h-4 w-4" /> Nueva fila
        </Button>

        {selectedCount > 0 && (
          <Button variant="destructive" size="sm" onClick={onDeleteSelected} className="gap-1">
            <Trash2 className="h-4 w-4" /> Eliminar ({selectedCount})
          </Button>
        )}

        <div className="text-xs text-muted-foreground ml-auto hidden sm:block">
          {totalEventos} evento{totalEventos !== 1 ? "s" : ""}
        </div>
      </div>

      <div className="flex gap-1 border-b border-border">
        <button
          className={`px-3 py-1.5 text-xs rounded-t-md transition-colors flex items-center gap-1.5 ${
            activeTab === "tabla"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-muted"
          }`}
          onClick={() => onTabChange("tabla")}
        >
          <Table className="h-3.5 w-3.5" /> Tabla
        </button>
        <button
          className={`px-3 py-1.5 text-xs rounded-t-md transition-colors flex items-center gap-1.5 ${
            activeTab === "calendario"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-muted"
          }`}
          onClick={() => onTabChange("calendario")}
        >
          <Calendar className="h-3.5 w-3.5" /> Calendario
        </button>
      </div>
    </div>
  )
}
