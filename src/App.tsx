import { useEffect, useMemo, useState } from 'react'
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
import './App.css'
import StatCard from './components/StatCard'
import AppUsageTable from './components/AppUsageTable'
import NotificationSummary from './components/NotificationSummary'
import SuggestionPanel from './components/SuggestionPanel'
import type { ThemeName } from './types/models'
import {
  formatMinutes,
  getAppTotals,
  getCategoryTotals,
  getDailyTotals,
  getNotificationTotals,
} from './utils/analytics'
import {
  fetchNotificationSummary,
  fetchSuggestions,
  fetchUsageSnapshot,
} from './services/usageService'

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

const themes: ThemeName[] = ['dark', 'light', 'tokyo', 'skin']

const App = () => {
  const [theme, setTheme] = useState<ThemeName>('dark')
  const [snapshot, setSnapshot] = useState<Awaited<ReturnType<typeof fetchUsageSnapshot>> | null>(
    null,
  )
  const [suggestions, setSuggestions] = useState<Awaited<ReturnType<typeof fetchSuggestions>>>([])
  const [notificationSummary, setNotificationSummary] = useState<
    Awaited<ReturnType<typeof fetchNotificationSummary>> | null
  >(null)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  useEffect(() => {
    let interval: number | undefined

    const load = async () => {
      const [usageSnapshot, suggestionFeed, notificationFeed] = await Promise.all([
        fetchUsageSnapshot(),
        fetchSuggestions(),
        fetchNotificationSummary(),
      ])

      setSnapshot(usageSnapshot)
      setSuggestions(suggestionFeed)
      setNotificationSummary(notificationFeed)
    }

    load()
    interval = window.setInterval(() => {
      fetchUsageSnapshot().then(setSnapshot)
      fetchNotificationSummary().then(setNotificationSummary)
    }, 5000)

    return () => {
      if (interval) window.clearInterval(interval)
    }
  }, [])

  const { dailyTotals, weeklyAverage, monthlyAverage, dailyAverage, categoryTotals, appRows, notificationRows } =
    useMemo(() => {
      if (!snapshot) {
        return {
          dailyTotals: [],
          weeklyAverage: 0,
          monthlyAverage: 0,
          dailyAverage: 0,
          categoryTotals: [],
          appRows: [],
          notificationRows: [],
        }
      }

      const totals = getDailyTotals(snapshot.usageEntries)
      const last7 = totals.slice(-7)
      const last30 = totals.slice(-30)
      const weeklyAverageValue = Math.round(
        last7.reduce((sum, entry) => sum + entry.minutes, 0) / Math.max(last7.length, 1),
      )
      const monthlyAverageValue = Math.round(
        last30.reduce((sum, entry) => sum + entry.minutes, 0) / Math.max(last30.length, 1),
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
        monthlyAverage: monthlyAverageValue,
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

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar__logo">ScreenForge</div>
        <nav className="sidebar__nav">
          <button className="nav-item nav-item--active">Dashboard</button>
          <button className="nav-item">Insights</button>
          <button className="nav-item">Apps</button>
          <button className="nav-item">Notifications</button>
          <button className="nav-item">Settings</button>
        </nav>
        <div className="sidebar__footer">
          <div className="sidebar__note">Focus score</div>
          <div className="sidebar__score">86</div>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <div>
            <div className="topbar__title">Good evening</div>
            <div className="topbar__subtitle">Your screen time overview (last 14 days)</div>
          </div>
          <div className="topbar__actions">
            <div className="theme-switcher">
              {themes.map((option) => (
                <button
                  key={option}
                  className={`theme-pill ${theme === option ? 'theme-pill--active' : ''}`}
                  onClick={() => setTheme(option)}
                >
                  {option}
                </button>
              ))}
            </div>
            <button className="primary-button">Create focus session</button>
          </div>
        </header>

        <section className="stats-grid">
          <StatCard label="Daily average" value={formatMinutes(dailyAverage)} sub="Across all apps" />
          <StatCard label="Weekly average" value={formatMinutes(weeklyAverage)} sub="Last 7 days" />
          <StatCard label="Monthly average" value={formatMinutes(monthlyAverage)} sub="Last 30 days" />
          <StatCard
            label="Notifications"
            value={notificationSummary ? `${notificationSummary.total}` : '—'}
            sub="Total in selected range"
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
              <span className="chip">Trending up</span>
            </div>
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
          </div>

          <div className="card chart-card">
            <div className="card__header">
              <div>
                <h3>Categories</h3>
                <p>Minutes by app category</p>
              </div>
              <span className="chip">This month</span>
            </div>
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
          </div>
        </section>

        <section className="grid grid--two">
          <AppUsageTable rows={appRows.slice(0, 6)} />
          {notificationSummary && <NotificationSummary total={notificationSummary.total} rows={notificationRows.slice(0, 6)} />}
        </section>

        <section className="grid grid--three">
          <SuggestionPanel items={suggestions} />
          <div className="card insight-card">
            <h3>Focus windows</h3>
            <p>Best uninterrupted hours: 09:00 – 11:30</p>
            <div className="insight-card__metric">2h 30m</div>
            <p>Auto schedule a focus block during your peak productivity.</p>
          </div>
          <div className="card insight-card">
            <h3>Distraction score</h3>
            <p>Social app usage down 12% this week.</p>
            <div className="insight-card__metric">Low</div>
            <p>Keep quiet hours active to maintain focus.</p>
          </div>
        </section>
      </main>
    </div>
  )
}

export default App
