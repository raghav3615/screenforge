import { useMemo } from 'react'
import type { UsageSnapshot } from '../services/usageService'
import type { NotificationSummary as NotifSummaryType } from '../types/models'
import './Notifications.css'

interface NotificationsProps {
  snapshot: UsageSnapshot | null
  notificationSummary: NotifSummaryType | null
}

const Notifications = ({ snapshot, notificationSummary }: NotificationsProps) => {
  const { appNotifications, totalNotifications, avgPerApp, topSender, statusInfo } = useMemo(() => {
    if (!snapshot || !notificationSummary) {
      return { 
        appNotifications: [], 
        totalNotifications: 0, 
        avgPerApp: 0, 
        topSender: null,
        statusInfo: { status: 'loading' as const, message: 'Loading...' }
      }
    }

    const appLookup = new Map(snapshot.apps.map((a) => [a.id, a]))
    const entries = Object.entries(notificationSummary.perApp)
      .map(([appId, count]) => ({
        app: appLookup.get(appId),
        appId,
        count: count as number,
      }))
      .filter((e) => e.count > 0)
      .sort((a, b) => b.count - a.count)

    // For entries without app info, create a placeholder
    const processedEntries = entries.map(e => ({
      app: e.app ?? { id: e.appId, name: e.appId === 'other' ? 'Other Apps' : e.appId, category: 'Unknown', color: '#6b7280' },
      count: e.count,
    }))

    const avg = processedEntries.length > 0 ? Math.round(notificationSummary.total / processedEntries.length) : 0
    const top = processedEntries.length > 0 ? processedEntries[0] : null

    // Determine status message
    let statusInfo: { status: 'ok' | 'no-logs' | 'error' | 'loading'; message: string }
    if (notificationSummary.status === 'no-logs') {
      statusInfo = {
        status: 'no-logs',
        message: 'Windows notification logs are disabled. Enable them in Event Viewer or run as Administrator.',
      }
    } else if (notificationSummary.status === 'error') {
      statusInfo = {
        status: 'error',
        message: notificationSummary.errorMessage ?? 'Failed to read notification logs.',
      }
    } else {
      statusInfo = { status: 'ok', message: '' }
    }

    return {
      appNotifications: processedEntries,
      totalNotifications: notificationSummary.total,
      avgPerApp: avg,
      topSender: top,
      statusInfo,
    }
  }, [snapshot, notificationSummary])

  const maxCount = appNotifications.length > 0 ? appNotifications[0].count : 1

  return (
    <>
      <header className="topbar">
        <div>
          <div className="topbar__title">Notifications</div>
          <div className="topbar__subtitle">Track notification activity from your apps today</div>
        </div>
      </header>

      {/* Status Banner */}
      {statusInfo.status !== 'ok' && statusInfo.status !== 'loading' && (
        <div className={`notif-status-banner notif-status-banner--${statusInfo.status}`}>
          <div className="notif-status-banner__content">
            <span className="notif-status-banner__title">
              {statusInfo.status === 'no-logs' ? 'Notification Logs Disabled' : 'Error Reading Logs'}
            </span>
            <span className="notif-status-banner__message">{statusInfo.message}</span>
          </div>
        </div>
      )}

      {/* Stats Overview */}
      <section className="notif-stats-row">
        <div className="notif-stat-block">
          <span className="notif-stat-block__value">{totalNotifications}</span>
          <span className="notif-stat-block__label">Total Today</span>
        </div>
        <div className="notif-stat-divider" />
        <div className="notif-stat-block">
          <span className="notif-stat-block__value">{appNotifications.length}</span>
          <span className="notif-stat-block__label">Apps</span>
        </div>
        <div className="notif-stat-divider" />
        <div className="notif-stat-block">
          <span className="notif-stat-block__value">{avgPerApp}</span>
          <span className="notif-stat-block__label">Avg per App</span>
        </div>
        <div className="notif-stat-divider" />
        <div className="notif-stat-block">
          <span className="notif-stat-block__value notif-stat-block__value--highlight">
            {topSender?.app.name ?? 'None'}
          </span>
          <span className="notif-stat-block__label">Top Sender</span>
        </div>
      </section>

      {/* Breakdown Section */}
      <section className="card notif-breakdown-section">
        <div className="notif-breakdown-header">
          <div>
            <h3>Breakdown by App</h3>
            <p>Notifications received today per application</p>
          </div>
          {appNotifications.length > 0 && (
            <span className="notif-count-badge">{appNotifications.length} apps</span>
          )}
        </div>
        
        {appNotifications.length === 0 ? (
          <div className="notif-empty-state">
            <div className="notif-empty-state__title">No notifications tracked yet</div>
            <div className="notif-empty-state__subtitle">
              {statusInfo.status === 'ok' 
                ? 'Notifications from your apps will appear here as they come in.'
                : 'Fix the issue above to start tracking notifications.'}
            </div>
          </div>
        ) : (
          <div className="notif-app-list">
            <div className="notif-app-list__header">
              <span>Application</span>
              <span>Count</span>
            </div>
            {appNotifications.map(({ app, count }) => {
              const percentage = Math.round((count / totalNotifications) * 100)
              return (
                <div key={app.id} className="notif-app-row">
                  <div className="notif-app-row__info">
                    <div className="notif-app-row__indicator" style={{ background: app.color }} />
                    <div className="notif-app-row__details">
                      <span className="notif-app-row__name">{app.name}</span>
                      <span className="notif-app-row__meta">{app.category}</span>
                    </div>
                  </div>
                  <div className="notif-app-row__progress">
                    <div className="notif-app-row__bar">
                      <div
                        className="notif-app-row__bar-fill"
                        style={{
                          width: `${(count / maxCount) * 100}%`,
                          background: app.color,
                        }}
                      />
                    </div>
                    <span className="notif-app-row__percentage">{percentage}%</span>
                  </div>
                  <div className="notif-app-row__count">{count}</div>
                </div>
              )
            })}
          </div>
        )}
      </section>

      {/* Tips Section */}
      <section className="card notif-tips-section">
        <h3>Reduce Distractions</h3>
        <p>Tips for managing notification overload</p>
        <div className="notif-tips-list">
          <div className="notif-tip-row">
            <div className="notif-tip-row__header">
              <span className="notif-tip-row__title">Enable Focus Assist</span>
            </div>
            <p className="notif-tip-row__desc">
              Use Windows Focus Assist to silence notifications during work hours. 
              Access it from the Action Center or Settings.
            </p>
          </div>
          <div className="notif-tip-row">
            <div className="notif-tip-row__header">
              <span className="notif-tip-row__title">Configure App Notifications</span>
            </div>
            <p className="notif-tip-row__desc">
              Go to Windows Settings &gt; System &gt; Notifications to customize 
              which apps can send you notifications.
            </p>
          </div>
          <div className="notif-tip-row">
            <div className="notif-tip-row__header">
              <span className="notif-tip-row__title">Set Time Limits</span>
            </div>
            <p className="notif-tip-row__desc">
              Use the Apps page to set daily time limits for distracting applications. 
              You will receive a notification when limits are exceeded.
            </p>
          </div>
        </div>
      </section>
    </>
  )
}

export default Notifications
