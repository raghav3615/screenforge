import type { AppInfo } from '../types/models'
import { formatMinutes } from '../utils/analytics'
import './AppUsageTable.css'

interface AppUsageRow {
  app: AppInfo
  minutes: number
  notifications: number
}

interface AppUsageTableProps {
  rows: AppUsageRow[]
}

const AppUsageTable = ({ rows }: AppUsageTableProps) => {
  return (
    <div className="table-card">
      <div className="table-card__header">
        <div>
          <h3>Top apps</h3>
          <p>Daily average across selected range</p>
        </div>
        <button className="ghost-button">Manage limits</button>
      </div>
      <div className="table">
        <div className="table__row table__row--head">
          <span>App</span>
          <span>Category</span>
          <span>Avg usage</span>
          <span>Notifications</span>
        </div>
        {rows.map((row) => (
          <div className="table__row" key={row.app.id}>
            <span className="table__app">
              <span className="table__dot" style={{ background: row.app.color }} />
              {row.app.name}
            </span>
            <span>{row.app.category}</span>
            <span>{formatMinutes(row.minutes)}</span>
            <span>{row.notifications}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default AppUsageTable
