import { useEffect, useState } from 'react'
import api from '../api/client'

const empty = {
  lineaId: '', nombre: '', latitud: '', longitud: '',
  capacidadMaxima: '', ordenEnLinea: ''
}

export default function EstacionesPage() {
  const [estaciones, setEstaciones] = useState([])
  const [lineas, setLineas]         = useState([])
  const [filtroLinea, setFiltro]    = useState('')
  const [loading, setLoading]       = useState(true)
  const [modal, setModal]           = useState(false)
  const [form, setForm]             = useState(empty)
  const [editId, setEditId]         = useState(null)
  const [saving, setSaving]         = useState(false)

  useEffect(() => {
    api.get('/api/linea').then(r => setLineas(r.data))
    fetchEstaciones()
  }, [])

  useEffect(() => { fetchEstaciones() }, [filtroLinea])

  async function fetchEstaciones() {
    setLoading(true)
    const url = filtroLinea ? `/api/estacion?lineaId=${filtroLinea}` : '/api/estacion'
    const { data } = await api.get(url)
    setEstaciones(data)
    setLoading(false)
  }

  function openCreate() { setForm(empty); setEditId(null); setModal(true) }

  function openEdit(e) {
    setForm({
      lineaId: e.lineaId, nombre: e.nombre,
      latitud: e.latitud, longitud: e.longitud,
      capacidadMaxima: e.capacidadMaxima, ordenEnLinea: e.ordenEnLinea
    })
    setEditId(e.id); setModal(true)
  }

  async function handleSave() {
    setSaving(true)
    const payload = {
      ...form,
      latitud: parseFloat(form.latitud),
      longitud: parseFloat(form.longitud),
      capacidadMaxima: parseInt(form.capacidadMaxima),
      ordenEnLinea: parseInt(form.ordenEnLinea),
    }
    try {
      if (editId) await api.put(`/api/estacion/${editId}`, payload)
      else        await api.post('/api/estacion', payload)
      setModal(false); fetchEstaciones()
    } finally { setSaving(false) }
  }

  async function handleDelete(id) {
    if (!confirm('¿Eliminar esta estación?')) return
    await api.delete(`/api/estacion/${id}`)
    fetchEstaciones()
  }

  const f = (k) => e => setForm(p => ({ ...p, [k]: e.target.value }))
  const lineaNombre = (id) => lineas.find(l => l.id === id)?.nombre ?? id

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Estaciones</div>
          <div className="page-subtitle">Gestión de estaciones por línea</div>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>+ Nueva estación</button>
      </div>

      <div style={{ marginBottom: 20 }}>
        <select value={filtroLinea} onChange={e => setFiltro(e.target.value)}
          style={{ minWidth: 200 }}>
          <option value="">Todas las líneas</option>
          {lineas.map(l => <option key={l.id} value={l.id}>{l.nombre}</option>)}
        </select>
      </div>

      <div className="card">
        {loading ? <div className="loading">Cargando...</div> : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Nombre</th>
                  <th>Línea</th>
                  <th>Capacidad</th>
                  <th>Coordenadas</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {estaciones.map(e => (
                  <tr key={e.id}>
                    <td style={{ color: 'var(--text2)', fontFamily: 'var(--mono)' }}>
                      {e.ordenEnLinea}
                    </td>
                    <td style={{ fontWeight: 600 }}>{e.nombre}</td>
                    <td>
                      <span className="badge badge-blue">{lineaNombre(e.lineaId)}</span>
                    </td>
                    <td style={{ fontFamily: 'var(--mono)' }}>{e.capacidadMaxima}</td>
                    <td style={{ color: 'var(--text2)', fontFamily: 'var(--mono)', fontSize: 12 }}>
                      {e.latitud.toFixed(4)}, {e.longitud.toFixed(4)}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button className="btn btn-ghost btn-sm" onClick={() => openEdit(e)}>Editar</button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(e.id)}>Eliminar</button>
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
              <div className="modal-title">{editId ? 'Editar estación' : 'Nueva estación'}</div>
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
                <label>Nombre</label>
                <input value={form.nombre} onChange={f('nombre')} />
              </div>
              <div className="form-field">
                <label>Latitud</label>
                <input type="number" step="0.0001" value={form.latitud} onChange={f('latitud')} />
              </div>
              <div className="form-field">
                <label>Longitud</label>
                <input type="number" step="0.0001" value={form.longitud} onChange={f('longitud')} />
              </div>
              <div className="form-field">
                <label>Capacidad máxima</label>
                <input type="number" value={form.capacidadMaxima} onChange={f('capacidadMaxima')} />
              </div>
              <div className="form-field">
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