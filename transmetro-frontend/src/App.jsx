import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Layout from './components/Layout'
import LoginPage from './pages/LoginPage'
import HomePage from './pages/HomePage'
import LineasPage from './pages/LineasPage'
import EstacionesPage from './pages/EstacionesPage'
import { BusesPage, PilotosPage, FlujoPage, AlertasPage, ReportesPage } from './pages/OtrasPages'
import { MunicipalidadPage } from './pages/MunicipalidadPage'
import { GuardiasPage }      from './pages/GuardiasPage'
import { LineaEstacionPage } from './pages/LineaEstacionPage'
import AccesosPage  from './pages/AccesosPage.jsx'
import OcupacionPage from './pages/Ocupacionpage.jsx'
import MapaLineasPage from './pages/MapaLineasPage'

function PrivateRoute({ children }) {
  const { session, loading } = useAuth()
  if (loading) return <div style={{ padding: 32, color: '#8892b0' }}>Cargando...</div>
  return session ? children : <Navigate to="/login" replace />
}

function AppRoutes() {
  const { session, loading } = useAuth()
  if (loading) return <div style={{ padding: 32, color: '#8892b0' }}>Cargando...</div>

  return (
    <Routes>
      <Route path="/login" element={session ? <Navigate to="/dashboard" replace /> : <LoginPage />} />
      <Route path="/dashboard" element={<PrivateRoute><Layout /></PrivateRoute>}>
        <Route index           element={<HomePage />} />
        <Route path="lineas"     element={<LineasPage />} />
        <Route path="estaciones" element={<EstacionesPage />} />
        <Route path="buses"      element={<BusesPage />} />
        <Route path="pilotos"    element={<PilotosPage />} />
        <Route path="flujo"      element={<FlujoPage />} />
        <Route path="alertas"    element={<AlertasPage />} />
        <Route path="reportes"   element={<ReportesPage />} />
        <Route path="municipalidades" element={<MunicipalidadPage />} />
        <Route path="guardias"        element={<GuardiasPage />} />
        <Route path="linea-estacion"  element={<LineaEstacionPage />} />
        <Route path="accesos"   element={<AccesosPage />} />
        <Route path="ocupacion" element={<OcupacionPage />} />
        <Route path="mapa" element={<MapaLineasPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}