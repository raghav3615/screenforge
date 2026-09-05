import type { AppInfo } from '../types/models'
import { useI18n } from '../i18n/I18nProvider'
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

const AppUsageTable = ({ rows, title, subtitle }: AppUsageTableProps) => {
  const { formatMinutes, formatSeconds, t, translateCategory } = useI18n()

  return (
    <div className="table-card">
      <div className="table-card__header">
        <div>
          <h3>{title || t('tables.topApps')}</h3>
          <p>{subtitle || t('tables.usageToday')}</p>
        </div>
      </div>
      <div className="table">
        <div className="table__row table__row--head">
          <span>{t('tables.app')}</span>
          <span>{t('tables.category')}</span>
          <span>{t('tables.time')}</span>
          <span>{t('tables.notifications')}</span>
        </div>
        {rows.length === 0 ? (
          <div className="table__empty">{t('tables.empty')}</div>
        ) : (
          rows.map((row) => (
            <div className="table__row" key={row.app.id}>
              <span className="table__app">
                <span className="table__dot" style={{ background: row.app.color }} />
                {row.app.name}
              </span>
              <span>{translateCategory(row.app.category)}</span>
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
