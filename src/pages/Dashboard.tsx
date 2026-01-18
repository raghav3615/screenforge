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
import type { ThemeName, SuggestionItem, NotificationSummary as NotifSummaryType } from '../types/models'
import type { UsageSnapshot } from '../services/usageService'
import {
  formatMinutes,
  getAppTotals,
  getCategoryTotals,
  getDailyTotals,
  getNotificationTotals,
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

const Dashboard = ({ snapshot, suggestions, notificationSummary, theme }: DashboardProps) => {
  const { dailyTotals, weeklyAverage, dailyAverage, categoryTotals, appRows, notificationRows } =
    useMemo(() => {
      if (!snapshot) {
        return {
          dailyTotals: [],
          weeklyAverage: 0,
          dailyAverage: 0,
          categoryTotals: [],
          appRows: [],
          notificationRows: [],
        }
      }

      const totals = getDailyTotals(snapshot.usageEntries)
      const last7 = totals.slice(-7)
      const weeklyAverageValue = Math.round(
        last7.reduce((sum, entry) => sum + entry.minutes, 0) / Math.max(last7.length, 1),
      )
      const dailyAverageValue = Math.round(
        totals.reduce((sum, entry) => sum + entry.minutes, 0) / Math.max(totals.length, 1),
      )

      const appTotals = getAppTotals(snapshot.usageEntries, snapshot.apps)
      const notifications = getNotificationTotals(snapshot.usageEntries, snapshot.apps)
      const notificationMap = new Map(notifications.map((row) => [row.app.id, row.notifications]))
      if (notificationSummary?.perApp) {
        for (const [appId, count] of Object.entries(notificationSummary.perApp)) {
          if (typeof count === 'number' && Number.isFinite(count)) {
            notificationMap.set(appId, count)
          }
        }
      }

      const summaryRows = snapshot.apps
        .map((app) => ({ app, notifications: notificationMap.get(app.id) ?? 0 }))
        .filter((row) => row.notifications > 0)
        .sort((a, b) => b.notifications - a.notifications)

      return {
        dailyTotals: totals,
        weeklyAverage: weeklyAverageValue,
        dailyAverage: dailyAverageValue,
        categoryTotals: getCategoryTotals(snapshot.usageEntries, snapshot.apps),
        appRows: appTotals.map((row) => ({
          app: row.app,
          minutes: Math.round(row.minutes / Math.max(totals.length, 1)),
          notifications: notificationMap.get(row.app.id) ?? 0,
        })),
        notificationRows: summaryRows,
      }
    }, [snapshot, notificationSummary])

  const activeAppName = snapshot?.activeAppId
    ? snapshot.apps.find((app) => app.id === snapshot.activeAppId)?.name ?? 'Other apps'
    : 'No active app'

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
    labels: categoryTotals.map((row) => row.category),
    datasets: [
      {
        label: 'Minutes',
        data: categoryTotals.map((row) => row.minutes),
        backgroundColor: ['#4f8bff', '#8c7dff', '#2ed47a', '#ff8b6a', '#f7b955'],
        borderRadius: 12,
      },
    ],
  }

  const todayUsage = dailyTotals.length > 0 ? dailyTotals[dailyTotals.length - 1]?.minutes ?? 0 : 0

  return (
    <>
      <header className="topbar">
        <div>
          <div className="topbar__title">{getGreeting()}</div>
          <div className="topbar__subtitle">Your screen time overview</div>
        </div>
      </header>

      <section className="stats-grid">
        <StatCard label="Today" value={formatMinutes(todayUsage)} sub="Total screen time today" />
        <StatCard label="Daily average" value={formatMinutes(dailyAverage)} sub="Across all apps" />
        <StatCard label="Weekly average" value={formatMinutes(weeklyAverage)} sub="Last 7 days" />
        <StatCard
          label="Notifications"
          value={notificationSummary ? `${notificationSummary.total}` : '0'}
          sub="Total received"
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
              <p>Minutes by app category</p>
            </div>
            <span className="chip">All time</span>
          </div>
          {categoryTotals.length > 0 ? (
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
        <AppUsageTable rows={appRows.slice(0, 6)} />
        {notificationSummary && <NotificationSummary total={notificationSummary.total} rows={notificationRows.slice(0, 6)} />}
      </section>

        <section className="grid grid--three">
        <SuggestionPanel items={suggestions} />
        <div className="card insight-card">
            <h3>Active app</h3>
            <p>{activeAppName}</p>
            <div className="insight-card__metric">Live</div>
            <p>Currently on screen</p>
        </div>
        <div className="card insight-card">
          <h3>Session status</h3>
          <p>ScreenForge is tracking your usage</p>
          <div className="insight-card__metric insight-card__metric--success">Active</div>
          <p>Real-time data collection enabled</p>
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
