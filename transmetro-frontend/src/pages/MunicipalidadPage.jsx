import { useEffect, useState } from 'react'
import api from '../api/client'
 
// ── MUNICIPALIDAD ─────────────────────────────────────────────
const emptyMunicipalidad = { nombre: '', descripcion: '' }
 
export function MunicipalidadPage() {
  const [municipalidades, setMunicipalidades] = useState([])
  const [loading, setLoading]                 = useState(true)
  const [modal, setModal]                     = useState(false)
  const [form, setForm]                       = useState(emptyMunicipalidad)
  const [editId, setEditId]                   = useState(null)
  const [saving, setSaving]                   = useState(false)
 
  useEffect(() => { fetchMunicipalidades() }, [])
 
  async function fetchMunicipalidades() {
    setLoading(true)
    const { data } = await api.get('/api/municipalidad')
    setMunicipalidades(data)
    setLoading(false)
  }
 
  function openEdit(m) {
    setForm({ nombre: m.nombre, descripcion: m.descripcion ?? '' })
    setEditId(m.id); setModal(true)
  }
 
  async function handleSave() {
    setSaving(true)
    try {
      if (editId) await api.put(`/api/municipalidad/${editId}`, form)
      else        await api.post('/api/municipalidad', form)
      setModal(false); fetchMunicipalidades()
    } finally { setSaving(false) }
  }
 
  async function handleDelete(id) {
    if (!confirm('¿Eliminar esta municipalidad?')) return
    await api.delete(`/api/municipalidad/${id}`)
    fetchMunicipalidades()
  }
 
  const f = k => e => setForm(p => ({ ...p, [k]: e.target.value }))
 
  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Municipalidades</div>
          <div className="page-subtitle">Gestión de municipios del área metropolitana</div>
        </div>
        <button className="btn btn-primary"
          onClick={() => { setForm(emptyMunicipalidad); setEditId(null); setModal(true) }}>
          + Nueva municipalidad
        </button>
      </div>
 
      <div className="card">
        {loading ? <div className="loading">Cargando...</div> : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Nombre</th><th>Descripción</th><th>Acciones</th></tr>
              </thead>
              <tbody>
                {municipalidades.map(m => (
                  <tr key={m.id}>
                    <td style={{ fontWeight: 600 }}>{m.nombre}</td>
                    <td style={{ color: 'var(--text2)' }}>{m.descripcion ?? '—'}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button className="btn btn-ghost btn-sm" onClick={() => openEdit(m)}>Editar</button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(m.id)}>Eliminar</button>
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
              <div className="modal-title">{editId ? 'Editar municipalidad' : 'Nueva municipalidad'}</div>
              <button className="modal-close" onClick={() => setModal(false)}>×</button>
            </div>
            <div className="form-grid">
              <div className="form-field full">
                <label>Nombre</label>
                <input value={form.nombre} onChange={f('nombre')} />
              </div>
              <div className="form-field full">
                <label>Descripción</label>
                <input value={form.descripcion} onChange={f('descripcion')} />
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
 