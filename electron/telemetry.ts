import { execFile } from 'node:child_process'
import { promisify } from 'node:util'

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

const appCatalog: AppInfo[] = [
  { id: 'code', name: 'VS Code', category: 'Productivity', color: '#35a7ff' },
  { id: 'msedge', name: 'Microsoft Edge', category: 'Productivity', color: '#4f8bff' },
  { id: 'chrome', name: 'Google Chrome', category: 'Productivity', color: '#f7b955' },
  { id: 'discord', name: 'Discord', category: 'Social', color: '#8c7dff' },
  { id: 'spotify', name: 'Spotify', category: 'Entertainment', color: '#2ed47a' },
  { id: 'steam', name: 'Steam', category: 'Entertainment', color: '#ff8b6a' },
  { id: 'teams', name: 'Microsoft Teams', category: 'Communication', color: '#5b7cfa' },
  { id: 'outlook', name: 'Outlook', category: 'Communication', color: '#2f6fff' },
  { id: 'explorer', name: 'File Explorer', category: 'Utilities', color: '#9aa0ff' },
]

const processMap: Record<string, string> = {
  Code: 'code',
  msedge: 'msedge',
  chrome: 'chrome',
  Discord: 'discord',
  Spotify: 'spotify',
  steam: 'steam',
  Teams: 'teams',
  OUTLOOK: 'outlook',
  explorer: 'explorer',
}

const unknownApp: AppInfo = {
  id: 'other',
  name: 'Other apps',
  category: 'Other',
  color: '#6b7280',
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

export const createUsageTracker = (): UsageTracker => {
  const appLookup = new Map<string, AppInfo>()
  for (const app of appCatalog) {
    appLookup.set(app.id, app)
  }
  appLookup.set(unknownApp.id, unknownApp)

  const totals = new Map<string, number>()
  let interval: NodeJS.Timeout | null = null
  const tickMs = 5000

  const record = (appId: string, deltaSeconds: number) => {
    const today = new Date().toISOString().slice(0, 10)
    const key = `${today}:${appId}`
    totals.set(key, (totals.get(key) ?? 0) + deltaSeconds)
  }

  const poll = async () => {
    const active = await getActiveApp()
    const mapped = active ? processMap[active.process] ?? 'other' : 'other'
    record(mapped, tickMs / 1000)
  }

  interval = setInterval(poll, tickMs)
  poll()

  return {
    apps: Array.from(appLookup.values()),
    getSnapshot: () => {
      const entries: UsageEntry[] = []
      for (const [key, seconds] of totals.entries()) {
        const [date, appId] = key.split(':')
        entries.push({
          date,
          appId,
          minutes: Math.max(1, Math.round(seconds / 60)),
          notifications: 0,
        })
      }
      return { apps: Array.from(appLookup.values()), usageEntries: entries }
    },
    dispose: () => {
      if (interval) {
        clearInterval(interval)
        interval = null
      }
    },
  }
}
