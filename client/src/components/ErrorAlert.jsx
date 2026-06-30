import { AlertCircle, X } from 'lucide-react'
import { useState } from 'react'

export function ErrorAlert({ message }) {
  const [visible, setVisible] = useState(true)
  if (!message || !visible) return null
  return (
    <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg px-4 py-3 text-sm">
      <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
      <span className="flex-1">{message}</span>
      <button onClick={() => setVisible(false)} className="hover:text-red-300 transition-colors">
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}
