import { useEffect, useState } from 'react'
import './App.css'
import type { ThemeName, PageName, SuggestionItem, NotificationSummary } from './types/models'
import type { UsageSnapshot } from './services/usageService'
import {
  fetchNotificationSummary,
  fetchSuggestions,
  fetchUsageSnapshot,
} from './services/usageService'
import Dashboard from './pages/Dashboard'
import Insights from './pages/Insights'
import Apps from './pages/Apps'
import Notifications from './pages/Notifications'
import Settings from './pages/Settings'

const themes: ThemeName[] = ['dark', 'light', 'tokyo', 'skin']

const navItems: { id: PageName; label: string }[] = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'insights', label: 'Insights' },
  { id: 'apps', label: 'Apps' },
  { id: 'notifications', label: 'Notifications' },
  { id: 'settings', label: 'Settings' },
]

const App = () => {
  const [theme, setTheme] = useState<ThemeName>(() => {
    const saved = localStorage.getItem('screenforge-theme')
    return (saved as ThemeName) || 'dark'
  })
  const [page, setPage] = useState<PageName>('dashboard')
  const [snapshot, setSnapshot] = useState<UsageSnapshot | null>(null)
  const [suggestions, setSuggestions] = useState<SuggestionItem[]>([])
  const [notificationSummary, setNotificationSummary] = useState<NotificationSummary | null>(null)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('screenforge-theme', theme)
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

  // Calculate focus score based on productive vs non-productive time
  const focusScore = (() => {
    if (!snapshot || snapshot.usageEntries.length === 0) return 0
    const productiveCategories = ['Productivity', 'Education', 'Communication', 'Utilities', 'Browsers']
    const appLookup = new Map(snapshot.apps.map((a) => [a.id, a]))
    let productiveMinutes = 0
    let totalMinutes = 0
    for (const entry of snapshot.usageEntries) {
      const app = appLookup.get(entry.appId)
      totalMinutes += entry.minutes
      if (app && productiveCategories.includes(app.category)) {
        productiveMinutes += entry.minutes
      }
    }
    if (totalMinutes === 0) return 0
    return Math.min(100, Math.round((productiveMinutes / totalMinutes) * 100 + 10))
  })()

  const renderPage = () => {
    switch (page) {
      case 'dashboard':
        return (
          <Dashboard
            snapshot={snapshot}
            suggestions={suggestions}
            notificationSummary={notificationSummary}
            theme={theme}
          />
        )
      case 'insights':
        return <Insights snapshot={snapshot} theme={theme} />
      case 'apps':
        return <Apps snapshot={snapshot} />
      case 'notifications':
        return <Notifications snapshot={snapshot} notificationSummary={notificationSummary} />
      case 'settings':
        return <Settings theme={theme} onThemeChange={setTheme} />
      default:
        return null
    }
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar__logo">
          <svg className="logo-icon" width="24" height="24" viewBox="0 0 24 24" fill="none">
            <rect x="2" y="3" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="2"/>
            <path d="M8 21h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <path d="M12 17v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <path d="M7 8l3 3-3 3" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12 14h5" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <span className="logo-text">
            <span className="logo-text__screen">Screen</span>
            <span className="logo-text__forge">Forge</span>
          </span>
        </div>
        <nav className="sidebar__nav">
          {navItems.map((item) => (
            <button
              key={item.id}
              className={`nav-item ${page === item.id ? 'nav-item--active' : ''}`}
              onClick={() => setPage(item.id)}
            >
              {item.label}
            </button>
          ))}
        </nav>
        <div className="sidebar__footer">
          <div className="sidebar__note">Focus score</div>
          <div className="sidebar__score">{focusScore}</div>
        </div>
      </aside>

      <main className="main">
        <div className="main__header-actions">
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
        </div>
        {renderPage()}
      </main>
    </div>
  )
}

export default App
