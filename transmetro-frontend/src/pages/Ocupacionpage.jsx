import { useEffect, useState } from 'react'
import api from '../api/client'

export default function OcupacionPage() {
  const [buses, setBuses]       = useState([])
  const [busId, setBusId]       = useState('')
  const [pasajeros, setPasajeros] = useState('')
  const [resultado, setResultado] = useState(null)
  const [registrando, setRegistrando] = useState(false)
  const [error, setError]       = useState(null)

  useEffect(() => {
    api.get('/api/bus?estado=activo').then(r => setBuses(r.data))
  }, [])

  async function handleRegistrar() {
    if (!busId || !pasajeros) return
    setRegistrando(true); setError(null); setResultado(null)
    try {
      const { data } = await api.post('/api/bus/ocupacion', {
        busId,
        pasajeros: parseInt(pasajeros)
      })
      setResultado(data)
      setPasajeros('')
    } catch (err) {
      setError('Error al registrar ocupación')
    } finally { setRegistrando(false) }
  }

  const busSeleccionado = buses.find(b => b.id === busId)

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Ocupación de buses</div>
          <div className="page-subtitle">Registro de pasajeros por unidad</div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 24, maxWidth: 520 }}>
        <div style={{ fontWeight: 600, marginBottom: 16 }}>Registrar ocupación</div>
        <div className="form-grid">
          <div className="form-field full">
            <label>Bus</label>
            <select value={busId} onChange={e => { setBusId(e.target.value); setResultado(null) }}>
              <option value="">Seleccionar bus</option>
              {buses.map(b => (
                <option key={b.id} value={b.id}>
                  {b.placa} — Cap. {b.capacidadMaxima}
                </option>
              ))}
            </select>
          </div>
          {busSeleccionado && (
            <div className="form-field full">
              <label>Cantidad de pasajeros actuales</label>
              <input
                type="number"
                min="0"
                max={busSeleccionado.capacidadMaxima}
                value={pasajeros}
                onChange={e => setPasajeros(e.target.value)}
                placeholder={`Máximo: ${busSeleccionado.capacidadMaxima}`}
              />
            </div>
          )}
        </div>

        <div style={{ marginTop: 16 }}>
          <button className="btn btn-primary"
            onClick={handleRegistrar}
            disabled={registrando || !busId || !pasajeros}>
            {registrando ? 'Registrando...' : 'Registrar'}
          </button>
        </div>

        {error && (
          <p style={{ color: 'var(--danger)', fontSize: 13, marginTop: 12 }}>{error}</p>
        )}

        {resultado && (
          <div style={{
            marginTop: 16,
            padding: 16,
            borderRadius: 10,
            border: `1px solid ${resultado.esperaAdicional ? 'var(--warning)' : 'var(--accent2)'}`,
            background: resultado.esperaAdicional
              ? 'rgba(245,166,35,0.08)' : 'rgba(34,211,165,0.08)'
          }}>
            <div style={{
              fontWeight: 600,
              color: resultado.esperaAdicional ? 'var(--warning)' : 'var(--accent2)',
              marginBottom: 6
            }}>
              {resultado.esperaAdicional ? '⚠️ Baja ocupación detectada' : '✓ Ocupación normal'}
            </div>
            <div style={{ fontSize: 13, color: 'var(--text2)' }}>
              Porcentaje de ocupación: <strong style={{ color: 'var(--text)' }}>
                {resultado.porcentaje}%
              </strong>
            </div>
            {resultado.esperaAdicional && (
              <div style={{
                fontSize: 13,
                color: 'var(--warning)',
                marginTop: 8,
                fontWeight: 500
              }}>
                {resultado.esperaAdicional}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Referencia de capacidades */}
      <div className="card">
        <div style={{ fontWeight: 600, marginBottom: 16 }}>Referencia de flota activa</div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Placa</th><th>Capacidad</th><th>25% mínimo</th><th>Estado</th></tr>
            </thead>
            <tbody>
              {buses.map(b => (
                <tr key={b.id}>
                  <td style={{ fontFamily: 'var(--mono)', fontWeight: 600 }}>{b.placa}</td>
                  <td style={{ fontFamily: 'var(--mono)' }}>{b.capacidadMaxima}</td>
                  <td style={{ fontFamily: 'var(--mono)', color: 'var(--warning)' }}>
                    {Math.ceil(b.capacidadMaxima * 0.25)} pasajeros
                  </td>
                  <td>
                    <span className="badge badge-green">{b.estado}</span>
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