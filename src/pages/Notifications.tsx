import { useMemo } from 'react'
import type { UsageSnapshot } from '../services/usageService'
import type { NotificationSummary as NotifSummaryType } from '../types/models'
import './Notifications.css'

interface NotificationsProps {
  snapshot: UsageSnapshot | null
  notificationSummary: NotifSummaryType | null
}

const Notifications = ({ snapshot, notificationSummary }: NotificationsProps) => {
  const { appNotifications, totalNotifications } = useMemo(() => {
    if (!snapshot || !notificationSummary) {
      return { appNotifications: [], totalNotifications: 0 }
    }

    const appLookup = new Map(snapshot.apps.map((a) => [a.id, a]))
    const entries = Object.entries(notificationSummary.perApp)
      .map(([appId, count]) => ({
        app: appLookup.get(appId),
        count: count as number,
      }))
      .filter((e): e is { app: NonNullable<typeof e.app>; count: number } => Boolean(e.app) && e.count > 0)
      .sort((a, b) => b.count - a.count)

    return {
      appNotifications: entries,
      totalNotifications: notificationSummary.total,
    }
  }, [snapshot, notificationSummary])

  return (
    <>
      <header className="topbar">
        <div>
          <div className="topbar__title">Notifications</div>
          <div className="topbar__subtitle">Track and manage your notification activity</div>
        </div>
      </header>

      <section className="notif-hero">
        <div className="notif-hero-card">
          <div className="notif-hero-card__value">{totalNotifications}</div>
          <div className="notif-hero-card__label">Total notifications</div>
        </div>
        <div className="notif-hero-card">
          <div className="notif-hero-card__value">{appNotifications.length}</div>
          <div className="notif-hero-card__label">Apps sending notifications</div>
        </div>
        <div className="notif-hero-card">
          <div className="notif-hero-card__value">
            {appNotifications[0]?.app.name ?? 'None'}
          </div>
          <div className="notif-hero-card__label">Top sender</div>
        </div>
      </section>

      <section className="card notif-list-card">
        <h3>Notification breakdown</h3>
        <p>Notifications received per app</p>
        
        {appNotifications.length === 0 ? (
          <div className="notif-empty">
            No notifications tracked yet. Keep ScreenForge running to collect data.
          </div>
        ) : (
          <div className="notif-list">
            {appNotifications.map(({ app, count }) => (
              <div key={app.id} className="notif-item">
                <div className="notif-item__info">
                  <div className="notif-item__dot" style={{ background: app.color }} />
                  <div>
                    <div className="notif-item__name">{app.name}</div>
                    <div className="notif-item__category">{app.category}</div>
                  </div>
                </div>
                <div className="notif-item__count">
                  {count}
                  <span className="notif-item__label">notifications</span>
                </div>
                <div className="notif-item__bar">
                  <div
                    className="notif-item__bar-fill"
                    style={{
                      width: `${Math.min(100, (count / Math.max(totalNotifications, 1)) * 100 * 3)}%`,
                      background: app.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="card">
        <h3>Tips to reduce distractions</h3>
        <div className="notif-tips">
          <div className="notif-tip">
            <div className="notif-tip__icon">🔕</div>
            <div>
              <div className="notif-tip__title">Use Focus Mode</div>
              <div className="notif-tip__desc">Enable Windows Focus Assist to silence notifications during work</div>
            </div>
          </div>
          <div className="notif-tip">
            <div className="notif-tip__icon">📵</div>
            <div>
              <div className="notif-tip__title">Disable non-essential notifications</div>
              <div className="notif-tip__desc">Go to Settings → Notifications to customize per-app settings</div>
            </div>
          </div>
          <div className="notif-tip">
            <div className="notif-tip__icon">⏰</div>
            <div>
              <div className="notif-tip__title">Schedule quiet hours</div>
              <div className="notif-tip__desc">Set times when notifications are automatically silenced</div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

export default Notifications
