import { useMemo } from 'react'
import type { UsageSnapshot } from '../services/usageService'
import type { NotificationSummary as NotifSummaryType } from '../types/models'
import { useI18n } from '../i18n/I18nProvider'
import './Notifications.css'

interface NotificationsProps {
  snapshot: UsageSnapshot | null
  notificationSummary: NotifSummaryType | null
}

const Notifications = ({ snapshot, notificationSummary }: NotificationsProps) => {
  const { t, translateCategory } = useI18n()
  const { appNotifications, totalNotifications, avgPerApp, topSender, statusInfo } = useMemo(() => {
    if (!snapshot || !notificationSummary) {
      return { 
        appNotifications: [], 
        totalNotifications: 0, 
        avgPerApp: 0, 
        topSender: null,
        statusInfo: { status: 'loading' as const, message: t('common.loading') }
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
      app: e.app ?? { id: e.appId, name: e.appId === 'other' ? t('notifications.breakdown.otherApps') : e.appId, category: 'Unknown', color: '#6b7280' },
      count: e.count,
    }))

    const avg = processedEntries.length > 0 ? Math.round(notificationSummary.total / processedEntries.length) : 0
    const top = processedEntries.length > 0 ? processedEntries[0] : null

    // Determine status message
    let statusInfo: { status: 'ok' | 'no-logs' | 'error' | 'loading'; message: string }
    if (notificationSummary.status === 'no-logs') {
      statusInfo = {
        status: 'no-logs',
        message: t('notifications.status.disabledMessage'),
      }
    } else if (notificationSummary.status === 'error') {
      statusInfo = {
        status: 'error',
        message: notificationSummary.errorMessage
          ? t('notifications.status.errorWithDetails', { detail: notificationSummary.errorMessage })
          : t('notifications.status.errorMessage'),
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
  }, [snapshot, notificationSummary, t])

  const maxCount = appNotifications.length > 0 ? appNotifications[0].count : 1

  return (
    <>
      <header className="topbar">
        <div>
          <div className="topbar__title">{t('notifications.title')}</div>
          <div className="topbar__subtitle">{t('notifications.subtitle')}</div>
        </div>
      </header>

      {/* Status Banner */}
      {statusInfo.status !== 'ok' && statusInfo.status !== 'loading' && (
        <div className={`notif-status-banner notif-status-banner--${statusInfo.status}`}>
          <div className="notif-status-banner__content">
            <span className="notif-status-banner__title">
              {statusInfo.status === 'no-logs' ? t('notifications.status.disabledTitle') : t('notifications.status.errorTitle')}
            </span>
            <span className="notif-status-banner__message">{statusInfo.message}</span>
          </div>
        </div>
      )}

      {/* Stats Overview */}
      <section className="notif-stats-row">
        <div className="notif-stat-block">
          <span className="notif-stat-block__value">{totalNotifications}</span>
          <span className="notif-stat-block__label">{t('notifications.stats.totalToday')}</span>
        </div>
        <div className="notif-stat-divider" />
        <div className="notif-stat-block">
          <span className="notif-stat-block__value">{appNotifications.length}</span>
          <span className="notif-stat-block__label">{t('notifications.stats.apps')}</span>
        </div>
        <div className="notif-stat-divider" />
        <div className="notif-stat-block">
          <span className="notif-stat-block__value">{avgPerApp}</span>
          <span className="notif-stat-block__label">{t('notifications.stats.avgPerApp')}</span>
        </div>
        <div className="notif-stat-divider" />
        <div className="notif-stat-block">
          <span className="notif-stat-block__value notif-stat-block__value--highlight">
            {topSender?.app.name ?? t('common.none')}
          </span>
          <span className="notif-stat-block__label">{t('notifications.stats.topSender')}</span>
        </div>
      </section>

      {/* Breakdown Section */}
      <section className="card notif-breakdown-section">
        <div className="notif-breakdown-header">
          <div>
            <h3>{t('notifications.breakdown.title')}</h3>
            <p>{t('notifications.breakdown.subtitle')}</p>
          </div>
          {appNotifications.length > 0 && (
            <span className="notif-count-badge">{t('notifications.breakdown.countBadge', { count: appNotifications.length })}</span>
          )}
        </div>
        
        {appNotifications.length === 0 ? (
          <div className="notif-empty-state">
            <div className="notif-empty-state__title">{t('notifications.breakdown.emptyTitle')}</div>
            <div className="notif-empty-state__subtitle">
              {statusInfo.status === 'ok' 
                ? t('notifications.breakdown.emptySubtitle')
                : t('notifications.breakdown.emptyActionSubtitle')}
            </div>
          </div>
        ) : (
          <div className="notif-app-list">
            <div className="notif-app-list__header">
              <span>{t('notifications.breakdown.app')}</span>
              <span>{t('notifications.breakdown.count')}</span>
            </div>
            {appNotifications.map(({ app, count }) => {
              const percentage = Math.round((count / totalNotifications) * 100)
              return (
                <div key={app.id} className="notif-app-row">
                  <div className="notif-app-row__info">
                    <div className="notif-app-row__indicator" style={{ background: app.color }} />
                    <div className="notif-app-row__details">
                      <span className="notif-app-row__name">{app.name}</span>
                      <span className="notif-app-row__meta">{translateCategory(app.category)}</span>
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
        <h3>{t('notifications.tips.title')}</h3>
        <p>{t('notifications.tips.subtitle')}</p>
        <div className="notif-tips-list">
          <div className="notif-tip-row">
            <div className="notif-tip-row__header">
              <span className="notif-tip-row__title">{t('notifications.tips.focusAssistTitle')}</span>
            </div>
            <p className="notif-tip-row__desc">
              {t('notifications.tips.focusAssistDesc')}
            </p>
          </div>
          <div className="notif-tip-row">
            <div className="notif-tip-row__header">
              <span className="notif-tip-row__title">{t('notifications.tips.appNotificationsTitle')}</span>
            </div>
            <p className="notif-tip-row__desc">
              {t('notifications.tips.appNotificationsDesc')}
            </p>
          </div>
          <div className="notif-tip-row">
            <div className="notif-tip-row__header">
              <span className="notif-tip-row__title">{t('notifications.tips.timeLimitsTitle')}</span>
            </div>
            <p className="notif-tip-row__desc">
              {t('notifications.tips.timeLimitsDesc')}
            </p>
          </div>
        </div>
      </section>
    </>
  )
}

export default Notifications
