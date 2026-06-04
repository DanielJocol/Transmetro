import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './Layout.css'

const navItems = [
  { to: '/dashboard',                 label: 'Inicio',          icon: '⊞', roles: ['administrador', 'supervisor', 'operador'] },
  { to: '/dashboard/lineas',          label: 'Líneas',          icon: '⇄', roles: ['administrador', 'supervisor'] },
  { to: '/dashboard/estaciones',      label: 'Estaciones',      icon: '◎', roles: ['administrador', 'supervisor'] },
  { to: '/dashboard/buses',           label: 'Buses',           icon: '▣', roles: ['administrador', 'supervisor'] },
  { to: '/dashboard/pilotos',         label: 'Pilotos',         icon: '♟', roles: ['administrador', 'supervisor'] },
  { to: '/dashboard/flujo',           label: 'Flujo',           icon: '≈', roles: ['administrador', 'supervisor', 'operador'] },
  { to: '/dashboard/alertas',         label: 'Alertas',         icon: '⚑', roles: ['administrador', 'supervisor', 'operador'] },
  { to: '/dashboard/reportes',        label: 'Reportes',        icon: '▤', roles: ['administrador', 'supervisor'] },
  { to: '/dashboard/municipalidades', label: 'Municipalidades', icon: '🏛', roles: ['administrador'] },
  { to: '/dashboard/guardias',        label: 'Guardias',        icon: '🛡', roles: ['administrador', 'supervisor'] },
  { to: '/dashboard/linea-estacion',  label: 'Transbordos',     icon: '⇌', roles: ['administrador'] },
  { to: '/dashboard/accesos',         label: 'Accesos',         icon: '⊟', roles: ['administrador', 'supervisor'] },
  { to: '/dashboard/ocupacion',       label: 'Ocupación',       icon: '⁂', roles: ['administrador', 'supervisor', 'operador'] },
  { to: '/dashboard/mapa',            label: 'Mapa',            icon: '🗺', roles: ['administrador', 'supervisor', 'operador'] },
]

export default function Layout() {
  const { perfil, logout } = useAuth()
  const navigate = useNavigate()

  async function handleLogout() {
    await logout()
    navigate('/login')
  }

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <img src="/logo/escudo.png" alt="Transmetro" className="logo-icon" />
          <div>
            <div className="logo-title">Transmetro</div>
            <div className="logo-sub">Ciudad de Guatemala</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          {navItems
            .filter(item => item.roles.includes(perfil?.rol))
            .map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/dashboard'}
                className={({ isActive }) =>
                  `nav-item ${isActive ? 'nav-item--active' : ''}`
                }
              >
                <span className="nav-icon">{item.icon}</span>
                <span>{item.label}</span>
              </NavLink>
            ))}
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-name">{perfil?.nombre ?? 'Usuario'}</div>
            <div className="user-role">{perfil?.rol}</div>
          </div>
          <button className="logout-btn" onClick={handleLogout}>Salir</button>
        </div>
      </aside>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  )
}