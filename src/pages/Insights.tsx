import { useMemo } from 'react'
import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from 'chart.js'
import { Doughnut, Line } from 'react-chartjs-2'
import type { UsageSnapshot } from '../services/usageService'
import type { ThemeName } from '../types/models'
import { formatMinutes, getDailyTotals, getCategoryTotals, getAppTotals, calculateFocusScore, getTodayEntries } from '../utils/analytics'
import './Insights.css'

ChartJS.register(ArcElement, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend)

interface InsightsProps {
  snapshot: UsageSnapshot | null
  theme: ThemeName
}

const Insights = ({ snapshot, theme }: InsightsProps) => {
  const {
    dailyTotals,
    categoryTotals,
    appTotals,
    focusScore,
    todayAppsCount,
    topAppName,
    topCategoryName,
    peakDayLabel,
  } = useMemo(() => {
    if (!snapshot || snapshot.usageEntries.length === 0) {
      return {
        dailyTotals: [],
        categoryTotals: [],
        appTotals: [],
        focusScore: 0,
        todayAppsCount: 0,
        topAppName: 'N/A',
        topCategoryName: 'N/A',
        peakDayLabel: 'N/A',
      }
    }

    const totals = getDailyTotals(snapshot.usageEntries)
    const categories = getCategoryTotals(snapshot.usageEntries, snapshot.apps)
    const apps = getAppTotals(snapshot.usageEntries, snapshot.apps)

    // Calculate focus score using shared utility
    const score = calculateFocusScore(snapshot.usageEntries, snapshot.apps)

    // Get today's apps count
    const todayEntries = getTodayEntries(snapshot.usageEntries)
    const todayAppTotals = getAppTotals(todayEntries, snapshot.apps)

    const topApp = apps.length > 0 ? apps[0] : null
    const topCategory = categories.length > 0 ? categories[0] : null
    const peakDay = totals.length > 0 ? totals.reduce((best, cur) => (cur.minutes > best.minutes ? cur : best), totals[0]) : null

    return {
      dailyTotals: totals,
      categoryTotals: categories,
      appTotals: apps,
      focusScore: score,
      todayAppsCount: todayAppTotals.length,
      topAppName: topApp?.app.name ?? 'N/A',
      topCategoryName: topCategory?.category ?? 'N/A',
      peakDayLabel: peakDay ? new Date(peakDay.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'N/A',
    }
  }, [snapshot])

  const style = typeof window !== 'undefined' ? getComputedStyle(document.documentElement) : null
  const axisColor = style?.getPropertyValue('--text-muted').trim() || 'rgba(255,255,255,0.6)'
  const gridColor = style?.getPropertyValue('--card-border').trim() || 'rgba(255,255,255,0.08)'
  const accentColor = style?.getPropertyValue('--accent').trim() || 'rgba(79, 139, 255, 0.9)'
  
  // Use white text for dark themes, black for light themes
  const legendColor = theme === 'dark' || theme === 'tokyo' ? '#ffffff' : '#000000'

  const weeklyData = useMemo(() => {
    const last7 = dailyTotals.slice(-7)
    return {
      labels: last7.map((d) => new Date(d.date).toLocaleDateString('en-US', { weekday: 'short' })),
      datasets: [
        {
          label: 'Minutes',
          data: last7.map((d) => d.minutes),
          borderColor: accentColor,
          backgroundColor: 'transparent',
          fill: true,
          tension: 0.4,
        },
      ],
    }
  }, [dailyTotals, accentColor])

  const categoryDonutData = useMemo(() => ({
    labels: categoryTotals.map((c) => c.category),
    datasets: [
      {
        data: categoryTotals.map((c) => c.minutes),
        backgroundColor: ['#4f8bff', '#8c7dff', '#2ed47a', '#ff8b6a', '#f7b955', '#9aa0ff'],
        borderWidth: 0,
      },
    ],
  }), [categoryTotals])

  const totalTime = dailyTotals.reduce((s, d) => s + d.minutes, 0)
  const avgDaily = dailyTotals.length > 0 ? Math.round(totalTime / dailyTotals.length) : 0

  return (
    <>
      <header className="topbar">
        <div>
          <div className="topbar__title">Insights</div>
          <div className="topbar__subtitle">Deep dive into your screen time patterns</div>
        </div>
      </header>

      <section className="insights-hero">
        <div className="insight-hero-card">
          <div className="insight-hero-card__label">Focus Score</div>
          <div className="insight-hero-card__value">{focusScore}</div>
          <div className="insight-hero-card__sub">Based on productive app usage</div>
        </div>
        <div className="insight-hero-card">
          <div className="insight-hero-card__label">Apps Used</div>
          <div className="insight-hero-card__value">{todayAppsCount}</div>
          <div className="insight-hero-card__sub">Today</div>
        </div>
        <div className="insight-hero-card">
          <div className="insight-hero-card__label">Top app</div>
          <div className="insight-hero-card__value insight-hero-card__value--small">{topAppName}</div>
          <div className="insight-hero-card__sub">Most used by minutes</div>
        </div>
        <div className="insight-hero-card">
          <div className="insight-hero-card__label">Total tracked</div>
          <div className="insight-hero-card__value insight-hero-card__value--small">{formatMinutes(totalTime)}</div>
          <div className="insight-hero-card__sub">All time screen time</div>
        </div>
      </section>

      <section className="grid">
        <div className="card chart-card">
          <div className="card__header">
            <div>
              <h3>Weekly trend</h3>
              <p>Screen time over the last 7 days</p>
            </div>
          </div>
          {dailyTotals.length > 0 ? (
            <Line
              data={weeklyData}
              options={{
                responsive: true,
                plugins: { legend: { display: false } },
                scales: {
                  x: { grid: { display: false }, ticks: { color: axisColor } },
                  y: { grid: { color: gridColor }, ticks: { color: axisColor } },
                },
              }}
            />
          ) : (
            <div className="chart-empty">Start using apps to see trends</div>
          )}
        </div>

        <div className="card chart-card">
          <div className="card__header">
            <div>
              <h3>Category breakdown</h3>
              <p>How you spend your screen time</p>
            </div>
          </div>
          {categoryTotals.length > 0 ? (
            <div className="donut-container">
              <Doughnut
                data={categoryDonutData}
                options={{
                  responsive: true,
                  cutout: '65%',
                  plugins: {
                    legend: { position: 'right', labels: { color: legendColor } },
                  },
                }}
              />
            </div>
          ) : (
            <div className="chart-empty">No category data yet</div>
          )}
        </div>
      </section>

      <section className="insights-stats">
        <div className="card">
          <h3>Quick stats</h3>
          <div className="quick-stats">
            <div className="quick-stat">
              <span className="quick-stat__label">Days tracked</span>
              <span className="quick-stat__value">{dailyTotals.length}</span>
            </div>
            <div className="quick-stat">
              <span className="quick-stat__label">Apps used</span>
              <span className="quick-stat__value">{appTotals.length}</span>
            </div>
            <div className="quick-stat">
              <span className="quick-stat__label">Daily average</span>
              <span className="quick-stat__value">{formatMinutes(avgDaily)}</span>
            </div>
            <div className="quick-stat">
              <span className="quick-stat__label">Top category</span>
              <span className="quick-stat__value">{topCategoryName}</span>
            </div>
            <div className="quick-stat">
              <span className="quick-stat__label">Peak day</span>
              <span className="quick-stat__value">{peakDayLabel}</span>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

export default Insights
