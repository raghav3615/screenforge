'use client'

import { useEffect, useState } from 'react'

const KEY = 'sf:stars'
const TTL_MS = 1000 * 60 * 30 // 30 min client cache

function readCache(): { stars: number; t: number } | null {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (typeof parsed.stars === 'number' && typeof parsed.t === 'number') return parsed
    return null
  } catch {
    return null
  }
}

export function useGithubStars() {
  const [stars, setStars] = useState<number | null>(null)

  useEffect(() => {
    const cached = readCache()
    if (cached && Date.now() - cached.t < TTL_MS) {
      setStars(cached.stars)
    }

    let cancelled = false

    async function load() {
      // Prefer same-origin API (cached at edge + avoids GH rate limits)
      const endpoints = ['/api/stars', 'https://api.github.com/repos/raghav3615/screenforge']
      for (const url of endpoints) {
        try {
          const r = await fetch(url, { cache: 'no-store' })
          if (!r.ok) continue
          const d = await r.json()
          const value = typeof d.stars === 'number' ? d.stars : d.stargazers_count
          if (typeof value === 'number' && !cancelled) {
            setStars(value)
            try {
              localStorage.setItem(KEY, JSON.stringify({ stars: value, t: Date.now() }))
            } catch {}
            return
          }
        } catch {}
      }
    }

    load()
    const id = setInterval(load, 1000 * 60 * 5) // refresh every 5 min
    const onVis = () => { if (document.visibilityState === 'visible') load() }
    document.addEventListener('visibilitychange', onVis)
    return () => { cancelled = true; clearInterval(id); document.removeEventListener('visibilitychange', onVis) }
  }, [])

  return stars
}

export function formatStars(n: number | null) {
  if (n === null) return null
  if (n >= 1000) return `${(n / 1000).toFixed(n >= 10000 ? 0 : 1).replace(/\.0$/, '')}k`
  return String(n)
}
