import './StatCard.css'

interface StatCardProps {
  label: string
  value: string
  sub?: string
  accent?: string
}

const StatCard = ({ label, value, sub, accent }: StatCardProps) => {
  return (
    <div className="stat-card">
      <div className="stat-card__label">{label}</div>
      <div className="stat-card__value" style={{ color: accent }}>
        {value}
      </div>
      {sub && <div className="stat-card__sub">{sub}</div>}
    </div>
  )
}

export default StatCard
