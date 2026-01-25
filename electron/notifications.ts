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
  // Communication / Messaging
  { match: /discord/i, appId: 'discord' },
  { match: /whatsapp/i, appId: 'whatsapp' },
  { match: /telegram/i, appId: 'telegram' },
  { match: /signal/i, appId: 'signal' },
  { match: /messenger/i, appId: 'messenger' },
  { match: /skype/i, appId: 'skype' },
  { match: /teams|ms-teams/i, appId: 'teams' },
  { match: /slack/i, appId: 'slack' },
  { match: /zoom/i, appId: 'zoom' },
  // Media
  { match: /spotify/i, appId: 'spotify' },
  { match: /steam/i, appId: 'steam' },
  // Email
  { match: /outlook/i, appId: 'outlook' },
  { match: /mail/i, appId: 'mail' },
  { match: /gmail/i, appId: 'gmail' },
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
  { match: /todoist/i, appId: 'todoist' },
  { match: /trello/i, appId: 'trello' },
  // Entertainment
  { match: /netflix/i, appId: 'netflix' },
  { match: /youtube/i, appId: 'youtube' },
  { match: /vlc/i, appId: 'vlc' },
  { match: /twitch/i, appId: 'twitch' },
  // Utilities
  { match: /explorer/i, appId: 'explorer' },
  { match: /terminal|windowsterminal|wt|powershell|cmd/i, appId: 'terminal' },
  // System
  { match: /windows\.systemtoast/i, appId: 'system' },
  { match: /settings/i, appId: 'settings' },
  { match: /store/i, appId: 'store' },
  { match: /defender/i, appId: 'defender' },
  { match: /security/i, appId: 'security' },
]

const mapAppId = (raw?: string): string => {
  if (!raw) return 'other'
  const found = appIdMap.find((entry) => entry.match.test(raw))
  return found?.appId ?? 'other'
}

const getDataPath = () => {
  const userDataPath = app.getPath('userData')
  return path.join(userDataPath, 'notification-data.json')
}

interface PersistedNotificationData {
  counts: Record<string, Record<string, number>> // date -> appId -> count
  lastPollTime: string
  seenNotificationIds: string[] // Track seen notifications to avoid duplicates
}

