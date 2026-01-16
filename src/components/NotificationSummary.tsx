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
  return (
    <div className="notification-card">
      <div className="notification-card__header">
        <div>
          <h3>Notifications</h3>
          <p>{total} total notifications</p>
        </div>
        <button className="ghost-button">Quiet hours</button>
      </div>
      <div className="notification-card__list">
        {rows.map((row) => (
          <div key={row.app.id} className="notification-card__row">
            <span className="notification-card__app">
              <span className="table__dot" style={{ background: row.app.color }} />
              {row.app.name}
            </span>
            <span className="notification-card__count">{row.notifications}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default NotificationSummary
