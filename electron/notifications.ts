import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { app } from 'electron'
import * as fs from 'node:fs'
import * as path from 'node:path'

const execFileAsync = promisify(execFile)

export interface NotificationSummary {
  total: number
  perApp: Record<string, number>
  lastUpdated: string
  status: 'ok' | 'no-logs' | 'error'
  errorMessage?: string
}

// Extended app ID map matching telemetry.ts for consistency
const appIdMap: Array<{ match: RegExp; appId: string }> = [
  // Browsers
  { match: /microsoft\.microsoftedge|msedge/i, appId: 'msedge' },
  { match: /chrome/i, appId: 'chrome' },
  { match: /firefox/i, appId: 'firefox' },
  { match: /zen/i, appId: 'zen' },
  { match: /brave/i, appId: 'brave' },
  { match: /opera/i, appId: 'opera' },
  { match: /vivaldi/i, appId: 'vivaldi' },
  { match: /arc/i, appId: 'arc' },
  // Communication
  { match: /discord/i, appId: 'discord' },
  { match: /spotify/i, appId: 'spotify' },
  { match: /steam/i, appId: 'steam' },
  { match: /teams|ms-teams/i, appId: 'teams' },
  { match: /outlook/i, appId: 'outlook' },
  { match: /slack/i, appId: 'slack' },
  { match: /zoom/i, appId: 'zoom' },
  // Social
  { match: /whatsapp/i, appId: 'whatsapp' },
  { match: /telegram/i, appId: 'telegram' },
  // Productivity
  { match: /code|vscode/i, appId: 'code' },
  { match: /cursor/i, appId: 'cursor' },
  { match: /notion/i, appId: 'notion' },
  { match: /winword|word/i, appId: 'word' },
  { match: /excel/i, appId: 'excel' },
  { match: /powerpnt|powerpoint/i, appId: 'powerpoint' },
  { match: /onenote/i, appId: 'onenote' },
  { match: /rider/i, appId: 'rider' },
  { match: /intellij|idea/i, appId: 'intellij' },
  { match: /webstorm/i, appId: 'webstorm' },
  { match: /postman/i, appId: 'postman' },
  { match: /github/i, appId: 'github' },
  { match: /figma/i, appId: 'figma' },
  // Entertainment
  { match: /netflix/i, appId: 'netflix' },
  { match: /youtube/i, appId: 'youtube' },
  { match: /vlc/i, appId: 'vlc' },
  // Utilities
  { match: /explorer/i, appId: 'explorer' },
  { match: /terminal|windowsterminal|wt|powershell|cmd/i, appId: 'terminal' },
]

const mapAppId = (raw?: string) => {
  if (!raw) return 'other'
  const found = appIdMap.find((entry) => entry.match.test(raw))
  return found?.appId ?? 'other'
}

const logNames = [
  'Microsoft-Windows-Notifications-Platform/Operational',
  'Microsoft-Windows-Notifications/Operational',
]

const getDataPath = () => {
  const userDataPath = app.getPath('userData')
  return path.join(userDataPath, 'notification-data.json')
}

interface PersistedNotificationData {
  counts: Record<string, Record<string, number>> // date -> appId -> count
  lastPollTime: string
}

const loadPersistedData = (): PersistedNotificationData => {
  const dataPath = getDataPath()
  try {
    if (fs.existsSync(dataPath)) {
      const raw = fs.readFileSync(dataPath, 'utf8')
      const data = JSON.parse(raw) as PersistedNotificationData
      return data
    }
  } catch {
    // Ignore load errors, start fresh
  }
  return { counts: {}, lastPollTime: new Date(Date.now() - 60_000).toISOString() }
}

