import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { DashboardLayout } from '../../components/DashboardLayout'
import { PageMeta } from '../../components/PageMeta'
import { Spinner } from '../../components/Spinner'
import { ErrorAlert } from '../../components/ErrorAlert'
import { useAuth } from '../../context/AuthContext'
import api from '../../lib/api'
import { Building2, Globe, Save, Image, CheckCircle, ArrowLeft, Pencil, X } from 'lucide-react'

export default function EditCollegePage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [college, setCollege] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({ name: '', email_domain: '', logo_url: '' })
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [saved, setSaved] = useState(false)

  // Security: college_admin can only edit their own college
  useEffect(() => {
    if (user?.role === 'college_admin' && user?.college_id !== id) {
      navigate('/feed', { replace: true })
      return
    }

    // GET /colleges/:id — returns { college }
    api.get(`/colleges/${id}`)
      .then(res => {
        const c = res.data.college
        setCollege(c)
        setForm({ name: c.name, email_domain: c.email_domain || '', logo_url: c.logo_url || '' })
      })
      .catch(err => setError(err.response?.data?.error || 'Failed to load college.'))
      .finally(() => setLoading(false))
  }, [id, user, navigate])

  const set = key => e => setForm(f => ({ ...f, [key]: e.target.value }))

  const handleSave = async (e) => {
    e.preventDefault()
    setSaveError('')
    setSaving(true)
    setSaved(false)
    try {
      const res = await api.patch(`/colleges/${id}`, form)
      setCollege(res.data.college)
      setSaved(true)
      setEditing(false)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      setSaveError(err.response?.data?.error || 'Failed to update college.')
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setForm({ name: college?.name || '', email_domain: college?.email_domain || '', logo_url: college?.logo_url || '' })
    setSaveError('')
    setEditing(false)
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      </DashboardLayout>
    )
  }

  if (error) {
    return (
      <DashboardLayout>
        <ErrorAlert message={error} />
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <PageMeta title="Edit College" />

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
          {college?.logo_url ? (
            <img
              src={college.logo_url}
              alt={college.name}
              className="w-24 h-24 rounded-2xl object-contain bg-white/5 border border-[#1e1e3a] shadow-xl p-2"
            />
          ) : (
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30 flex items-center justify-center shadow-xl">
              <Building2 className="w-10 h-10 text-blue-400" />
            </div>
          )}
          
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-[#f0f0ff] mb-2">{college?.name}</h1>
            <div className="flex flex-wrap gap-2">
              {college?.email_domain && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs text-blue-300">
                  <Globe className="w-3 h-3" />
                  {college.email_domain}
                </span>
              )}
            </div>
          </div>

          {!editing && (
            <button
              onClick={() => setEditing(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-[#1e1e3a] text-sm text-[#8888aa] hover:text-[#f0f0ff] hover:border-[#2a2a4a] transition-all"
            >
              <Pencil className="w-3.5 h-3.5" />
              Edit Details
            </button>
          )}
        </div>
      </div>

      {/* Edit Form */}
      {editing && (
        <div className="card p-6 mb-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-semibold text-[#f0f0ff]">Edit College Information</h2>
            <button onClick={handleCancel} className="text-[#555577] hover:text-[#8888aa] transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          <ErrorAlert message={saveError} />

          <form onSubmit={handleSave} className="space-y-5 mt-4">
            <div className="grid sm:grid-cols-2 gap-5">
              <div className="sm:col-span-2">
                <label htmlFor="college-name" className="block text-sm font-medium text-[#8888aa] mb-1.5 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5" /> College Name
                </label>
                <input
                  id="college-name"
                  type="text"
                  required
                  value={form.name}
                  onChange={set('name')}
                  className="input-field"
                  placeholder="e.g. Indian Institute of Technology Delhi"
                />
              </div>

              <div>
                <label htmlFor="college-domain" className="block text-sm font-medium text-[#8888aa] mb-1.5 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5" /> Email Domain
                </label>
                <input
                  id="college-domain"
                  type="text"
                  value={form.email_domain}
                  onChange={set('email_domain')}
                  className="input-field"
                  placeholder="e.g. iitd.ac.in"
                />
                <p className="text-xs text-[#555577] mt-1.5">The domain used for institutional emails.</p>
              </div>

              <div>
                <label htmlFor="college-logo" className="block text-sm font-medium text-[#8888aa] mb-1.5 flex items-center gap-1.5">
                  <Image className="w-3.5 h-3.5" /> Logo URL
                </label>
                <input
                  id="college-logo"
                  type="url"
                  value={form.logo_url}
                  onChange={set('logo_url')}
                  className="input-field"
                  placeholder="https://example.com/logo.png"
                />
                {form.logo_url && (
                  <div className="mt-2 flex items-center gap-2 bg-white/5 p-2 rounded-lg border border-[#1e1e3a] w-fit">
                    <img
                      src={form.logo_url}
                      alt="Preview"
                      className="w-6 h-6 rounded object-contain"
                      onError={e => { e.target.style.display = 'none' }}
                    />
                    <span className="text-xs text-[#8888aa]">Live Preview</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3 pt-4 border-t border-[#1e1e3a]">
              <button type="submit" disabled={saving} className="btn-primary text-sm py-2 px-5 text-white">
                <Save className="w-4 h-4" />
                {saving ? 'Saving...' : 'Save changes'}
              </button>
              <button type="button" onClick={handleCancel} className="btn-ghost text-sm py-2 px-4">
                Cancel
              </button>
              {saved && (
                <span className="text-sm text-green-400 flex items-center gap-1">
                  <CheckCircle className="w-4 h-4" />Saved!
                </span>
              )}
            </div>
          </form>
        </div>
      )}

      {/* Optional: Read-only info cards when not editing */}
      {!editing && (
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="card p-5 bg-blue-500/5 border-[#1e1e3a]">
            <div className="flex items-center gap-2 mb-2">
              <Globe className="w-5 h-5 text-blue-400" />
              <p className="text-xs font-medium text-[#555577] uppercase tracking-wider">Email Domain</p>
            </div>
            <p className="text-sm font-medium text-[#f0f0ff]">{college?.email_domain || '—'}</p>
          </div>
          <div className="card p-5 bg-purple-500/5 border-[#1e1e3a]">
            <div className="flex items-center gap-2 mb-2">
              <Image className="w-5 h-5 text-purple-400" />
              <p className="text-xs font-medium text-[#555577] uppercase tracking-wider">Logo URL</p>
            </div>
            <p className="text-sm font-medium text-[#f0f0ff] truncate max-w-full">{college?.logo_url || '—'}</p>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
