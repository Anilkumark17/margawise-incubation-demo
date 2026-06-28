import { useEffect, useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useApp } from '../../context/AppProvider'

const SIDEBAR_KEY = 'margawise_sidebar_collapsed'

const NAV = {
  founder: [
    { to: '/founder/dashboard', label: 'Dashboard', icon: '◫' },
    { to: '/founder/targets', label: 'Targets', icon: '◈' },
    { to: '/founder/reviews', label: 'Reviews', icon: '▣' },
    { to: '/founder/mentors', label: 'Mentors', icon: '◎' },
  ],
  mentor: [
    { to: '/mentor/dashboard', label: 'Dashboard', icon: '◫' },
    { to: '/mentor/matches', label: 'Matches', icon: '⇄' },
    { to: '/mentor/profile', label: 'Profile', icon: '◉' },
    { to: '/mentor/availability', label: 'Availability', icon: '◷' },
  ],
  incubation: [
    { to: '/incubation/dashboard',   label: 'Dashboard',   icon: '◫' },
    { to: '/incubation/applications',label: 'Applications', icon: '▣' },
    { to: '/incubation/mentors',     label: 'Mentors',     icon: '◎' },
    { to: '/incubation/workshops',   label: 'Workshops',   icon: '◈' },
    { to: '/incubation/settings',    label: 'Settings',    icon: '⚙' },
  ],
}

export default function DashboardLayout({ role, children, wide }) {
  const { logout, data } = useApp()
  const navigate = useNavigate()
  const user = data.currentUser
  const [collapsed, setCollapsed] = useState(
    () => localStorage.getItem(SIDEBAR_KEY) === 'true'
  )

  useEffect(() => {
    localStorage.setItem(SIDEBAR_KEY, String(collapsed))
  }, [collapsed])

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const roleLabel =
    role === 'founder' ? 'Founder' : role === 'mentor' ? 'Mentor' : 'Incubation Manager'

  return (
    <div className={`layout ${collapsed ? 'sidebar-collapsed' : ''}`}>
      <aside className={`sidebar app-sidebar ${collapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-top">
          <div className="sidebar-brand">
            <span className="brand-icon">M</span>
            {!collapsed && <span className="brand-text">MargaWise</span>}
          </div>
          <button
            type="button"
            className="sidebar-toggle"
            onClick={() => setCollapsed((c) => !c)}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? '›' : '‹'}
          </button>
        </div>
        <nav className="sidebar-nav">
          {NAV[role]?.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              title={collapsed ? item.label : undefined}
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              <span className="nav-icon">{item.icon}</span>
              {!collapsed && <span className="nav-label">{item.label}</span>}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-footer">
          {!collapsed && (
            <div className="user-info">
              <span className="user-name">{user?.name}</span>
              <span className="user-role">{roleLabel}</span>
            </div>
          )}
          {collapsed && (
            <div className="user-avatar-sm" title={user?.name}>
              {user?.name?.charAt(0) || '?'}
            </div>
          )}
          <button
            type="button"
            className="btn-logout"
            onClick={handleLogout}
            title={collapsed ? 'Sign out' : undefined}
          >
            {collapsed ? '⎋' : 'Sign out'}
          </button>
        </div>
      </aside>
      <main className={`main-content ${wide ? 'wide' : ''}`}>{children}</main>
    </div>
  )
}
