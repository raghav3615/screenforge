import { useMemo, useState } from 'react'
import type { UsageSnapshot } from '../services/usageService'
import type { AppInfo } from '../types/models'
import { formatSeconds, getAppTotals, getDailyTotals } from '../utils/analytics'
import './Apps.css'

interface AppsProps {
  snapshot: UsageSnapshot | null
}

type SortBy = 'time' | 'name' | 'category'

const Apps = ({ snapshot }: AppsProps) => {
  const [sortBy, setSortBy] = useState<SortBy>('time')
  const [search, setSearch] = useState('')

  const runningNow = useMemo(() => {
    const items = snapshot?.runningApps ?? []
    const appLookup = new Map(snapshot?.apps.map((a) => [a.id, a]) ?? [])
    return [...items]
      .map((p) => ({
        ...p,
        appInfo: appLookup.get(p.appId),
      }))
      // Prioritize apps with windows, then by count
      .sort((a, b) => (b.hasWindow ? 1 : 0) - (a.hasWindow ? 1 : 0) || b.count - a.count)
      .slice(0, 30)
  }, [snapshot])

  // Separate open apps (with visible windows) from background processes
  const openApps = useMemo(() => runningNow.filter((p) => p.hasWindow), [runningNow])
  const backgroundApps = useMemo(() => runningNow.filter((p) => !p.hasWindow), [runningNow])

  const { appList, totalSeconds, dailyCount } = useMemo(() => {
    if (!snapshot || snapshot.usageEntries.length === 0) {
      return { appList: [], totalSeconds: 0, dailyCount: 0 }
    }

    const appTotals = getAppTotals(snapshot.usageEntries, snapshot.apps)
    const dailyTotals = getDailyTotals(snapshot.usageEntries)
    const totalSec = appTotals.reduce((s, a) => s + a.seconds, 0)

    let sorted = [...appTotals]
    if (sortBy === 'name') {
      sorted.sort((a, b) => a.app.name.localeCompare(b.app.name))
    } else if (sortBy === 'category') {
      sorted.sort((a, b) => a.app.category.localeCompare(b.app.category))
    }

    if (search) {
      const q = search.toLowerCase()
      sorted = sorted.filter(
        (a) => a.app.name.toLowerCase().includes(q) || a.app.category.toLowerCase().includes(q)
      )
    }

    return {
      appList: sorted,
      totalSeconds: totalSec,
      dailyCount: dailyTotals.length,
    }
  }, [snapshot, sortBy, search])

  return (
    <>
      <header className="topbar">
        <div>
          <div className="topbar__title">Apps</div>
          <div className="topbar__subtitle">All tracked applications</div>
        </div>
      </header>

      <section className="running-now">
        <div className="running-now__header">
          <div className="running-now__title">Open apps</div>
          <div className="running-now__sub">
            Apps with visible windows
          </div>
        </div>
        {openApps.length === 0 ? (
          <div className="running-now__empty">No apps with visible windows detected yet.</div>
        ) : (
          <div className="running-now__list">
            {openApps.map((p) => (
              <div 
                key={`${p.process}:${p.count}:${p.hasWindow}`} 
                className={`running-now__pill running-now__pill--window ${p.appId === snapshot?.activeAppId ? 'running-now__pill--active' : ''}`}
              >
                <span 
                  className="running-now__dot" 
                  style={{ background: p.appInfo?.color ?? '#6b7280' }} 
                />
                <span className="running-now__name">{p.appInfo?.name ?? p.process}</span>
                {p.appId === snapshot?.activeAppId && (
                  <span className="running-now__focus">focused</span>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="running-now running-now--background">
        <div className="running-now__header">
          <div className="running-now__title">Background processes</div>
          <div className="running-now__sub">
            Running without visible windows
          </div>
        </div>
        {backgroundApps.length === 0 ? (
          <div className="running-now__empty">No background processes detected.</div>
        ) : (
          <div className="running-now__list">
            {backgroundApps.slice(0, 16).map((p) => (
              <div key={`${p.process}:${p.count}:${p.hasWindow}`} className="running-now__pill">
                <span className="running-now__name">{p.appInfo?.name ?? p.process}</span>
                <span className="running-now__meta">
                  {p.count} {p.count === 1 ? 'process' : 'processes'}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="apps-controls">
        <input
          type="text"
          className="apps-search"
          placeholder="Search apps..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="apps-sort">
          <span>Sort by:</span>
          <button className={sortBy === 'time' ? 'active' : ''} onClick={() => setSortBy('time')}>
            Time
          </button>
          <button className={sortBy === 'name' ? 'active' : ''} onClick={() => setSortBy('name')}>
            Name
          </button>
          <button className={sortBy === 'category' ? 'active' : ''} onClick={() => setSortBy('category')}>
            Category
          </button>
        </div>
      </section>

      <section className="apps-grid">
        {appList.length === 0 ? (
          <div className="apps-empty">
            {search ? 'No apps match your search' : 'No apps tracked yet. Start using your computer!'}
          </div>
        ) : (
          appList.map(({ app, seconds }) => (
            <AppCard
              key={app.id}
              app={app}
              totalSeconds={seconds}
              dailyAverageSeconds={Math.round(seconds / Math.max(dailyCount, 1))}
              percentage={totalSeconds > 0 ? Math.round((seconds / totalSeconds) * 100) : 0}
            />
          ))
        )}
      </section>
    </>
  )
}

interface AppCardProps {
  app: AppInfo
  totalSeconds: number
  dailyAverageSeconds: number
  percentage: number
}

const AppCard = ({ app, totalSeconds, dailyAverageSeconds, percentage }: AppCardProps) => (
  <div className="app-card">
    <div className="app-card__header">
      <div className="app-card__dot" style={{ background: app.color }} />
      <div className="app-card__info">
        <div className="app-card__name">{app.name}</div>
        <div className="app-card__category">{app.category}</div>
      </div>
    </div>
    <div className="app-card__stats">
      <div className="app-card__stat">
        <span className="app-card__stat-label">Total</span>
        <span className="app-card__stat-value">{formatSeconds(totalSeconds)}</span>
      </div>
      <div className="app-card__stat">
        <span className="app-card__stat-label">Daily avg</span>
        <span className="app-card__stat-value">{formatSeconds(dailyAverageSeconds)}</span>
      </div>
      <div className="app-card__stat">
        <span className="app-card__stat-label">Share</span>
        <span className="app-card__stat-value">{percentage}%</span>
      </div>
    </div>
    <div className="app-card__bar">
      <div className="app-card__bar-fill" style={{ width: `${percentage}%`, background: app.color }} />
    </div>
  </div>
)

export default Apps
