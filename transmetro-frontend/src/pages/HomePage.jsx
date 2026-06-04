import { useEffect, useState } from 'react'
import api from '../api/client'

export default function HomePage() {
  const [reporte, setReporte] = useState([])
  const [alertas, setAlertas] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/api/reporte/lineas'),
      api.get('/api/alerta?soloActivas=true'),
    ]).then(([r, a]) => {
      setReporte(r.data)
      setAlertas(a.data)
    }).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="loading">Cargando...</div>

  const totalLineas    = reporte.length
  const totalBuses     = reporte.reduce((s, l) => s + l.totalBuses, 0)
  const busesActivos   = reporte.reduce((s, l) => s + l.busesActivos, 0)
  const totalEstaciones= reporte.reduce((s, l) => s + l.totalEstaciones, 0)
  const alertasActivas = alertas.length

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Panel de control</div>
          <div className="page-subtitle">Resumen operativo del sistema Transmetro</div>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Líneas activas</div>
          <div className="stat-value stat-accent">{totalLineas}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Estaciones</div>
          <div className="stat-value">{totalEstaciones}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Buses en flota</div>
          <div className="stat-value">{totalBuses}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Buses activos</div>
          <div className="stat-value stat-green">{busesActivos}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Alertas activas</div>
          <div className={`stat-value ${alertasActivas > 0 ? 'stat-danger' : 'stat-green'}`}>
            {alertasActivas}
          </div>
        </div>
      </div>

      <div className="card">
        <div style={{ marginBottom: 16, fontWeight: 600, fontSize: 15 }}>
          Resumen por línea
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Línea</th>
                <th>Estaciones</th>
                <th>Buses totales</th>
                <th>Buses activos</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {reporte.map(l => (
                <tr key={l.id}>
                  <td style={{ fontWeight: 600 }}>{l.nombre}</td>
                  <td>{l.totalEstaciones}</td>
                  <td>{l.totalBuses}</td>
                  <td>{l.busesActivos}</td>
                  <td>
                    <span className={`badge ${l.activa ? 'badge-green' : 'badge-gray'}`}>
                      {l.activa ? 'Activa' : 'Inactiva'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}