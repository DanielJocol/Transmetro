import { useEffect, useState } from 'react'
import api from '../api/client'

const empty = { nombre: '', descripcion: '', activa: true }

export default function LineasPage() {
  const [lineas, setLineas]   = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal]     = useState(false)
  const [form, setForm]       = useState(empty)
  const [editId, setEditId]   = useState(null)
  const [saving, setSaving]   = useState(false)

  useEffect(() => { fetchLineas() }, [])

  async function fetchLineas() {
    setLoading(true)
    const { data } = await api.get('/api/linea')
    setLineas(data)
    setLoading(false)
  }

  function openCreate() {
    setForm(empty); setEditId(null); setModal(true)
  }

  function openEdit(l) {
    setForm({ nombre: l.nombre, descripcion: l.descripcion ?? '', activa: l.activa })
    setEditId(l.id); setModal(true)
  }

  async function handleSave() {
    setSaving(true)
    try {
      if (editId) await api.put(`/api/linea/${editId}`, form)
      else        await api.post('/api/linea', form)
      setModal(false)
      fetchLineas()
    } finally { setSaving(false) }
  }

  async function handleDelete(id) {
    if (!confirm('¿Eliminar esta línea?')) return
    await api.delete(`/api/linea/${id}`)
    fetchLineas()
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Líneas</div>
          <div className="page-subtitle">Gestión de líneas del Transmetro</div>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>+ Nueva línea</button>
      </div>

      <div className="card">
        {loading ? <div className="loading">Cargando...</div> : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Descripción</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {lineas.map(l => (
                  <tr key={l.id}>
                    <td style={{ fontWeight: 600 }}>{l.nombre}</td>
                    <td style={{ color: 'var(--text2)' }}>{l.descripcion}</td>
                    <td>
                      <span className={`badge ${l.activa ? 'badge-green' : 'badge-gray'}`}>
                        {l.activa ? 'Activa' : 'Inactiva'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button className="btn btn-ghost btn-sm" onClick={() => openEdit(l)}>Editar</button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(l.id)}>Eliminar</button>
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
              <div className="modal-title">{editId ? 'Editar línea' : 'Nueva línea'}</div>
              <button className="modal-close" onClick={() => setModal(false)}>×</button>
            </div>
            <div className="form-grid">
              <div className="form-field full">
                <label>Nombre</label>
                <input value={form.nombre}
                  onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))} />
              </div>
              <div className="form-field full">
                <label>Descripción</label>
                <input value={form.descripcion}
                  onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))} />
              </div>
              <div className="form-field">
                <label>Estado</label>
                <select value={form.activa}
                  onChange={e => setForm(f => ({ ...f, activa: e.target.value === 'true' }))}>
                  <option value="true">Activa</option>
                  <option value="false">Inactiva</option>
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