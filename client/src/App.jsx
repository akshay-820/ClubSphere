import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { RequireAuth, RequireRole, GuestOnly } from './components/RouteGuards'

// Pages
import HomePage from './pages/HomePage'
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import VerifyOtpPage from './pages/auth/VerifyOtpPage'
import FeedPage from './pages/FeedPage'
import ProfilePage from './pages/ProfilePage'
import RequestCollegePage from './pages/RequestCollegePage'
import EditCollegePage from './pages/college/EditCollegePage'
import AdminCollegesPage from './pages/admin/AdminCollegesPage'
import AdminCollegeRequestsPage from './pages/admin/AdminCollegeRequestsPage'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public landing */}
          <Route path="/" element={<HomePage />} />

          {/* Auth routes — redirect logged-in users away */}
          <Route element={<GuestOnly />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/verify-otp" element={<VerifyOtpPage />} />
          </Route>

          {/* Protected routes — must be logged in */}
          <Route element={<RequireAuth />}>
            <Route path="/feed" element={<FeedPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/request-college" element={<RequestCollegePage />} />

            {/* College admin: edit their own college */}
            <Route
              element={<RequireRole roles={['college_admin', 'super_admin']} />}
            >
              <Route path="/colleges/:id/edit" element={<EditCollegePage />} />
            </Route>

            {/* Super Admin only */}
            <Route element={<RequireRole roles={['super_admin']} />}>
              <Route path="/admin/colleges" element={<AdminCollegesPage />} />
              <Route path="/admin/college-requests" element={<AdminCollegeRequestsPage />} />
            </Route>
          </Route>

          {/* Catch-all fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
