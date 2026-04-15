import { NextResponse } from "next/server"
import Papa from "papaparse"

const SHEET_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vReaVS6mnh4C46hwJQp65r_RFHgZsQaWnsJyH7w8pJGdYHcn_R84Wz3hRorPXgBwT7g6-U5ld3S1DF_/pub?output=csv"
const NOVEDADES_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vReaVS6mnh4C46hwJQp65r_RFHgZsQaWnsJyH7w8pJGdYHcn_R84Wz3hRorPXgBwT7g6-U5ld3S1DF_/pub?gid=318237054&single=true&output=csv"

// Cache en memoria del servidor
let cachedHorarios: unknown[] | null = null
let cachedNovedades: string[] | null = null
let lastFetch: number = 0
const CACHE_DURATION = 10000 // 10 segundos de cache

async function fetchCSV(url: string): Promise<string> {
  const response = await fetch(url, { 
    next: { revalidate: 10 } // Cache de Next.js
  })
  return response.text()
}

function parseCSV<T>(csv: string): T[] {
  const result = Papa.parse<T>(csv, {
    header: true,
    skipEmptyLines: true
  })
  return result.data
}

async function getData() {
  const now = Date.now()
  
  // Si el cache es valido, retornar datos cacheados
  if (cachedHorarios && cachedNovedades && (now - lastFetch) < CACHE_DURATION) {
    return { horarios: cachedHorarios, novedades: cachedNovedades, fromCache: true }
  }
  
  // Fetch ambos en paralelo
  const [horariosCSV, novedadesCSV] = await Promise.all([
    fetchCSV(SHEET_CSV_URL),
    fetchCSV(NOVEDADES_CSV_URL)
  ])
  
  // Parsear horarios
  const horariosData = parseCSV<Record<string, string>>(horariosCSV)
  cachedHorarios = horariosData.filter(r => r.Carrera || r.carrera || r.Aula || r.aula)
  
  // Parsear novedades
  const novedadesData = parseCSV<Record<string, string>>(novedadesCSV)
  cachedNovedades = novedadesData
    .map(r => r.Novedades || r.novedades || Object.values(r)[0] || "")
    .filter(text => text.trim() !== "")
  
  lastFetch = now
  
  return { horarios: cachedHorarios, novedades: cachedNovedades, fromCache: false }
}

export async function GET() {
  try {
    const { horarios, novedades, fromCache } = await getData()
    
    return NextResponse.json(
      { 
        horarios, 
        novedades,
        timestamp: new Date().toISOString(),
        cached: fromCache
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=10, stale-while-revalidate=59"
        }
      }
    )
  } catch (error) {
    console.error("[v0] Error fetching data:", error)
    return NextResponse.json(
      { error: "Error al cargar datos", horarios: [], novedades: [] },
      { status: 500 }
    )
  }
}
