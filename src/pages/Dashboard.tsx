import { useMemo } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Tooltip,
  Filler,
  Legend,
} from 'chart.js'
import { Bar, Line } from 'react-chartjs-2'
import StatCard from '../components/StatCard'
import AppUsageTable from '../components/AppUsageTable'
import NotificationSummary from '../components/NotificationSummary'
import SuggestionPanel from '../components/SuggestionPanel'
import type { ThemeName, SuggestionItem, NotificationSummary as NotifSummaryType, AppInfo } from '../types/models'
import type { UsageSnapshot } from '../services/usageService'
import {
  formatMinutes,
  formatSeconds,
  getAppTotals,
  getCategoryTotals,
  getDailyTotals,
  getTodayEntries,
  getTodayDateString,
} from '../utils/analytics'
import './Dashboard.css'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Tooltip,
  Filler,
  Legend,
)

interface DashboardProps {
  snapshot: UsageSnapshot | null
  suggestions: SuggestionItem[]
  notificationSummary: NotifSummaryType | null
  theme: ThemeName
}

const formatAppName = (appId: string): string => {
  const raw = appId.replace(/^proc:/i, '')
  const lower = raw.toLowerCase()
  if (lower === 'whatsapp' || lower === 'whatsapp.root') return 'WhatsApp'
  return raw
    .replace(/[._-]+/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

// Known app catalog for notifications that may not be in usage data
const knownApps: Record<string, { name: string; category: string; color: string }> = {
  discord: { name: 'Discord', category: 'Social', color: '#8c7dff' },
  whatsapp: { name: 'WhatsApp', category: 'Social', color: '#25d366' },
  telegram: { name: 'Telegram', category: 'Social', color: '#0088cc' },
  slack: { name: 'Slack', category: 'Communication', color: '#e91e63' },
  teams: { name: 'Microsoft Teams', category: 'Communication', color: '#5b7cfa' },
  outlook: { name: 'Outlook', category: 'Communication', color: '#2f6fff' },
  mail: { name: 'Mail', category: 'Communication', color: '#2f6fff' },
  gmail: { name: 'Gmail', category: 'Communication', color: '#ea4335' },
  spotify: { name: 'Spotify', category: 'Entertainment', color: '#2ed47a' },
  steam: { name: 'Steam', category: 'Entertainment', color: '#ff8b6a' },
  chrome: { name: 'Google Chrome', category: 'Browsers', color: '#f7b955' },
  msedge: { name: 'Microsoft Edge', category: 'Browsers', color: '#4f8bff' },
  firefox: { name: 'Firefox', category: 'Browsers', color: '#ff6611' },
  zoom: { name: 'Zoom', category: 'Communication', color: '#2d8cff' },
  skype: { name: 'Skype', category: 'Communication', color: '#00aff0' },
  messenger: { name: 'Messenger', category: 'Social', color: '#0084ff' },
  signal: { name: 'Signal', category: 'Social', color: '#3a76f0' },
  notion: { name: 'Notion', category: 'Productivity', color: '#1f1f1f' },
  figma: { name: 'Figma', category: 'Productivity', color: '#f24e1e' },
  github: { name: 'GitHub', category: 'Productivity', color: '#6e5494' },
  code: { name: 'VS Code', category: 'Productivity', color: '#35a7ff' },
  cursor: { name: 'Cursor', category: 'Productivity', color: '#00d4ff' },
  system: { name: 'System', category: 'System', color: '#6b7280' },
  settings: { name: 'Settings', category: 'System', color: '#6b7280' },
  store: { name: 'Microsoft Store', category: 'System', color: '#0078d4' },
  defender: { name: 'Windows Defender', category: 'System', color: '#0078d4' },
  security: { name: 'Windows Security', category: 'System', color: '#0078d4' },
  twitch: { name: 'Twitch', category: 'Entertainment', color: '#9146ff' },
  youtube: { name: 'YouTube', category: 'Entertainment', color: '#ff0000' },
  netflix: { name: 'Netflix', category: 'Entertainment', color: '#e50914' },
  todoist: { name: 'Todoist', category: 'Productivity', color: '#e44332' },
  trello: { name: 'Trello', category: 'Productivity', color: '#0079bf' },
}

const buildFallbackApp = (appId: string): AppInfo => {
  const known = knownApps[appId.toLowerCase()]
  if (known) {
    return {
      id: appId,
      name: known.name,
      category: known.category,
      color: known.color,
    }
  }
  return {
    id: appId,
    name: formatAppName(appId),
    category: 'Other',
    color: '#6b7280',
  }
}

const Dashboard = ({ snapshot, suggestions, notificationSummary, theme }: DashboardProps) => {
  const { 
    dailyTotals, 
    todaySeconds,
    todayAppsCount,
    todayAppRows,
    todayCategoryTotals,
    notificationRows 
  } = useMemo(() => {
      if (!snapshot) {
        return {
          dailyTotals: [],
          todayMinutes: 0,
          todaySeconds: 0,
          todayAppsCount: 0,
          todayAppRows: [],
          todayCategoryTotals: [],
          notificationRows: [],
        }
      }

      const totals = getDailyTotals(snapshot.usageEntries)
      const today = getTodayDateString()
      const todayData = totals.find(t => t.date === today)
      
      // Get today's entries for detailed breakdown
      const todayEntries = getTodayEntries(snapshot.usageEntries)
      const todayAppTotals = getAppTotals(todayEntries, snapshot.apps)
      const todayCats = getCategoryTotals(todayEntries, snapshot.apps)

      // Build notification rows from notificationSummary (which is already today only)
      const notificationMap = new Map<string, number>()
      if (notificationSummary?.perApp) {
        for (const [appId, count] of Object.entries(notificationSummary.perApp)) {
          if (typeof count === 'number' && Number.isFinite(count)) {
            notificationMap.set(appId, count)
          }
        }
      }

      const appLookup = new Map(snapshot.apps.map((app) => [app.id, app]))
      const summaryRows = Array.from(notificationMap.entries())
        .map(([appId, notifications]) => ({
          app: appLookup.get(appId) ?? buildFallbackApp(appId),
          notifications,
        }))
        .filter((row) => row.notifications > 0)
        .sort((a, b) => b.notifications - a.notifications)

      return {
        dailyTotals: totals,
        todaySeconds: todayData?.seconds ?? 0,
        todayAppsCount: todayAppTotals.length,
        todayAppRows: todayAppTotals.map((row) => ({
          app: row.app,
          minutes: row.minutes,
          seconds: row.seconds,
          notifications: notificationMap.get(row.app.id) ?? 0,
        })),
        todayCategoryTotals: todayCats,
        notificationRows: summaryRows,
      }
    }, [snapshot, notificationSummary])

  const activeAppName = snapshot?.activeAppId
    ? snapshot.apps.find((app) => app.id === snapshot.activeAppId)?.name ?? 'Other apps'
    : 'No active app'

  // Get currently running apps with windows (active apps)
  const activeApps = useMemo(() => {
    const items = snapshot?.runningApps ?? []
    const appLookup = new Map(snapshot?.apps.map((a) => [a.id, a]) ?? [])
    return items
      .filter((p) => p.hasWindow) // Only show apps with visible windows
      .map((p) => ({
        ...p,
        appInfo: appLookup.get(p.appId),
      }))
      .slice(0, 8) // Show top 8 active apps
  }, [snapshot])

  const chartLabels = dailyTotals.map((entry) =>
    new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
  )

  const axisColor =
    getComputedStyle(document.documentElement).getPropertyValue('--text-muted').trim() ||
    'rgba(255,255,255,0.6)'
  const gridColor = theme === 'light' || theme === 'skin' ? 'rgba(12, 15, 22, 0.08)' : 'rgba(255,255,255,0.05)'

  const usageChartData = {
    labels: chartLabels,
    datasets: [
      {
        label: 'Usage (minutes)',
        data: dailyTotals.map((entry) => entry.minutes),
        borderColor: 'rgba(79, 139, 255, 0.9)',
        backgroundColor: 'rgba(79, 139, 255, 0.15)',
        fill: true,
        tension: 0.35,
        pointRadius: 0,
      },
    ],
  }

  const categoryChartData = {
    labels: todayCategoryTotals.map((row) => row.category),
    datasets: [
      {
        label: 'Minutes',
        data: todayCategoryTotals.map((row) => row.minutes),
        backgroundColor: ['#4f8bff', '#8c7dff', '#2ed47a', '#ff8b6a', '#f7b955'],
        borderRadius: 12,
      },
    ],
  }

  return (
    <>
      <header className="topbar">
        <div>
          <div className="topbar__title">{getGreeting()}</div>
          <div className="topbar__subtitle">Your screen time for today</div>
        </div>
      </header>

      <section className="stats-grid">
        <StatCard 
          label="Screen Time" 
          value={formatSeconds(todaySeconds)} 
          sub="Total today" 
        />
        <StatCard 
          label="Apps Used" 
          value={`${todayAppsCount}`} 
          sub="Today" 
        />
        <StatCard 
          label="Top Category" 
          value={todayCategoryTotals[0]?.category ?? 'None'} 
          sub={todayCategoryTotals[0] ? formatMinutes(todayCategoryTotals[0].minutes) : 'No data'} 
        />
        <StatCard
          label="Notifications"
          value={notificationSummary ? `${notificationSummary.total}` : '0'}
          sub={notificationRows[0] ? `Top: ${notificationRows[0].app.name}` : 'Today'}
          accent="var(--accent)"
        />
      </section>

      <section className="grid">
        <div className="card chart-card">
          <div className="card__header">
            <div>
              <h3>Daily usage</h3>
              <p>Minutes per day across all apps</p>
            </div>
            <span className="chip">{getTrendLabel(dailyTotals)}</span>
          </div>
          {dailyTotals.length > 0 ? (
            <Line
              data={usageChartData}
              options={{
                responsive: true,
                plugins: {
                  legend: { display: false },
                },
                scales: {
                  x: { grid: { display: false }, ticks: { color: axisColor } },
                  y: { grid: { color: gridColor }, ticks: { color: axisColor } },
                },
              }}
            />
          ) : (
            <div className="chart-empty">Start using apps to see your usage data</div>
          )}
        </div>

        <div className="card chart-card">
          <div className="card__header">
            <div>
              <h3>Categories</h3>
              <p>Time by category today</p>
            </div>
            <span className="chip">Today</span>
          </div>
          {todayCategoryTotals.length > 0 ? (
            <Bar
              data={categoryChartData}
              options={{
                responsive: true,
                plugins: {
                  legend: { display: false },
                },
                scales: {
                  x: { grid: { display: false }, ticks: { color: axisColor } },
                  y: { grid: { color: gridColor }, ticks: { color: axisColor } },
                },
              }}
            />
          ) : (
            <div className="chart-empty">No category data yet</div>
          )}
        </div>
      </section>

      <section className="grid grid--two">
        <AppUsageTable rows={todayAppRows.slice(0, 6)} title="Top Apps Today" />
        {notificationSummary && <NotificationSummary total={notificationSummary.total} rows={notificationRows.slice(0, 6)} />}
      </section>

        <section className="grid grid--three">
        <SuggestionPanel items={suggestions} />
        <div className="card active-apps-card">
            <h3>Active apps</h3>
            <p className="active-apps-subtitle">Currently open windows</p>
            {activeApps.length === 0 ? (
              <div className="active-apps-empty">No apps with visible windows detected</div>
            ) : (
              <div className="active-apps-list">
                {activeApps.map((app) => (
                  <div key={app.appId} className="active-app-item">
                    <span
                      className="active-app-dot"
                      style={{ background: app.appInfo?.color ?? '#6b7280' }}
                    />
                    <span className="active-app-name">
                      {app.appInfo?.name ?? app.process}
                    </span>
                    {app.appId === snapshot?.activeAppId && (
                      <span className="active-app-focus">focused</span>
                    )}
                  </div>
                ))}
              </div>
            )}
        </div>
        <div className="card session-card">
          <div className="session-card__header">
            <div className="session-card__status">
              <span className="session-card__dot"></span>
              <span className="session-card__status-text">Tracking</span>
            </div>
            <span className="chip">Live</span>
          </div>
          <div className="session-card__info">
            <div className="session-card__row">
              <span className="session-card__label">Current focus</span>
              <span className="session-card__value">{activeAppName}</span>
            </div>
            <div className="session-card__row">
              <span className="session-card__label">Apps used today</span>
              <span className="session-card__value">{todayAppsCount}</span>
            </div>
            <div className="session-card__row">
              <span className="session-card__label">Days recorded</span>
              <span className="session-card__value">{dailyTotals.length}</span>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

const getGreeting = () => {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}

const getTrendLabel = (dailyTotals: { minutes: number }[]) => {
  if (dailyTotals.length < 2) return 'Collecting data'
  const recent = dailyTotals.slice(-3)
  const older = dailyTotals.slice(-6, -3)
  if (older.length === 0) return 'New data'
  const recentAvg = recent.reduce((s, e) => s + e.minutes, 0) / recent.length
  const olderAvg = older.reduce((s, e) => s + e.minutes, 0) / older.length
  const diff = ((recentAvg - olderAvg) / Math.max(olderAvg, 1)) * 100
  if (diff > 10) return 'Trending up'
  if (diff < -10) return 'Trending down'
  return 'Stable'
}

export default Dashboard
