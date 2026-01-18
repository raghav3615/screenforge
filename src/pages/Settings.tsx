import { useState, useEffect } from 'react'
import { clearUsageData } from '../services/usageService'
import type { ThemeName } from '../types/models'
import './Settings.css'

interface SettingsProps {
  theme: ThemeName
  onThemeChange: (theme: ThemeName) => void
}

const themes: { id: ThemeName; name: string; description: string }[] = [
  { id: 'dark', name: 'Dark', description: 'Easy on the eyes, perfect for night' },
  { id: 'light', name: 'Light', description: 'Clean and bright for daytime' },
  { id: 'tokyo', name: 'Tokyo', description: 'Cyberpunk vibes with purple accents' },
  { id: 'skin', name: 'Skin', description: 'Warm and soft aesthetic' },
]

const Settings = ({ theme, onThemeChange }: SettingsProps) => {
  const [startWithWindows, setStartWithWindows] = useState(false)
  const [minimizeToTray, setMinimizeToTray] = useState(true)

  useEffect(() => {
    // Load settings from localStorage
    const saved = localStorage.getItem('screenforge-settings')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        setStartWithWindows(parsed.startWithWindows ?? false)
        setMinimizeToTray(parsed.minimizeToTray ?? true)
      } catch {
        // Ignore parse errors
      }
    }
  }, [])

  const saveSettings = (key: string, value: boolean) => {
    const current = localStorage.getItem('screenforge-settings')
    let settings: Record<string, boolean> = {}
    if (current) {
      try {
        settings = JSON.parse(current)
      } catch {
        // Ignore
      }
    }
    settings[key] = value
    localStorage.setItem('screenforge-settings', JSON.stringify(settings))
  }

  return (
    <>
      <header className="topbar">
        <div>
          <div className="topbar__title">Settings</div>
          <div className="topbar__subtitle">Customize your ScreenForge experience</div>
        </div>
      </header>

      <section className="settings-section">
        <h3>Appearance</h3>
        <p>Choose your preferred theme</p>
        <div className="theme-grid">
          {themes.map((t) => (
            <button
              key={t.id}
              className={`theme-card ${theme === t.id ? 'theme-card--active' : ''}`}
              onClick={() => onThemeChange(t.id)}
            >
              <div className="theme-card__preview" data-theme-preview={t.id} />
              <div className="theme-card__info">
                <div className="theme-card__name">{t.name}</div>
                <div className="theme-card__desc">{t.description}</div>
              </div>
              {theme === t.id && <div className="theme-card__check">✓</div>}
            </button>
          ))}
        </div>
      </section>

      <section className="settings-section">
        <h3>Behavior</h3>
        <p>Control how ScreenForge runs</p>
        <div className="settings-list">
          <label className="setting-row">
            <div className="setting-row__info">
              <div className="setting-row__label">Start with Windows</div>
              <div className="setting-row__desc">Launch ScreenForge when you log in</div>
            </div>
            <input
              type="checkbox"
              className="toggle"
              checked={startWithWindows}
              onChange={(e) => {
                setStartWithWindows(e.target.checked)
                saveSettings('startWithWindows', e.target.checked)
              }}
            />
          </label>
          <label className="setting-row">
            <div className="setting-row__info">
              <div className="setting-row__label">Minimize to tray</div>
              <div className="setting-row__desc">Keep running in background when closed</div>
            </div>
            <input
              type="checkbox"
              className="toggle"
              checked={minimizeToTray}
              onChange={(e) => {
                setMinimizeToTray(e.target.checked)
                saveSettings('minimizeToTray', e.target.checked)
              }}
            />
          </label>
        </div>
      </section>

      <section className="settings-section">
        <h3>Data</h3>
        <p>Manage your tracked data</p>
        <div className="settings-list">
          <div className="setting-row">
            <div className="setting-row__info">
              <div className="setting-row__label">Clear all data</div>
              <div className="setting-row__desc">Remove all tracked usage history</div>
            </div>
            <button className="danger-button" onClick={async () => {
              if (confirm('Are you sure? This will delete all your usage data.')) {
                await clearUsageData()
                window.location.reload()
              }
            }}>
              Clear data
            </button>
          </div>
        </div>
      </section>

      <section className="settings-section">
        <h3>About</h3>
        <div className="about-info">
          <div className="about-row">
            <span>Version</span>
            <span>1.0.0</span>
          </div>
          <div className="about-row">
            <span>Platform</span>
            <span>Windows</span>
          </div>
          <div className="about-row">
            <span>Built with</span>
            <span>Electron + React</span>
          </div>
        </div>
      </section>
    </>
  )
}

export default Settings
