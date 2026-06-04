import { useEffect, useState } from 'react'
import api from '../api/client'

// ── BUSES ────────────────────────────────────────────────────
const emptyBus = { lineaId: '', placa: '', capacidadMaxima: '', estado: 'activo' }

export function BusesPage() {
  const [buses, setBuses]     = useState([])
  const [lineas, setLineas]   = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal]     = useState(false)
  const [form, setForm]       = useState(emptyBus)
  const [editId, setEditId]   = useState(null)
  const [saving, setSaving]   = useState(false)

  useEffect(() => {
    api.get('/api/linea').then(r => setLineas(r.data))
    fetchBuses()
  }, [])

  async function fetchBuses() {
    setLoading(true)
    const { data } = await api.get('/api/bus')
    setBuses(data); setLoading(false)
  }

  function openEdit(b) {
    setForm({ lineaId: b.lineaId ?? '', placa: b.placa,
              capacidadMaxima: b.capacidadMaxima, estado: b.estado })
    setEditId(b.id); setModal(true)
  }

  async function handleSave() {
    setSaving(true)
    const payload = { ...form, capacidadMaxima: parseInt(form.capacidadMaxima) }
    try {
      if (editId) await api.put(`/api/bus/${editId}`, payload)
      else        await api.post('/api/bus', payload)
      setModal(false); fetchBuses()
    } finally { setSaving(false) }
  }

  async function handleDelete(id) {
    if (!confirm('¿Eliminar este bus?')) return
    await api.delete(`/api/bus/${id}`); fetchBuses()
  }

  const estadoBadge = (e) => ({
    activo: 'badge-green', en_mantenimiento: 'badge-warn', fuera_de_servicio: 'badge-danger'
  }[e] ?? 'badge-gray')

  const lineaNombre = (id) => lineas.find(l => l.id === id)?.nombre ?? '—'
  const f = (k) => e => setForm(p => ({ ...p, [k]: e.target.value }))

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Buses</div>
          <div className="page-subtitle">Gestión de flota vehicular</div>
        </div>
        <button className="btn btn-primary" onClick={() => { setForm(emptyBus); setEditId(null); setModal(true) }}>
          + Nuevo bus
        </button>
      </div>

      <div className="card">
        {loading ? <div className="loading">Cargando...</div> : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Placa</th><th>Línea</th><th>Capacidad</th><th>Estado</th><th>Acciones</th></tr></thead>
              <tbody>
                {buses.map(b => (
                  <tr key={b.id}>
                    <td style={{ fontWeight: 600, fontFamily: 'var(--mono)' }}>{b.placa}</td>
                    <td><span className="badge badge-blue">{lineaNombre(b.lineaId)}</span></td>
                    <td style={{ fontFamily: 'var(--mono)' }}>{b.capacidadMaxima}</td>
                    <td><span className={`badge ${estadoBadge(b.estado)}`}>{b.estado.replace('_', ' ')}</span></td>
                    <td>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button className="btn btn-ghost btn-sm" onClick={() => openEdit(b)}>Editar</button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(b.id)}>Eliminar</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <div className="modal-title">{editId ? 'Editar bus' : 'Nuevo bus'}</div>
              <button className="modal-close" onClick={() => setModal(false)}>×</button>
            </div>
            <div className="form-grid">
              <div className="form-field full">
                <label>Línea</label>
                <select value={form.lineaId} onChange={f('lineaId')}>
                  <option value="">Sin asignar</option>
                  {lineas.map(l => <option key={l.id} value={l.id}>{l.nombre}</option>)}
                </select>
              </div>
              <div className="form-field">
                <label>Placa</label>
                <input value={form.placa} onChange={f('placa')} />
              </div>
              <div className="form-field">
                <label>Capacidad máxima</label>
                <input type="number" value={form.capacidadMaxima} onChange={f('capacidadMaxima')} />
              </div>
              <div className="form-field full">
                <label>Estado</label>
                <select value={form.estado} onChange={f('estado')}>
                  <option value="activo">Activo</option>
                  <option value="en_mantenimiento">En mantenimiento</option>
                  <option value="fuera_de_servicio">Fuera de servicio</option>
                </select>
              </div>
            </div>
            <div className="modal-actions">
              <button className="btn btn-ghost" onClick={() => setModal(false)}>Cancelar</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}


// ── PILOTOS ──────────────────────────────────────────────────
const emptyPiloto = { busId: '', nombre: '', apellido: '', dpi: '', telefono: '', direccion: '', formacion: '' }

export function PilotosPage() {
  const [pilotos, setPilotos] = useState([])
  const [buses, setBuses]     = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal]     = useState(false)
  const [form, setForm]       = useState(emptyPiloto)
  const [editId, setEditId]   = useState(null)
  const [saving, setSaving]   = useState(false)

  useEffect(() => {
    api.get('/api/bus').then(r => setBuses(r.data))
    fetchPilotos()
  }, [])

  async function fetchPilotos() {
    setLoading(true)
    const { data } = await api.get('/api/piloto')
    setPilotos(data); setLoading(false)
  }

  function openEdit(p) {
    setForm({ busId: p.busId ?? '', nombre: p.nombre, apellido: p.apellido,
              dpi: p.dpi, telefono: p.telefono ?? '', direccion: p.direccion ?? '',
              formacion: p.formacion ?? '' })
    setEditId(p.id); setModal(true)
  }

  async function handleSave() {
    setSaving(true)
    try {
      if (editId) await api.put(`/api/piloto/${editId}`, form)
      else        await api.post('/api/piloto', form)
      setModal(false); fetchPilotos()
    } finally { setSaving(false) }
  }

  async function handleDelete(id) {
    if (!confirm('¿Eliminar este piloto?')) return
    await api.delete(`/api/piloto/${id}`); fetchPilotos()
  }

  const busPlaca = (id) => buses.find(b => b.id === id)?.placa ?? '—'
  const f = (k) => e => setForm(p => ({ ...p, [k]: e.target.value }))

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Pilotos</div>
          <div className="page-subtitle">Gestión de conductores</div>
        </div>
        <button className="btn btn-primary" onClick={() => { setForm(emptyPiloto); setEditId(null); setModal(true) }}>
          + Nuevo piloto
        </button>
      </div>

      <div className="card">
        {loading ? <div className="loading">Cargando...</div> : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Nombre</th><th>DPI</th><th>Bus asignado</th><th>Teléfono</th><th>Acciones</th></tr></thead>
              <tbody>
                {pilotos.map(p => (
                  <tr key={p.id}>
                    <td style={{ fontWeight: 600 }}>{p.nombre} {p.apellido}</td>
                    <td style={{ fontFamily: 'var(--mono)', color: 'var(--text2)' }}>{p.dpi}</td>
                    <td><span className="badge badge-blue">{busPlaca(p.busId)}</span></td>
                    <td style={{ color: 'var(--text2)' }}>{p.telefono}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button className="btn btn-ghost btn-sm" onClick={() => openEdit(p)}>Editar</button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(p.id)}>Eliminar</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <div className="modal-title">{editId ? 'Editar piloto' : 'Nuevo piloto'}</div>
              <button className="modal-close" onClick={() => setModal(false)}>×</button>
            </div>
            <div className="form-grid">
              <div className="form-field">
                <label>Nombre</label>
                <input value={form.nombre} onChange={f('nombre')} />
              </div>
              <div className="form-field">
                <label>Apellido</label>
                <input value={form.apellido} onChange={f('apellido')} />
              </div>
              <div className="form-field">
                <label>DPI</label>
                <input value={form.dpi} onChange={f('dpi')} />
              </div>
              <div className="form-field">
                <label>Teléfono</label>
                <input value={form.telefono} onChange={f('telefono')} />
              </div>
              <div className="form-field full">
                <label>Dirección</label>
                <input value={form.direccion} onChange={f('direccion')} />
              </div>
              <div className="form-field full">
                <label>Formación</label>
                <input value={form.formacion} onChange={f('formacion')} />
              </div>
              <div className="form-field full">
                <label>Bus asignado</label>
                <select value={form.busId} onChange={f('busId')}>
                  <option value="">Sin asignar</option>
                  {buses.map(b => <option key={b.id} value={b.id}>{b.placa}</option>)}
                </select>
              </div>
            </div>
            <div className="modal-actions">
              <button className="btn btn-ghost" onClick={() => setModal(false)}>Cancelar</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}


// ── FLUJO ────────────────────────────────────────────────────
export function FlujoPage() {
  const [estaciones, setEstaciones] = useState([])
  const [historial, setHistorial]   = useState([])
  const [estacionId, setEstacionId] = useState('')
  const [cantidad, setCantidad]     = useState('')
  const [loading, setLoading]       = useState(false)
  const [registrando, setRegistrando] = useState(false)
  const [msg, setMsg]               = useState(null)

  useEffect(() => {
    api.get('/api/estacion').then(r => setEstaciones(r.data))
  }, [])

  useEffect(() => {
    if (estacionId) fetchHistorial()
  }, [estacionId])

  async function fetchHistorial() {
    setLoading(true)
    const { data } = await api.get(`/api/flujo?estacionId=${estacionId}&limite=20`)
    setHistorial(data); setLoading(false)
  }

  async function handleRegistrar() {
    if (!estacionId || !cantidad) return
    setRegistrando(true); setMsg(null)
    try {
      await api.post('/api/flujo', { estacionId, cantidadActual: parseInt(cantidad) })
      setMsg({ tipo: 'ok', texto: 'Flujo registrado correctamente' })
      setCantidad(''); fetchHistorial()
    } catch {
      setMsg({ tipo: 'error', texto: 'Error al registrar flujo' })
    } finally { setRegistrando(false) }
  }

  const estNombre = (id) => estaciones.find(e => e.id === id)?.nombre ?? id

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Control de flujo</div>
          <div className="page-subtitle">Registro de pasajeros por estación</div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 24 }}>
        <div style={{ fontWeight: 600, marginBottom: 16 }}>Registrar flujo</div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div className="form-field" style={{ minWidth: 220 }}>
            <label>Estación</label>
            <select value={estacionId} onChange={e => setEstacionId(e.target.value)}>
              <option value="">Seleccionar estación</option>
              {estaciones.map(e => <option key={e.id} value={e.id}>{e.nombre}</option>)}
            </select>
          </div>
          <div className="form-field" style={{ minWidth: 140 }}>
            <label>Cantidad actual</label>
            <input type="number" value={cantidad}
              onChange={e => setCantidad(e.target.value)}
              placeholder="0" />
          </div>
          <button className="btn btn-primary" onClick={handleRegistrar} disabled={registrando}>
            {registrando ? 'Registrando...' : 'Registrar'}
          </button>
        </div>
        {msg && (
          <div style={{ marginTop: 12, fontSize: 13,
            color: msg.tipo === 'ok' ? 'var(--accent2)' : 'var(--danger)' }}>
            {msg.texto}
          </div>
        )}
      </div>

      {estacionId && (
        <div className="card">
          <div style={{ fontWeight: 600, marginBottom: 16 }}>
            Historial — {estNombre(estacionId)}
          </div>
          {loading ? <div className="loading">Cargando...</div> : (
            <div className="table-wrap">
              <table>
                <thead><tr><th>Fecha y hora</th><th>Cantidad</th></tr></thead>
                <tbody>
                  {historial.map(h => (
                    <tr key={h.id}>
                      <td style={{ color: 'var(--text2)', fontFamily: 'var(--mono)', fontSize: 12 }}>
                        {new Date(h.registradoEn).toLocaleString('es-GT')}
                      </td>
                      <td style={{ fontFamily: 'var(--mono)', fontWeight: 600 }}>
                        {h.cantidadActual}
                      </td>
                    </tr>
                  ))}
                  {historial.length === 0 && (
                    <tr><td colSpan={2} className="empty">Sin registros</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  )
}


// ── ALERTAS ──────────────────────────────────────────────────
export function AlertasPage() {
  const [alertas, setAlertas]       = useState([])
  const [soloActivas, setSolo]      = useState(true)
  const [loading, setLoading]       = useState(true)
  const [resolviendo, setResolviendo] = useState(null)

  useEffect(() => { fetchAlertas() }, [soloActivas])

  async function fetchAlertas() {
    setLoading(true)
    const { data } = await api.get(`/api/alerta?soloActivas=${soloActivas}`)
    setAlertas(data); setLoading(false)
  }

  async function handleResolver(id) {
    setResolviendo(id)
    await api.patch(`/api/alerta/${id}/resolver`, { resuelta: true })
    setResolviendo(null); fetchAlertas()
  }

  const tipoIcon = (t) => t === 'saturacion_estacion' ? '⚠️' : '📉'

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Alertas</div>
          <div className="page-subtitle">Notificaciones operativas del sistema</div>
        </div>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text2)', cursor: 'pointer' }}>
          <input type="checkbox" checked={soloActivas}
            onChange={e => setSolo(e.target.checked)} />
          Solo alertas activas
        </label>
      </div>

      {loading ? <div className="loading">Cargando...</div> : alertas.length === 0 ? (
        <div className="empty">No hay alertas {soloActivas ? 'activas' : ''}</div>
      ) : (
        alertas.map(a => (
          <div key={a.id} className={`alert-item ${a.resuelta ? 'resolved' : 'unresolved'}`}>
            <span className="alert-icon">{tipoIcon(a.tipo)}</span>
            <div style={{ flex: 1 }}>
              <div className="alert-desc">{a.descripcion}</div>
              <div className="alert-meta">
                {new Date(a.creadaEn).toLocaleString('es-GT')} ·
                <span className={`badge ${a.resuelta ? 'badge-green' : 'badge-danger'}`}
                  style={{ marginLeft: 6 }}>
                  {a.resuelta ? 'Resuelta' : 'Activa'}
                </span>
              </div>
            </div>
            {!a.resuelta && (
              <button className="btn btn-success btn-sm"
                onClick={() => handleResolver(a.id)}
                disabled={resolviendo === a.id}>
                {resolviendo === a.id ? '...' : 'Resolver'}
              </button>
            )}
          </div>
        ))
      )}
    </div>
  )
}


// ── REPORTES ─────────────────────────────────────────────────
export function ReportesPage() {
  const [reporte, setReporte]       = useState([])
  const [estaciones, setEstaciones] = useState([])
  const [accesos, setAccesos]       = useState([])
  const [estacionId, setEstacionId] = useState('')
  const [loading, setLoading]       = useState(true)
  const [loadingAccesos, setLoadingAccesos] = useState(false)

  useEffect(() => {
    Promise.all([
      api.get('/api/reporte/lineas'),
      api.get('/api/estacion'),
    ]).then(([r, e]) => {
      setReporte(r.data); setEstaciones(e.data)
    }).finally(() => setLoading(false))
  }, [])

  async function fetchAccesos() {
    if (!estacionId) return
    setLoadingAccesos(true)
    const { data } = await api.get(`/api/acceso?estacionId=${estacionId}`)
    setAccesos(data); setLoadingAccesos(false)
  }

  if (loading) return <div className="loading">Cargando...</div>

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Reportes</div>
          <div className="page-subtitle">Métricas y accesos del sistema</div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 24 }}>
        <div style={{ fontWeight: 600, marginBottom: 16 }}>Reporte por línea</div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Línea</th><th>Descripción</th><th>Estaciones</th>
                <th>Buses totales</th><th>Buses activos</th><th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {reporte.map(l => (
                <tr key={l.id}>
                  <td style={{ fontWeight: 600 }}>{l.nombre}</td>
                  <td style={{ color: 'var(--text2)', fontSize: 12 }}>{l.descripcion}</td>
                  <td style={{ fontFamily: 'var(--mono)' }}>{l.totalEstaciones}</td>
                  <td style={{ fontFamily: 'var(--mono)' }}>{l.totalBuses}</td>
                  <td style={{ fontFamily: 'var(--mono)' }}>{l.busesActivos}</td>
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

      <div className="card">
        <div style={{ fontWeight: 600, marginBottom: 16 }}>Accesos por estación</div>
        <div style={{ display: 'flex', gap: 12, marginBottom: 16, alignItems: 'flex-end' }}>
          <div className="form-field" style={{ minWidth: 220 }}>
            <label>Estación</label>
            <select value={estacionId} onChange={e => setEstacionId(e.target.value)}>
              <option value="">Seleccionar estación</option>
              {estaciones.map(e => <option key={e.id} value={e.id}>{e.nombre}</option>)}
            </select>
          </div>
          <button className="btn btn-primary" onClick={fetchAccesos} disabled={!estacionId}>
            Consultar
          </button>
        </div>

        {loadingAccesos ? <div className="loading">Cargando...</div> : accesos.length > 0 ? (
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Nombre</th><th>Descripción</th><th>Estado</th></tr>
              </thead>
              <tbody>
                {accesos.map(a => (
                  <tr key={a.id}>
                    <td style={{ fontWeight: 600 }}>{a.nombre}</td>
                    <td style={{ color: 'var(--text2)', fontSize: 12 }}>{a.descripcion ?? '—'}</td>
                    <td>
                      <span className={`badge ${a.activo ? 'badge-green' : 'badge-gray'}`}>
                        {a.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : estacionId ? (
          <div className="empty">Sin accesos registrados</div>
        ) : null}
      </div>
    </div>
  )
}