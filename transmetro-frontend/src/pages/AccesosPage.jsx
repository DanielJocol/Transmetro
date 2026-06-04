import { useEffect, useState } from 'react'
import api from '../api/client'

const emptyAcceso = { estacionId: '', nombre: '', descripcion: '', activo: true }

export default function AccesosPage() {
  const [accesos, setAccesos]         = useState([])
  const [lineas, setLineas]           = useState([])
  const [estaciones, setEstaciones]   = useState([])
  const [estFiltradas, setEstFiltradas] = useState([])
  const [filtroLinea, setFiltroLinea] = useState('')
  const [filtroEst, setFiltroEst]     = useState('')
  const [loading, setLoading]         = useState(true)
  const [modal, setModal]             = useState(false)
  const [form, setForm]               = useState(emptyAcceso)
  const [editId, setEditId]           = useState(null)
  const [saving, setSaving]           = useState(false)

  useEffect(() => {
    api.get('/api/linea').then(r => setLineas(r.data))
    api.get('/api/estacion').then(r => setEstaciones(r.data))
    fetchAccesos()
  }, [])

  // Al cambiar línea, filtrar estaciones y limpiar filtro de estación
  useEffect(() => {
    if (!filtroLinea) {
      setEstFiltradas(estaciones)
    } else {
      api.get(`/api/estacion?lineaId=${filtroLinea}`)
        .then(r => setEstFiltradas(r.data))
    }
    setFiltroEst('')
  }, [filtroLinea, estaciones])

  useEffect(() => { fetchAccesos() }, [filtroEst])

  async function fetchAccesos() {
    setLoading(true)
    const url = filtroEst ? `/api/acceso?estacionId=${filtroEst}` : '/api/acceso'
    const { data } = await api.get(url)
    setAccesos(data)
    setLoading(false)
  }

  // Al cambiar línea sin estación específica, cargar accesos de todas las estaciones de esa línea
  useEffect(() => {
    if (!filtroLinea) { fetchAccesos(); return }
    if (filtroEst) return
    api.get(`/api/estacion?lineaId=${filtroLinea}`).then(async r => {
      const ids = r.data.map(e => e.id)
      const results = await Promise.all(ids.map(id => api.get(`/api/acceso?estacionId=${id}`)))
      const todos = results.flatMap(res => res.data)
      setAccesos(todos)
      setLoading(false)
    })
  }, [filtroLinea])

  function openEdit(a) {
    setForm({
      estacionId: a.estacionId, nombre: a.nombre,
      descripcion: a.descripcion ?? '', activo: a.activo
    })
    setEditId(a.id); setModal(true)
  }

  async function handleSave() {
    setSaving(true)
    try {
      if (editId) await api.put(`/api/acceso/${editId}`, form)
      else        await api.post('/api/acceso', form)
      setModal(false); fetchAccesos()
    } finally { setSaving(false) }
  }

  async function handleDelete(id) {
    if (!confirm('¿Eliminar este acceso?')) return
    await api.delete(`/api/acceso/${id}`)
    fetchAccesos()
  }

  const estNombre = id => estaciones.find(e => e.id === id)?.nombre ?? '—'
  const f = k => e => setForm(p => ({ ...p, [k]: e.target.value }))

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Accesos</div>
          <div className="page-subtitle">Entradas y salidas físicas por estación</div>
        </div>
        <button className="btn btn-primary"
          onClick={() => { setForm(emptyAcceso); setEditId(null); setModal(true) }}>
          + Nuevo acceso
        </button>
      </div>

      {/* Filtros */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
        <select value={filtroLinea} onChange={e => setFiltroLinea(e.target.value)}
          style={{ minWidth: 200 }}>
          <option value="">Todas las líneas</option>
          {lineas.map(l => <option key={l.id} value={l.id}>{l.nombre}</option>)}
        </select>

        <select value={filtroEst} onChange={e => { setFiltroEst(e.target.value) }}
          style={{ minWidth: 220 }}>
          <option value="">Todas las estaciones</option>
          {estFiltradas.map(e => <option key={e.id} value={e.id}>{e.nombre}</option>)}
        </select>
      </div>

      <div className="card">
        {loading ? <div className="loading">Cargando...</div> : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Nombre</th><th>Estación</th><th>Descripción</th>
                  <th>Estado</th><th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {accesos.map(a => (
                  <tr key={a.id}>
                    <td style={{ fontWeight: 600 }}>{a.nombre}</td>
                    <td><span className="badge badge-blue">{estNombre(a.estacionId)}</span></td>
                    <td style={{ color: 'var(--text2)', fontSize: 13 }}>{a.descripcion ?? '—'}</td>
                    <td>
                      <span className={`badge ${a.activo ? 'badge-green' : 'badge-gray'}`}>
                        {a.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button className="btn btn-ghost btn-sm" onClick={() => openEdit(a)}>Editar</button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(a.id)}>Eliminar</button>
                      </div>
                    </td>
                  </tr>
                ))}
                {accesos.length === 0 && (
                  <tr><td colSpan={5} className="empty">Sin accesos registrados</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <div className="modal-title">{editId ? 'Editar acceso' : 'Nuevo acceso'}</div>
              <button className="modal-close" onClick={() => setModal(false)}>×</button>
            </div>
            <div className="form-grid">
              <div className="form-field full">
                <label>Estación</label>
                <select value={form.estacionId} onChange={f('estacionId')}>
                  <option value="">Seleccionar estación</option>
                  {estaciones.map(e => <option key={e.id} value={e.id}>{e.nombre}</option>)}
                </select>
              </div>
              <div className="form-field full">
                <label>Nombre del acceso</label>
                <input value={form.nombre} onChange={f('nombre')}
                  placeholder="ej: Acceso Norte, Entrada Principal" />
              </div>
              <div className="form-field full">
                <label>Descripción</label>
                <input value={form.descripcion} onChange={f('descripcion')}
                  placeholder="ej: Entrada desde Av. Elena" />
              </div>
              <div className="form-field">
                <label>Estado</label>
                <select value={form.activo}
                  onChange={e => setForm(p => ({ ...p, activo: e.target.value === 'true' }))}>
                  <option value="true">Activo</option>
                  <option value="false">Inactivo</option>
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