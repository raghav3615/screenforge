import type { SuggestionItem } from '../types/models'
import './SuggestionPanel.css'

interface SuggestionPanelProps {
  items: SuggestionItem[]
}

const SuggestionPanel = ({ items }: SuggestionPanelProps) => {
  return (
    <div className="suggestion-card">
      <div>
        <h3>Suggestions</h3>
        <p>Based on your recent activity</p>
      </div>
      <div className="suggestion-card__list">
        {items.map((item) => (
          <div key={item.id} className="suggestion-card__item">
            <div className="suggestion-card__title">{item.title}</div>
            <div className="suggestion-card__detail">{item.detail}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default SuggestionPanel
