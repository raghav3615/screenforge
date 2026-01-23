import { useMemo } from 'react'
import type { UsageSnapshot } from '../services/usageService'
import type { NotificationSummary as NotifSummaryType } from '../types/models'
import './Notifications.css'

interface NotificationsProps {
  snapshot: UsageSnapshot | null
  notificationSummary: NotifSummaryType | null
}

const Notifications = ({ snapshot, notificationSummary }: NotificationsProps) => {
  const { appNotifications, totalNotifications, avgPerApp } = useMemo(() => {
    if (!snapshot || !notificationSummary) {
      return { appNotifications: [], totalNotifications: 0, avgPerApp: 0 }
    }

    const appLookup = new Map(snapshot.apps.map((a) => [a.id, a]))
    const entries = Object.entries(notificationSummary.perApp)
      .map(([appId, count]) => ({
        app: appLookup.get(appId),
        count: count as number,
      }))
      .filter((e): e is { app: NonNullable<typeof e.app>; count: number } => Boolean(e.app) && e.count > 0)
      .sort((a, b) => b.count - a.count)

    const avg = entries.length > 0 ? Math.round(notificationSummary.total / entries.length) : 0

    return {
      appNotifications: entries,
      totalNotifications: notificationSummary.total,
      avgPerApp: avg,
    }
  }, [snapshot, notificationSummary])

  const maxCount = appNotifications.length > 0 ? appNotifications[0].count : 1

  return (
    <>
      <header className="topbar">
        <div>
          <div className="topbar__title">Notifications</div>
          <div className="topbar__subtitle">Track and manage your notification activity</div>
        </div>
      </header>

      <section className="notif-stats-grid">
        <div className="notif-stat-card">
          <div className="notif-stat-card__icon notif-stat-card__icon--primary">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
          </div>
          <div className="notif-stat-card__content">
            <span className="notif-stat-card__value">{totalNotifications}</span>
            <span className="notif-stat-card__label">Total notifications</span>
          </div>
        </div>

        <div className="notif-stat-card">
          <div className="notif-stat-card__icon notif-stat-card__icon--secondary">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7"/>
              <rect x="14" y="3" width="7" height="7"/>
              <rect x="14" y="14" width="7" height="7"/>
              <rect x="3" y="14" width="7" height="7"/>
            </svg>
          </div>
          <div className="notif-stat-card__content">
            <span className="notif-stat-card__value">{appNotifications.length}</span>
            <span className="notif-stat-card__label">Apps sending</span>
          </div>
        </div>

        <div className="notif-stat-card">
          <div className="notif-stat-card__icon notif-stat-card__icon--accent">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 20V10"/>
              <path d="M18 20V4"/>
              <path d="M6 20v-4"/>
            </svg>
          </div>
          <div className="notif-stat-card__content">
            <span className="notif-stat-card__value">{avgPerApp}</span>
            <span className="notif-stat-card__label">Avg per app</span>
          </div>
        </div>

        <div className="notif-stat-card">
          <div className="notif-stat-card__icon notif-stat-card__icon--warning">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5z"/>
              <path d="M2 17l10 5 10-5"/>
              <path d="M2 12l10 5 10-5"/>
            </svg>
          </div>
          <div className="notif-stat-card__content">
            <span className="notif-stat-card__value">{appNotifications[0]?.app.name ?? 'None'}</span>
            <span className="notif-stat-card__label">Top sender</span>
          </div>
        </div>
      </section>

      <section className="card notif-breakdown-card">
        <div className="notif-breakdown-header">
          <div>
            <h3>Notification breakdown</h3>
            <p>Notifications received per app</p>
          </div>
          {appNotifications.length > 0 && (
            <span className="chip">{appNotifications.length} apps</span>
          )}
        </div>
        
        {appNotifications.length === 0 ? (
          <div className="notif-empty">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
              <line x1="1" y1="1" x2="23" y2="23"/>
            </svg>
            <span>No notifications tracked yet</span>
            <span className="notif-empty__sub">Keep ScreenForge running to collect data</span>
          </div>
        ) : (
          <div className="notif-breakdown-list">
            {appNotifications.map(({ app, count }) => (
              <div key={app.id} className="notif-breakdown-item">
                <div className="notif-breakdown-item__info">
                  <div className="notif-breakdown-item__dot" style={{ background: app.color }} />
                  <div className="notif-breakdown-item__details">
                    <span className="notif-breakdown-item__name">{app.name}</span>
                    <span className="notif-breakdown-item__category">{app.category}</span>
                  </div>
                </div>
                <div className="notif-breakdown-item__bar-wrapper">
                  <div className="notif-breakdown-item__bar">
                    <div
                      className="notif-breakdown-item__bar-fill"
                      style={{
                        width: `${(count / maxCount) * 100}%`,
                        background: app.color,
                      }}
                    />
                  </div>
                </div>
                <div className="notif-breakdown-item__count">{count}</div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="card notif-tips-card">
        <h3>Reduce distractions</h3>
        <p>Tips to improve your focus</p>
        <div className="notif-tips-grid">
          <div className="notif-tip-item">
            <div className="notif-tip-item__icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                <line x1="1" y1="1" x2="23" y2="23"/>
              </svg>
            </div>
            <div className="notif-tip-item__content">
              <span className="notif-tip-item__title">Focus Mode</span>
              <span className="notif-tip-item__desc">Enable Windows Focus Assist during work</span>
            </div>
          </div>
          <div className="notif-tip-item">
            <div className="notif-tip-item__icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3"/>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
              </svg>
            </div>
            <div className="notif-tip-item__content">
              <span className="notif-tip-item__title">App Settings</span>
              <span className="notif-tip-item__desc">Customize per-app notification settings</span>
            </div>
          </div>
          <div className="notif-tip-item">
            <div className="notif-tip-item__icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
            </div>
            <div className="notif-tip-item__content">
              <span className="notif-tip-item__title">Quiet Hours</span>
              <span className="notif-tip-item__desc">Schedule times when notifications are silenced</span>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

export default Notifications
