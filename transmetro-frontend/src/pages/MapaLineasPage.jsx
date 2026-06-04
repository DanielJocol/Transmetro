import React, { useEffect, useState, useRef } from 'react'
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import api from '../api/client'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

const COLORES = {
  'Línea 1':     '#6B48FF',
  'Línea 2':     '#9B59B6',
  'Línea 6':     '#F1C40F',
  'Línea 7':     '#95A5A6',
  'Línea 12':    '#E74C3C',
  'Línea 13':    '#2ECC71',
  'Línea 18':    '#3498DB',
  'Expreso 125': '#E67E22',
}

function elegirSprite(p1, p2) {
  const dLat = p2[0] - p1[0]
  const dLng = p2[1] - p1[1]
  const angulo = Math.atan2(dLng, dLat) * 180 / Math.PI
  if (angulo >= -22.5  && angulo <  22.5)  return '/sprites/Sprite 04.png'
  if (angulo >=  22.5  && angulo <  67.5)  return '/sprites/Sprite 07.png'
  if (angulo >=  67.5  && angulo < 112.5)  return '/sprites/Sprite 02.png'
  if (angulo >= 112.5  && angulo < 157.5)  return '/sprites/Sprite 06.png'
  if (angulo >= 157.5  || angulo < -157.5) return '/sprites/Sprite 03.png'
  if (angulo >= -157.5 && angulo < -112.5) return '/sprites/Sprite 05.png'
  if (angulo >= -112.5 && angulo <  -67.5) return '/sprites/Sprite 01.png'
  if (angulo >=  -67.5 && angulo <  -22.5) return '/sprites/Sprite 08.png'
  return '/sprites/Sprite 02.png'
}

function iconoBus(spriteUrl, placa, color) {
  return L.divIcon({
    className: '',
    html: `
      <div style="display:flex;flex-direction:column;align-items:center;gap:2px;filter:drop-shadow(0 2px 6px rgba(0,0,0,0.6))">
        <img src="${spriteUrl}" style="width:48px;height:48px;object-fit:contain;" />
        <div style="background:${color};color:#fff;font-size:8px;font-weight:700;padding:1px 5px;border-radius:3px;font-family:monospace;white-space:nowrap;box-shadow:0 1px 3px rgba(0,0,0,0.4)">
          ${placa}
        </div>
      </div>`,
    iconSize:   [60, 64],
    iconAnchor: [30, 32],
  })
}

