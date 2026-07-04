export function Spinner({ size = 'md' }) {
  const s = size === 'xs' ? 'w-3 h-3' : size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-12 h-12' : 'w-8 h-8'
  return (
    <div className={`${s} border-2 border-[#1e1e3a] border-t-blue-500 rounded-full animate-spin`} />
  )
}
