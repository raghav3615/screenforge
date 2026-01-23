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
  seconds?: number  // Total seconds for more accurate display
  notifications: number
}

interface ActiveAppSample {
  process: string
  title: string
  isMinimized: boolean
  isVisible: boolean
}

interface UsageTracker {
  apps: AppInfo[]
  getSnapshot: () => {
    apps: AppInfo[]
    usageEntries: UsageEntry[]
    activeAppId: string | null
    runningApps: RunningAppSummary[]
  }
  clearData: () => void
  dispose: () => void
}

export interface RunningAppSummary {
  process: string
  appId: string
  count: number
  hasWindow: boolean
}

// Extended app catalog with more common Windows applications
const appCatalog: AppInfo[] = [
  { id: 'code', name: 'VS Code', category: 'Productivity', color: '#35a7ff' },
  // Browsers
  { id: 'msedge', name: 'Microsoft Edge', category: 'Browsers', color: '#4f8bff' },
  { id: 'chrome', name: 'Google Chrome', category: 'Browsers', color: '#f7b955' },
  { id: 'firefox', name: 'Firefox', category: 'Browsers', color: '#ff6611' },
  { id: 'zen', name: 'Zen Browser', category: 'Browsers', color: '#8b5cf6' },
  { id: 'brave', name: 'Brave', category: 'Browsers', color: '#fb542b' },
  { id: 'opera', name: 'Opera', category: 'Browsers', color: '#ff1b2d' },
  { id: 'vivaldi', name: 'Vivaldi', category: 'Browsers', color: '#ef3939' },
  { id: 'arc', name: 'Arc', category: 'Browsers', color: '#5e5ce6' },
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
  // Browsers
  { pattern: /^msedge$/i, appId: 'msedge' },
  { pattern: /^chrome$/i, appId: 'chrome' },
  { pattern: /^firefox$/i, appId: 'firefox' },
  { pattern: /^zen$/i, appId: 'zen' },
  { pattern: /^brave$/i, appId: 'brave' },
  { pattern: /^opera$/i, appId: 'opera' },
  { pattern: /^vivaldi$/i, appId: 'vivaldi' },
  { pattern: /^arc$/i, appId: 'arc' },
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
  // Simpler, more reliable PowerShell script for getting foreground window
  const script = `
Add-Type @'
using System;
using System.Runtime.InteropServices;
using System.Text;
public class ForegroundWindow {
  [DllImport("user32.dll")] public static extern IntPtr GetForegroundWindow();
  [DllImport("user32.dll", SetLastError=true, CharSet=CharSet.Auto)] public static extern int GetWindowText(IntPtr hWnd, StringBuilder text, int count);
  [DllImport("user32.dll", SetLastError=true)] public static extern uint GetWindowThreadProcessId(IntPtr hWnd, out uint lpdwProcessId);
}
'@
$hWnd = [ForegroundWindow]::GetForegroundWindow()
if ($hWnd -eq [IntPtr]::Zero) {
  Write-Output '{"process":null,"title":null,"isMinimized":false,"isVisible":true}'
  exit
}
$procId = 0
[ForegroundWindow]::GetWindowThreadProcessId($hWnd, [ref]$procId) | Out-Null
$proc = Get-Process -Id $procId -ErrorAction SilentlyContinue
$sb = New-Object System.Text.StringBuilder 512
[ForegroundWindow]::GetWindowText($hWnd, $sb, $sb.Capacity) | Out-Null
$title = $sb.ToString()
$name = if ($proc) { $proc.ProcessName } else { $null }
@{ process=$name; title=$title; isMinimized=$false; isVisible=$true } | ConvertTo-Json -Compress
`

  try {
    const { stdout } = await execFileAsync(
      'powershell',
      [
        '-NoProfile',
        '-NonInteractive',
        '-WindowStyle',
        'Hidden',
        '-ExecutionPolicy',
        'Bypass',
        '-Command',
        script,
      ],
      {
        windowsHide: true,
        timeout: 3000,
        maxBuffer: 1024 * 1024,
      }
    )

    const raw = (stdout ?? '').trim()
    if (!raw) return null
    const parsed = JSON.parse(raw) as ActiveAppSample
    if (!parsed?.process) return null
    return parsed
  } catch {
    return null
  }
}

