import { useState, useEffect } from 'react'
import { clearUsageData, fetchSettings, updateSettings, fetchTimeLimits } from '../services/usageService'
import type { ThemeName, AppSettings, AppTimeLimit } from '../types/models'
import { useI18n, type LocaleCode } from '../i18n/I18nProvider'
import './Settings.css'

interface SettingsProps {
  theme: ThemeName
  onThemeChange: (theme: ThemeName) => void
}

const Settings = ({ theme, onThemeChange }: SettingsProps) => {
  const { locale, setLocale, localeOptions, t, translateThemeName, translateThemeDescription } = useI18n()
  const [startWithWindows, setStartWithWindows] = useState(false)
  const [minimizeToTray, setMinimizeToTray] = useState(true)
  const [timeLimitNotificationsEnabled, setTimeLimitNotificationsEnabled] = useState(true)
  const [timeLimits, setTimeLimits] = useState<AppTimeLimit[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Load settings from main process
    const loadSettings = async () => {
      try {
        const [settings, limits] = await Promise.all([
          fetchSettings(),
          fetchTimeLimits(),
        ])
        setStartWithWindows(settings.startWithWindows)
        setMinimizeToTray(settings.minimizeToTray)
        setTimeLimitNotificationsEnabled(settings.timeLimitNotificationsEnabled)
        setTimeLimits(limits)
        setLocale(settings.language)
      } catch {
        // Fall back to defaults
      } finally {
        setLoading(false)
      }
    }
    loadSettings()
  }, [setLocale])

  const handleSettingChange = async (key: keyof AppSettings, value: boolean) => {
    try {
      const updated = await updateSettings({ [key]: value })
      if (key === 'startWithWindows') setStartWithWindows(updated.startWithWindows)
      if (key === 'minimizeToTray') setMinimizeToTray(updated.minimizeToTray)
      if (key === 'timeLimitNotificationsEnabled') setTimeLimitNotificationsEnabled(updated.timeLimitNotificationsEnabled)
    } catch {
      // Ignore errors
    }
  }

  const handleLanguageChange = async (nextLanguage: LocaleCode) => {
    setLocale(nextLanguage)
    try {
      await updateSettings({ language: nextLanguage })
    } catch {
      // Ignore errors and keep local UI language
    }
  }

  if (loading) {
    return (
      <>
        <header className="topbar">
          <div>
            <div className="topbar__title">{t('settings.title')}</div>
            <div className="topbar__subtitle">{t('settings.loadingSubtitle')}</div>
          </div>
        </header>
      </>
    )
  }

  return (
    <>
      <header className="topbar">
        <div>
          <div className="topbar__title">{t('settings.title')}</div>
          <div className="topbar__subtitle">{t('settings.subtitle')}</div>
        </div>
      </header>

      <section className="settings-section">
        <h3>{t('settings.sections.appearance')}</h3>
        <p>{t('settings.sections.appearanceDesc')}</p>
        <div className="theme-grid">
          {(['dark', 'light', 'tokyo', 'skin'] as ThemeName[]).map((themeOption) => (
            <button
              key={themeOption}
              className={`theme-card ${theme === themeOption ? 'theme-card--active' : ''}`}
              onClick={() => onThemeChange(themeOption)}
            >
              <div className="theme-card__preview" data-theme-preview={themeOption} />
              <div className="theme-card__info">
                <div className="theme-card__name">{translateThemeName(themeOption)}</div>
                <div className="theme-card__desc">{translateThemeDescription(themeOption)}</div>
              </div>
            </button>
          ))}
        </div>
      </section>

      <section className="settings-section">
        <h3>{t('settings.sections.language')}</h3>
        <p>{t('settings.sections.languageDesc')}</p>
        <div className="theme-grid">
          {localeOptions.map((option) => (
            <button
              key={option.code}
              className={`theme-card ${locale === option.code ? 'theme-card--active' : ''}`}
              onClick={() => handleLanguageChange(option.code)}
            >
              <div className="theme-card__info">
                <div className="theme-card__name">{option.label}</div>
              </div>
            </button>
          ))}
        </div>
      </section>

      <section className="settings-section">
        <h3>{t('settings.sections.behavior')}</h3>
        <p>{t('settings.sections.behaviorDesc')}</p>
        <div className="settings-list">
          <label className="setting-row">
            <div className="setting-row__info">
              <div className="setting-row__label">{t('settings.behavior.startWithWindows')}</div>
              <div className="setting-row__desc">{t('settings.behavior.startWithWindowsDesc')}</div>
            </div>
            <input
              type="checkbox"
              className="toggle"
              checked={startWithWindows}
              onChange={(e) => handleSettingChange('startWithWindows', e.target.checked)}
            />
          </label>
          <label className="setting-row">
            <div className="setting-row__info">
              <div className="setting-row__label">{t('settings.behavior.minimizeToTray')}</div>
              <div className="setting-row__desc">{t('settings.behavior.minimizeToTrayDesc')}</div>
            </div>
            <input
              type="checkbox"
              className="toggle"
              checked={minimizeToTray}
              onChange={(e) => handleSettingChange('minimizeToTray', e.target.checked)}
            />
          </label>
        </div>
      </section>

      <section className="settings-section">
        <h3>{t('settings.sections.timeLimits')}</h3>
        <p>{t('settings.sections.timeLimitsDesc')}</p>
        <div className="settings-list">
          <label className="setting-row">
            <div className="setting-row__info">
              <div className="setting-row__label">{t('settings.timeLimits.notifications')}</div>
              <div className="setting-row__desc">{t('settings.timeLimits.notificationsDesc')}</div>
            </div>
            <input
              type="checkbox"
              className="toggle"
              checked={timeLimitNotificationsEnabled}
              onChange={(e) => handleSettingChange('timeLimitNotificationsEnabled', e.target.checked)}
            />
          </label>
          {timeLimits.length > 0 && (
            <div className="setting-row setting-row--info">
              <div className="setting-row__info">
                <div className="setting-row__label">{t('settings.timeLimits.activeLimits')}</div>
                <div className="setting-row__desc">
                  {t('settings.timeLimits.activeLimitsDesc', { count: timeLimits.length })}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="settings-section">
        <h3>{t('settings.sections.data')}</h3>
        <p>{t('settings.sections.dataDesc')}</p>
        <div className="settings-list">
          <div className="setting-row">
            <div className="setting-row__info">
              <div className="setting-row__label">{t('settings.data.clearAll')}</div>
              <div className="setting-row__desc">{t('settings.data.clearAllDesc')}</div>
            </div>
            <button className="danger-button" onClick={async () => {
              if (confirm(t('settings.data.clearConfirm'))) {
                await clearUsageData()
                window.location.reload()
              }
            }}>
              {t('settings.data.clearButton')}
            </button>
          </div>
        </div>
      </section>

      <section className="settings-section">
        <h3>{t('settings.sections.about')}</h3>
        <div className="about-info">
          <div className="about-row">
            <span>{t('settings.about.version')}</span>
            <span>1.0.0</span>
          </div>
          <div className="about-row">
            <span>{t('settings.about.platform')}</span>
            <span>{t('settings.about.windows')}</span>
          </div>
          <div className="about-row">
            <span>{t('settings.about.builtWith')}</span>
            <span>{t('settings.about.techStack')}</span>
          </div>
        </div>
      </section>
    </>
  )
}

export default Settings
