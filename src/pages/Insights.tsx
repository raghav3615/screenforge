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
import { useI18n } from '../i18n/I18nProvider'
import { getDailyTotals, getCategoryTotals, getAppTotals, calculateFocusScore, getTodayEntries } from '../utils/analytics'
import './Insights.css'

ChartJS.register(ArcElement, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend)

interface InsightsProps {
  snapshot: UsageSnapshot | null
  theme: ThemeName
}

const Insights = ({ snapshot, theme }: InsightsProps) => {
  const { t, formatMinutes, formatDate, translateCategory } = useI18n()
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
        topAppName: t('common.notAvailable'),
        topCategoryName: t('common.notAvailable'),
        peakDayLabel: t('common.notAvailable'),
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
      topAppName: topApp?.app.name ?? t('common.notAvailable'),
      topCategoryName: topCategory ? translateCategory(topCategory.category) : t('common.notAvailable'),
      peakDayLabel: peakDay ? formatDate(`${peakDay.date}T00:00:00`, { month: 'short', day: 'numeric' }) : t('common.notAvailable'),
    }
  }, [snapshot, formatDate, t, translateCategory])

  const style = typeof window !== 'undefined' ? getComputedStyle(document.documentElement) : null
  const axisColor = style?.getPropertyValue('--text-muted').trim() || 'rgba(255,255,255,0.6)'
  const gridColor = style?.getPropertyValue('--card-border').trim() || 'rgba(255,255,255,0.08)'
  const accentColor = style?.getPropertyValue('--accent').trim() || 'rgba(79, 139, 255, 0.9)'
  
  // Use white text for dark themes, black for light themes
  const legendColor = theme === 'dark' || theme === 'tokyo' ? '#ffffff' : '#000000'

  const weeklyData = useMemo(() => {
    const last7 = dailyTotals.slice(-7)
    return {
      labels: last7.map((d) => formatDate(`${d.date}T00:00:00`, { weekday: 'short' })),
      datasets: [
        {
          label: t('insights.charts.minutesDataset'),
          data: last7.map((d) => d.minutes),
          borderColor: accentColor,
          backgroundColor: 'transparent',
          fill: true,
          tension: 0.4,
        },
      ],
    }
  }, [dailyTotals, accentColor, formatDate, t])

  const categoryDonutData = useMemo(() => ({
    labels: categoryTotals.map((c) => translateCategory(c.category)),
    datasets: [
      {
        data: categoryTotals.map((c) => c.minutes),
        backgroundColor: ['#4f8bff', '#8c7dff', '#2ed47a', '#ff8b6a', '#f7b955', '#9aa0ff'],
        borderWidth: 0,
      },
    ],
  }), [categoryTotals, translateCategory])

  const totalTime = dailyTotals.reduce((s, d) => s + d.minutes, 0)
  const avgDaily = dailyTotals.length > 0 ? Math.round(totalTime / dailyTotals.length) : 0

  return (
    <>
      <header className="topbar">
        <div>
          <div className="topbar__title">{t('insights.title')}</div>
          <div className="topbar__subtitle">{t('insights.subtitle')}</div>
        </div>
      </header>

      <section className="insights-hero">
        <div className="insight-hero-card">
          <div className="insight-hero-card__label">{t('insights.cards.focusScore')}</div>
          <div className="insight-hero-card__value">{focusScore}</div>
          <div className="insight-hero-card__sub">{t('insights.cards.focusScoreSub')}</div>
        </div>
        <div className="insight-hero-card">
          <div className="insight-hero-card__label">{t('insights.cards.appsUsed')}</div>
          <div className="insight-hero-card__value">{todayAppsCount}</div>
          <div className="insight-hero-card__sub">{t('common.today')}</div>
        </div>
        <div className="insight-hero-card">
          <div className="insight-hero-card__label">{t('insights.cards.topApp')}</div>
          <div className="insight-hero-card__value insight-hero-card__value--small">{topAppName}</div>
          <div className="insight-hero-card__sub">{t('insights.cards.topAppSub')}</div>
        </div>
        <div className="insight-hero-card">
          <div className="insight-hero-card__label">{t('insights.cards.totalTracked')}</div>
          <div className="insight-hero-card__value insight-hero-card__value--small">{formatMinutes(totalTime)}</div>
          <div className="insight-hero-card__sub">{t('insights.cards.totalTrackedSub')}</div>
        </div>
      </section>

      <section className="grid">
        <div className="card chart-card">
          <div className="card__header">
            <div>
              <h3>{t('insights.charts.weeklyTrendTitle')}</h3>
              <p>{t('insights.charts.weeklyTrendSubtitle')}</p>
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
            <div className="chart-empty">{t('insights.charts.weeklyTrendEmpty')}</div>
          )}
        </div>

        <div className="card chart-card">
          <div className="card__header">
            <div>
              <h3>{t('insights.charts.categoryBreakdownTitle')}</h3>
              <p>{t('insights.charts.categoryBreakdownSubtitle')}</p>
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
            <div className="chart-empty">{t('insights.charts.categoryBreakdownEmpty')}</div>
          )}
        </div>
      </section>

      <section className="insights-stats">
        <div className="card">
          <h3>{t('insights.quickStats.title')}</h3>
          <div className="quick-stats">
            <div className="quick-stat">
              <span className="quick-stat__label">{t('insights.quickStats.daysTracked')}</span>
              <span className="quick-stat__value">{dailyTotals.length}</span>
            </div>
            <div className="quick-stat">
              <span className="quick-stat__label">{t('insights.quickStats.appsUsed')}</span>
              <span className="quick-stat__value">{appTotals.length}</span>
            </div>
            <div className="quick-stat">
              <span className="quick-stat__label">{t('insights.quickStats.dailyAverage')}</span>
              <span className="quick-stat__value">{formatMinutes(avgDaily)}</span>
            </div>
            <div className="quick-stat">
              <span className="quick-stat__label">{t('insights.quickStats.topCategory')}</span>
              <span className="quick-stat__value">{topCategoryName}</span>
            </div>
            <div className="quick-stat">
              <span className="quick-stat__label">{t('insights.quickStats.peakDay')}</span>
              <span className="quick-stat__value">{peakDayLabel}</span>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

export default Insights
