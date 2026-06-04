import { useEffect, useState } from 'react'
import api from '../api/client'

const emptyGuardia = {
  estacionId: '', accesoId: '', nombre: '', apellido: '',
  dpi: '', telefono: '', turno: 'diurno'
}

export function GuardiasPage() {
  const [guardias, setGuardias]     = useState([])
  const [estaciones, setEstaciones] = useState([])
  const [accesos, setAccesos]       = useState([])
  const [accesosForm, setAccesosForm] = useState([])
  const [filtro, setFiltro]         = useState('')
  const [loading, setLoading]       = useState(true)
  const [modal, setModal]           = useState(false)
  const [form, setForm]             = useState(emptyGuardia)
  const [editId, setEditId]         = useState(null)
  const [saving, setSaving]         = useState(false)

  useEffect(() => {
    api.get('/api/estacion').then(r => setEstaciones(r.data))
    api.get('/api/acceso').then(r => setAccesos(r.data))
    fetchGuardias()
  }, [])

  useEffect(() => { fetchGuardias() }, [filtro])

  // Cuando cambia la estación en el form, cargar accesos de esa estación
  useEffect(() => {
    if (!form.estacionId) { setAccesosForm([]); return }
    api.get(`/api/acceso?estacionId=${form.estacionId}`)
      .then(r => setAccesosForm(r.data))
  }, [form.estacionId])

  async function fetchGuardias() {
    setLoading(true)
    const url = filtro ? `/api/guardia?estacionId=${filtro}` : '/api/guardia'
    const { data } = await api.get(url)
    setGuardias(data)
    setLoading(false)
  }

  function openEdit(g) {
    setForm({
      estacionId: g.estacionId, accesoId: g.accesoId ?? '',
      nombre: g.nombre, apellido: g.apellido,
      dpi: g.dpi, telefono: g.telefono ?? '', turno: g.turno
    })
    setEditId(g.id); setModal(true)
  }

  async function handleSave() {
    setSaving(true)
    try {
      if (editId) await api.put(`/api/guardia/${editId}`, form)
      else        await api.post('/api/guardia', form)
      setModal(false); fetchGuardias()
    } finally { setSaving(false) }
  }

  async function handleDelete(id) {
    if (!confirm('¿Eliminar este guardia?')) return
    await api.delete(`/api/guardia/${id}`)
    fetchGuardias()
  }

  const estNombre    = id => estaciones.find(e => e.id === id)?.nombre ?? '—'
  const accesoNombre = id => accesos.find(a => a.id === id)?.nombre ?? '—'
  const f = k => e => setForm(p => ({ ...p, [k]: e.target.value }))

  const turnoBadge = t => ({
    diurno: 'badge-green', nocturno: 'badge-blue', mixto: 'badge-warn'
  }[t] ?? 'badge-gray')

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Guardias de seguridad</div>
          <div className="page-subtitle">Personal de seguridad por acceso</div>
        </div>
        <button className="btn btn-primary"
          onClick={() => { setForm(emptyGuardia); setEditId(null); setModal(true) }}>
          + Nuevo guardia
        </button>
      </div>

      <div style={{ marginBottom: 20 }}>
        <select value={filtro} onChange={e => setFiltro(e.target.value)}
          style={{ minWidth: 220 }}>
          <option value="">Todas las estaciones</option>
          {estaciones.map(e => <option key={e.id} value={e.id}>{e.nombre}</option>)}
        </select>
      </div>

      <div className="card">
        {loading ? <div className="loading">Cargando...</div> : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Nombre</th><th>DPI</th><th>Estación</th>
                  <th>Acceso</th><th>Turno</th><th>Teléfono</th><th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {guardias.map(g => (
                  <tr key={g.id}>
                    <td style={{ fontWeight: 600 }}>{g.nombre} {g.apellido}</td>
                    <td style={{ fontFamily: 'var(--mono)', color: 'var(--text2)', fontSize: 12 }}>{g.dpi}</td>
                    <td><span className="badge badge-blue">{estNombre(g.estacionId)}</span></td>
                    <td><span className="badge badge-gray">{g.accesoId ? accesoNombre(g.accesoId) : '—'}</span></td>
                    <td><span className={`badge ${turnoBadge(g.turno)}`}>{g.turno}</span></td>
                    <td style={{ color: 'var(--text2)' }}>{g.telefono ?? '—'}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button className="btn btn-ghost btn-sm" onClick={() => openEdit(g)}>Editar</button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(g.id)}>Eliminar</button>
                      </div>
                    </td>
                  </tr>
                ))}
                {guardias.length === 0 && (
                  <tr><td colSpan={7} className="empty">Sin guardias registrados</td></tr>
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
              <div className="modal-title">{editId ? 'Editar guardia' : 'Nuevo guardia'}</div>
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
                <label>Estación asignada</label>
                <select value={form.estacionId} onChange={f('estacionId')}>
                  <option value="">Seleccionar estación</option>
                  {estaciones.map(e => <option key={e.id} value={e.id}>{e.nombre}</option>)}
                </select>
              </div>
              <div className="form-field full">
                <label>Acceso asignado</label>
                <select value={form.accesoId} onChange={f('accesoId')}
                  disabled={!form.estacionId}>
                  <option value="">
                    {form.estacionId ? 'Seleccionar acceso' : 'Primero selecciona una estación'}
                  </option>
                  {accesosForm.map(a => (
                    <option key={a.id} value={a.id}>{a.nombre}</option>
                  ))}
                </select>
              </div>
              <div className="form-field full">
                <label>Turno</label>
                <select value={form.turno} onChange={f('turno')}>
                  <option value="diurno">Diurno</option>
                  <option value="nocturno">Nocturno</option>
                  <option value="mixto">Mixto</option>
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