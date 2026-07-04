import { useState, useEffect, useCallback } from 'react'
import { DashboardLayout } from '../../components/DashboardLayout'
import { PageMeta } from '../../components/PageMeta'
import { Spinner } from '../../components/Spinner'
import { ErrorAlert } from '../../components/ErrorAlert'
import api from '../../lib/api'
import {
  FileText,
  CheckCircle,
  XCircle,
  Tag,
  User,
  DollarSign,
  Clock,
  Users,
  AlertTriangle,
  X,
} from 'lucide-react'

const CATEGORY_COLORS = {
  technical: 'from-blue-500/20 to-blue-600/5 border-blue-500/20',
  cultural: 'from-purple-500/20 to-purple-600/5 border-purple-500/20',
  sports: 'from-green-500/20 to-green-600/5 border-green-500/20',
  social: 'from-cyan-500/20 to-cyan-600/5 border-cyan-500/20',
  academic: 'from-amber-500/20 to-amber-600/5 border-amber-500/20',
  arts: 'from-pink-500/20 to-pink-600/5 border-pink-500/20',
  default: 'from-[#1a1a2e]/80 to-[#1a1a2e]/20 border-[#2a2a4a]',
}

function getCategoryStyle(category) {
  const key = category?.toLowerCase()
  return CATEGORY_COLORS[key] || CATEGORY_COLORS.default
}

export default function ClubRequestsPage() {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [actionLoading, setActionLoading] = useState(null)
  const [actionError, setActionError] = useState('')
  const [rejectTarget, setRejectTarget] = useState(null)
  const [rejecting, setRejecting] = useState(false)

  const fetchRequests = useCallback(() => {
    setLoading(true)
    setError('')
    api
      .get('/club-requests')
      .then((res) => setRequests(res.data.club_requests || []))
      .catch((err) =>
        setError(err.response?.data?.error || 'Failed to load club requests.')
      )
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    queueMicrotask(fetchRequests)
  }, [fetchRequests])

  const handleApprove = async (id) => {
    setActionLoading(id)
    setActionError('')
    try {
      await api.post(`/club-requests/${id}/approve`)
      setRequests((prev) => prev.filter((r) => r.id !== id))
    } catch (err) {
      setActionError(err.response?.data?.error || 'Failed to approve request.')
    } finally {
      setActionLoading(null)
    }
  }

  const openRejectModal = (req) => {
    setRejectTarget(req)
    setActionError('')
  }

  const closeRejectModal = () => {
    if (rejecting) return
    setRejectTarget(null)
    setActionError('')
  }

  const confirmReject = async () => {
    if (!rejectTarget) return
    setRejecting(true)
    setActionError('')
    try {
      await api.delete(`/club-requests/${rejectTarget.id}/reject`)
      setRequests((prev) => prev.filter((r) => r.id !== rejectTarget.id))
      setRejectTarget(null)
    } catch (err) {
      setActionError(err.response?.data?.error || 'Failed to reject request.')
    } finally {
      setRejecting(false)
    }
  }

  return (
    <DashboardLayout>
      <PageMeta title="Club Requests" />

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#f0f0ff]">Club Requests</h1>
        <p className="text-sm text-[#8888aa] mt-0.5">
          Review pending club creation requests from students in your college.
        </p>
      </div>

      {loading && (
        <div className="flex justify-center py-20">
          <Spinner size="lg" />
        </div>
      )}

      <ErrorAlert message={error} />
      {actionError && !rejectTarget && <ErrorAlert message={actionError} />}

      {!loading && requests.length === 0 && !error && (
        <div className="text-center py-20">
          <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-blue-400" />
          </div>
          <p className="text-[#f0f0ff] font-medium mb-1">No pending club requests</p>
          <p className="text-[#8888aa] text-sm">
            When students submit club creation requests, they'll appear here.
          </p>
        </div>
      )}

      {!loading && requests.length > 0 && (
        <div className="space-y-4">
          {requests.map((req) => {
            const catStyle = getCategoryStyle(req.category)
            const isActing = actionLoading === req.id

            return (
              <div
                key={req.id}
                className={`card p-5 bg-gradient-to-br ${catStyle} border transition-all duration-200`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                  {/* Club logo / placeholder */}
                  <div className="flex-shrink-0">
                    {req.logo_url ? (
                      <img
                        src={req.logo_url}
                        alt={req.name}
                        className="w-14 h-14 rounded-xl object-contain bg-white/5 border border-white/10 p-1"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                        <Users className="w-7 h-7 text-[#555577]" />
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h3 className="font-semibold text-[#f0f0ff] text-base">{req.name}</h3>
                      {req.category && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/10 text-xs font-medium text-[#f0f0ff]">
                          <Tag className="w-3 h-3" />
                          {req.category}
                        </span>
                      )}
                    </div>

                    {req.description && (
                      <p className="text-sm text-[#8888aa] mb-3 line-clamp-2">{req.description}</p>
                    )}

                    <div className="flex flex-wrap gap-3 text-xs text-[#555577]">
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {req.requested_by_name || 'Unknown'}
                        {req.requested_by_email && (
                          <span className="text-[#444466] ml-0.5">({req.requested_by_email})</span>
                        )}
                      </span>
                      {req.membership_fee != null && (
                        <span className="flex items-center gap-1">
                          <DollarSign className="w-3 h-3" />
                          {req.membership_fee === 0 ? 'Free' : `₹${req.membership_fee}`}
                        </span>
                      )}
                      {req.created_at && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(req.created_at).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 flex-shrink-0 self-start sm:self-center">
                    <button
                      onClick={() => handleApprove(req.id)}
                      disabled={isActing}
                      className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-green-500/15 text-green-400 border border-green-500/25 hover:bg-green-500/25 hover:border-green-500/40 transition-all disabled:opacity-50 disabled:pointer-events-none"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      {isActing ? '...' : 'Approve'}
                    </button>
                    <button
                      onClick={() => openRejectModal(req)}
                      disabled={isActing}
                      className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-red-500/15 text-red-400 border border-red-500/25 hover:bg-red-500/25 hover:border-red-500/40 transition-all disabled:opacity-50 disabled:pointer-events-none"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      {isActing ? '...' : 'Reject'}
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Reject confirmation modal */}
      {rejectTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={closeRejectModal}
        >
          <div
            className="card w-full max-w-sm p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-3 mb-4">
              <div className="w-9 h-9 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-4 h-4 text-red-400" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-[#f0f0ff] text-sm">Reject club request?</p>
                <p className="text-sm text-[#8888aa] mt-1">
                  This will permanently delete the request for{' '}
                  <span className="text-[#f0f0ff] font-medium">{rejectTarget.name}</span>. This
                  action cannot be undone.
                </p>
              </div>
              <button
                onClick={closeRejectModal}
                className="ml-auto text-[#555577] hover:text-[#8888aa] transition-colors shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <ErrorAlert message={actionError} />

            <div className="flex gap-2.5 mt-4">
              <button
                onClick={confirmReject}
                disabled={rejecting}
                className="flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-lg bg-red-500 text-white shadow-sm shadow-red-500/20 hover:bg-red-400 active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none"
              >
                {rejecting ? <Spinner size="xs" /> : <XCircle className="w-3.5 h-3.5" />}
                {rejecting ? 'Rejecting...' : 'Yes, reject'}
              </button>
              <button
                onClick={closeRejectModal}
                disabled={rejecting}
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
