import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { app } from 'electron'
import * as fs from 'node:fs'
import * as path from 'node:path'

const execFileAsync = promisify(execFile)

export interface AppInfo {
  id: string
  name: string
  category: string
  color: string
}

export interface UsageEntry {
  date: string
  appId: string
  minutes: number
  notifications: number
}

interface ActiveAppSample {
  process: string
  title: string
}

interface UsageTracker {
  apps: AppInfo[]
  getSnapshot: () => { apps: AppInfo[]; usageEntries: UsageEntry[] }
  dispose: () => void
}

// Extended app catalog with more common Windows applications
const appCatalog: AppInfo[] = [
  { id: 'code', name: 'VS Code', category: 'Productivity', color: '#35a7ff' },
  { id: 'msedge', name: 'Microsoft Edge', category: 'Productivity', color: '#4f8bff' },
  { id: 'chrome', name: 'Google Chrome', category: 'Productivity', color: '#f7b955' },
  { id: 'firefox', name: 'Firefox', category: 'Productivity', color: '#ff6611' },
  { id: 'discord', name: 'Discord', category: 'Social', color: '#8c7dff' },
  { id: 'spotify', name: 'Spotify', category: 'Entertainment', color: '#2ed47a' },
  { id: 'steam', name: 'Steam', category: 'Entertainment', color: '#ff8b6a' },
  { id: 'teams', name: 'Microsoft Teams', category: 'Communication', color: '#5b7cfa' },
  { id: 'outlook', name: 'Outlook', category: 'Communication', color: '#2f6fff' },
  { id: 'explorer', name: 'File Explorer', category: 'Utilities', color: '#9aa0ff' },
  { id: 'notepad', name: 'Notepad', category: 'Productivity', color: '#a0c4ff' },
  { id: 'terminal', name: 'Terminal', category: 'Productivity', color: '#4ec9b0' },
  { id: 'slack', name: 'Slack', category: 'Communication', color: '#e91e63' },
  { id: 'zoom', name: 'Zoom', category: 'Communication', color: '#2d8cff' },
  { id: 'notion', name: 'Notion', category: 'Productivity', color: '#1f1f1f' },
  { id: 'word', name: 'Microsoft Word', category: 'Productivity', color: '#2b579a' },
  { id: 'excel', name: 'Microsoft Excel', category: 'Productivity', color: '#217346' },
  { id: 'powerpoint', name: 'PowerPoint', category: 'Productivity', color: '#d24726' },
  { id: 'vlc', name: 'VLC', category: 'Entertainment', color: '#ff8c00' },
  { id: 'obs', name: 'OBS Studio', category: 'Productivity', color: '#302e2e' },
  { id: 'figma', name: 'Figma', category: 'Productivity', color: '#f24e1e' },
  { id: 'photoshop', name: 'Photoshop', category: 'Productivity', color: '#31a8ff' },
  { id: 'premiere', name: 'Premiere Pro', category: 'Productivity', color: '#9999ff' },
  { id: 'blender', name: 'Blender', category: 'Productivity', color: '#f5792a' },
  { id: 'vscode-insiders', name: 'VS Code Insiders', category: 'Productivity', color: '#24bfa5' },
  { id: 'cursor', name: 'Cursor', category: 'Productivity', color: '#00d4ff' },
  { id: 'whatsapp', name: 'WhatsApp', category: 'Social', color: '#25d366' },
  { id: 'telegram', name: 'Telegram', category: 'Social', color: '#0088cc' },
  { id: 'youtube', name: 'YouTube', category: 'Entertainment', color: '#ff0000' },
  { id: 'netflix', name: 'Netflix', category: 'Entertainment', color: '#e50914' },
  { id: 'github', name: 'GitHub Desktop', category: 'Productivity', color: '#6e5494' },
  { id: 'postman', name: 'Postman', category: 'Productivity', color: '#ff6c37' },
  { id: 'rider', name: 'JetBrains Rider', category: 'Productivity', color: '#c90f5e' },
  { id: 'intellij', name: 'IntelliJ IDEA', category: 'Productivity', color: '#fe315d' },
  { id: 'webstorm', name: 'WebStorm', category: 'Productivity', color: '#07c3f2' },
]

