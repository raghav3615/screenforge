import type { AppInfo } from '../types/models'
import './NotificationSummary.css'

interface NotificationRow {
  app: AppInfo
  notifications: number
}

interface NotificationSummaryProps {
  total: number
  rows: NotificationRow[]
}

const NotificationSummary = ({ total, rows }: NotificationSummaryProps) => {
  const maxCount = rows.length > 0 ? Math.max(...rows.map(r => r.notifications)) : 1

  return (
    <div className="notification-card">
      <div className="notification-card__header">
        <div className="notification-card__title-group">
          <h3>Notifications</h3>
          <span className="notification-card__badge">{total}</span>
        </div>
        <span className="notification-card__date">Today</span>
      </div>
      
      <div className="notification-card__list">
        {rows.length === 0 ? (
          <div className="notification-card__empty">No notifications yet</div>
        ) : (
          rows.map((row) => {
            const percentage = (row.notifications / maxCount) * 100
            return (
              <div key={row.app.id} className="notification-card__row">
                <div className="notification-card__app-info">
                  <span 
                    className="notification-card__dot" 
                    style={{ background: row.app.color }} 
                  />
                  <span className="notification-card__app-name">{row.app.name}</span>
                </div>
                <div className="notification-card__bar-container">
                  <div 
                    className="notification-card__bar" 
                    style={{ 
                      width: `${percentage}%`,
                      background: row.app.color 
                    }} 
                  />
                </div>
                <span className="notification-card__count">{row.notifications}</span>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

export default NotificationSummary