function haversine(p1, p2) {
  const R = 6371000
  const dLat = (p2.latitud - p1.latitud) * Math.PI / 180
  const dLng = (p2.longitud - p1.longitud) * Math.PI / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(p1.latitud * Math.PI / 180) *
    Math.cos(p2.latitud * Math.PI / 180) *
    Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function haversineArr(p1, p2) {
  return haversine(
    { latitud: p1[0], longitud: p1[1] },
    { latitud: p2[0], longitud: p2[1] }
  )
}

const VELOCIDAD_MS = 25000 / 3600

function mapearPuntosAEstaciones(rutaPuntos, estaciones) {
  const n       = rutaPuntos.length
  const mapping = new Array(n).fill(0)

  const indicesEstacion = []
  let busquedaDesde = 0
  for (let e = 0; e < estaciones.length; e++) {
    const est = estaciones[e]
    let minDist = Infinity, mejorIdx = busquedaDesde
    const limite = Math.min(busquedaDesde + Math.ceil(n / estaciones.length) * 2, n)
    for (let i = busquedaDesde; i < limite; i++) {
      const d = haversineArr(rutaPuntos[i], [est.latitud, est.longitud])
      if (d < minDist) { minDist = d; mejorIdx = i }
    }
    indicesEstacion.push(mejorIdx)
    busquedaDesde = mejorIdx
  }

  for (let e = 0; e < indicesEstacion.length; e++) {
    const desde = indicesEstacion[e]
    const hasta = e < indicesEstacion.length - 1 ? indicesEstacion[e + 1] : n
    for (let i = desde; i < hasta; i++) mapping[i] = e
  }
  for (let i = 0; i < indicesEstacion[0]; i++) mapping[i] = 0

  return mapping
}

function distanciaTotal(puntos) {
  let total = 0
  for (let i = 0; i < puntos.length - 1; i++) {
    const p1 = { latitud: puntos[i][0],   longitud: puntos[i][1] }
    const p2 = { latitud: puntos[i+1][0], longitud: puntos[i+1][1] }
    total += haversine(p1, p2)
  }
  return total
}

async function obtenerRutaOSRM(estaciones) {
  try {
    const lista  = [...estaciones, estaciones[0]]
    const coords = lista.map(e => `${e.longitud},${e.latitud}`).join(';')
    const url    = `https://router.project-osrm.org/route/v1/driving/${coords}?overview=full&geometries=geojson`
    const res    = await fetch(url)
    const data   = await res.json()
    if (data.code === 'Ok' && data.routes?.[0])
      return data.routes[0].geometry.coordinates.map(([lng, lat]) => [lat, lng])
  } catch (e) {
    console.warn('OSRM no disponible:', e)
  }
  return [...estaciones, estaciones[0]].map(e => [e.latitud, e.longitud])
}

function interpolar(p1, p2, t) {
  return [p1[0] + (p2[0] - p1[0]) * t, p1[1] + (p2[1] - p1[1]) * t]
}

function iconoEstacion(color, numero) {
  return L.divIcon({
    className: '',
    html: `<div style="background:${color};color:#fff;width:24px;height:24px;border-radius:50%;border:2px solid #fff;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;box-shadow:0 2px 6px rgba(0,0,0,0.4);">${numero}</div>`,
    iconSize: [24, 24], iconAnchor: [12, 12],
  })
}

// Componente memoizado — nunca se re-renderiza por animaciones de buses
const EstacionesLayer = React.memo(({ estaciones, color }) => (
  <>
    {estaciones.map((est, i) => (
      <Marker
        key={est.id}
        position={[est.latitud, est.longitud]}
        icon={iconoEstacion(color, i + 1)}
        eventHandlers={{ click: e => e.target.openPopup() }}
      >
        <Popup>
          <div style={{ fontFamily: 'sans-serif', minWidth: 160 }}>
            <b style={{ fontSize: 14 }}>{est.nombre}</b>
            <hr style={{ margin: '6px 0' }} />
            <div style={{ fontSize: 12 }}>
              <div>Orden: <b>{est.ordenEnLinea}</b></div>
              <div>Capacidad: <b>{est.capacidadMaxima} pasajeros</b></div>
            </div>
          </div>
        </Popup>
      </Marker>
    ))}
  </>
))

function CentrarMapa({ puntos }) {
  const map = useMap()
  useEffect(() => {
    if (!puntos.length) return
    map.fitBounds(L.latLngBounds(puntos), { padding: [40, 40] })
  }, [puntos])
  return null
}

function BusCirculando({ rutaPuntos, puntosAEstaciones, estaciones, offsetInicial, bus, color, onEstado }) {
  const [posicion, setPosicion]   = useState(null)
  const [spriteUrl, setSpriteUrl] = useState('/sprites/Sprite 02.png')
  const rafRef   = useRef(null)
  const indexRef = useRef(0)
  const startRef = useRef(null)
  const durMs    = 2000

  function limpiar() {
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    rafRef.current = null; startRef.current = null
  }

  function calcularProxima(idx) {
    if (!puntosAEstaciones?.length || !estaciones?.length) return
    const n            = rutaPuntos.length
    const estActualIdx = puntosAEstaciones[idx % n]
    const proximaIdx   = (estActualIdx + 1) % estaciones.length

    let distRestante = 0
    let i = idx % n
    let pasos = 0
    while (puntosAEstaciones[i % n] !== proximaIdx) {
      distRestante += haversineArr(rutaPuntos[i % n], rutaPuntos[(i + 1) % n])
      i++
      if (++pasos > n) break
    }

    const minutos = Math.max(1, Math.ceil(distRestante / VELOCIDAD_MS / 60))
    onEstado(bus.id, { proximaEstacion: estaciones[proximaIdx], minutos })
  }

  function animarTramo(o, d, idx, onFin) {
    startRef.current = null
    setSpriteUrl(elegirSprite(o, d))

    function frame(ts) {
      if (!startRef.current) startRef.current = ts
      const t    = Math.min((ts - startRef.current) / durMs, 1)
      const ease = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t
      setPosicion(interpolar(o, d, ease))
      calcularProxima(idx)
      if (t < 1) rafRef.current = requestAnimationFrame(frame)
      else onFin()
    }
    rafRef.current = requestAnimationFrame(frame)
  }

  function avanzar(idx) {
    const total = rutaPuntos.length
    const curr  = idx % total
    const next  = (idx + 1) % total
    animarTramo(rutaPuntos[curr], rutaPuntos[next], curr, () => {
      indexRef.current = idx + 1
      avanzar(idx + 1)
    })
  }

  useEffect(() => {
    if (!rutaPuntos.length) return
    const startIdx = Math.floor(offsetInicial * rutaPuntos.length)
    indexRef.current = startIdx
    setPosicion(rutaPuntos[startIdx])
    const t = setTimeout(() => avanzar(startIdx), offsetInicial * 800)
    return () => { clearTimeout(t); limpiar() }
  }, [rutaPuntos])

  useEffect(() => () => limpiar(), [])

  if (!posicion) return null

  return (
    <Marker
      position={posicion}
      icon={iconoBus(spriteUrl, bus.placa, color)}
      zIndexOffset={1000}
    >
      <Popup>
        <div style={{ fontFamily: 'sans-serif', minWidth: 160 }}>
          <b style={{ fontSize: 14 }}>🚌 {bus.placa}</b>
          <hr style={{ margin: '6px 0' }} />
          <div style={{ fontSize: 12 }}>
            <div>Estado: <b style={{ color: '#22c55e' }}>{bus.estado}</b></div>
            <div>Capacidad: <b>{bus.capacidadMaxima} pasajeros</b></div>
          </div>
        </div>
      </Popup>
    </Marker>
  )
}

export default function MapaLineasPage() {
  const [lineas, setLineas]                       = useState([])
  const [lineaSeleccionada, setLinea]             = useState(null)
  const [estaciones, setEstaciones]               = useState([])
  const [buses, setBuses]                         = useState([])
  const [rutaPuntos, setRutaPuntos]               = useState([])
  const [puntosAEstaciones, setPuntosAEstaciones] = useState([])
  const [estadoBuses, setEstadoBuses]             = useState({})
  const [distancia, setDistancia]                 = useState(null)
  const [cargandoRuta, setCargando]               = useState(false)

  useEffect(() => { api.get('/api/linea').then(r => setLineas(r.data)) }, [])

  useEffect(() => {
    if (!lineaSeleccionada) return
    setRutaPuntos([]); setBuses([]); setEstadoBuses({}); setPuntosAEstaciones([])
    setCargando(true)
    Promise.all([
      api.get(`/api/estacion?lineaId=${lineaSeleccionada.id}`),
      api.get(`/api/bus?lineaId=${lineaSeleccionada.id}&estado=activo`)
    ]).then(async ([estRes, busRes]) => {
      const sorted = estRes.data.sort((a, b) => a.ordenEnLinea - b.ordenEnLinea)
      setEstaciones(sorted)
      setBuses(busRes.data)
      const ruta = await obtenerRutaOSRM(sorted)
      setRutaPuntos(ruta)
      setDistancia(distanciaTotal(ruta))
      setPuntosAEstaciones(mapearPuntosAEstaciones(ruta, sorted))
      setCargando(false)
    })
  }, [lineaSeleccionada])

  const color   = COLORES[lineaSeleccionada?.nombre] ?? '#3d8ef8'
  const PANEL_H = 'calc(100vh - 140px)'

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Mapa de líneas</div>
          <div className="page-subtitle">Recorridos reales por calles y simulación de operación</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 16, alignItems: 'start' }}>

        <div style={{ height: PANEL_H, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12, paddingRight: 4 }}>

          <div className="card">
            <div style={{ fontWeight: 600, marginBottom: 12, fontSize: 13 }}>Seleccionar línea</div>
            {lineas.map(l => (
              <button key={l.id} onClick={() => setLinea(l)} style={{
                display: 'block', width: '100%', textAlign: 'left',
                padding: '8px 12px', borderRadius: 8, border: 'none',
                marginBottom: 4, cursor: 'pointer', fontSize: 13,
                background: lineaSeleccionada?.id === l.id ? `${COLORES[l.nombre] ?? '#3d8ef8'}22` : 'var(--surface2)',
                color: lineaSeleccionada?.id === l.id ? (COLORES[l.nombre] ?? '#3d8ef8') : 'var(--text)',
                borderLeft: lineaSeleccionada?.id === l.id ? `3px solid ${COLORES[l.nombre] ?? '#3d8ef8'}` : '3px solid transparent',
                fontWeight: lineaSeleccionada?.id === l.id ? 600 : 400,
              }}>
                {l.nombre}
              </button>
            ))}
          </div>

          {distancia !== null && lineaSeleccionada && (
            <div className="card">
              <div style={{ fontWeight: 600, marginBottom: 8, fontSize: 13 }}>{lineaSeleccionada.nombre}</div>
              <div style={{ fontSize: 11, color: 'var(--accent)', marginBottom: 8, fontFamily: 'var(--mono)' }}>⟳ Línea en circuito</div>
              <div style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 2 }}>Estaciones</div>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 22, fontWeight: 700, color: 'var(--accent)', marginBottom: 10 }}>
                {estaciones.length}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 2 }}>Distancia total</div>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 22, fontWeight: 700, color: 'var(--accent2)' }}>
                {(distancia / 1000).toFixed(2)} km
              </div>
            </div>
          )}

          {buses.length > 0 && (
            <div className="card">
              <div style={{ fontWeight: 600, marginBottom: 10, fontSize: 13 }}>
                Buses en operación ({buses.length})
              </div>
              {buses.map((b, i) => {
                const info = estadoBuses[b.id]
                return (
                  <div key={b.id} style={{
                    padding: '8px 0',
                    borderBottom: i < buses.length - 1 ? '1px solid var(--border)' : 'none',
                    fontSize: 12
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <img src="/sprites/Sprite 04.png"
                        style={{ width: 28, height: 28, objectFit: 'contain' }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ color: 'var(--text)', fontWeight: 600, fontFamily: 'var(--mono)' }}>
                          {b.placa}
                        </div>
                        <div style={{ color: 'var(--accent2)', fontSize: 11 }}>
                          ● En ruta · Cap. {b.capacidadMaxima}
                        </div>
                      </div>
                    </div>
                    {info && (
                      <div style={{ marginTop: 6, paddingLeft: 36, fontSize: 11 }}>
                        <span style={{ color: 'var(--text2)' }}>Próxima: </span>
                        <span style={{ color: 'var(--text)', fontWeight: 600 }}>{info.proximaEstacion.nombre}</span>
                        <div style={{ color: 'var(--warning)', fontFamily: 'var(--mono)', marginTop: 2 }}>
                          ⏱ ~{info.minutos} min
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          {estaciones.length > 1 && (
            <div className="card">
              <div style={{ fontWeight: 600, marginBottom: 8, fontSize: 13 }}>Distancias entre estaciones</div>
              {estaciones.slice(0, -1).map((est, i) => {
                const d = haversine(est, estaciones[i + 1])
                return (
                  <div key={est.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid var(--border)', fontSize: 11 }}>
                    <span style={{ color: 'var(--text2)' }}>{est.nombre} →</span>
                    <span style={{ fontFamily: 'var(--mono)', color: 'var(--text)', marginLeft: 6, whiteSpace: 'nowrap' }}>
                      {(d / 1000).toFixed(3)} km
                    </span>
                  </div>
                )
              })}
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', fontSize: 11 }}>
                <span style={{ color: 'var(--accent)' }}>
                  {estaciones[estaciones.length - 1]?.nombre} → {estaciones[0]?.nombre}
                </span>
                <span style={{ fontFamily: 'var(--mono)', color: 'var(--accent)', marginLeft: 6, whiteSpace: 'nowrap' }}>
                  {estaciones.length > 1
                    ? (haversine(estaciones[estaciones.length - 1], estaciones[0]) / 1000).toFixed(3)
                    : 0} km
                </span>
              </div>
            </div>
          )}

          {cargandoRuta && (
            <div className="card">
              <div style={{ fontSize: 12, color: 'var(--text2)' }}>Calculando ruta por calles...</div>
            </div>
          )}
        </div>

        <div style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid var(--border)', height: PANEL_H, position: 'sticky', top: 0 }}>
          <MapContainer center={[14.6349, -90.5069]} zoom={13} style={{ height: '100%', width: '100%' }}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {rutaPuntos.length > 0 && <CentrarMapa puntos={rutaPuntos} />}
            {rutaPuntos.length > 1 && (
              <Polyline positions={rutaPuntos} pathOptions={{ color, weight: 5, opacity: 0.9 }} />
            )}
            <EstacionesLayer estaciones={estaciones} color={color} />
            {puntosAEstaciones.length > 0 && buses.map((bus, i) => (
              <BusCirculando
                key={`${lineaSeleccionada?.id}-${bus.id}`}
                rutaPuntos={rutaPuntos}
                puntosAEstaciones={puntosAEstaciones}
                estaciones={estaciones}
                offsetInicial={i / Math.max(buses.length, 1)}
                bus={bus}
                color={color}
                onEstado={(id, info) => setEstadoBuses(prev => ({ ...prev, [id]: info }))}
              />
            ))}
          </MapContainer>
        </div>
      </div>
    </div>
  )
}