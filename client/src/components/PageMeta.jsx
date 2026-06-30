import { useEffect } from 'react'

export function PageMeta({ title }) {
  useEffect(() => {
    document.title = title ? `${title} — ClubSphere` : 'ClubSphere'
  }, [title])
  return null
}
