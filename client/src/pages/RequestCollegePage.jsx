import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { DashboardLayout } from '../components/DashboardLayout'
import { PageMeta } from '../components/PageMeta'
import { ErrorAlert } from '../components/ErrorAlert'
import api from '../lib/api'
import { Building2, CheckCircle2, ArrowLeft, Globe, Image, Send } from 'lucide-react'

export default function RequestCollegePage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ college_name: '', email_domain: '', logo_url: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const set = key => e => setForm(f => ({ ...f, [key]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      // POST /college-requests
      await api.post('/college-requests', {
        college_name: form.college_name.trim(),
        email_domain: form.email_domain.trim(),
        logo_url: form.logo_url.trim(),
      })
      setSuccess(true)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit request.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <DashboardLayout>
        <PageMeta title="Request College" />
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
          <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mb-6 border border-green-500/20">
            <CheckCircle2 className="w-10 h-10 text-green-400" />
          </div>
          <h2 className="text-2xl font-bold text-[#f0f0ff] mb-2">Request Submitted!</h2>
          <p className="text-[#8888aa] max-w-sm mb-8 leading-relaxed">
            Thank you! Your college request has been submitted successfully. A super admin will review and approve it shortly.
          </p>
          <button onClick={() => navigate('/feed')} className="btn-primary px-6 py-2.5 text-white shadow-lg shadow-blue-500/20">
            Return to Feed
          </button>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <PageMeta title="Request College" />

      <div className="max-w-3xl">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-sm text-[#8888aa] hover:text-[#f0f0ff] transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

      {/* Hero card */}
      <div className="relative overflow-hidden rounded-2xl border border-[#1e1e3a] mb-6">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-cyan-600/5 to-transparent pointer-events-none" />
        <div className="absolute top-[-20%] right-[-10%] w-96 h-96 bg-cyan-600/10 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="relative p-8 flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30 flex items-center justify-center shadow-xl">
            <Building2 className="w-10 h-10 text-blue-400" />
          </div>
          
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-[#f0f0ff] mb-2">Request New College</h1>
            <p className="text-sm text-[#8888aa] max-w-lg leading-relaxed">
              Don't see your college on ClubSphere? Fill out the details below. Once approved by our team, students will be able to join and create clubs for your campus!
            </p>
          </div>
        </div>
      </div>

      <div className="card p-6">
        <h2 className="text-base font-semibold text-[#f0f0ff] mb-6">College Information</h2>
        
        <ErrorAlert message={error} />
        
        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="sm:col-span-2">
              <label htmlFor="cname" className="block text-sm font-medium text-[#8888aa] mb-2 flex items-center gap-1.5">
                <Building2 className="w-4 h-4" /> College Name
              </label>
              <input
                id="cname"
                type="text"
                required
                value={form.college_name}
                onChange={set('college_name')}
                placeholder="e.g. Indian Institute of Technology Delhi"
                className="input-field py-2.5"
              />
            </div>

            <div>
              <label htmlFor="edomain" className="block text-sm font-medium text-[#8888aa] mb-2 flex items-center gap-1.5">
                <Globe className="w-4 h-4" /> Email Domain
              </label>
              <input
                id="edomain"
                type="text"
                required
                value={form.email_domain}
                onChange={set('email_domain')}
                placeholder="e.g. iitd.ac.in"
                className="input-field py-2.5"
              />
              <p className="text-xs text-[#555577] mt-1.5">Institutional email domain (without @).</p>
            </div>

            <div>
              <label htmlFor="logo" className="block text-sm font-medium text-[#8888aa] mb-2 flex items-center gap-1.5">
                <Image className="w-4 h-4" /> Logo URL
              </label>
              <input
                id="logo"
                type="url"
                required
                value={form.logo_url}
                onChange={set('logo_url')}
                placeholder="https://example.com/logo.png"
                className="input-field py-2.5"
              />
              {form.logo_url && (
                <div className="mt-2.5 flex items-center gap-3 bg-white/5 p-2 rounded-lg border border-[#1e1e3a] w-fit">
                  <img
                    src={form.logo_url}
                    alt="Preview"
                    className="w-8 h-8 rounded object-contain bg-white/5"
                    onError={e => { e.target.style.display = 'none' }}
                  />
                  <span className="text-xs text-[#8888aa]">Logo Preview</span>
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-[#1e1e3a] flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary py-2.5 px-6 text-white text-sm shadow-lg shadow-blue-500/20"
            >
              <Send className="w-4 h-4 mr-2" />
              {loading ? 'Submitting Request...' : 'Submit Request'}
            </button>
          </div>
        </form>
      </div>
      </div>
    </DashboardLayout>
  )
}
