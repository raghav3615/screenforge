import type { AppInfo } from '../types/models'
import { formatMinutes, formatSeconds } from '../utils/analytics'
import './AppUsageTable.css'

interface AppUsageRow {
  app: AppInfo
  minutes: number
  seconds?: number
  notifications: number
}

interface AppUsageTableProps {
  rows: AppUsageRow[]
  title?: string
  subtitle?: string
}

const AppUsageTable = ({ rows, title = 'Top apps', subtitle = 'Usage today' }: AppUsageTableProps) => {
  return (
    <div className="table-card">
      <div className="table-card__header">
        <div>
          <h3>{title}</h3>
          <p>{subtitle}</p>
        </div>
      </div>
      <div className="table">
        <div className="table__row table__row--head">
          <span>App</span>
          <span>Category</span>
          <span>Time</span>
          <span>Notifications</span>
        </div>
        {rows.length === 0 ? (
          <div className="table__empty">No app data yet for today</div>
        ) : (
          rows.map((row) => (
            <div className="table__row" key={row.app.id}>
              <span className="table__app">
                <span className="table__dot" style={{ background: row.app.color }} />
                {row.app.name}
              </span>
              <span>{row.app.category}</span>
              <span>{row.seconds !== undefined ? formatSeconds(row.seconds) : formatMinutes(row.minutes)}</span>
              <span>{row.notifications}</span>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default AppUsageTable
