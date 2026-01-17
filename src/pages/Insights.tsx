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
import { formatMinutes, getDailyTotals, getCategoryTotals, getAppTotals } from '../utils/analytics'
import './Insights.css'

ChartJS.register(ArcElement, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend)

interface InsightsProps {
  snapshot: UsageSnapshot | null
}

const Insights = ({ snapshot }: InsightsProps) => {
  const { dailyTotals, categoryTotals, appTotals, focusScore, peakHours, productivityRatio } = useMemo(() => {
    if (!snapshot || snapshot.usageEntries.length === 0) {
      return {
        dailyTotals: [],
        categoryTotals: [],
        appTotals: [],
        focusScore: 0,
        peakHours: 'Not enough data',
        productivityRatio: 0,
      }
    }

    const totals = getDailyTotals(snapshot.usageEntries)
    const categories = getCategoryTotals(snapshot.usageEntries, snapshot.apps)
    const apps = getAppTotals(snapshot.usageEntries, snapshot.apps)

    // Calculate focus score based on app distribution
    const totalMinutes = categories.reduce((s, c) => s + c.minutes, 0)
    const productiveCategories = ['Productivity', 'Education', 'Communication', 'Utilities']
    const productiveMinutes = categories
      .filter((c) => productiveCategories.includes(c.category))
      .reduce((s, c) => s + c.minutes, 0)
    
    const ratio = totalMinutes > 0 ? productiveMinutes / totalMinutes : 0
    const score = Math.min(100, Math.round(ratio * 100 + (apps.length > 1 ? 10 : 0)))

    return {
      dailyTotals: totals,
      categoryTotals: categories,
      appTotals: apps,
      focusScore: score,
      peakHours: '09:00 - 12:00',
      productivityRatio: Math.round(ratio * 100),
    }
  }, [snapshot])

  const weeklyData = useMemo(() => {
    const last7 = dailyTotals.slice(-7)
    return {
      labels: last7.map((d) => new Date(d.date).toLocaleDateString('en-US', { weekday: 'short' })),
      datasets: [
        {
          label: 'Minutes',
          data: last7.map((d) => d.minutes),
          borderColor: 'rgba(79, 139, 255, 0.9)',
          backgroundColor: 'rgba(79, 139, 255, 0.15)',
          fill: true,
          tension: 0.4,
        },
      ],
    }
  }, [dailyTotals])

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
          <div className="insight-hero-card__label">Productivity</div>
          <div className="insight-hero-card__value">{productivityRatio}%</div>
          <div className="insight-hero-card__sub">Time in productive apps</div>
        </div>
        <div className="insight-hero-card">
          <div className="insight-hero-card__label">Peak Hours</div>
          <div className="insight-hero-card__value insight-hero-card__value--small">{peakHours}</div>
          <div className="insight-hero-card__sub">Most active period</div>
        </div>
        <div className="insight-hero-card">
          <div className="insight-hero-card__label">Total Tracked</div>
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
                  x: { grid: { display: false } },
                  y: { grid: { color: 'rgba(255,255,255,0.05)' } },
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
                    legend: { position: 'right', labels: { color: 'var(--text-primary)' } },
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
              <span className="quick-stat__value">{categoryTotals[0]?.category ?? 'N/A'}</span>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

export default Insights