// Map process names to app IDs (case-insensitive matching)
const processPatterns: Array<{ pattern: RegExp; appId: string }> = [
  { pattern: /^code$/i, appId: 'code' },
  { pattern: /^code - insiders$/i, appId: 'vscode-insiders' },
  { pattern: /^cursor$/i, appId: 'cursor' },
  { pattern: /^msedge$/i, appId: 'msedge' },
  { pattern: /^chrome$/i, appId: 'chrome' },
  { pattern: /^firefox$/i, appId: 'firefox' },
  { pattern: /^discord$/i, appId: 'discord' },
  { pattern: /^spotify$/i, appId: 'spotify' },
  { pattern: /^steam$/i, appId: 'steam' },
  { pattern: /^teams$/i, appId: 'teams' },
  { pattern: /^ms-teams$/i, appId: 'teams' },
  { pattern: /^outlook$/i, appId: 'outlook' },
  { pattern: /^explorer$/i, appId: 'explorer' },
  { pattern: /^notepad$/i, appId: 'notepad' },
  { pattern: /^notepad\+\+$/i, appId: 'notepad' },
  { pattern: /^windowsterminal$/i, appId: 'terminal' },
  { pattern: /^wt$/i, appId: 'terminal' },
  { pattern: /^powershell$/i, appId: 'terminal' },
  { pattern: /^cmd$/i, appId: 'terminal' },
  { pattern: /^slack$/i, appId: 'slack' },
  { pattern: /^zoom$/i, appId: 'zoom' },
  { pattern: /^notion$/i, appId: 'notion' },
  { pattern: /^winword$/i, appId: 'word' },
  { pattern: /^excel$/i, appId: 'excel' },
  { pattern: /^powerpnt$/i, appId: 'powerpoint' },
  { pattern: /^vlc$/i, appId: 'vlc' },
  { pattern: /^obs64$/i, appId: 'obs' },
  { pattern: /^obs$/i, appId: 'obs' },
  { pattern: /^figma$/i, appId: 'figma' },
  { pattern: /^photoshop$/i, appId: 'photoshop' },
  { pattern: /^premiere/i, appId: 'premiere' },
  { pattern: /^blender$/i, appId: 'blender' },
  { pattern: /^whatsapp$/i, appId: 'whatsapp' },
  { pattern: /^telegram$/i, appId: 'telegram' },
  { pattern: /^githubdesktop$/i, appId: 'github' },
  { pattern: /^postman$/i, appId: 'postman' },
  { pattern: /^rider64$/i, appId: 'rider' },
  { pattern: /^idea64$/i, appId: 'intellij' },
  { pattern: /^webstorm64$/i, appId: 'webstorm' },
]

const unknownApp: AppInfo = {
  id: 'other',
  name: 'Other apps',
  category: 'Other',
  color: '#6b7280',
}

const toDisplayName = (value: string) =>
  value
    .replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())

const getDataPath = () => {
  const userDataPath = app.getPath('userData')
  return path.join(userDataPath, 'usage-data.json')
}

const loadPersistedData = (): Map<string, number> => {
  const dataPath = getDataPath()
  const map = new Map<string, number>()
  
  try {
    if (fs.existsSync(dataPath)) {
      const raw = fs.readFileSync(dataPath, 'utf8')
      const data = JSON.parse(raw) as Record<string, number>
      for (const [key, value] of Object.entries(data)) {
        map.set(key, value)
      }
    }
  } catch {
    // Ignore load errors, start fresh
  }
  
  return map
}

const savePersistedData = (totals: Map<string, number>) => {
  const dataPath = getDataPath()
  const data: Record<string, number> = {}
  
  for (const [key, value] of totals.entries()) {
    data[key] = value
  }
  
  try {
    const dir = path.dirname(dataPath)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2))
  } catch {
    // Ignore save errors
  }
}

