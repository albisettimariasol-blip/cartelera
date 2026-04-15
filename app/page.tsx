"use client"

import { useState, useEffect, useMemo } from "react"
import { Search, RefreshCw, MapPin, Instagram, Facebook, Bell } from "lucide-react"

const DIAS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"]

const REDES_SOCIALES = {
  instagram: "https://instagram.com/isfd19",
  facebook: "https://facebook.com/isfd19"
}

interface HorarioData {
  Dia?: string
  Día?: string
  dia?: string
  DIA?: string
  Carrera?: string
  carrera?: string
  Horario?: string
  horario?: string
  Aula?: string
  aula?: string
  Turno?: string
  turno?: string
}



export default function CarteleraPage() {
  const [datos, setDatos] = useState<HorarioData[]>([])
  const [novedades, setNovedades] = useState<string[]>([])
  const [diaActual, setDiaActual] = useState("")
  const [busqueda, setBusqueda] = useState("")
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(false)
  const [ultimaSync, setUltimaSync] = useState<Date | null>(null)

  useEffect(() => {
    const dias = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"]
    const hoy = dias[new Date().getDay()]
    setDiaActual(hoy === "Domingo" ? "Lunes" : hoy)
    fetchData()

    const interval = setInterval(() => {
      fetchData(true)
    }, 30000)

    return () => clearInterval(interval)
  }, [])

  const fetchData = async (silent = false) => {
    if (!silent) {
      setCargando(true)
    }
    setError(false)
    
    try {
      const response = await fetch("/api/datos")
      const data = await response.json()
      
      if (data.error) {
        throw new Error(data.error)
      }
      
      setDatos(data.horarios || [])
      setNovedades(data.novedades || [])
      setCargando(false)
      setUltimaSync(new Date())
    } catch {
      setError(true)
      setCargando(false)
    }
  }

  const filtrados = useMemo(() => {
    // Normalizar: quitar tildes y pasar a minusculas
    const normalizar = (str: string) => 
      str.toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim()
    
    return datos.filter(h => {
      const d = normalizar(h.Dia || h.Día || h.dia || h.DIA || "")
      const c = normalizar(h.Carrera || h.carrera || "")
      const a = normalizar(h.Aula || h.aula || "")
      const current = normalizar(diaActual)
      
      const matchDia = d === current
      const matchBusqueda = c.includes(normalizar(busqueda)) || a.includes(normalizar(busqueda))
      
      return matchDia && (busqueda === "" || matchBusqueda)
    })
  }, [datos, diaActual, busqueda])

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-3xl px-4 py-8 md:py-16">
        {/* Header */}
        <header className="mb-12">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
              Horarios
            </h1>
            <button 
              onClick={() => fetchData()}
              disabled={cargando}
              className="p-3 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors disabled:opacity-50"
              aria-label="Actualizar"
            >
              <RefreshCw className={`w-5 h-5 ${cargando ? "animate-spin" : ""}`} />
            </button>
          </div>
          <p className="text-muted-foreground font-mono text-sm tracking-wide uppercase flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
              En vivo
            </span>
            {ultimaSync && (
              <span className="text-muted-foreground/60">
                {ultimaSync.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })}
              </span>
            )}
          </p>
        </header>

        {/* Redes Sociales - Top */}
        <div className="flex gap-3 mb-8">
          <a 
            href={REDES_SOCIALES.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2.5 bg-secondary rounded-lg hover:bg-secondary/80 transition-colors group"
          >
            <Instagram className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
            <span className="text-xs font-mono text-muted-foreground group-hover:text-foreground transition-colors">
              Instagram
            </span>
          </a>
          <a 
            href={REDES_SOCIALES.facebook}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2.5 bg-secondary rounded-lg hover:bg-secondary/80 transition-colors group"
          >
            <Facebook className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
            <span className="text-xs font-mono text-muted-foreground group-hover:text-foreground transition-colors">
              Facebook
            </span>
          </a>
        </div>

        {/* Novedades - Carousel style */}
        {novedades.length > 0 && (
          <section className="mb-10">
            <h2 className="text-lg font-bold tracking-tight flex items-center gap-2 mb-4">
              <Bell className="w-4 h-4 text-muted-foreground" />
              Novedades
            </h2>
            <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 snap-x snap-mandatory">
              {novedades.map((texto, index) => (
                <div 
                  key={index}
                  className={`flex-shrink-0 w-72 p-4 rounded-lg transition-colors cursor-pointer hover:bg-secondary snap-start ${
                    index === 0 ? "bg-secondary border-l-2 border-primary" : "bg-secondary/50"
                  }`}
                >
                  {index === 0 && (
                    <span className="text-[10px] font-mono uppercase tracking-wider bg-primary text-primary-foreground px-2 py-0.5 rounded mb-2 inline-block">
                      Nuevo
                    </span>
                  )}
                  <p className="text-sm text-foreground">
                    {texto}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Filters */}
        <div className="flex flex-col gap-4 mb-8">
          {/* Day tabs */}
          <div className="flex gap-1 p-1 bg-secondary rounded-lg overflow-x-auto">
            {DIAS.map(d => (
              <button 
                key={d}
                onClick={() => setDiaActual(d)}
                className={`px-4 py-2.5 rounded-md text-xs font-mono uppercase tracking-wider transition-all whitespace-nowrap ${
                  diaActual === d 
                    ? "bg-primary text-primary-foreground" 
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {d}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input 
              type="text"
              placeholder="Buscar..."
              className="w-full h-12 pl-11 pr-4 bg-secondary border-0 rounded-lg outline-none focus:ring-2 focus:ring-primary/50 text-foreground placeholder:text-muted-foreground font-mono text-sm transition-all"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>
        </div>

        {/* Table Header */}
        <div className="hidden md:grid grid-cols-12 gap-4 px-4 py-3 text-xs font-mono uppercase tracking-wider text-muted-foreground border-b border-border mb-2">
          <div className="col-span-2">Horario</div>
          <div className="col-span-6">Carrera</div>
          <div className="col-span-2">Turno</div>
          <div className="col-span-2 text-right">Aula</div>
        </div>

        {/* List */}
        <div className="space-y-1">
          {cargando ? (
            <div className="text-center py-20">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
                Cargando...
              </p>
            </div>
          ) : error ? (
            <div className="py-20 text-center">
              <p className="text-sm font-mono text-muted-foreground mb-4">
                Error al cargar datos
              </p>
              <button 
                onClick={() => fetchData()}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-mono"
              >
                Reintentar
              </button>
            </div>
          ) : filtrados.length > 0 ? (
            filtrados.map((h, i) => {
              const isEven = i % 2 === 0
              return (
                <div 
                  key={i} 
                  className={`grid grid-cols-12 gap-4 px-4 py-4 rounded-lg transition-colors ${
                    isEven ? "bg-secondary/50" : ""
                  } hover:bg-secondary`}
                >
                  {/* Time */}
                  <div className="col-span-12 md:col-span-2 flex items-center">
                    <span className="font-mono text-sm text-muted-foreground">
                      {h.Horario || h.horario || "--:--"}
                    </span>
                  </div>
                  
                  {/* Career */}
                  <div className="col-span-12 md:col-span-6 flex items-center">
                    <span className="font-semibold text-foreground uppercase tracking-wide text-sm">
                      {h.Carrera || h.carrera}
                    </span>
                  </div>
                  
                  {/* Shift */}
                  <div className="col-span-6 md:col-span-2 flex items-center">
                    <span className="text-xs font-mono text-muted-foreground uppercase">
                      {h.Turno || h.turno || "-"}
                    </span>
                  </div>
                  
                  {/* Room */}
                  <div className="col-span-6 md:col-span-2 flex items-center justify-end gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="font-mono font-bold text-foreground">
                      {h.Aula || h.aula}
                    </span>
                  </div>
                </div>
              )
            })
          ) : (
            <div className="py-20 text-center">
              <p className="text-sm font-mono text-muted-foreground">
                Sin clases para {diaActual.toLowerCase()}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="mt-16 pt-8 border-t border-border text-center">
          <p className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
            ISFD N°19 - Cartelera de Horarios
          </p>
        </footer>
      </div>
    </div>
  )
}
