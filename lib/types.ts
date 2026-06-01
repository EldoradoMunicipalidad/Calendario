// Tipos para el sistema de logística de eventos

export type EstadoEvento = "LISTO" | "GESTIONANDO" | "AGENDADO" | "SUSPENDIDO"
export type Prioridad = "ALTA" | "MEDIA" | "BAJA"
export type Ambito = "EXTERNO" | "INSTITUCIONAL"
export type Traslado = "" | "TRASLADO" | "SIN NOTA"
export type Sonido = string
export type Viandas = "" | "SI" | "SI + 8 HS" | "NO" | "NO - 8 hs" | "VER"
export type Ambiente = "" | "TRAMITADO" | "PEDIDO"

export interface Evento {
  id: string
  nombre: string
  fecha: string
  horario: string
  estado: EstadoEvento
  prioridad: Prioridad
  ambito: Ambito
  traslado: Traslado
  registro: string
  contacto: string
  sonido: Sonido
  viandas: Viandas
  sillas: string
  mesas: string
  gazebos: string
  tarimas: string
  gradas: string
  banos: string
  luces: string
  luminarias: string
  transito: string
  ambulancia: string
  contingencia: string
  ambiente: Ambiente
  autMunicipal: string
  autCde: string
  autExpendio: string
  planeta: string
  createdAt?: string
  updatedAt?: string
}

export interface Columna {
  key: keyof Evento
  label: string
  w: number
  type: "text" | "date" | "select"
  opts?: string[]
}

export const COLUMNAS: Columna[] = [
  { key: "nombre", label: "Evento", w: 220, type: "text" },
  { key: "fecha", label: "Fecha", w: 110, type: "date" },
  { key: "horario", label: "Horario", w: 110, type: "text" },
  { key: "estado", label: "Estado", w: 110, type: "select", opts: ["LISTO", "GESTIONANDO", "AGENDADO", "SUSPENDIDO"] },
  { key: "prioridad", label: "Prioridad", w: 90, type: "select", opts: ["ALTA", "MEDIA", "BAJA"] },
  { key: "ambito", label: "Ámbito", w: 110, type: "select", opts: ["EXTERNO", "INSTITUCIONAL"] },
  { key: "traslado", label: "Traslado", w: 100, type: "select", opts: ["", "TRASLADO", "SIN NOTA"] },
  { key: "registro", label: "Registro/Nota", w: 120, type: "text" },
  { key: "contacto", label: "Contacto", w: 130, type: "text" },
  { key: "sonido", label: "Sonido", w: 90, type: "select", opts: ["", "CULTURA", "MK", "OTRO", "SIN", "VER"] },
  { key: "viandas", label: "Viandas", w: 100, type: "select", opts: ["", "SI", "SI + 8 HS", "NO", "NO - 8 hs", "VER"] },
  { key: "sillas", label: "Sillas", w: 70, type: "text" },
  { key: "mesas", label: "Mesas", w: 70, type: "text" },
  { key: "gazebos", label: "Gazebos", w: 75, type: "text" },
  { key: "tarimas", label: "Tarimas", w: 75, type: "text" },
  { key: "gradas", label: "Gradas", w: 100, type: "text" },
  { key: "banos", label: "Baños", w: 70, type: "text" },
  { key: "luces", label: "Luces/Grupo", w: 120, type: "text" },
  { key: "luminarias", label: "Luminarias", w: 110, type: "text" },
  { key: "transito", label: "Tránsito", w: 100, type: "text" },
  { key: "ambulancia", label: "Ambulancia", w: 110, type: "text" },
  { key: "contingencia", label: "Contingencia", w: 130, type: "text" },
  { key: "ambiente", label: "Ambiente", w: 90, type: "select", opts: ["", "TRAMITADO", "PEDIDO"] },
  { key: "autMunicipal", label: "Aut. Municipal", w: 110, type: "text" },
  { key: "autCde", label: "Aut. CDE", w: 100, type: "text" },
  { key: "autExpendio", label: "Aut. Expendio", w: 110, type: "text" },
  { key: "planeta", label: "Planeta Cartón/CIC", w: 140, type: "text" },
]

