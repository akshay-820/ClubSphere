import { useState, useEffect } from 'react'
import { DashboardLayout } from '../../components/DashboardLayout'
import { PageMeta } from '../../components/PageMeta'
import { Spinner } from '../../components/Spinner'
import { ErrorAlert } from '../../components/ErrorAlert'
import api from '../../lib/api'
import { FileText, CheckCircle, XCircle, Globe, Building2 } from 'lucide-react'

export default function AdminCollegeRequestsPage() {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [actionLoading, setActionLoading] = useState(null) // id of item being acted on

  const fetchRequests = () => {
    setLoading(true)
    // GET /college-requests — super admin only, returns { college_requests: [...] }
    api.get('/college-requests')
      .then(res => setRequests(res.data.college_requests || []))
      .catch(err => setError(err.response?.data?.error || 'Failed to load requests.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchRequests() }, [])

  const handleApprove = async (id) => {
    setActionLoading(id)
    try {
      // PATCH /college-requests/:id/approve
      await api.patch(`/college-requests/${id}/approve`)
      setRequests(prev => prev.filter(r => r.id !== id))
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to approve request.')
    } finally {
      setActionLoading(null)
    }
  }

  const handleReject = async (id) => {
    setActionLoading(id)
    try {
      // PATCH /college-requests/:id/reject
      await api.patch(`/college-requests/${id}/reject`)
      setRequests(prev => prev.filter(r => r.id !== id))
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to reject request.')
    } finally {
      setActionLoading(null)
    }
  }

  return (
    <DashboardLayout>
      <PageMeta title="College Requests" />
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#f0f0ff]">College Requests</h1>
        <p className="text-sm text-[#8888aa] mt-0.5">Review and approve or reject pending college creation requests.</p>
      </div>

      {loading && <div className="flex justify-center py-20"><Spinner size="lg" /></div>}
      <ErrorAlert message={error} />

      {!loading && requests.length === 0 && !error && (
        <div className="text-center py-20">
          <FileText className="w-10 h-10 text-[#555577] mx-auto mb-3" />
          <p className="text-[#8888aa] text-sm">No pending college requests.</p>
        </div>
      )}

      {!loading && requests.length > 0 && (
        <div className="space-y-3">
          {requests.map(req => (
            <div key={req.id} className="card p-5 flex items-center gap-4">
              {req.logo_url ? (
                <img src={req.logo_url} alt={req.college_name} className="w-10 h-10 rounded-lg object-contain bg-white/5 flex-shrink-0" />
              ) : (
                <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center flex-shrink-0">
                  <Building2 className="w-5 h-5 text-blue-400" />
                </div>
              )}

              <div className="flex-1 min-w-0">
                <p className="font-medium text-[#f0f0ff] text-sm">{req.college_name}</p>
                <p className="text-xs text-[#555577] flex items-center gap-1 mt-0.5">
                  <Globe className="w-3 h-3" />{req.email_domain}
                </p>
                {req.created_at && (
                  <p className="text-xs text-[#555577] mt-0.5">
                    Requested {new Date(req.created_at).toLocaleDateString()}
                  </p>
                )}
              </div>

              <div className="flex gap-2 flex-shrink-0">
                <button
                  onClick={() => handleApprove(req.id)}
                  disabled={actionLoading === req.id}
                  className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-green-500/10 text-green-400 border border-green-500/20 hover:bg-green-500/20 transition-colors disabled:opacity-50"
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  {actionLoading === req.id ? '...' : 'Approve'}
                </button>
                <button
                  onClick={() => handleReject(req.id)}
                  disabled={actionLoading === req.id}
                  className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-colors disabled:opacity-50"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  {actionLoading === req.id ? '...' : 'Reject'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  )
}
