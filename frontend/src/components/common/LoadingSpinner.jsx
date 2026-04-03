import { Loader2 } from 'lucide-react'

export function LoadingSpinner({ fullPage = false }) {
  if (fullPage) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 size={32} className="animate-spin text-mustard-500" />
    </div>
  )
  return <Loader2 size={20} className="animate-spin text-mustard-500" />
}

export function EmptyState({ icon, title, desc, action }) {
  return (
    <div className="text-center py-14">
      <div className="w-14 h-14 bg-earth-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-earth-400">
        {icon}
      </div>
      <p className="font-display font-semibold text-earth-700 text-lg mb-1">{title}</p>
      {desc && <p className="font-body text-sm text-earth-400 mb-5">{desc}</p>}
      {action}
    </div>
  )
}