export const EVENTOS_INICIALES: Omit<Evento, "id" | "createdAt" | "updatedAt">[] = [
  { nombre: "MAYO 1° Bo BELGRANO FERIA+CLUB+CENTENARIO", fecha: "2026-05-01", horario: "10.30 a 22 aprox", estado: "LISTO", prioridad: "MEDIA", ambito: "EXTERNO", traslado: "TRASLADO", registro: "IV-2690-272", contacto: "3751663071", sonido: "CULTURA", viandas: "SI", sillas: "100", mesas: "", gazebos: "20", tarimas: "2", gradas: "", banos: "4", luces: "", luminarias: "KERMES", transito: "", ambulancia: "", contingencia: "", ambiente: "", autMunicipal: "", autCde: "", autExpendio: "", planeta: "CINTAS" },
  { nombre: "MAYO 1 VIERNES - Bo 1° DE MAYO ANIV", fecha: "2026-05-01", horario: "", estado: "LISTO", prioridad: "MEDIA", ambito: "EXTERNO", traslado: "TRASLADO", registro: "", contacto: "3751506246", sonido: "OTRO", viandas: "NO", sillas: "", mesas: "", gazebos: "", tarimas: "", gradas: "", banos: "", luces: "", luminarias: "", transito: "CONFIRMADO", ambulancia: "", contingencia: "", ambiente: "", autMunicipal: "", autCde: "", autExpendio: "", planeta: "" },
  { nombre: "MAYO 2 - LOS CEDROS", fecha: "2026-05-02", horario: "", estado: "LISTO", prioridad: "BAJA", ambito: "EXTERNO", traslado: "TRASLADO", registro: "", contacto: "3751521171", sonido: "OTRO", viandas: "NO", sillas: "", mesas: "4", gazebos: "", tarimas: "", gradas: "", banos: "6", luces: "", luminarias: "", transito: "", ambulancia: "", contingencia: "", ambiente: "", autMunicipal: "", autCde: "", autExpendio: "", planeta: "" },
  { nombre: "MAYO 4 - 20 ANIVERSARIO HOGAR BETANIA", fecha: "2026-05-04", horario: "10.30 a 12", estado: "LISTO", prioridad: "BAJA", ambito: "EXTERNO", traslado: "TRASLADO", registro: "", contacto: "3751669873", sonido: "CULTURA", viandas: "NO", sillas: "50", mesas: "", gazebos: "", tarimas: "", gradas: "", banos: "", luces: "", luminarias: "", transito: "", ambulancia: "", contingencia: "", ambiente: "", autMunicipal: "", autCde: "", autExpendio: "", planeta: "" },
  { nombre: "MAYO 6 - DIR NIÑEZ TALLER", fecha: "2026-05-06", horario: "", estado: "LISTO", prioridad: "ALTA", ambito: "INSTITUCIONAL", traslado: "TRASLADO", registro: "", contacto: "LETTY LOPEZ", sonido: "SIN", viandas: "NO", sillas: "30", mesas: "", gazebos: "", tarimas: "", gradas: "", banos: "", luces: "", luminarias: "", transito: "", ambulancia: "", contingencia: "", ambiente: "", autMunicipal: "", autCde: "", autExpendio: "", planeta: "" },
  { nombre: "MAYO 7 - PLZA SARMIENTO ZOONOSIS", fecha: "2026-05-07", horario: "", estado: "LISTO", prioridad: "ALTA", ambito: "INSTITUCIONAL", traslado: "TRASLADO", registro: "", contacto: "MATI MONTI", sonido: "SIN", viandas: "NO", sillas: "", mesas: "", gazebos: "", tarimas: "", gradas: "", banos: "", luces: "", luminarias: "", transito: "", ambulancia: "", contingencia: "", ambiente: "", autMunicipal: "", autCde: "", autExpendio: "", planeta: "" },
  { nombre: "MAYO 8 - CIC PINARES DIR NIÑEZ", fecha: "2026-05-08", horario: "16 a 19", estado: "LISTO", prioridad: "ALTA", ambito: "INSTITUCIONAL", traslado: "TRASLADO", registro: "", contacto: "LETICIA LOPEZ", sonido: "CULTURA", viandas: "NO", sillas: "", mesas: "", gazebos: "", tarimas: "", gradas: "", banos: "", luces: "Y BIBLIOTECA MOVIL", luminarias: "", transito: "", ambulancia: "", contingencia: "", ambiente: "", autMunicipal: "", autCde: "", autExpendio: "", planeta: "" },
  { nombre: "MAYO 8 - 170 ANIV POLICIA DE MISIONES", fecha: "2026-05-08", horario: "600.000 sec gob", estado: "LISTO", prioridad: "ALTA", ambito: "EXTERNO", traslado: "TRASLADO", registro: "", contacto: "3751477260", sonido: "MK", viandas: "NO", sillas: "", mesas: "", gazebos: "", tarimas: "", gradas: "PEDIDO +PALCOS", banos: "", luces: "", luminarias: "", transito: "VER CORTE", ambulancia: "", contingencia: "", ambiente: "", autMunicipal: "", autCde: "PEDIR COSTANERA", autExpendio: "", planeta: "" },
  { nombre: "MAYO 9 - VIRGEN DE LUJAN CAPILLA", fecha: "2026-05-09", horario: "", estado: "LISTO", prioridad: "MEDIA", ambito: "EXTERNO", traslado: "TRASLADO", registro: "IV-3344-297", contacto: "3751571383", sonido: "SIN", viandas: "NO", sillas: "", mesas: "", gazebos: "", tarimas: "", gradas: "", banos: "", luces: "", luminarias: "SIN DISPONIBILIDAD", transito: "", ambulancia: "", contingencia: "", ambiente: "", autMunicipal: "", autCde: "", autExpendio: "", planeta: "" },
  { nombre: "MAYO 9 - FERIA SOCIAL + FIESTA REVIRO", fecha: "2026-05-09", horario: "sec gob (costo c/ policia)", estado: "LISTO", prioridad: "ALTA", ambito: "INSTITUCIONAL", traslado: "TRASLADO", registro: "", contacto: "ROLANDO VERGARA", sonido: "MK", viandas: "NO", sillas: "", mesas: "", gazebos: "", tarimas: "", gradas: "", banos: "", luces: "", luminarias: "", transito: "", ambulancia: "", contingencia: "", ambiente: "", autMunicipal: "", autCde: "", autExpendio: "", planeta: "" },
]
