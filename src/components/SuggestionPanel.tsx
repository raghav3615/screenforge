import type { SuggestionItem } from '../types/models'
import { useI18n } from '../i18n/I18nProvider'
import './SuggestionPanel.css'

interface SuggestionPanelProps {
  items: SuggestionItem[]
}

const SuggestionPanel = ({ items }: SuggestionPanelProps) => {
  const { t } = useI18n()

  return (
    <div className="suggestion-card">
      <div>
        <h3>{t('suggestions.title')}</h3>
        <p>{t('suggestions.subtitle')}</p>
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