const savePersistedData = (data: PersistedNotificationData) => {
  const dataPath = getDataPath()
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

// Get today's date in the Windows system timezone
const getTodayDateString = (): string => {
  const now = new Date()
  // Use local date components to respect Windows timezone
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const enableNotificationLogs = async (): Promise<{ success: boolean; error?: string }> => {
  const results = await Promise.all(
    logNames.map(async (logName) => {
      try {
        await execFileAsync('wevtutil', ['sl', logName, '/e:true'], { timeout: 5000 })
        return { success: true }
      } catch (err) {
        return { success: false, error: String(err) }
      }
    }),
  )
  
  const anySuccess = results.some(r => r.success)
  if (anySuccess) {
    return { success: true }
  }
  return { success: false, error: 'Could not enable notification logs. Administrator access may be required.' }
}

const checkLogsEnabled = async (): Promise<boolean> => {
  try {
    const script = `
$logEnabled = $false
$logs = @('${logNames[0]}', '${logNames[1]}')
foreach ($log in $logs) {
  try {
    $config = wevtutil gl $log 2>$null
    if ($config -match 'enabled:\\s*true') {
      $logEnabled = $true
      break
    }
  } catch {}
}
if ($logEnabled) { 'true' } else { 'false' }
`
    const { stdout } = await execFileAsync('powershell', [
      '-NoProfile',
      '-ExecutionPolicy',
      'Bypass',
      '-Command',
      script,
    ], { timeout: 5000 })
    
    return stdout.trim().toLowerCase() === 'true'
  } catch {
    return false
  }
}

const queryNotificationEvents = async (sinceIso: string): Promise<{ events: Array<{ appId?: string; time?: string }>; error?: string }> => {
  const script = `
$since = Get-Date "${sinceIso}"
$logs = @('${logNames[0]}', '${logNames[1]}')
$events = foreach ($log in $logs) {
  try {
    Get-WinEvent -FilterHashtable @{ LogName = $log; StartTime = $since } -ErrorAction SilentlyContinue
  } catch {
  }
}
if (-not $events) {
  '[]'
  exit
}
$events = $events | Sort-Object TimeCreated -Descending | Select-Object -First 500
$events | ForEach-Object {
  $xml = [xml]$_.ToXml()
  $data = $xml.Event.EventData.Data
  $appId = ($data | Where-Object { $_.Name -in @('AppId', 'AppUserModelId', 'ApplicationId', 'PackageFullName', 'ProcessName', 'ExePath') } | Select-Object -First 1).'#text'
  if (-not $appId -and $data) {
    $appId = ($data | Select-Object -First 1).'#text'
  }
  [PSCustomObject]@{ appId = $appId; time = $_.TimeCreated.ToString('o') }
} | ConvertTo-Json -Compress
`

  try {
    const { stdout, stderr } = await execFileAsync('powershell', [
      '-NoProfile',
      '-ExecutionPolicy',
      'Bypass',
      '-Command',
      script,
    ], { timeout: 10000 })

    if (stderr && stderr.includes('No events were found')) {
      return { events: [] }
    }

    if (!stdout) return { events: [] }
    try {
      const parsed = JSON.parse(stdout)
      if (!parsed) return { events: [] }
      if (Array.isArray(parsed)) return { events: parsed }
      return { events: [parsed] }
    } catch {
      return { events: [] }
    }
  } catch (err) {
    return { events: [], error: String(err) }
  }
}

export const createNotificationTracker = () => {
  let persistedData = loadPersistedData()
  let logsEnabled = false
  let logsChecked = false
  let lastError: string | undefined
  let saveTimeout: NodeJS.Timeout | null = null

  const scheduleSave = () => {
    if (saveTimeout) return
    saveTimeout = setTimeout(() => {
      savePersistedData(persistedData)
      saveTimeout = null
    }, 5000)
  }

  const poll = async (): Promise<'ok' | 'no-logs' | 'error'> => {
    // Check if logs are enabled first time
    if (!logsChecked) {
      logsChecked = true
      logsEnabled = await checkLogsEnabled()
      if (!logsEnabled) {
        const result = await enableNotificationLogs()
        logsEnabled = result.success
        if (!result.success) {
          lastError = result.error
        }
      }
    }

    if (!logsEnabled) {
      return 'no-logs'
    }

    const result = await queryNotificationEvents(persistedData.lastPollTime)
    
    if (result.error) {
      lastError = result.error
      return 'error'
    }

    const today = getTodayDateString()
    persistedData.lastPollTime = new Date().toISOString()

    for (const event of result.events) {
      const appKey = mapAppId(event.appId)
      // Extract date from event time or use today
      let eventDate = today
      if (event.time) {
        try {
          const eventDateTime = new Date(event.time)
          const year = eventDateTime.getFullYear()
          const month = String(eventDateTime.getMonth() + 1).padStart(2, '0')
          const day = String(eventDateTime.getDate()).padStart(2, '0')
          eventDate = `${year}-${month}-${day}`
        } catch {
          eventDate = today
        }
      }
      
      if (!persistedData.counts[eventDate]) {
        persistedData.counts[eventDate] = {}
      }
      persistedData.counts[eventDate][appKey] = (persistedData.counts[eventDate][appKey] ?? 0) + 1
    }

    // Clean up old data (keep last 7 days)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    const cutoffDate = `${sevenDaysAgo.getFullYear()}-${String(sevenDaysAgo.getMonth() + 1).padStart(2, '0')}-${String(sevenDaysAgo.getDate()).padStart(2, '0')}`
    
    for (const date of Object.keys(persistedData.counts)) {
      if (date < cutoffDate) {
        delete persistedData.counts[date]
      }
    }

    scheduleSave()
    return 'ok'
  }

  const getSummary = async (): Promise<NotificationSummary> => {
    const status = await poll()
    const today = getTodayDateString()
    
    // Aggregate counts for today only
    const todayCounts = persistedData.counts[today] ?? {}
    const perApp: Record<string, number> = { ...todayCounts }
    const total = Object.values(perApp).reduce((sum, value) => sum + value, 0)

    return {
      total,
      perApp,
      lastUpdated: new Date().toISOString(),
      status,
      errorMessage: status !== 'ok' ? lastError : undefined,
    }
  }

  const dispose = () => {
    if (saveTimeout) {
      clearTimeout(saveTimeout)
      saveTimeout = null
    }
    savePersistedData(persistedData)
  }

  return { getSummary, dispose }
}
