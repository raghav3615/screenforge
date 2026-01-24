import { useMemo, useState, useEffect } from 'react'
import type { UsageSnapshot } from '../services/usageService'
import type { AppInfo, AppTimeLimit } from '../types/models'
import { formatSeconds, getAppTotals, getDailyTotals } from '../utils/analytics'
import { fetchTimeLimits, addTimeLimit, removeTimeLimit } from '../services/usageService'
import './Apps.css'

interface AppsProps {
  snapshot: UsageSnapshot | null
}

type SortBy = 'time' | 'name' | 'category'

// Get today's date string in local timezone
const getTodayDateString = (): string => {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const Apps = ({ snapshot }: AppsProps) => {
  const [sortBy, setSortBy] = useState<SortBy>('time')
  const [search, setSearch] = useState('')
  const [timeLimits, setTimeLimits] = useState<AppTimeLimit[]>([])
  const [editingLimit, setEditingLimit] = useState<string | null>(null)
  const [limitInputValue, setLimitInputValue] = useState('')

  // Load time limits on mount
  useEffect(() => {
    fetchTimeLimits().then(setTimeLimits)
  }, [])

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

  const { appList, totalSeconds, dailyCount, todayUsageByApp } = useMemo(() => {
    if (!snapshot || snapshot.usageEntries.length === 0) {
      return { appList: [], totalSeconds: 0, dailyCount: 0, todayUsageByApp: new Map<string, number>() }
    }

    const appTotals = getAppTotals(snapshot.usageEntries, snapshot.apps)
    const dailyTotals = getDailyTotals(snapshot.usageEntries)
    const totalSec = appTotals.reduce((s, a) => s + a.seconds, 0)

    // Calculate today's usage for each app
    const today = getTodayDateString()
    const todayUsage = new Map<string, number>()
    for (const entry of snapshot.usageEntries) {
      if (entry.date === today) {
        const current = todayUsage.get(entry.appId) ?? 0
        todayUsage.set(entry.appId, current + entry.minutes)
      }
    }

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
      todayUsageByApp: todayUsage,
    }
  }, [snapshot, sortBy, search])

  const handleSetLimit = async (appId: string) => {
    const minutes = parseInt(limitInputValue, 10)
    if (isNaN(minutes) || minutes <= 0) {
      setEditingLimit(null)
      setLimitInputValue('')
      return
    }

    const newLimits = await addTimeLimit({
      appId,
      limitMinutes: minutes,
      enabled: true,
    })
    setTimeLimits(newLimits)
    setEditingLimit(null)
    setLimitInputValue('')
  }

  const handleRemoveLimit = async (appId: string) => {
    const newLimits = await removeTimeLimit(appId)
    setTimeLimits(newLimits)
  }

  const getAppLimit = (appId: string): AppTimeLimit | undefined => {
    return timeLimits.find((l) => l.appId === appId)
  }

  return (
    <>
      <header className="topbar">
        <div>
          <div className="topbar__title">Apps</div>
          <div className="topbar__subtitle">All tracked applications and time limits</div>
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

      {/* Time Limits Summary */}
      {timeLimits.length > 0 && (
        <section className="time-limits-summary">
          <div className="time-limits-summary__header">
            <div className="time-limits-summary__title">Active Time Limits</div>
            <div className="time-limits-summary__sub">
              {timeLimits.length} app{timeLimits.length !== 1 ? 's' : ''} with limits
            </div>
          </div>
          <div className="time-limits-summary__list">
            {timeLimits.map((limit) => {
              const app = snapshot?.apps.find((a) => a.id === limit.appId)
              const usedMinutes = todayUsageByApp.get(limit.appId) ?? 0
              const percentUsed = Math.min(100, Math.round((usedMinutes / limit.limitMinutes) * 100))
              const isExceeded = usedMinutes >= limit.limitMinutes

              return (
                <div 
                  key={limit.appId} 
                  className={`time-limit-pill ${isExceeded ? 'time-limit-pill--exceeded' : ''}`}
                >
                  <span 
                    className="time-limit-pill__dot" 
                    style={{ background: app?.color ?? '#6b7280' }} 
                  />
                  <span className="time-limit-pill__name">{app?.name ?? limit.appId}</span>
                  <span className="time-limit-pill__usage">
                    {usedMinutes}m / {limit.limitMinutes}m
                  </span>
                  <div className="time-limit-pill__bar">
                    <div 
                      className="time-limit-pill__bar-fill" 
                      style={{ 
                        width: `${percentUsed}%`,
                        background: isExceeded ? 'var(--danger)' : (app?.color ?? '#6b7280'),
                      }} 
                    />
                  </div>
                  {isExceeded && <span className="time-limit-pill__exceeded">exceeded</span>}
                </div>
              )
            })}
          </div>
        </section>
      )}

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
          appList.map(({ app, seconds }) => {
            const limit = getAppLimit(app.id)
            const todayMinutes = todayUsageByApp.get(app.id) ?? 0
            return (
              <AppCard
                key={app.id}
                app={app}
                totalSeconds={seconds}
                dailyAverageSeconds={Math.round(seconds / Math.max(dailyCount, 1))}
                percentage={totalSeconds > 0 ? Math.round((seconds / totalSeconds) * 100) : 0}
                todayMinutes={todayMinutes}
                limit={limit}
                isEditingLimit={editingLimit === app.id}
                limitInputValue={editingLimit === app.id ? limitInputValue : ''}
                onStartEditLimit={() => {
                  setEditingLimit(app.id)
                  setLimitInputValue(limit?.limitMinutes?.toString() ?? '')
                }}
                onLimitInputChange={setLimitInputValue}
                onSaveLimit={() => handleSetLimit(app.id)}
                onCancelEdit={() => {
                  setEditingLimit(null)
                  setLimitInputValue('')
                }}
                onRemoveLimit={() => handleRemoveLimit(app.id)}
              />
            )
          })
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
  todayMinutes: number
  limit?: AppTimeLimit
  isEditingLimit: boolean
  limitInputValue: string
  onStartEditLimit: () => void
  onLimitInputChange: (value: string) => void
  onSaveLimit: () => void
  onCancelEdit: () => void
  onRemoveLimit: () => void
}

const AppCard = ({ 
  app, 
  totalSeconds, 
  dailyAverageSeconds, 
  percentage,
  todayMinutes,
  limit,
  isEditingLimit,
  limitInputValue,
  onStartEditLimit,
  onLimitInputChange,
  onSaveLimit,
  onCancelEdit,
  onRemoveLimit,
}: AppCardProps) => {
  const isExceeded = limit && todayMinutes >= limit.limitMinutes
  const limitProgress = limit ? Math.min(100, Math.round((todayMinutes / limit.limitMinutes) * 100)) : 0

  return (
    <div className={`app-card ${isExceeded ? 'app-card--exceeded' : ''}`}>
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

      {/* Time Limit Section */}
      <div className="app-card__limit">
        {isEditingLimit ? (
          <div className="app-card__limit-edit">
            <input
              type="number"
              className="app-card__limit-input"
              placeholder="Minutes"
              value={limitInputValue}
              onChange={(e) => onLimitInputChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') onSaveLimit()
                if (e.key === 'Escape') onCancelEdit()
              }}
              autoFocus
              min={1}
            />
            <span className="app-card__limit-unit">min/day</span>
            <button className="app-card__limit-save" onClick={onSaveLimit}>Save</button>
            <button className="app-card__limit-cancel" onClick={onCancelEdit}>Cancel</button>
          </div>
        ) : limit ? (
          <div className="app-card__limit-active">
            <div className="app-card__limit-info">
              <span className="app-card__limit-label">Today:</span>
              <span className={`app-card__limit-status ${isExceeded ? 'app-card__limit-status--exceeded' : ''}`}>
                {todayMinutes}m / {limit.limitMinutes}m
              </span>
            </div>
            <div className="app-card__limit-bar">
              <div 
                className="app-card__limit-bar-fill" 
                style={{ 
                  width: `${limitProgress}%`,
                  background: isExceeded ? 'var(--danger)' : app.color,
                }} 
              />
            </div>
            <div className="app-card__limit-actions">
              <button className="app-card__limit-edit-btn" onClick={onStartEditLimit}>Edit</button>
              <button className="app-card__limit-remove-btn" onClick={onRemoveLimit}>Remove</button>
            </div>
          </div>
        ) : (
          <button className="app-card__set-limit-btn" onClick={onStartEditLimit}>
            Set time limit
          </button>
        )}
      </div>
    </div>
  )
}

export default Apps
