import { useState } from 'react'
import { DashboardLayout } from '../components/DashboardLayout'
import { PageMeta } from '../components/PageMeta'
import { ErrorAlert } from '../components/ErrorAlert'
import { useAuth } from '../context/AuthContext'
import api from '../lib/api'
import {
  Mail,
  BookOpen,
  Building2,
  CheckCircle,
  XCircle,
  Save,
  Pencil,
  X,
  GraduationCap,
  GitBranch,
} from 'lucide-react'

export default function ProfilePage() {
  const { user, setUser } = useAuth()

  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({
    name: user?.name || '',
    year: user?.year ?? '',
    branch: user?.branch || '',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)

  const set = key => e => setForm(f => ({ ...f, [key]: e.target.value }))

  const handleSave = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) return setError('Name cannot be empty.')
    setError('')
    setSaving(true)
    setSaved(false)
    try {
      // PATCH /users/me — accepts name, year, branch
      const payload = {
        name: form.name.trim(),
        branch: form.branch.trim() || null,
        year: form.year !== '' ? parseInt(form.year) : null,
      }
      const res = await api.patch('/users/me', payload)
      setUser(prev => ({ ...prev, ...res.data.user }))
      setSaved(true)
      setEditing(false)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update profile.')
    } finally {
      setSaving(false)
    }
  }

  const handleCancelEdit = () => {
    setForm({ name: user?.name || '', year: user?.year ?? '', branch: user?.branch || '' })
    setError('')
    setEditing(false)
  }

  const initials = user?.name
    ?.split(' ')
    .map(w => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'U'

  const yearLabel = {
    1: '1st Year',
    2: '2nd Year',
    3: '3rd Year',
    4: '4th Year',
    5: '5th Year',
  }

  return (
    <DashboardLayout>
      <PageMeta title="My Profile" />

      {/* Full-width hero card */}
      <div className="relative overflow-hidden rounded-2xl border border-[#1e1e3a] mb-6">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-purple-600/5 to-transparent pointer-events-none" />
        <div className="absolute top-0 right-0 w-72 h-72 bg-purple-600/8 rounded-full blur-[80px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-600/8 rounded-full blur-[60px] pointer-events-none" />

        <div className="relative p-8 flex flex-col sm:flex-row items-start sm:items-center gap-6">
          {/* Avatar */}
          <div className="relative">
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-3xl font-bold shadow-2xl">
              {initials}
            </div>
            <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-[#13131f] ${user?.email_verified ? 'bg-green-400' : 'bg-red-400'}`} />
          </div>

          {/* Name + meta */}
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-[#f0f0ff] mb-0.5">{user?.name}</h1>
            <p className="text-sm text-[#8888aa] flex items-center gap-1.5 mb-3">
              <Mail className="w-3.5 h-3.5" />
              {user?.email}
              {user?.email_verified
                ? <span className="ml-1 inline-flex items-center gap-1 text-xs text-green-400"><CheckCircle className="w-3 h-3" />Verified</span>
                : <span className="ml-1 inline-flex items-center gap-1 text-xs text-red-400"><XCircle className="w-3 h-3" />Not verified</span>
              }
            </p>

            {/* Info chips */}
            <div className="flex flex-wrap gap-2">
              {user?.college_name && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs text-blue-300">
                  <Building2 className="w-3 h-3" />
                  {user.college_name}
                </span>
              )}
              {user?.year && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-xs text-purple-300">
                  <GraduationCap className="w-3 h-3" />
                  {yearLabel[user.year] || `Year ${user.year}`}
                </span>
              )}
              {user?.branch && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-xs text-cyan-300">
                  <GitBranch className="w-3 h-3" />
                  {user.branch}
                </span>
              )}
            </div>
          </div>

          {/* Edit button */}
          {!editing && (
            <button
              onClick={() => setEditing(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-[#1e1e3a] text-sm text-[#8888aa] hover:text-[#f0f0ff] hover:border-[#2a2a4a] transition-all"
            >
              <Pencil className="w-3.5 h-3.5" />
              Edit
            </button>
          )}
        </div>
      </div>

      {/* Edit form */}
      {editing && (
        <div className="card p-6 mb-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-semibold text-[#f0f0ff]">Edit Profile</h2>
            <button onClick={handleCancelEdit} className="text-[#555577] hover:text-[#8888aa] transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          <ErrorAlert message={error} />

          <form onSubmit={handleSave} className="space-y-4 mt-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="profile-name" className="block text-sm font-medium text-[#8888aa] mb-1.5">
                  Full Name
                </label>
                <input
                  id="profile-name"
                  type="text"
                  value={form.name}
                  onChange={set('name')}
                  className="input-field"
                  placeholder="Your name"
                  required
                />
              </div>

              <div>
                <label htmlFor="profile-year" className="block text-sm font-medium text-[#8888aa] mb-1.5">
                  Year
                </label>
                <select
                  id="profile-year"
                  value={form.year}
                  onChange={set('year')}
                  className="input-field"
                >
                  <option value="">Not specified</option>
                  <option value="1">1st Year</option>
                  <option value="2">2nd Year</option>
                  <option value="3">3rd Year</option>
                  <option value="4">4th Year</option>
                  <option value="5">5th Year</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="profile-branch" className="block text-sm font-medium text-[#8888aa] mb-1.5">
                  Branch / Department
                </label>
                <input
                  id="profile-branch"
                  type="text"
                  value={form.branch}
                  onChange={set('branch')}
                  className="input-field"
                  placeholder="e.g. Computer Science, Mechanical Engineering"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button type="submit" disabled={saving} className="btn-primary text-sm py-2 px-5 text-white">
                <Save className="w-4 h-4" />
                {saving ? 'Saving...' : 'Save changes'}
              </button>
              <button type="button" onClick={handleCancelEdit} className="btn-ghost text-sm py-2 px-4">
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

      {/* Info cards */}
      <div className="grid sm:grid-cols-3 gap-4">
        <InfoCard
          icon={<Mail className="w-5 h-5 text-blue-400" />}
          label="Email"
          value={user?.email}
          bg="bg-blue-500/8"
        />
        <InfoCard
          icon={<Building2 className="w-5 h-5 text-purple-400" />}
          label="College"
          value={user?.college_name || '—'}
          bg="bg-purple-500/8"
        />
        <InfoCard
          icon={<GraduationCap className="w-5 h-5 text-cyan-400" />}
          label="Year"
          value={user?.year ? (yearLabel[user.year] || `Year ${user.year}`) : '—'}
          bg="bg-cyan-500/8"
        />
        <InfoCard
          icon={<GitBranch className="w-5 h-5 text-emerald-400" />}
          label="Branch"
          value={user?.branch || '—'}
          bg="bg-emerald-500/8"
        />
        <InfoCard
          icon={<BookOpen className="w-5 h-5 text-orange-400" />}
          label="Email Status"
          value={user?.email_verified ? 'Verified' : 'Not verified'}
          valueClass={user?.email_verified ? 'text-green-400' : 'text-red-400'}
          bg="bg-orange-500/8"
        />
      </div>
    </DashboardLayout>
  )
}

function InfoCard({ icon, label, value, bg = 'bg-white/5', valueClass = 'text-[#f0f0ff]' }) {
  return (
    <div className={`card p-4 ${bg} border-[#1e1e3a]`}>
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <p className="text-xs font-medium text-[#555577] uppercase tracking-wider">{label}</p>
      </div>
      <p className={`text-sm font-medium truncate ${valueClass}`}>{value}</p>
    </div>
  )
}
