import { DashboardLayout } from '../components/DashboardLayout'
import { PageMeta } from '../components/PageMeta'
import { Layers } from 'lucide-react'

export default function FeedPage() {
  return (
    <DashboardLayout>
      <PageMeta title="Feed" />
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-5">
          <Layers className="w-8 h-8 text-blue-400" />
        </div>
        <h1 className="text-2xl font-bold text-[#f0f0ff] mb-2">Feed</h1>
        <p className="text-[#8888aa] text-sm max-w-sm">
          Your personalised campus feed is coming soon. Stay tuned!
        </p>
      </div>
    </DashboardLayout>
  )
}
