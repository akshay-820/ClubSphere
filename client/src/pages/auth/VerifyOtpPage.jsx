import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import api from '../../lib/api'
import { PageMeta } from '../../components/PageMeta'
import { ErrorAlert } from '../../components/ErrorAlert'
import { Mail, CheckCircle2 } from 'lucide-react'
import logo from '../../assets/logo.png'

export default function VerifyOtpPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const { login } = useAuth()

  // Email is carried from RegisterPage via router state
  const emailFromState = location.state?.email || ''
  const [email, setEmail] = useState(emailFromState)
  const [otp, setOtp] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      // POST /auth/register/verify — backend returns { message, user }
      const res = await api.post('/auth/register/verify', {
        email: email.trim().toLowerCase(),
        otp: otp.trim(),
      })
      setSuccess(true)
      login(res.data.user)
      setTimeout(() => navigate('/feed', { replace: true }), 1500)
    } catch (err) {
      const msg = err.response?.data?.error || 'Verification failed. Please check the OTP and try again.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-6">
      <PageMeta title="Verify Email" />

      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2 mb-8">
          <img src={logo} alt="ClubSphere" className="h-8 w-8 object-contain" />
          <span className="font-bold gradient-text text-lg">ClubSphere</span>
        </div>

        {success ? (
          <div className="text-center py-8">
            <CheckCircle2 className="w-14 h-14 text-green-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-[#f0f0ff] mb-2">Verified!</h2>
            <p className="text-sm text-[#8888aa]">Taking you to your feed...</p>
          </div>
        ) : (
          <>
            <div className="w-12 h-12 rounded-xl bg-blue-500/15 border border-blue-500/25 flex items-center justify-center mb-5">
              <Mail className="w-6 h-6 text-blue-400" />
            </div>
            <h1 className="text-2xl font-bold text-[#f0f0ff] mb-1">Check your email</h1>
            <p className="text-sm text-[#8888aa] mb-7">
              We sent a verification code to{' '}
              {emailFromState
                ? <strong className="text-[#f0f0ff]">{emailFromState}</strong>
                : 'your email address'
              }.
            </p>

            <ErrorAlert message={error} />

            <form onSubmit={handleSubmit} className="space-y-5 mt-4">
              {!emailFromState && (
                <div>
                  <label htmlFor="verify-email" className="block text-sm font-medium text-[#8888aa] mb-1.5">Email</label>
                  <input
                    id="verify-email"
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="you@college.edu"
                    className="input-field"
                  />
                </div>
              )}

              <div>
                <label htmlFor="otp" className="block text-sm font-medium text-[#8888aa] mb-1.5">Verification Code</label>
                <input
                  id="otp"
                  type="text"
                  required
                  value={otp}
                  onChange={e => setOtp(e.target.value)}
                  placeholder="Enter 6-digit code"
                  maxLength={6}
                  className="input-field tracking-widest text-lg font-mono text-center"
                  autoComplete="one-time-code"
                  inputMode="numeric"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full justify-center text-white"
              >
                {loading ? 'Verifying...' : 'Verify & Continue'}
              </button>
            </form>

            <p className="text-xs text-[#555577] text-center mt-5">
              Didn&apos;t get the code? Check your spam folder or{' '}
              <button
                type="button"
                onClick={() => navigate('/register')}
                className="text-blue-400 hover:underline"
              >
                register again
              </button>.
            </p>
          </>
        )}
      </div>
    </div>
  )
}
