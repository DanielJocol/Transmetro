import { useEffect, useState } from 'react'
import api from '../api/client'
// ── LINEA ESTACION (transbordos) ──────────────────────────────
export function LineaEstacionPage() {
  const [relaciones, setRelaciones] = useState([])
  const [lineas, setLineas]         = useState([])
  const [estaciones, setEstaciones] = useState([])
  const [filtroLinea, setFiltro]    = useState('')
  const [loading, setLoading]       = useState(true)
  const [modal, setModal]           = useState(false)
  const [form, setForm]             = useState({ lineaId: '', estacionId: '', ordenEnLinea: '' })
  const [editId, setEditId]         = useState(null)
  const [saving, setSaving]         = useState(false)
 
  useEffect(() => {
    api.get('/api/linea').then(r => setLineas(r.data))
    api.get('/api/estacion').then(r => setEstaciones(r.data))
    fetchRelaciones()
  }, [])
 
  useEffect(() => { fetchRelaciones() }, [filtroLinea])
 
  async function fetchRelaciones() {
    setLoading(true)
    const url = filtroLinea
      ? `/api/lineaestacion?lineaId=${filtroLinea}`
      : '/api/lineaestacion'
    const { data } = await api.get(url)
    setRelaciones(data)
    setLoading(false)
  }
 
  function openEdit(r) {
    setForm({ lineaId: r.lineaId, estacionId: r.estacionId, ordenEnLinea: r.ordenEnLinea })
    setEditId(r.id); setModal(true)
  }
 
  async function handleSave() {
    setSaving(true)
    const payload = { ...form, ordenEnLinea: parseInt(form.ordenEnLinea) }
    try {
      if (editId) await api.put(`/api/lineaestacion/${editId}`, payload)
      else        await api.post('/api/lineaestacion', payload)
      setModal(false); fetchRelaciones()
    } finally { setSaving(false) }
  }
 
  async function handleDelete(id) {
    if (!confirm('¿Eliminar esta relación?')) return
    await api.delete(`/api/lineaestacion/${id}`)
    fetchRelaciones()
  }
 
  const lineaNombre   = id => lineas.find(l => l.id === id)?.nombre ?? '—'
  const estNombre     = id => estaciones.find(e => e.id === id)?.nombre ?? '—'
  const f = k => e => setForm(p => ({ ...p, [k]: e.target.value }))
 
  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Estaciones por línea</div>
          <div className="page-subtitle">Gestión de relaciones y estaciones de transbordo</div>
        </div>
        <button className="btn btn-primary"
          onClick={() => { setForm({ lineaId: '', estacionId: '', ordenEnLinea: '' }); setEditId(null); setModal(true) }}>
          + Asignar estación
        </button>
      </div>
 
      <div style={{ marginBottom: 20 }}>
        <select value={filtroLinea} onChange={e => setFiltro(e.target.value)}
          style={{ minWidth: 220 }}>
          <option value="">Todas las líneas</option>
          {lineas.map(l => <option key={l.id} value={l.id}>{l.nombre}</option>)}
        </select>
      </div>
 
      <div className="card">
        {loading ? <div className="loading">Cargando...</div> : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>#</th><th>Línea</th><th>Estación</th><th>Acciones</th></tr>
              </thead>
              <tbody>
                {relaciones.map(r => (
                  <tr key={r.id}>
                    <td style={{ fontFamily: 'var(--mono)', color: 'var(--text2)' }}>
                      {r.ordenEnLinea}
                    </td>
                    <td><span className="badge badge-blue">{lineaNombre(r.lineaId)}</span></td>
                    <td style={{ fontWeight: 600 }}>{estNombre(r.estacionId)}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button className="btn btn-ghost btn-sm" onClick={() => openEdit(r)}>Editar</button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(r.id)}>Eliminar</button>
                      </div>
                    </td>
                  </tr>
                ))}
                {relaciones.length === 0 && (
                  <tr><td colSpan={4} className="empty">Sin relaciones registradas</td></tr>
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
              <div className="modal-title">{editId ? 'Editar relación' : 'Asignar estación a línea'}</div>
              <button className="modal-close" onClick={() => setModal(false)}>×</button>
            </div>
            <div className="form-grid">
              <div className="form-field full">
                <label>Línea</label>
                <select value={form.lineaId} onChange={f('lineaId')}>
                  <option value="">Seleccionar línea</option>
                  {lineas.map(l => <option key={l.id} value={l.id}>{l.nombre}</option>)}
                </select>
              </div>
              <div className="form-field full">
                <label>Estación</label>
                <select value={form.estacionId} onChange={f('estacionId')}>
                  <option value="">Seleccionar estación</option>
                  {estaciones.map(e => <option key={e.id} value={e.id}>{e.nombre}</option>)}
                </select>
              </div>
              <div className="form-field full">
                <label>Orden en línea</label>
                <input type="number" value={form.ordenEnLinea} onChange={f('ordenEnLinea')} />
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
 