const loadPersistedData = (): PersistedNotificationData => {
  const dataPath = getDataPath()
  try {
    if (fs.existsSync(dataPath)) {
      const raw = fs.readFileSync(dataPath, 'utf8')
      const data = JSON.parse(raw) as PersistedNotificationData
      return {
        counts: data.counts ?? {},
        lastPollTime: data.lastPollTime ?? new Date(Date.now() - 60_000).toISOString(),
        seenNotificationIds: data.seenNotificationIds ?? [],
      }
    }
  } catch {
    // Ignore load errors, start fresh
  }
  return { counts: {}, lastPollTime: new Date(Date.now() - 60_000).toISOString(), seenNotificationIds: [] }
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
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// Query notifications from Action Center and various Windows logs
const queryNotifications = async (): Promise<{ notifications: Array<{ appId: string; id: string; time: string }>; error?: string }> => {
  // PowerShell script that queries multiple notification sources
  const script = `
$ErrorActionPreference = 'SilentlyContinue'
$today = (Get-Date).Date
$notifications = @()

# Method 1: Query Action Center notifications via Settings Sync events
# These are more reliably captured
$logNames = @(
    'Microsoft-Windows-PushNotification-Platform/Operational',
    'Microsoft-Windows-TWinUI/Operational'
)

foreach ($logName in $logNames) {
    try {
        $enabled = (wevtutil gl $logName 2>$null) -match 'enabled:\\s*true'
        if (-not $enabled) {
            wevtutil sl $logName /e:true 2>$null
        }
        
        $events = Get-WinEvent -FilterHashtable @{
            LogName = $logName
            StartTime = $today
        } -MaxEvents 200 -ErrorAction SilentlyContinue

        foreach ($event in $events) {
            $xml = [xml]$event.ToXml()
            $eventData = $xml.Event.EventData.Data
            
            # Try different field names for app ID
            $appId = $null
            foreach ($field in @('AppUserModelId', 'AppId', 'ApplicationId', 'PackageName')) {
                $val = ($eventData | Where-Object { $_.Name -eq $field } | Select-Object -First 1).'#text'
                if ($val) { $appId = $val; break }
            }
            
            if (-not $appId) {
                # Try getting from message
                if ($event.Message -match 'AppUserModelId[=:]\\s*([^\\s,]+)') {
                    $appId = $Matches[1]
                }
            }
            
            if ($appId -and $appId -notmatch 'SystemSettings|ShellExperienceHost|StartMenuExperienceHost|SearchUI|LockApp') {
                $notifications += [PSCustomObject]@{
                    id = "$($logName)_$($event.RecordId)"
                    appId = $appId
                    time = $event.TimeCreated.ToString('o')
                }
            }
        }
    } catch {}
}

# Method 2: Read from notification database if sqlite3 is available
try {
    $dbPath = "$env:LOCALAPPDATA\\Microsoft\\Windows\\Notifications\\wpndatabase.db"
    if (Test-Path $dbPath) {
        # Copy to temp location since original is locked
        $tempDb = [System.IO.Path]::GetTempFileName()
        [System.IO.File]::Copy($dbPath, $tempDb, $true)
        
        # Check if sqlite3 exists
        $sqlite = Get-Command sqlite3.exe -ErrorAction SilentlyContinue
        if ($sqlite) {
            $todayStart = [int64](($today.ToUniversalTime() - [DateTime]'1970-01-01T00:00:00Z').TotalSeconds)
            $query = "SELECT n.Id, n.ArrivalTime, h.PrimaryId, h.DisplayName FROM Notification n LEFT JOIN NotificationHandler h ON n.HandlerId = h.RecordId WHERE n.ArrivalTime >= $todayStart ORDER BY n.ArrivalTime DESC LIMIT 300;"
            
            $result = & sqlite3.exe -separator '|' $tempDb $query 2>$null
            if ($result) {
                foreach ($line in $result) {
                    $parts = $line -split '\\|'
                    if ($parts.Count -ge 3) {
                        $nId = $parts[0]
                        $arrivalTime = $parts[1]
                        $primaryId = $parts[2]
                        
                        if ($primaryId -and $primaryId -notmatch 'SystemSettings|ShellExperienceHost') {
                            # Convert arrival time (Unix timestamp) to ISO format
                            $timeStr = try {
                                [DateTime]::UnixEpoch.AddSeconds([long]$arrivalTime).ToString('o')
                            } catch { (Get-Date).ToString('o') }
                            
                            $notifications += [PSCustomObject]@{
                                id = "db_$nId"
                                appId = $primaryId
                                time = $timeStr
                            }
                        }
                    }
                }
            }
        }
        Remove-Item $tempDb -Force -ErrorAction SilentlyContinue
    }
} catch {}

# Method 3: Read notification settings to get app list with notification counts from registry
try {
    $notifSettingsPath = 'HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Notifications\\Settings'
    if (Test-Path $notifSettingsPath) {
        $apps = Get-ChildItem $notifSettingsPath -ErrorAction SilentlyContinue
        foreach ($appKey in $apps) {
            $appId = $appKey.PSChildName
            # Skip system apps
            if ($appId -match 'SystemSettings|ShellExperienceHost|StartMenuExperienceHost|SearchUI|LockApp|Cortana') {
                continue
            }
            # Check if this app has notifications enabled
            $enabled = Get-ItemProperty -Path $appKey.PSPath -Name 'Enabled' -ErrorAction SilentlyContinue
            if ($enabled -and $enabled.Enabled -eq 1) {
                # This app has notifications enabled - we track it if we see notifications
            }
        }
    }
} catch {}

# Remove duplicates and output
$unique = $notifications | Sort-Object id -Unique

if ($unique.Count -eq 0) {
    Write-Output '[]'
} else {
    $unique | ConvertTo-Json -Compress -Depth 3
}
`

  try {
    const { stdout, stderr } = await execFileAsync('powershell', [
      '-NoProfile',
      '-ExecutionPolicy',
      'Bypass',
      '-Command',
      script,
    ], { timeout: 30000 })

    if (!stdout || stdout.trim() === '' || stdout.trim() === '[]') {
      return { notifications: [] }
    }

    try {
      const parsed = JSON.parse(stdout.trim())
      if (Array.isArray(parsed)) {
        return { notifications: parsed }
      }
      if (parsed && typeof parsed === 'object') {
        return { notifications: [parsed] }
      }
      return { notifications: [] }
    } catch {
      return { notifications: [], error: 'Failed to parse notification data' }
    }
  } catch (err) {
    return { notifications: [], error: String(err) }
  }
}

export const createNotificationTracker = () => {
  let persistedData = loadPersistedData()
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
    const result = await queryNotifications()
    
    if (result.error) {
      lastError = result.error
    }

    const today = getTodayDateString()
    persistedData.lastPollTime = new Date().toISOString()

    // Process new notifications
    for (const notif of result.notifications) {
      // Skip if we've already seen this notification
      if (persistedData.seenNotificationIds.includes(notif.id)) {
        continue
      }

      const appId = mapAppId(notif.appId)
      
      // Skip 'other' category to reduce noise
      if (appId === 'other') {
        persistedData.seenNotificationIds.push(notif.id)
        continue
      }
      
      // Extract date from notification time or use today
      let eventDate = today
      if (notif.time) {
        try {
          const eventDateTime = new Date(notif.time)
          if (!isNaN(eventDateTime.getTime())) {
            const year = eventDateTime.getFullYear()
            const month = String(eventDateTime.getMonth() + 1).padStart(2, '0')
            const day = String(eventDateTime.getDate()).padStart(2, '0')
            eventDate = `${year}-${month}-${day}`
          }
        } catch {
          eventDate = today
        }
      }
      
      // Only count today's notifications
      if (eventDate === today) {
        if (!persistedData.counts[eventDate]) {
          persistedData.counts[eventDate] = {}
        }
        persistedData.counts[eventDate][appId] = (persistedData.counts[eventDate][appId] ?? 0) + 1
      }
      
      persistedData.seenNotificationIds.push(notif.id)
    }

    // Keep only recent notification IDs (last 2000)
    if (persistedData.seenNotificationIds.length > 2000) {
      persistedData.seenNotificationIds = persistedData.seenNotificationIds.slice(-1000)
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
