import { NextResponse } from 'next/server'

export const revalidate = 3600 // ISR: cache 1h at edge

const REPO = 'raghav3615/screenforge'

export async function GET() {
  const token = process.env.GITHUB_TOKEN
  try {
    const res = await fetch(`https://api.github.com/repos/${REPO}`, {
      headers: {
        Accept: 'application/vnd.github.v3+json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        'User-Agent': 'screenforge.app',
      },
      next: { revalidate: 3600 },
    })

    if (!res.ok) {
      const text = await res.text()
      return NextResponse.json(
        { error: 'github api error', status: res.status, detail: text.slice(0, 300) },
        {
          status: 200, // don't break UI; return fallback
          headers: { 'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=3600' },
        }
      )
    }

    const data = await res.json()
    return NextResponse.json(
      {
        stars: data.stargazers_count ?? null,
        forks: data.forks_count ?? null,
        updatedAt: new Date().toISOString(),
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=3600',
        },
      }
    )
  } catch (e) {
    return NextResponse.json({ error: String(e), stars: null }, { status: 200, headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' } })
  }
}
