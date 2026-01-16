import { execFile } from 'node:child_process'
import { promisify } from 'node:util'

const execFileAsync = promisify(execFile)

export interface NotificationSummary {
  total: number
  perApp: Record<string, number>
}

const appIdMap: Array<{ match: RegExp; appId: string }> = [
  { match: /microsoft\.microsoftedge|msedge/i, appId: 'msedge' },
  { match: /chrome/i, appId: 'chrome' },
  { match: /discord/i, appId: 'discord' },
  { match: /spotify/i, appId: 'spotify' },
  { match: /steam/i, appId: 'steam' },
  { match: /teams/i, appId: 'teams' },
  { match: /outlook/i, appId: 'outlook' },
]

const mapAppId = (raw?: string) => {
  if (!raw) return 'other'
  const found = appIdMap.find((entry) => entry.match.test(raw))
  return found?.appId ?? 'other'
}

const queryNotificationEvents = async (sinceIso: string) => {
  const script = `
$since = Get-Date "${sinceIso}"
$events = Get-WinEvent -LogName Microsoft-Windows-Notifications-Platform/Operational -ErrorAction SilentlyContinue |
  Where-Object { $_.TimeCreated -gt $since } |
  Select-Object -First 200
$events | ForEach-Object {
  $xml = [xml]$_.ToXml()
  $data = $xml.Event.EventData.Data
  $appId = ($data | Where-Object { $_.Name -eq 'AppId' -or $_.Name -eq 'AppUserModelId' -or $_.Name -eq 'PackageFullName' } | Select-Object -First 1).'#text'
  [PSCustomObject]@{ appId = $appId; time = $_.TimeCreated }
} | ConvertTo-Json -Compress
`

  const { stdout } = await execFileAsync('powershell', [
    '-NoProfile',
    '-ExecutionPolicy',
    'Bypass',
    '-Command',
    script,
  ])

  if (!stdout) return [] as Array<{ appId?: string; time?: string }>
  try {
    const parsed = JSON.parse(stdout)
    if (Array.isArray(parsed)) return parsed
    return [parsed]
  } catch {
    return []
  }
}

export const createNotificationTracker = () => {
  let lastPoll = new Date(Date.now() - 60_000).toISOString()
  const counts = new Map<string, number>()

  const poll = async () => {
    const events = await queryNotificationEvents(lastPoll)
    lastPoll = new Date().toISOString()
    for (const event of events) {
      const appKey = mapAppId(event.appId)
      counts.set(appKey, (counts.get(appKey) ?? 0) + 1)
    }
  }

  const getSummary = async (): Promise<NotificationSummary> => {
    await poll()
    const perApp: Record<string, number> = {}
    for (const [appId, count] of counts.entries()) {
      perApp[appId] = count
    }
    return {
      total: Object.values(perApp).reduce((sum, value) => sum + value, 0),
      perApp,
    }
  }

  return { getSummary }
}
