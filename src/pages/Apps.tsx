import { useMemo, useState, useEffect } from 'react'
import type { UsageSnapshot } from '../services/usageService'
import type { AppInfo, AppTimeLimit } from '../types/models'
import { useI18n } from '../i18n/I18nProvider'
import { 
  getAppTotals, 
  getEntriesForDate, 
  getAvailableDates, 
  getTodayDateString,
  getCategoryTotals,
} from '../utils/analytics'
import { fetchTimeLimits, addTimeLimit, removeTimeLimit } from '../services/usageService'
import DatePicker from '../components/DatePicker'
import './Apps.css'

interface AppsProps {
  snapshot: UsageSnapshot | null
}

type SortBy = 'time' | 'name' | 'category'

const Apps = ({ snapshot }: AppsProps) => {
  const { t, formatSeconds, formatDateLabel, translateCategory } = useI18n()
  const [sortBy, setSortBy] = useState<SortBy>('time')
  const [search, setSearch] = useState('')
  const [timeLimits, setTimeLimits] = useState<AppTimeLimit[]>([])
  const [editingLimit, setEditingLimit] = useState<string | null>(null)
  const [limitInputValue, setLimitInputValue] = useState('')
  const [selectedDate, setSelectedDate] = useState<string>(getTodayDateString())

  // Load time limits on mount
  useEffect(() => {
    fetchTimeLimits().then(setTimeLimits)
  }, [])

  // Available dates for selection
  const availableDates = useMemo(() => {
    if (!snapshot) return [getTodayDateString()]
    const dates = getAvailableDates(snapshot.usageEntries)
    // Always include today even if no data
    const today = getTodayDateString()
    if (!dates.includes(today)) {
      dates.unshift(today)
    }
    return dates.slice(0, 14) // Last 14 days max
  }, [snapshot])

  const activeSelectedDate = useMemo(() => {
    if (availableDates.includes(selectedDate)) {
      return selectedDate
    }
    return availableDates[0] || getTodayDateString()
  }, [availableDates, selectedDate])

  const runningNow = useMemo(() => {
    const items = snapshot?.runningApps ?? []
    const appLookup = new Map(snapshot?.apps.map((a) => [a.id, a]) ?? [])
    return [...items]
      .map((p) => ({
        ...p,
        appInfo: appLookup.get(p.appId),
      }))
      .sort((a, b) => (b.hasWindow ? 1 : 0) - (a.hasWindow ? 1 : 0) || b.count - a.count)
      .slice(0, 30)
  }, [snapshot])

  const openApps = useMemo(() => runningNow.filter((p) => p.hasWindow), [runningNow])
  const backgroundApps = useMemo(() => runningNow.filter((p) => !p.hasWindow), [runningNow])

  const { appList, totalSeconds, categoryTotals, todayUsageByApp } = useMemo(() => {
    if (!snapshot || snapshot.usageEntries.length === 0) {
      return { appList: [], totalSeconds: 0, categoryTotals: [], todayUsageByApp: new Map<string, number>() }
    }

    // Filter entries for selected date
    const dateEntries = getEntriesForDate(snapshot.usageEntries, activeSelectedDate)
    const appTotals = getAppTotals(dateEntries, snapshot.apps)
    const catTotals = getCategoryTotals(dateEntries, snapshot.apps)
    const totalSec = appTotals.reduce((s, a) => s + a.seconds, 0)

    // Calculate today's usage for time limit progress (always today)
    const today = getTodayDateString()
    const todayEntries = getEntriesForDate(snapshot.usageEntries, today)
    const todayUsage = new Map<string, number>()
    for (const entry of todayEntries) {
      const current = todayUsage.get(entry.appId) ?? 0
      todayUsage.set(entry.appId, current + entry.minutes)
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
        (a) =>
          a.app.name.toLowerCase().includes(q) ||
          a.app.category.toLowerCase().includes(q) ||
          translateCategory(a.app.category).toLowerCase().includes(q)
      )
    }

    return {
      appList: sorted,
      totalSeconds: totalSec,
      categoryTotals: catTotals,
      todayUsageByApp: todayUsage,
    }
  }, [activeSelectedDate, snapshot, sortBy, search, translateCategory])

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

  const isToday = activeSelectedDate === getTodayDateString()

  return (
    <>
      <header className="topbar">
        <div>
          <div className="topbar__title">{t('apps.title')}</div>
          <div className="topbar__subtitle">
            {t('apps.subtitle', { date: formatDateLabel(activeSelectedDate) })}
          </div>
        </div>
      </header>

      {/* Date Selector & Stats */}
      <section className="apps-date-section">
        <div className="apps-date-selector">
          <span className="apps-date-label">{t('apps.dateView')}</span>
          <DatePicker
            selectedDate={activeSelectedDate}
            availableDates={availableDates}
            onChange={setSelectedDate}
          />
        </div>
        <div className="apps-date-stats">
          <div className="apps-date-stat">
            <span className="apps-date-stat__value">{formatSeconds(totalSeconds)}</span>
            <span className="apps-date-stat__label">{t('apps.stats.totalTime')}</span>
          </div>
          <div className="apps-date-stat">
            <span className="apps-date-stat__value">{appList.length}</span>
            <span className="apps-date-stat__label">{t('apps.stats.appsUsed')}</span>
          </div>
          <div className="apps-date-stat">
            <span className="apps-date-stat__value">{categoryTotals[0] ? translateCategory(categoryTotals[0].category) : t('common.none')}</span>
            <span className="apps-date-stat__label">{t('apps.stats.topCategory')}</span>
          </div>
        </div>
      </section>

      {isToday && (
        <>
          <section className="running-now">
            <div className="running-now__header">
              <div className="running-now__title">{t('apps.openApps.title')}</div>
              <div className="running-now__sub">{t('apps.openApps.subtitle')}</div>
            </div>
            {openApps.length === 0 ? (
              <div className="running-now__empty">{t('apps.openApps.empty')}</div>
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
                      <span className="running-now__focus">{t('common.focused')}</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="running-now running-now--background">
            <div className="running-now__header">
              <div className="running-now__title">{t('apps.backgroundApps.title')}</div>
              <div className="running-now__sub">{t('apps.backgroundApps.subtitle')}</div>
            </div>
            {backgroundApps.length === 0 ? (
              <div className="running-now__empty">{t('apps.backgroundApps.empty')}</div>
            ) : (
              <div className="running-now__list">
                {backgroundApps.slice(0, 16).map((p) => (
                  <div key={`${p.process}:${p.count}:${p.hasWindow}`} className="running-now__pill">
                    <span className="running-now__name">{p.appInfo?.name ?? p.process}</span>
                    <span className="running-now__meta">
                      {t('apps.backgroundApps.processCount', { count: p.count })}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>
        </>
      )}

      {/* Time Limits Summary - only show if there are limits */}
      {timeLimits.length > 0 && isToday && (
        <section className="time-limits-summary">
          <div className="time-limits-summary__header">
            <div className="time-limits-summary__title">{t('apps.timeLimits.title')}</div>
            <div className="time-limits-summary__sub">
              {t('apps.timeLimits.subtitle', { count: timeLimits.length })}
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
                    {t('apps.timeLimits.usage', { used: usedMinutes, limit: limit.limitMinutes })}
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
                  {isExceeded && <span className="time-limit-pill__exceeded">{t('apps.timeLimits.exceeded')}</span>}
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
          placeholder={t('apps.controls.searchPlaceholder')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="apps-sort">
          <span>{t('apps.controls.sortBy')}</span>
          <button className={sortBy === 'time' ? 'active' : ''} onClick={() => setSortBy('time')}>
            {t('apps.controls.time')}
          </button>
          <button className={sortBy === 'name' ? 'active' : ''} onClick={() => setSortBy('name')}>
            {t('apps.controls.name')}
          </button>
          <button className={sortBy === 'category' ? 'active' : ''} onClick={() => setSortBy('category')}>
            {t('apps.controls.category')}
          </button>
        </div>
      </section>

      <section className="apps-grid">
        {appList.length === 0 ? (
          <div className="apps-empty">
            {search 
              ? t('apps.empty.search')
              : t('apps.empty.date', { date: formatDateLabel(activeSelectedDate) })}
          </div>
        ) : (
          appList.map(({ app, seconds }) => {
            const limit = getAppLimit(app.id)
            const todayMinutes = todayUsageByApp.get(app.id) ?? 0
            return (
              <AppCard
                key={app.id}
                app={app}
                seconds={seconds}
                percentage={totalSeconds > 0 ? Math.round((seconds / totalSeconds) * 100) : 0}
                todayMinutes={todayMinutes}
                limit={limit}
                isToday={isToday}
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
  seconds: number
  percentage: number
  todayMinutes: number
  limit?: AppTimeLimit
  isToday: boolean
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
  seconds, 
  percentage,
  todayMinutes,
  limit,
  isToday,
  isEditingLimit,
  limitInputValue,
  onStartEditLimit,
  onLimitInputChange,
  onSaveLimit,
  onCancelEdit,
  onRemoveLimit,
}: AppCardProps) => {
  const { t, formatSeconds, translateCategory } = useI18n()
  const isExceeded = limit && todayMinutes >= limit.limitMinutes
  const limitProgress = limit ? Math.min(100, Math.round((todayMinutes / limit.limitMinutes) * 100)) : 0

  return (
    <div className={`app-card ${isExceeded ? 'app-card--exceeded' : ''}`}>
      <div className="app-card__header">
        <div className="app-card__dot" style={{ background: app.color }} />
        <div className="app-card__info">
          <div className="app-card__name">{app.name}</div>
          <div className="app-card__category">{translateCategory(app.category)}</div>
        </div>
      </div>
      <div className="app-card__main-stat">
        <span className="app-card__time">{formatSeconds(seconds)}</span>
        <span className="app-card__percentage">{t('apps.cards.percentageOfTotal', { count: percentage })}</span>
      </div>
      <div className="app-card__bar">
        <div className="app-card__bar-fill" style={{ width: `${percentage}%`, background: app.color }} />
      </div>

      {/* Time Limit Section - only show for today */}
      {isToday && (
        <div className="app-card__limit">
          {isEditingLimit ? (
            <div className="app-card__limit-edit">
              <input
                type="number"
                className="app-card__limit-input"
                placeholder={t('apps.timeLimits.minutesPlaceholder')}
                value={limitInputValue}
                onChange={(e) => onLimitInputChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') onSaveLimit()
                  if (e.key === 'Escape') onCancelEdit()
                }}
                autoFocus
                min={1}
              />
              <span className="app-card__limit-unit">{t('apps.timeLimits.perDayUnit')}</span>
              <button className="app-card__limit-save" onClick={onSaveLimit}>{t('apps.timeLimits.save')}</button>
              <button className="app-card__limit-cancel" onClick={onCancelEdit}>{t('apps.timeLimits.cancel')}</button>
            </div>
          ) : limit ? (
            <div className="app-card__limit-active">
              <div className="app-card__limit-info">
                <span className="app-card__limit-label">{t('apps.timeLimits.limit')}</span>
                <span className={`app-card__limit-status ${isExceeded ? 'app-card__limit-status--exceeded' : ''}`}>
                  {t('apps.timeLimits.usage', { used: todayMinutes, limit: limit.limitMinutes })}
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
                <button className="app-card__limit-edit-btn" onClick={onStartEditLimit}>{t('apps.timeLimits.edit')}</button>
                <button className="app-card__limit-remove-btn" onClick={onRemoveLimit}>{t('apps.timeLimits.remove')}</button>
              </div>
            </div>
          ) : (
            <button className="app-card__set-limit-btn" onClick={onStartEditLimit}>
              {t('apps.timeLimits.setLimit')}
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export default Apps
