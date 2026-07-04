import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { DashboardLayout } from '../components/DashboardLayout'
import { PageMeta } from '../components/PageMeta'
import { Spinner } from '../components/Spinner'
import { ErrorAlert } from '../components/ErrorAlert'
import { useAuth } from '../context/AuthContext'
import api from '../lib/api'
import {
  Users,
  Plus,
  Pencil,
  Trash2,
  Tag,
  DollarSign,
  UserCheck,
  Clock,
  X,
  AlertTriangle,
  Save,
  Image as ImageIcon,
} from 'lucide-react'

const CATEGORY_COLORS = {
  technical: { gradient: 'from-blue-500/15 to-blue-600/5', border: 'border-blue-500/20', badge: 'bg-blue-500/15 text-blue-300 border-blue-500/20', icon: 'text-blue-400' },
  cultural: { gradient: 'from-purple-500/15 to-purple-600/5', border: 'border-purple-500/20', badge: 'bg-purple-500/15 text-purple-300 border-purple-500/20', icon: 'text-purple-400' },
  sports: { gradient: 'from-green-500/15 to-green-600/5', border: 'border-green-500/20', badge: 'bg-green-500/15 text-green-300 border-green-500/20', icon: 'text-green-400' },
  social: { gradient: 'from-cyan-500/15 to-cyan-600/5', border: 'border-cyan-500/20', badge: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/20', icon: 'text-cyan-400' },
  academic: { gradient: 'from-amber-500/15 to-amber-600/5', border: 'border-amber-500/20', badge: 'bg-amber-500/15 text-amber-300 border-amber-500/20', icon: 'text-amber-400' },
  arts: { gradient: 'from-pink-500/15 to-pink-600/5', border: 'border-pink-500/20', badge: 'bg-pink-500/15 text-pink-300 border-pink-500/20', icon: 'text-pink-400' },
  default: { gradient: 'from-[#1a1a2e]/60 to-transparent', border: 'border-[#2a2a4a]', badge: 'bg-white/5 text-[#8888aa] border-[#2a2a4a]', icon: 'text-[#8888aa]' },
}

function getCategoryStyle(category) {
  const key = category?.toLowerCase()
  return CATEGORY_COLORS[key] || CATEGORY_COLORS.default
}


// ─── Edit Club Modal ───────────────────────────────────────────────────────────
function EditClubModal({ club, onClose, onSaved }) {
  const [form, setForm] = useState({
    name: club.name || '',
    description: club.description || '',
    category: club.category || '',
    logo_url: club.logo_url || '',
    membership_fee: club.membership_fee != null ? String(club.membership_fee) : '',
    accepting_members: club.accepting_members ?? true,
    registration_type: club.registration_type || '',
    membership_duration_days: club.membership_duration_days != null ? String(club.membership_duration_days) : '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))
  const setCheck = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.checked }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const payload = {
        name: form.name.trim() || undefined,
        description: form.description.trim() || undefined,
        category: form.category || undefined,
        logo_url: form.logo_url.trim() || undefined,
        membership_fee: form.membership_fee !== '' ? parseFloat(form.membership_fee) : undefined,
        accepting_members: form.accepting_members,
        registration_type: form.registration_type || undefined,
        membership_duration_days: form.membership_duration_days !== '' ? parseInt(form.membership_duration_days) : undefined,
      }
      const res = await api.patch(`/clubs/${club.id}`, payload)
      onSaved(res.data.club)
      onClose()
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update club.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="card w-full max-w-lg p-6 shadow-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-lg font-bold text-[#f0f0ff]">Edit Club</h2>
            <p className="text-xs text-[#8888aa] mt-0.5">Update club details</p>
          </div>
          <button onClick={onClose} className="text-[#555577] hover:text-[#8888aa] transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <ErrorAlert message={error} />

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label htmlFor="edit-club-name" className="block text-sm font-medium text-[#8888aa] mb-1.5">
                Club Name
              </label>
              <input
                id="edit-club-name"
                type="text"
                value={form.name}
                onChange={set('name')}
                className="input-field"
                placeholder="Club name"
              />
            </div>

            <div>
              <label htmlFor="edit-club-category" className="block text-sm font-medium text-[#8888aa] mb-1.5">
                Category
              </label>
              <select
                id="edit-club-category"
                value={form.category}
                onChange={set('category')}
                className="input-field"
              >
                <option value="">Select category</option>
                <option value="technical">Technical</option>
                <option value="cultural">Cultural</option>
                <option value="sports">Sports</option>
                <option value="social">Social</option>
                <option value="academic">Academic</option>
                <option value="arts">Arts</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label htmlFor="edit-club-fee" className="block text-sm font-medium text-[#8888aa] mb-1.5">
                Membership Fee (₹)
              </label>
              <input
                id="edit-club-fee"
                type="number"
                min="0"
                step="0.01"
                value={form.membership_fee}
                onChange={set('membership_fee')}
                className="input-field"
                placeholder="0 for free"
              />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="edit-club-desc" className="block text-sm font-medium text-[#8888aa] mb-1.5">
                Description
              </label>
              <textarea
                id="edit-club-desc"
                rows={3}
                value={form.description}
                onChange={set('description')}
                className="input-field resize-none"
                placeholder="Describe the club..."
              />
            </div>

            <div>
              <label htmlFor="edit-club-logo" className="block text-sm font-medium text-[#8888aa] mb-1.5 flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5" /> Logo URL
              </label>
              <input
                id="edit-club-logo"
                type="url"
                value={form.logo_url}
                onChange={set('logo_url')}
                className="input-field"
                placeholder="https://..."
              />
              {form.logo_url && (
                <div className="mt-1.5 flex items-center gap-2 bg-white/5 p-1.5 rounded-lg border border-[#1e1e3a] w-fit">
                  <img
                    src={form.logo_url}
                    alt="Preview"
                    className="w-5 h-5 rounded object-contain"
                    onError={(e) => { e.target.style.display = 'none' }}
                  />
                  <span className="text-xs text-[#8888aa]">Preview</span>
                </div>
              )}
            </div>

            <div>
              <label htmlFor="edit-club-reg-type" className="block text-sm font-medium text-[#8888aa] mb-1.5">
                Registration Type
              </label>
              <select
                id="edit-club-reg-type"
                value={form.registration_type}
                onChange={set('registration_type')}
                className="input-field"
              >
                <option value="">Select type</option>
                <option value="open">Open</option>
                <option value="approval">Approval Required</option>
                <option value="invite">Invite Only</option>
              </select>
            </div>

            <div>
              <label htmlFor="edit-club-duration" className="block text-sm font-medium text-[#8888aa] mb-1.5">
                Membership Duration (days)
              </label>
              <input
                id="edit-club-duration"
                type="number"
                min="1"
                value={form.membership_duration_days}
                onChange={set('membership_duration_days')}
                className="input-field"
                placeholder="e.g. 365"
              />
            </div>

            <div className="flex items-center gap-3">
              <input
                id="edit-club-accepting"
                type="checkbox"
                checked={form.accepting_members}
                onChange={setCheck('accepting_members')}
                className="w-4 h-4 rounded border-[#2a2a4a] bg-[#0a0a0f] accent-blue-500"
              />
              <label htmlFor="edit-club-accepting" className="text-sm text-[#8888aa] cursor-pointer">
                Accepting new members
              </label>
            </div>
          </div>

          <div className="flex gap-3 pt-2 border-t border-[#1e1e3a]">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary text-sm py-2 px-5 text-white"
            >
              {loading ? <Spinner size="xs" /> : <Save className="w-4 h-4" />}
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
            <button type="button" onClick={onClose} className="btn-ghost text-sm py-2 px-4">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Club Card ────────────────────────────────────────────────────────────────
function ClubCard({ club, canManage, onEdit, onDelete }) {
  const style = getCategoryStyle(club.category)

  return (
    <div className={`card p-5 bg-gradient-to-br ${style.gradient} border ${style.border} transition-all duration-200 hover:shadow-lg hover:shadow-black/20 flex flex-col gap-4`}>
      {/* Top row: logo + name + admin actions */}
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          {club.logo_url ? (
            <img
              src={club.logo_url}
              alt={club.name}
              className="w-12 h-12 rounded-xl object-contain bg-white/5 border border-white/10 p-1"
            />
          ) : (
            <div className={`w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center ${style.icon}`}>
              <Users className="w-6 h-6" />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-[#f0f0ff] text-sm leading-tight truncate">{club.name}</h3>
          {club.category && (
            <span className={`inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full border text-[10px] font-medium ${style.badge}`}>
              <Tag className="w-2.5 h-2.5" />
              {club.category}
            </span>
          )}
        </div>

        {/* Admin icons: edit + delete */}
        {canManage && (
          <div className="flex items-center gap-1 flex-shrink-0">
            <button
              onClick={() => onEdit(club)}
              className="p-1.5 rounded-lg text-[#555577] hover:text-blue-400 hover:bg-blue-500/10 transition-colors"
              title="Edit club"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onDelete(club)}
              className="p-1.5 rounded-lg text-[#555577] hover:text-red-400 hover:bg-red-500/10 transition-colors"
              title="Delete club"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Description */}
      {club.description && (
        <p className="text-xs text-[#8888aa] leading-relaxed line-clamp-3">{club.description}</p>
      )}

      {/* Details row */}
      <div className="flex flex-wrap gap-2 text-[10px] text-[#555577]">
        {club.membership_fee != null && (
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/5 border border-white/5">
            <DollarSign className="w-2.5 h-2.5" />
            {club.membership_fee === 0 ? 'Free' : `₹${club.membership_fee}`}
          </span>
        )}
        {club.membership_duration_days && (
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/5 border border-white/5">
            <Clock className="w-2.5 h-2.5" />
            {club.membership_duration_days}d membership
          </span>
        )}
        {club.registration_type && (
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/5 border border-white/5">
            <UserCheck className="w-2.5 h-2.5" />
            {club.registration_type}
          </span>
        )}
        {club.accepting_members != null && (
          <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full border ${
            club.accepting_members
              ? 'bg-green-500/10 border-green-500/20 text-green-400'
              : 'bg-red-500/10 border-red-500/20 text-red-400'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${club.accepting_members ? 'bg-green-400' : 'bg-red-400'}`} />
            {club.accepting_members ? 'Accepting members' : 'Closed'}
          </span>
        )}
      </div>
    </div>
  )
}

// ─── Main Clubs Page ───────────────────────────────────────────────────────────
export default function ClubsPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [clubs, setClubs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [editTarget, setEditTarget] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  const canManage =
    user?.role === 'college_admin' || user?.role === 'super_admin'

  const fetchClubs = useCallback(() => {
    setLoading(true)
    setError('')
    api
      .get('/clubs')
      .then((res) => setClubs(res.data.clubs || []))
      .catch((err) => setError(err.response?.data?.error || 'Failed to load clubs.'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    queueMicrotask(fetchClubs)
  }, [fetchClubs])

  const handleSaved = (updated) => {
    setClubs((prev) => prev.map((c) => (c.id === updated.id ? updated : c)))
  }

  const openDeleteModal = (club) => {
    setDeleteError('')
    setDeleteTarget(club)
  }

  const closeDeleteModal = () => {
    if (deleting) return
    setDeleteTarget(null)
    setDeleteError('')
  }

  const confirmDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    setDeleteError('')
    try {
      await api.delete(`/clubs/${deleteTarget.id}`)
      setClubs((prev) => prev.filter((c) => c.id !== deleteTarget.id))
      setDeleteTarget(null)
    } catch (err) {
      setDeleteError(err.response?.data?.error || 'Failed to delete club.')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <DashboardLayout>
      <PageMeta title="Clubs" />

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#f0f0ff]">Clubs</h1>
          <p className="text-sm text-[#8888aa] mt-0.5">
            Explore all clubs in your college
          </p>
        </div>
        <button
          id="request-club-btn"
          onClick={() => navigate('/clubs/request')}
          className="btn-primary text-sm py-2 px-4 text-white"
        >
          <Plus className="w-4 h-4" />
          Request Club
        </button>
      </div>

      {loading && (
        <div className="flex justify-center py-20">
          <Spinner size="lg" />
        </div>
      )}

      <ErrorAlert message={error} />

      {!loading && clubs.length === 0 && !error && (
        <div className="text-center py-20">
          <div className="w-16 h-16 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-purple-400" />
          </div>
          <p className="text-[#f0f0ff] font-medium mb-1">No clubs yet</p>
          <p className="text-[#8888aa] text-sm mb-5">
            Be the first to request a club for your college!
          </p>
          <button
            onClick={() => navigate('/clubs/request')}
            className="btn-primary text-sm py-2 px-5 text-white"
          >
            <Plus className="w-4 h-4" />
            Request a Club
          </button>
        </div>
      )}

      {!loading && clubs.length > 0 && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {clubs.map((club) => (
            <ClubCard
              key={club.id}
              club={club}
              canManage={canManage}
              onEdit={setEditTarget}
              onDelete={openDeleteModal}
            />
          ))}
        </div>
      )}

      {/* Edit Club Modal */}
      {editTarget && (
        <EditClubModal
          club={editTarget}
          onClose={() => setEditTarget(null)}
          onSaved={(updated) => {
            handleSaved(updated)
            setEditTarget(null)
          }}
        />
      )}

      {/* Delete confirmation modal */}
      {deleteTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={closeDeleteModal}
        >
          <div
            className="card w-full max-w-sm p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-3 mb-4">
              <div className="w-9 h-9 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-4 h-4 text-red-400" />
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-[#f0f0ff] text-sm">Delete club?</p>
                <p className="text-sm text-[#8888aa] mt-1">
                  Are you sure you want to delete{' '}
                  <span className="text-[#f0f0ff] font-medium">{deleteTarget.name}</span>?
                  This action cannot be undone.
                </p>
              </div>
            </div>

            <ErrorAlert message={deleteError} />

            <div className="flex gap-2.5 mt-4">
              <button
                onClick={confirmDelete}
                disabled={deleting}
                className="flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-lg bg-red-500 text-white shadow-sm shadow-red-500/20 hover:bg-red-400 active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none"
              >
                {deleting ? <Spinner size="xs" /> : <Trash2 className="w-3.5 h-3.5" />}
                {deleting ? 'Deleting...' : 'Yes, delete'}
              </button>
              <button
                onClick={closeDeleteModal}
                disabled={deleting}
                className="flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-lg border border-[#2a2a4a] text-[#8888aa] hover:border-[#3a3a5a] hover:bg-white/5 hover:text-[#f0f0ff] active:scale-[0.98] transition-all disabled:opacity-50"
              >
                <X className="w-3.5 h-3.5" />
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
