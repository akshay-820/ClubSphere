import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  FileText,
  User,
  LogOut,
  Shield,
  Pencil,
  Layers,
  Building2
} from 'lucide-react'
import logo from '../assets/logo.png'

export function DashboardLayout({ children }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  const navLink = ({ isActive }) =>
    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
      isActive
        ? 'bg-blue-500/15 text-blue-400 border border-blue-500/20'
        : 'text-[#8888aa] hover:text-[#f0f0ff] hover:bg-white/5'
    }`

  return (
    <div className="flex h-screen bg-[#0a0a0f]">
      {/* Sidebar */}
      <aside className="w-60 glass border-r border-[#1e1e3a] flex flex-col flex-shrink-0">
        {/* Logo */}
        <div className="p-5 border-b border-[#1e1e3a]">
          <Link to="/feed" className="flex items-center gap-2.5">
            <img src={logo} alt="ClubSphere" className="h-8 w-8 object-contain" />
            <span className="font-bold text-base gradient-text">ClubSphere</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          <NavLink to="/feed" className={navLink}>
            <Layers className="w-4 h-4" />
            Feed
          </NavLink>
          
          <NavLink to="/profile" className={navLink}>
            <User className="w-4 h-4" />
            My Profile
          </NavLink>


          {/* Super Admin section */}
          {user?.role === 'super_admin' && (
            <>
              <div className="pt-4 pb-1 px-3">
                <p className="text-[10px] font-semibold text-[#555577] uppercase tracking-widest flex items-center gap-1">
                  <Shield className="w-3 h-3" />
                  Super Admin
                </p>
              </div>
              <NavLink to="/admin/college-requests" className={navLink}>
                <FileText className="w-4 h-4" />
                College Requests
              </NavLink>
              <NavLink to="/admin/colleges" className={navLink}>
                <Shield className="w-4 h-4" />
                Manage Colleges
              </NavLink>
            </>
          )}

          {/* College Admin section */}
          {user?.role === 'college_admin' && user?.college_id && (
            <>
              <div className="pt-4 pb-1 px-3">
                <p className="text-[10px] font-semibold text-[#555577] uppercase tracking-widest flex items-center gap-1">
                  <Pencil className="w-3 h-3" />
                  College Admin
                </p>
              </div>
              <NavLink to={`/colleges/${user.college_id}/edit`} className={navLink}>
                <Pencil className="w-4 h-4" />
                Edit College
              </NavLink>
            </>
          )}
        </nav>

        {/* User footer */}
        <div className="p-3 border-t border-[#1e1e3a]">
          <div className="flex items-center gap-3 px-2 py-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-[#f0f0ff] truncate">{user?.name}</p>
              <p className="text-xs text-[#555577] truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <div key={location.pathname} className="max-w-5xl mx-auto p-8 animate-page-enter">
          {children}
        </div>
      </main>
    </div>
  )
}
