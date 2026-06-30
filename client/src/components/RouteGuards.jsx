import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Spinner } from './Spinner'

// Requires authenticated user
export function RequireAuth() {
  const { user, loading } = useAuth()
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }
  return user ? <Outlet /> : <Navigate to="/login" replace />
}

// Requires specific role(s)
export function RequireRole({ roles }) {
  const { user, loading } = useAuth()
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }
  if (!user) return <Navigate to="/login" replace />
  if (!roles.includes(user.role)) {
    return <Navigate to="/feed" replace />
  }
  return <Outlet />
}

// Redirect logged-in users away from auth pages
export function GuestOnly() {
  const { user, loading } = useAuth()
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }
  return user ? <Navigate to="/feed" replace /> : <Outlet />
}
