import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import api from '../../lib/api'
import { PageMeta } from '../../components/PageMeta'
import { PasswordInput } from '../../components/PasswordInput'
import { ErrorAlert } from '../../components/ErrorAlert'
import logo from '../../assets/logo.png'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      // POST /auth/login — returns { message, user }
      const res = await api.post('/auth/login', { email: email.trim().toLowerCase(), password })
      login(res.data.user)
      navigate('/feed', { replace: true })
    } catch (err) {
      // Backend returns { error: '...' }
      const msg = err.response?.data?.error || 'Something went wrong. Please try again.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex">
      <PageMeta title="Sign In" />

      {/* Left decorative panel */}
      <div className="hidden lg:flex w-1/2 relative bg-gradient-to-br from-[#10101a] to-[#0a0a0f] items-center justify-center overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-80 h-80 bg-blue-600/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-80 h-80 bg-purple-600/10 rounded-full blur-[100px]" />
        <div className="relative text-center px-12">
          <img src={logo} alt="ClubSphere" className="w-32 h-32 object-contain mx-auto mb-6 drop-shadow-2xl" />
          <h2 className="text-2xl font-bold text-white mb-3">Welcome back</h2>
          <p className="text-[#8888aa] text-sm leading-relaxed max-w-xs mx-auto">
            Sign in to access your campus communities, clubs, and everything happening around you.
          </p>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <img src={logo} alt="ClubSphere" className="h-8 w-8 object-contain" />
            <span className="font-bold gradient-text text-lg">ClubSphere</span>
          </div>

          <h1 className="text-2xl font-bold text-[#f0f0ff] mb-1">Sign in</h1>
          <p className="text-sm text-[#8888aa] mb-7">
            Don&apos;t have an account?{' '}
            <Link to="/register" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
              Register
            </Link>
          </p>

          <ErrorAlert message={error} />

          <form onSubmit={handleSubmit} className="space-y-5 mt-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[#8888aa] mb-1.5">
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@college.edu"
                className="input-field"
              />
            </div>

            <PasswordInput
              id="password"
              label="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              autoComplete="current-password"
            />

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center text-white"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