const getRunningApps = async (): Promise<Array<{ process: string; count: number; hasWindow: boolean }>> => {
  if (process.platform !== 'win32') return []

  const script = `
$ignored = @(
  'Idle','System','Registry','smss','csrss','wininit','services','lsass','svchost','fontdrvhost',
  'dwm','winlogon','conhost','dllhost','taskhostw','spoolsv','RuntimeBroker','SearchIndexer',
  'SecurityHealthService','WmiPrvSE','sihost','audiodg','ctfmon','SearchHost','StartMenuExperienceHost',
  'ShellExperienceHost','TextInputHost','LockApp','ApplicationFrameHost','SystemSettings',
  'WidgetService','Widgets','PhoneExperienceHost','UserOOBEBroker','CredentialUIBroker'
)

$procs = Get-Process -ErrorAction SilentlyContinue |
  Where-Object { $_.ProcessName -and ($ignored -notcontains $_.ProcessName) } |
  Select-Object ProcessName, MainWindowHandle, MainWindowTitle

$groups = $procs | Group-Object ProcessName | ForEach-Object {
  $hasWindow = ($_.Group | Where-Object { 
    $_.MainWindowHandle -ne 0 -and $_.MainWindowTitle -and $_.MainWindowTitle.Trim().Length -gt 0 
  } | Measure-Object).Count -gt 0
  [PSCustomObject]@{ process=$_.Name; count=$_.Count; hasWindow=$hasWindow }
}

$sorted = $groups | Sort-Object @{Expression={$_.hasWindow}; Descending=$true}, @{Expression={$_.count}; Descending=$true}
$result = $sorted | Select-Object -First 80
if ($result -eq $null) {
  Write-Output '[]'
} elseif ($result -is [array]) {
  $result | ConvertTo-Json -Compress
} else {
  ConvertTo-Json @($result) -Compress
}
`

  try {
    const { stdout } = await execFileAsync(
      'powershell',
      [
        '-NoProfile',
        '-NonInteractive',
        '-WindowStyle',
        'Hidden',
        '-ExecutionPolicy',
        'Bypass',
        '-Command',
        script,
      ],
      {
        windowsHide: true,
        timeout: 4000,
        maxBuffer: 4 * 1024 * 1024,
      }
    )

    const raw = (stdout ?? '').trim()
    if (!raw) return []
    const parsed = JSON.parse(raw) as
      | Array<{ process: string; count: number; hasWindow: boolean }>
      | { process: string; count: number; hasWindow: boolean }

    return Array.isArray(parsed) ? parsed : [parsed]
  } catch {
    return []
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
  let activeAppId: string | null = null
  let runningApps: RunningAppSummary[] = []

  const record = (appId: string | null, deltaSeconds: number) => {
    if (!appId || deltaSeconds <= 0) return
    const today = new Date().toISOString().slice(0, 10)
    const key = `${today}:${appId}`
    totals.set(key, (totals.get(key) ?? 0) + deltaSeconds)
  }

  const resolveAppId = (active: ActiveAppSample | null): string | null => {
    if (!active?.process) return null
    
    // Skip tracking the ScreenForge app itself or Electron
    const processLower = active.process.toLowerCase()
    if (processLower === 'electron' || processLower === 'screenforge' || 
        active.title?.toLowerCase().includes('screenforge')) {
      return null
    }
    
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

  // Separate function for running apps that doesn't require visibility check
  const resolveAppIdForRunningApps = (processName: string): string | null => {
    if (!processName) return null
    
    const processLower = processName.toLowerCase()
    if (processLower === 'electron' || processLower === 'screenforge') {
      return null
    }
    
    const mapped = mapProcessToAppId(processName)
    if (mapped && appLookup.has(mapped)) return mapped
    const dynamicId = `proc:${processName.toLowerCase()}`
    if (!appLookup.has(dynamicId)) {
      appLookup.set(dynamicId, {
        id: dynamicId,
        name: toDisplayName(processName),
        category: 'Other',
        color: '#6b7280',
      })
    }
    return dynamicId
  }

  const refreshRunningApps = async () => {
    const raw = await getRunningApps()
    runningApps = raw
      .filter((p) => Boolean(p.process))
      .map((p) => {
        const appId = resolveAppIdForRunningApps(p.process)
        return { process: p.process, appId, count: p.count, hasWindow: p.hasWindow }
      })
      .filter((p): p is RunningAppSummary => p.appId !== null)
  }

  const poll = async () => {
    const now = Date.now()
    const elapsedSeconds = Math.max(0, (now - lastTimestamp) / 1000)
    lastTimestamp = now

    // Record time for the previous app
    // Cap at 60 seconds to avoid huge jumps if the app was suspended
    if (lastAppId && elapsedSeconds > 0) {
      const cappedSeconds = Math.min(elapsedSeconds, 60)
      record(lastAppId, cappedSeconds)
    }

    const active = await getActiveApp()
    activeAppId = resolveAppId(active)
    lastAppId = activeAppId
  }

  // Start polling
  interval = setInterval(poll, tickMs)
  // Initialize immediately
  poll()

  // Refresh running apps periodically (every 5 seconds for better responsiveness)
  const runningAppsInterval = setInterval(() => {
    refreshRunningApps()
  }, 5000)
  refreshRunningApps()

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
        // Key format is "YYYY-MM-DD:appId" where appId can contain colons (e.g., "proc:chrome")
        const firstColonIndex = key.indexOf(':')
        if (firstColonIndex === -1) continue
        const date = key.slice(0, firstColonIndex)
        const appId = key.slice(firstColonIndex + 1)
        if (!appId) continue
        usedAppIds.add(appId)
        entries.push({
          date,
          appId,
          // Use floor to ensure we don't over-report, but keep fractional for accuracy
          minutes: Math.max(0, Math.floor(seconds / 60)),
          seconds: Math.max(0, Math.floor(seconds)),  // Include raw seconds for accurate display
          notifications: 0,
        })
      }

      // Only return apps that have been used
      const apps = Array.from(appLookup.values()).filter(
        (app) => usedAppIds.has(app.id)
      )

      return { apps, usageEntries: entries, activeAppId, runningApps }
    },
    clearData: () => {
      totals.clear()
      savePersistedData(totals)
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
      clearInterval(runningAppsInterval)
      // Save on dispose
      savePersistedData(totals)
    },
  }
}