const getActiveApp = async (): Promise<ActiveAppSample | null> => {
  const script = `
Add-Type @'
using System;
using System.Runtime.InteropServices;
public class Win32 {
  [DllImport("user32.dll")] public static extern IntPtr GetForegroundWindow();
  [DllImport("user32.dll", SetLastError=true)] public static extern int GetWindowText(IntPtr hWnd, System.Text.StringBuilder text, int count);
  [DllImport("user32.dll", SetLastError=true)] public static extern int GetWindowThreadProcessId(IntPtr hWnd, out int lpdwProcessId);
}
'@
$hWnd=[Win32]::GetForegroundWindow()
$pid=0
[Win32]::GetWindowThreadProcessId($hWnd,[ref]$pid) | Out-Null
$proc=Get-Process -Id $pid -ErrorAction SilentlyContinue
$sb=New-Object System.Text.StringBuilder 1024
[Win32]::GetWindowText($hWnd,$sb,$sb.Capacity) | Out-Null
[PSCustomObject]@{ process=$proc.ProcessName; title=$sb.ToString() } | ConvertTo-Json -Compress
`

  try {
    const { stdout } = await execFileAsync('powershell', [
      '-NoProfile',
      '-ExecutionPolicy',
      'Bypass',
      '-Command',
      script,
    ])

    if (!stdout) return null
    const parsed = JSON.parse(stdout) as ActiveAppSample
    if (!parsed?.process) return null
    return parsed
  } catch {
    return null
  }
}

const mapProcessToAppId = (processName: string): string | null => {
  for (const { pattern, appId } of processPatterns) {
    if (pattern.test(processName)) {
      return appId
    }
  }
  return null
}

export const createUsageTracker = (): UsageTracker => {
  const appLookup = new Map<string, AppInfo>()
  for (const app of appCatalog) {
    appLookup.set(app.id, app)
  }
  appLookup.set(unknownApp.id, unknownApp)

  // Load persisted data
  const totals = loadPersistedData()
  
  let interval: NodeJS.Timeout | null = null
  let saveInterval: NodeJS.Timeout | null = null
  const tickMs = 1000
  let lastAppId: string | null = null
  let lastTimestamp = Date.now()

  const record = (appId: string | null, deltaSeconds: number) => {
    if (!appId || deltaSeconds <= 0) return
    const today = new Date().toISOString().slice(0, 10)
    const key = `${today}:${appId}`
    totals.set(key, (totals.get(key) ?? 0) + deltaSeconds)
  }

  const resolveAppId = (active: ActiveAppSample | null) => {
    if (!active?.process) return unknownApp.id
    const mapped = mapProcessToAppId(active.process)
    if (mapped && appLookup.has(mapped)) return mapped
    const dynamicId = `proc:${active.process.toLowerCase()}`
    if (!appLookup.has(dynamicId)) {
      appLookup.set(dynamicId, {
        id: dynamicId,
        name: toDisplayName(active.process),
        category: 'Other',
        color: '#6b7280',
      })
    }
    return dynamicId
  }

  const poll = async () => {
    const now = Date.now()
    const elapsedSeconds = Math.max(0, (now - lastTimestamp) / 1000)
    record(lastAppId, elapsedSeconds)
    lastTimestamp = now

    const active = await getActiveApp()
    lastAppId = resolveAppId(active)
  }

  interval = setInterval(poll, tickMs)
  poll()

  // Save data every 30 seconds
  saveInterval = setInterval(() => {
    savePersistedData(totals)
  }, 30000)

  return {
    apps: Array.from(appLookup.values()),
    getSnapshot: () => {
      const entries: UsageEntry[] = []
      const usedAppIds = new Set<string>()
      
      for (const [key, seconds] of totals.entries()) {
        const [date, appId] = key.split(':')
        usedAppIds.add(appId)
        entries.push({
          date,
          appId,
          minutes: Math.round(seconds / 60),
          notifications: 0,
        })
      }

      // Only return apps that have been used
      const apps = Array.from(appLookup.values()).filter(
        (app) => usedAppIds.has(app.id)
      )

      return { apps, usageEntries: entries }
    },
    dispose: () => {
      if (interval) {
        clearInterval(interval)
        interval = null
      }
      if (saveInterval) {
        clearInterval(saveInterval)
        saveInterval = null
      }
      // Save on dispose
      savePersistedData(totals)
    },
  }
}
