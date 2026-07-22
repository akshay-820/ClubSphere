import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { RequireAuth, RequireRole, GuestOnly } from './components/RouteGuards'

// Pages
import HomePage from './pages/HomePage'
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import VerifyOtpPage from './pages/auth/VerifyOtpPage'
import FeedPage from './pages/FeedPage'
import PostsPage from './pages/PostsPage'
import PostDetailPage from './pages/PostDetailPage'
import EventsPage from './pages/EventsPage'
import EventDetailPage from './pages/EventDetailPage'
import EventFormPage from './pages/EventFormPage'
import CreatePostPage from './pages/CreatePostPage'
import EditPostPage from './pages/EditPostPage'
import ProfilePage from './pages/ProfilePage'
import RequestCollegePage from './pages/RequestCollegePage'
import EditCollegePage from './pages/college/EditCollegePage'
import ClubRequestsPage from './pages/college/ClubRequestsPage'
import ClubsPage from './pages/ClubsPage'
import ClubProfilePage from './pages/ClubProfilePage'
import RequestClubPage from './pages/RequestClubPage'
import EditClubPage from './pages/EditClubPage'
import AdminCollegesPage from './pages/admin/AdminCollegesPage'
import AdminCollegeRequestsPage from './pages/admin/AdminCollegeRequestsPage'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public landing */}
          <Route path="/" element={<HomePage />} />
          <Route path="/request-college" element={<RequestCollegePage />} />

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
            <Route path="/posts" element={<PostsPage />} />
            <Route path="/posts/:id" element={<PostDetailPage />} />
            <Route path="/events" element={<EventsPage />} />
            <Route path="/events/create" element={<Navigate to="/clubs" replace />} />
            <Route path="/events/:id" element={<EventDetailPage />} />
            <Route path="/clubs" element={<ClubsPage />} />
            <Route path="/clubs/request" element={<RequestClubPage />} />
            <Route path="/clubs/:id/events/create" element={<EventFormPage mode="create" />} />
            <Route path="/clubs/:id/events/:eventId/edit" element={<EventFormPage mode="edit" />} />
            <Route path="/clubs/:id/posts/create" element={<CreatePostPage />} />
            <Route path="/clubs/:id/posts/:postId/edit" element={<EditPostPage />} />
            <Route path="/clubs/:id/edit" element={<EditClubPage />} />
            <Route path="/clubs/:id" element={<ClubProfilePage />} />

            {/* College admin: edit their own college + club requests */}
            <Route
              element={<RequireRole roles={['college_admin', 'super_admin']} />}
            >
              <Route path="/colleges/:id/edit" element={<EditCollegePage />} />
            </Route>

            {/* College admin: club requests */}
            <Route element={<RequireRole roles={['college_admin']} />}>
              <Route path="/college/club-requests" element={<ClubRequestsPage />} />
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
