var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// electron/main.ts
var electron = __toESM(require("electron"), 1);
var import_node_path = __toESM(require("node:path"), 1);
var fs3 = __toESM(require("node:fs"), 1);

// electron/notifications.ts
var import_node_child_process = require("node:child_process");
var import_node_util = require("node:util");
var import_electron = require("electron");
var fs = __toESM(require("node:fs"), 1);
var path = __toESM(require("node:path"), 1);
var execFileAsync = (0, import_node_util.promisify)(import_node_child_process.execFile);
var appIdMap = [
  // Browsers
  { match: /microsoft\.microsoftedge|msedge/i, appId: "msedge" },
  { match: /chrome/i, appId: "chrome" },
  { match: /firefox/i, appId: "firefox" },
  { match: /zen/i, appId: "zen" },
  { match: /brave/i, appId: "brave" },
  { match: /opera/i, appId: "opera" },
  { match: /vivaldi/i, appId: "vivaldi" },
  { match: /arc/i, appId: "arc" },
  // Communication / Messaging
  { match: /discord/i, appId: "discord" },
  { match: /whatsapp/i, appId: "whatsapp" },
  { match: /telegram/i, appId: "telegram" },
  { match: /signal/i, appId: "signal" },
  { match: /messenger/i, appId: "messenger" },
  { match: /skype/i, appId: "skype" },
  { match: /teams|ms-teams/i, appId: "teams" },
  { match: /slack/i, appId: "slack" },
  { match: /zoom/i, appId: "zoom" },
  // Media
  { match: /spotify/i, appId: "spotify" },
  { match: /steam/i, appId: "steam" },
  // Email
  { match: /outlook/i, appId: "outlook" },
  { match: /mail/i, appId: "mail" },
  { match: /gmail/i, appId: "gmail" },
  // Productivity
  { match: /code|vscode/i, appId: "code" },
  { match: /cursor/i, appId: "cursor" },
  { match: /notion/i, appId: "notion" },
  { match: /winword|word/i, appId: "word" },
  { match: /excel/i, appId: "excel" },
  { match: /powerpnt|powerpoint/i, appId: "powerpoint" },
  { match: /onenote/i, appId: "onenote" },
  { match: /rider/i, appId: "rider" },
  { match: /intellij|idea/i, appId: "intellij" },
  { match: /webstorm/i, appId: "webstorm" },
  { match: /postman/i, appId: "postman" },
  { match: /github/i, appId: "github" },
  { match: /figma/i, appId: "figma" },
  { match: /todoist/i, appId: "todoist" },
  { match: /trello/i, appId: "trello" },
  // Entertainment
  { match: /netflix/i, appId: "netflix" },
  { match: /youtube/i, appId: "youtube" },
  { match: /vlc/i, appId: "vlc" },
  { match: /twitch/i, appId: "twitch" },
  // Utilities
  { match: /explorer/i, appId: "explorer" },
  { match: /terminal|windowsterminal|wt|powershell|cmd/i, appId: "terminal" },
  // System
  { match: /windows\.systemtoast/i, appId: "system" },
  { match: /settings/i, appId: "settings" },
  { match: /store/i, appId: "store" },
  { match: /defender/i, appId: "defender" },
  { match: /security/i, appId: "security" }
];
var mapAppId = (raw) => {
  if (!raw) return "other";
  const found = appIdMap.find((entry) => entry.match.test(raw));
  return found?.appId ?? "other";
};
var getDataPath = () => {
  const userDataPath = import_electron.app.getPath("userData");
  return path.join(userDataPath, "notification-data.json");
};
var loadPersistedData = () => {
  const dataPath = getDataPath();
  try {
    if (fs.existsSync(dataPath)) {
      const raw = fs.readFileSync(dataPath, "utf8");
      const data = JSON.parse(raw);
      return {
        counts: data.counts ?? {},
        lastPollTime: data.lastPollTime ?? new Date(Date.now() - 6e4).toISOString(),
        seenNotificationIds: data.seenNotificationIds ?? []
      };
    }
  } catch {
  }
  return { counts: {}, lastPollTime: new Date(Date.now() - 6e4).toISOString(), seenNotificationIds: [] };
};
var savePersistedData = (data) => {
  const dataPath = getDataPath();
  try {
    const dir = path.dirname(dataPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
  } catch {
  }
};
var getTodayDateString = () => {
  const now = /* @__PURE__ */ new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};
var queryNotifications = async () => {
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
`;
  try {
    const { stdout, stderr } = await execFileAsync("powershell", [
      "-NoProfile",
      "-ExecutionPolicy",
      "Bypass",
      "-Command",
      script
    ], { timeout: 3e4 });
    if (!stdout || stdout.trim() === "" || stdout.trim() === "[]") {
      return { notifications: [] };
    }
    try {
      const parsed = JSON.parse(stdout.trim());
      if (Array.isArray(parsed)) {
        return { notifications: parsed };
      }
      if (parsed && typeof parsed === "object") {
        return { notifications: [parsed] };
      }
      return { notifications: [] };
    } catch {
      return { notifications: [], error: "Failed to parse notification data" };
    }
  } catch (err) {
    return { notifications: [], error: String(err) };
  }
};
var createNotificationTracker = () => {
  let persistedData = loadPersistedData();
  let lastError;
  let saveTimeout = null;
  const scheduleSave = () => {
    if (saveTimeout) return;
    saveTimeout = setTimeout(() => {
      savePersistedData(persistedData);
      saveTimeout = null;
    }, 5e3);
  };
  const poll = async () => {
    const result = await queryNotifications();
    if (result.error) {
      lastError = result.error;
    }
    const today = getTodayDateString();
    persistedData.lastPollTime = (/* @__PURE__ */ new Date()).toISOString();
    for (const notif of result.notifications) {
      if (persistedData.seenNotificationIds.includes(notif.id)) {
        continue;
      }
      const appId = mapAppId(notif.appId);
      if (appId === "other") {
        persistedData.seenNotificationIds.push(notif.id);
        continue;
      }
      let eventDate = today;
      if (notif.time) {
        try {
          const eventDateTime = new Date(notif.time);
          if (!isNaN(eventDateTime.getTime())) {
            const year = eventDateTime.getFullYear();
            const month = String(eventDateTime.getMonth() + 1).padStart(2, "0");
            const day = String(eventDateTime.getDate()).padStart(2, "0");
            eventDate = `${year}-${month}-${day}`;
          }
        } catch {
          eventDate = today;
        }
      }
      if (eventDate === today) {
        if (!persistedData.counts[eventDate]) {
          persistedData.counts[eventDate] = {};
        }
        persistedData.counts[eventDate][appId] = (persistedData.counts[eventDate][appId] ?? 0) + 1;
      }
      persistedData.seenNotificationIds.push(notif.id);
    }
    if (persistedData.seenNotificationIds.length > 2e3) {
      persistedData.seenNotificationIds = persistedData.seenNotificationIds.slice(-1e3);
    }
    const sevenDaysAgo = /* @__PURE__ */ new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const cutoffDate = `${sevenDaysAgo.getFullYear()}-${String(sevenDaysAgo.getMonth() + 1).padStart(2, "0")}-${String(sevenDaysAgo.getDate()).padStart(2, "0")}`;
    for (const date of Object.keys(persistedData.counts)) {
      if (date < cutoffDate) {
        delete persistedData.counts[date];
      }
    }
    scheduleSave();
    return "ok";
  };
  const getSummary = async () => {
    const status = await poll();
    const today = getTodayDateString();
    const todayCounts = persistedData.counts[today] ?? {};
    const perApp = { ...todayCounts };
    const total = Object.values(perApp).reduce((sum, value) => sum + value, 0);
    return {
      total,
      perApp,
      lastUpdated: (/* @__PURE__ */ new Date()).toISOString(),
      status,
      errorMessage: status !== "ok" ? lastError : void 0
    };
  };
  const dispose = () => {
    if (saveTimeout) {
      clearTimeout(saveTimeout);
      saveTimeout = null;
    }
    savePersistedData(persistedData);
  };
  return { getSummary, dispose };
};

// electron/telemetry.ts
var import_node_child_process2 = require("node:child_process");
var import_node_util2 = require("node:util");
var import_electron2 = require("electron");
var fs2 = __toESM(require("node:fs"), 1);
var path2 = __toESM(require("node:path"), 1);
var execFileAsync2 = (0, import_node_util2.promisify)(import_node_child_process2.execFile);
var appCatalog = [
  { id: "code", name: "VS Code", category: "Productivity", color: "#35a7ff" },
  // Browsers
  { id: "msedge", name: "Microsoft Edge", category: "Browsers", color: "#4f8bff" },
  { id: "chrome", name: "Google Chrome", category: "Browsers", color: "#f7b955" },
  { id: "firefox", name: "Firefox", category: "Browsers", color: "#ff6611" },
  { id: "zen", name: "Zen Browser", category: "Browsers", color: "#8b5cf6" },
  { id: "brave", name: "Brave", category: "Browsers", color: "#fb542b" },
  { id: "opera", name: "Opera", category: "Browsers", color: "#ff1b2d" },
  { id: "vivaldi", name: "Vivaldi", category: "Browsers", color: "#ef3939" },
  { id: "arc", name: "Arc", category: "Browsers", color: "#5e5ce6" },
  { id: "discord", name: "Discord", category: "Social", color: "#8c7dff" },
  { id: "spotify", name: "Spotify", category: "Entertainment", color: "#2ed47a" },
  { id: "steam", name: "Steam", category: "Entertainment", color: "#ff8b6a" },
  { id: "teams", name: "Microsoft Teams", category: "Communication", color: "#5b7cfa" },
  { id: "outlook", name: "Outlook", category: "Communication", color: "#2f6fff" },
  { id: "explorer", name: "File Explorer", category: "Utilities", color: "#9aa0ff" },
  { id: "notepad", name: "Notepad", category: "Productivity", color: "#a0c4ff" },
  { id: "terminal", name: "Terminal", category: "Productivity", color: "#4ec9b0" },
  { id: "slack", name: "Slack", category: "Communication", color: "#e91e63" },
  { id: "zoom", name: "Zoom", category: "Communication", color: "#2d8cff" },
  { id: "notion", name: "Notion", category: "Productivity", color: "#1f1f1f" },
  { id: "word", name: "Microsoft Word", category: "Productivity", color: "#2b579a" },
  { id: "excel", name: "Microsoft Excel", category: "Productivity", color: "#217346" },
  { id: "powerpoint", name: "PowerPoint", category: "Productivity", color: "#d24726" },
  { id: "vlc", name: "VLC", category: "Entertainment", color: "#ff8c00" },
  { id: "obs", name: "OBS Studio", category: "Productivity", color: "#302e2e" },
  { id: "figma", name: "Figma", category: "Productivity", color: "#f24e1e" },
  { id: "photoshop", name: "Photoshop", category: "Productivity", color: "#31a8ff" },
  { id: "premiere", name: "Premiere Pro", category: "Productivity", color: "#9999ff" },
  { id: "blender", name: "Blender", category: "Productivity", color: "#f5792a" },
  { id: "vscode-insiders", name: "VS Code Insiders", category: "Productivity", color: "#24bfa5" },
  { id: "cursor", name: "Cursor", category: "Productivity", color: "#00d4ff" },
  { id: "whatsapp", name: "WhatsApp", category: "Social", color: "#25d366" },
  { id: "telegram", name: "Telegram", category: "Social", color: "#0088cc" },
  { id: "youtube", name: "YouTube", category: "Entertainment", color: "#ff0000" },
  { id: "netflix", name: "Netflix", category: "Entertainment", color: "#e50914" },
  { id: "github", name: "GitHub Desktop", category: "Productivity", color: "#6e5494" },
  { id: "postman", name: "Postman", category: "Productivity", color: "#ff6c37" },
  { id: "rider", name: "JetBrains Rider", category: "Productivity", color: "#c90f5e" },
  { id: "intellij", name: "IntelliJ IDEA", category: "Productivity", color: "#fe315d" },
  { id: "webstorm", name: "WebStorm", category: "Productivity", color: "#07c3f2" }
];
var processPatterns = [
  { pattern: /^code$/i, appId: "code" },
  { pattern: /^code - insiders$/i, appId: "vscode-insiders" },
  { pattern: /^cursor$/i, appId: "cursor" },
  // Browsers
  { pattern: /^msedge$/i, appId: "msedge" },
  { pattern: /^chrome$/i, appId: "chrome" },
  { pattern: /^firefox$/i, appId: "firefox" },
  { pattern: /^zen$/i, appId: "zen" },
  { pattern: /^brave$/i, appId: "brave" },
  { pattern: /^opera$/i, appId: "opera" },
  { pattern: /^vivaldi$/i, appId: "vivaldi" },
  { pattern: /^arc$/i, appId: "arc" },
  { pattern: /^discord$/i, appId: "discord" },
  { pattern: /^spotify$/i, appId: "spotify" },
  { pattern: /^steam$/i, appId: "steam" },
  { pattern: /^teams$/i, appId: "teams" },
  { pattern: /^ms-teams$/i, appId: "teams" },
  { pattern: /^outlook$/i, appId: "outlook" },
  { pattern: /^explorer$/i, appId: "explorer" },
  { pattern: /^notepad$/i, appId: "notepad" },
  { pattern: /^notepad\+\+$/i, appId: "notepad" },
  { pattern: /^windowsterminal$/i, appId: "terminal" },
  { pattern: /^wt$/i, appId: "terminal" },
  { pattern: /^powershell$/i, appId: "terminal" },
  { pattern: /^cmd$/i, appId: "terminal" },
  { pattern: /^slack$/i, appId: "slack" },
  { pattern: /^zoom$/i, appId: "zoom" },
  { pattern: /^notion$/i, appId: "notion" },
  { pattern: /^winword$/i, appId: "word" },
  { pattern: /^excel$/i, appId: "excel" },
  { pattern: /^powerpnt$/i, appId: "powerpoint" },
  { pattern: /^vlc$/i, appId: "vlc" },
  { pattern: /^obs64$/i, appId: "obs" },
  { pattern: /^obs$/i, appId: "obs" },
  { pattern: /^figma$/i, appId: "figma" },
  { pattern: /^photoshop$/i, appId: "photoshop" },
  { pattern: /^premiere/i, appId: "premiere" },
  { pattern: /^blender$/i, appId: "blender" },
  { pattern: /^whatsapp\.root$/i, appId: "whatsapp" },
  { pattern: /^whatsapp$/i, appId: "whatsapp" },
  { pattern: /^telegram$/i, appId: "telegram" },
  { pattern: /^githubdesktop$/i, appId: "github" },
  { pattern: /^postman$/i, appId: "postman" },
  { pattern: /^rider64$/i, appId: "rider" },
  { pattern: /^idea64$/i, appId: "intellij" },
  { pattern: /^webstorm64$/i, appId: "webstorm" }
];
var unknownApp = {
  id: "other",
  name: "Other apps",
  category: "Other",
  color: "#6b7280"
};
var getTodayDateString2 = () => {
  const now = /* @__PURE__ */ new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};
var toDisplayName = (value) => value.replace(/[-_]+/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
var getDataPath2 = () => {
  const userDataPath = import_electron2.app.getPath("userData");
  return path2.join(userDataPath, "usage-data.json");
};
var loadPersistedData2 = () => {
  const dataPath = getDataPath2();
  const map = /* @__PURE__ */ new Map();
  try {
    if (fs2.existsSync(dataPath)) {
      const raw = fs2.readFileSync(dataPath, "utf8");
      const data = JSON.parse(raw);
      for (const [key, value] of Object.entries(data)) {
        map.set(key, value);
      }
    }
  } catch {
  }
  return map;
};
var savePersistedData2 = (totals) => {
  const dataPath = getDataPath2();
  const data = {};
  for (const [key, value] of totals.entries()) {
    data[key] = value;
  }
  try {
    const dir = path2.dirname(dataPath);
    if (!fs2.existsSync(dir)) {
      fs2.mkdirSync(dir, { recursive: true });
    }
    fs2.writeFileSync(dataPath, JSON.stringify(data, null, 2));
  } catch {
  }
};
var getActiveApp = async () => {
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
`;
  try {
    const { stdout } = await execFileAsync2(
      "powershell",
      [
        "-NoProfile",
        "-NonInteractive",
        "-WindowStyle",
        "Hidden",
        "-ExecutionPolicy",
        "Bypass",
        "-Command",
        script
      ],
      {
        windowsHide: true,
        timeout: 3e3,
        maxBuffer: 1024 * 1024
      }
    );
    const raw = (stdout ?? "").trim();
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed?.process) return null;
    return parsed;
  } catch {
    return null;
  }
};
var getRunningApps = async () => {
  if (process.platform !== "win32") return [];
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
`;
  try {
    const { stdout } = await execFileAsync2(
      "powershell",
      [
        "-NoProfile",
        "-NonInteractive",
        "-WindowStyle",
        "Hidden",
        "-ExecutionPolicy",
        "Bypass",
        "-Command",
        script
      ],
      {
        windowsHide: true,
        timeout: 4e3,
        maxBuffer: 4 * 1024 * 1024
      }
    );
    const raw = (stdout ?? "").trim();
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [parsed];
  } catch {
    return [];
  }
};
var mapProcessToAppId = (processName) => {
  for (const { pattern, appId } of processPatterns) {
    if (pattern.test(processName)) {
      return appId;
    }
  }
  return null;
};
var createUsageTracker = () => {
  const appLookup = /* @__PURE__ */ new Map();
  for (const app4 of appCatalog) {
    appLookup.set(app4.id, app4);
  }
  appLookup.set(unknownApp.id, unknownApp);
  const totals = loadPersistedData2();
  let interval = null;
  let saveInterval = null;
  const tickMs = 1e3;
  let lastAppId = null;
  let lastTimestamp = Date.now();
  let activeAppId = null;
  let runningApps = [];
  const record = (appId, deltaSeconds) => {
    if (!appId || deltaSeconds <= 0) return;
    const today = getTodayDateString2();
    const key = `${today}:${appId}`;
    totals.set(key, (totals.get(key) ?? 0) + deltaSeconds);
  };
  const resolveAppId = (active) => {
    if (!active?.process) return null;
    const processLower = active.process.toLowerCase();
    if (processLower === "electron" || processLower === "screenforge" || active.title?.toLowerCase().includes("screenforge")) {
      return null;
    }
    const mapped = mapProcessToAppId(active.process);
    if (mapped && appLookup.has(mapped)) return mapped;
    const dynamicId = `proc:${active.process.toLowerCase()}`;
    if (!appLookup.has(dynamicId)) {
      appLookup.set(dynamicId, {
        id: dynamicId,
        name: toDisplayName(active.process),
        category: "Other",
        color: "#6b7280"
      });
    }
    return dynamicId;
  };
  const resolveAppIdForRunningApps = (processName) => {
    if (!processName) return null;
    const processLower = processName.toLowerCase();
    if (processLower === "electron" || processLower === "screenforge") {
      return null;
    }
    const mapped = mapProcessToAppId(processName);
    if (mapped && appLookup.has(mapped)) return mapped;
    const dynamicId = `proc:${processName.toLowerCase()}`;
    if (!appLookup.has(dynamicId)) {
      appLookup.set(dynamicId, {
        id: dynamicId,
        name: toDisplayName(processName),
        category: "Other",
        color: "#6b7280"
      });
    }
    return dynamicId;
  };
  const refreshRunningApps = async () => {
    const raw = await getRunningApps();
    runningApps = raw.filter((p) => Boolean(p.process)).map((p) => {
      const appId = resolveAppIdForRunningApps(p.process);
      return { process: p.process, appId, count: p.count, hasWindow: p.hasWindow };
    }).filter((p) => p.appId !== null);
  };
  const poll = async () => {
    const now = Date.now();
    const elapsedSeconds = Math.max(0, (now - lastTimestamp) / 1e3);
    lastTimestamp = now;
    if (lastAppId && elapsedSeconds > 0) {
      const cappedSeconds = Math.min(elapsedSeconds, 60);
      record(lastAppId, cappedSeconds);
    }
    const active = await getActiveApp();
    activeAppId = resolveAppId(active);
    lastAppId = activeAppId;
  };
  interval = setInterval(poll, tickMs);
  poll();
  const runningAppsInterval = setInterval(() => {
    refreshRunningApps();
  }, 5e3);
  refreshRunningApps();
  saveInterval = setInterval(() => {
    savePersistedData2(totals);
  }, 3e4);
  return {
    apps: Array.from(appLookup.values()),
    getSnapshot: () => {
      const entries = [];
      const usedAppIds = /* @__PURE__ */ new Set();
      for (const [key, seconds] of totals.entries()) {
        const firstColonIndex = key.indexOf(":");
        if (firstColonIndex === -1) continue;
        const date = key.slice(0, firstColonIndex);
        const appId = key.slice(firstColonIndex + 1);
        if (!appId) continue;
        usedAppIds.add(appId);
        entries.push({
          date,
          appId,
          // Use floor to ensure we don't over-report, but keep fractional for accuracy
          minutes: Math.max(0, Math.floor(seconds / 60)),
          seconds: Math.max(0, Math.floor(seconds)),
          // Include raw seconds for accurate display
          notifications: 0
        });
      }
      const apps = Array.from(appLookup.values()).filter(
        (app4) => usedAppIds.has(app4.id)
      );
      return { apps, usageEntries: entries, activeAppId, runningApps };
    },
    clearData: () => {
      totals.clear();
      savePersistedData2(totals);
    },
    dispose: () => {
      if (interval) {
        clearInterval(interval);
        interval = null;
      }
      if (saveInterval) {
        clearInterval(saveInterval);
        saveInterval = null;
      }
      clearInterval(runningAppsInterval);
      savePersistedData2(totals);
    }
  };
};

// electron/main.ts
var { app: app3, BrowserWindow, Tray, Menu, nativeImage, Notification } = electron;
var { ipcMain } = electron;
var isDev = Boolean(process.env.VITE_DEV_SERVER_URL);
var usageTracker = createUsageTracker();
var notificationTracker = createNotificationTracker();
var mainWindow = null;
var tray = null;
var isQuitting = false;
var ZOOM_STEP = 0.1;
var ZOOM_MIN = 0.5;
var ZOOM_MAX = 3;
var themeTitlebar = {
  dark: { background: "#09090b", text: "#fafafa" },
  light: { background: "#fafafa", text: "#09090b" },
  tokyo: { background: "#0f0b1a", text: "#f0e6ff" },
  skin: { background: "#f3eee9", text: "#2d1e17" }
};
var applyThemeToWindow = (theme) => {
  if (!mainWindow) return;
  const colors = themeTitlebar[theme] ?? themeTitlebar.dark;
  try {
    mainWindow.setTitleBarOverlay({ color: colors.background, symbolColor: colors.text });
  } catch {
  }
  try {
    mainWindow.setBackgroundColor(colors.background);
  } catch {
  }
};
var settings = {
  minimizeToTray: true,
  startWithWindows: false,
  timeLimits: [],
  timeLimitNotificationsEnabled: true
};
var shownAlerts = [];
var getTodayDateString3 = () => {
  const now = /* @__PURE__ */ new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};
var getSettingsPath = () => {
  const userDataPath = app3.getPath("userData");
  return import_node_path.default.join(userDataPath, "settings.json");
};
var getAlertsPath = () => {
  const userDataPath = app3.getPath("userData");
  return import_node_path.default.join(userDataPath, "alerts.json");
};
var loadSettings = () => {
  const settingsPath = getSettingsPath();
  try {
    if (fs3.existsSync(settingsPath)) {
      const raw = fs3.readFileSync(settingsPath, "utf8");
      const loaded = JSON.parse(raw);
      settings = {
        minimizeToTray: loaded.minimizeToTray ?? true,
        startWithWindows: loaded.startWithWindows ?? false,
        timeLimits: loaded.timeLimits ?? [],
        timeLimitNotificationsEnabled: loaded.timeLimitNotificationsEnabled ?? true
      };
    }
  } catch {
  }
};
var saveSettings = () => {
  const settingsPath = getSettingsPath();
  try {
    const dir = import_node_path.default.dirname(settingsPath);
    if (!fs3.existsSync(dir)) {
      fs3.mkdirSync(dir, { recursive: true });
    }
    fs3.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
  } catch {
  }
};
var loadAlerts = () => {
  const alertsPath = getAlertsPath();
  try {
    if (fs3.existsSync(alertsPath)) {
      const raw = fs3.readFileSync(alertsPath, "utf8");
      shownAlerts = JSON.parse(raw);
      const today = getTodayDateString3();
      shownAlerts = shownAlerts.filter((a) => a.date === today);
    }
  } catch {
    shownAlerts = [];
  }
};
var saveAlerts = () => {
  const alertsPath = getAlertsPath();
  try {
    const dir = import_node_path.default.dirname(alertsPath);
    if (!fs3.existsSync(dir)) {
      fs3.mkdirSync(dir, { recursive: true });
    }
    fs3.writeFileSync(alertsPath, JSON.stringify(shownAlerts, null, 2));
  } catch {
  }
};
var checkTimeLimits = () => {
  if (!settings.timeLimitNotificationsEnabled) return;
  if (settings.timeLimits.length === 0) return;
  const snapshot = usageTracker.getSnapshot();
  const today = getTodayDateString3();
  const appLookup = new Map(snapshot.apps.map((a) => [a.id, a]));
  const todayUsage = /* @__PURE__ */ new Map();
  for (const entry of snapshot.usageEntries) {
    if (entry.date === today) {
      const currentMinutes = todayUsage.get(entry.appId) ?? 0;
      todayUsage.set(entry.appId, currentMinutes + entry.minutes);
    }
  }
  for (const limit of settings.timeLimits) {
    if (!limit.enabled) continue;
    const usedMinutes = todayUsage.get(limit.appId) ?? 0;
    if (usedMinutes >= limit.limitMinutes) {
      const alreadyNotified = shownAlerts.some(
        (a) => a.appId === limit.appId && a.date === today
      );
      if (!alreadyNotified) {
        const appInfo = appLookup.get(limit.appId);
        const appName = appInfo?.name ?? limit.appId;
        const notification = new Notification({
          title: "Time Limit Reached",
          body: `You've used ${appName} for ${usedMinutes} minutes today. Your limit is ${limit.limitMinutes} minutes.`,
          icon: void 0,
          silent: false
        });
        notification.show();
        shownAlerts.push({
          appId: limit.appId,
          date: today,
          notifiedAt: (/* @__PURE__ */ new Date()).toISOString()
        });
        saveAlerts();
        if (mainWindow) {
          mainWindow.webContents.send("time-limit-exceeded", {
            appId: limit.appId,
            appName,
            usedMinutes,
            limitMinutes: limit.limitMinutes
          });
        }
      }
    }
  }
};
var generateSuggestions = () => {
  const snapshot = usageTracker.getSnapshot();
  const suggestions = [];
  if (snapshot.usageEntries.length === 0) {
    suggestions.push({
      id: "welcome",
      title: "Welcome to ScreenForge!",
      detail: "Keep the app running to track your screen time automatically."
    });
    return suggestions;
  }
  const categoryMinutes = /* @__PURE__ */ new Map();
  const appLookup = new Map(snapshot.apps.map((a) => [a.id, a]));
  for (const entry of snapshot.usageEntries) {
    const appInfo = appLookup.get(entry.appId);
    if (appInfo) {
      categoryMinutes.set(appInfo.category, (categoryMinutes.get(appInfo.category) ?? 0) + entry.minutes);
    }
  }
  const totalMinutes = Array.from(categoryMinutes.values()).reduce((s, v) => s + v, 0);
  const entertainmentMinutes = categoryMinutes.get("Entertainment") ?? 0;
  if (entertainmentMinutes > 0 && entertainmentMinutes / totalMinutes > 0.3) {
    suggestions.push({
      id: "entertainment",
      title: "High entertainment usage",
      detail: "Consider setting time limits for entertainment apps to boost productivity."
    });
  }
  const socialMinutes = categoryMinutes.get("Social") ?? 0;
  if (socialMinutes > 0 && socialMinutes / totalMinutes > 0.2) {
    suggestions.push({
      id: "social",
      title: "Social apps taking over",
      detail: "Try scheduling specific times for checking social media."
    });
  }
  const productiveMinutes = (categoryMinutes.get("Productivity") ?? 0) + (categoryMinutes.get("Education") ?? 0);
  if (productiveMinutes > 0 && productiveMinutes / totalMinutes > 0.5) {
    suggestions.push({
      id: "productive",
      title: "Great focus!",
      detail: "You're spending most of your time on productive tasks. Keep it up!"
    });
  }
  if (suggestions.length === 0) {
    suggestions.push({
      id: "balance",
      title: "Balanced usage",
      detail: "Your screen time is well distributed across different activities."
    });
  }
  suggestions.push({
    id: "breaks",
    title: "Remember to take breaks",
    detail: "Use the 20-20-20 rule: every 20 minutes, look at something 20 feet away for 20 seconds."
  });
  return suggestions;
};
var createTray = () => {
  const size = 16;
  const canvas = Buffer.alloc(size * size * 4);
  const bgColor = { r: 9, g: 9, b: 11, a: 255 };
  const accentColor = { r: 59, g: 130, b: 246, a: 255 };
  const white = { r: 250, g: 250, b: 250, a: 255 };
  const setPixel = (x, y, color) => {
    if (x < 0 || x >= size || y < 0 || y >= size) return;
    const i = (y * size + x) * 4;
    canvas[i] = color.r;
    canvas[i + 1] = color.g;
    canvas[i + 2] = color.b;
    canvas[i + 3] = color.a;
  };
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      setPixel(x, y, bgColor);
    }
  }
  for (let x = 2; x <= 13; x++) {
    setPixel(x, 2, white);
  }
  for (let x = 2; x <= 13; x++) {
    setPixel(x, 10, white);
  }
  for (let y = 2; y <= 10; y++) {
    setPixel(2, y, white);
  }
  for (let y = 2; y <= 10; y++) {
    setPixel(13, y, white);
  }
  setPixel(7, 11, white);
  setPixel(8, 11, white);
  setPixel(7, 12, white);
  setPixel(8, 12, white);
  for (let x = 5; x <= 10; x++) {
    setPixel(x, 13, white);
  }
  setPixel(4, 5, accentColor);
  setPixel(5, 6, accentColor);
  setPixel(4, 7, accentColor);
  for (let x = 7; x <= 11; x++) {
    setPixel(x, 8, accentColor);
  }
  const trayIcon = nativeImage.createFromBuffer(canvas, { width: size, height: size });
  tray = new Tray(trayIcon);
  tray.setToolTip("ScreenForge - Screen Time Tracker");
  const contextMenu = Menu.buildFromTemplate([
    {
      label: "Show ScreenForge",
      click: () => {
        if (mainWindow) {
          mainWindow.show();
          mainWindow.focus();
        }
      }
    },
    { type: "separator" },
    {
      label: "Quit",
      click: () => {
        isQuitting = true;
        app3.quit();
      }
    }
  ]);
  tray.setContextMenu(contextMenu);
  tray.on("double-click", () => {
    if (mainWindow) {
      mainWindow.show();
      mainWindow.focus();
    }
  });
};
var createAppIcon = () => {
  const size = 32;
  const canvas = Buffer.alloc(size * size * 4);
  const bgColor = { r: 9, g: 9, b: 11, a: 255 };
  const accentColor = { r: 59, g: 130, b: 246, a: 255 };
  const white = { r: 250, g: 250, b: 250, a: 255 };
  const setPixel = (x, y, color) => {
    if (x < 0 || x >= size || y < 0 || y >= size) return;
    const i = (y * size + x) * 4;
    canvas[i] = color.r;
    canvas[i + 1] = color.g;
    canvas[i + 2] = color.b;
    canvas[i + 3] = color.a;
  };
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      setPixel(x, y, bgColor);
    }
  }
  for (let x = 4; x <= 27; x++) {
    setPixel(x, 4, white);
    setPixel(x, 5, white);
  }
  for (let x = 4; x <= 27; x++) {
    setPixel(x, 20, white);
    setPixel(x, 21, white);
  }
  for (let y = 4; y <= 21; y++) {
    setPixel(4, y, white);
    setPixel(5, y, white);
  }
  for (let y = 4; y <= 21; y++) {
    setPixel(26, y, white);
    setPixel(27, y, white);
  }
  for (let x = 14; x <= 17; x++) {
    for (let y = 22; y <= 25; y++) {
      setPixel(x, y, white);
    }
  }
  for (let x = 10; x <= 21; x++) {
    setPixel(x, 26, white);
    setPixel(x, 27, white);
  }
  for (let i = 0; i < 2; i++) {
    setPixel(8 + i, 10, accentColor);
    setPixel(9 + i, 10, accentColor);
    setPixel(10 + i, 11, accentColor);
    setPixel(11 + i, 11, accentColor);
    setPixel(12 + i, 12, accentColor);
    setPixel(13 + i, 12, accentColor);
    setPixel(10 + i, 13, accentColor);
    setPixel(11 + i, 13, accentColor);
    setPixel(8 + i, 14, accentColor);
    setPixel(9 + i, 14, accentColor);
  }
  for (let x = 15; x <= 24; x++) {
    setPixel(x, 16, accentColor);
    setPixel(x, 17, accentColor);
  }
  return nativeImage.createFromBuffer(canvas, { width: size, height: size });
};
var createWindow = async () => {
  const appIcon = createAppIcon();
  mainWindow = new BrowserWindow({
    width: 1240,
    height: 820,
    minWidth: 980,
    minHeight: 640,
    backgroundColor: themeTitlebar.dark.background,
    show: false,
    frame: true,
    titleBarStyle: "default",
    autoHideMenuBar: true,
    icon: appIcon,
    webPreferences: {
      preload: import_node_path.default.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  });
  const adjustZoom = async (delta) => {
    const wc = mainWindow?.webContents;
    if (!wc) return;
    const current = await wc.getZoomFactor();
    const next = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, Number((current + delta).toFixed(2))));
    await wc.setZoomFactor(next);
  };
  mainWindow.webContents.on("before-input-event", (event, input) => {
    if (input.type !== "keyDown") return;
    if (!(input.control || input.meta)) return;
    const isMinus = input.key === "-" || input.code === "Minus" || input.code === "NumpadSubtract";
    const isPlus = input.key === "+" || input.key === "=" || input.key === "Add" || input.code === "Equal" || input.code === "NumpadAdd" || input.code === "NumpadEqual";
    if (isMinus) {
      event.preventDefault();
      void adjustZoom(-ZOOM_STEP);
      return;
    }
    if (isPlus) {
      event.preventDefault();
      void adjustZoom(ZOOM_STEP);
    }
  });
  mainWindow.on("close", (event) => {
    if (!isQuitting && settings.minimizeToTray) {
      event.preventDefault();
      mainWindow?.hide();
    }
  });
  mainWindow.once("ready-to-show", () => {
    mainWindow?.show();
  });
  if (isDev && process.env.VITE_DEV_SERVER_URL) {
    await mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
    mainWindow.webContents.openDevTools({ mode: "detach" });
  } else {
    const indexPath = import_node_path.default.join(app3.getAppPath(), "dist", "index.html");
    await mainWindow.loadFile(indexPath);
  }
};
var setAutoLaunch = (enable) => {
  if (process.platform !== "win32") return;
  app3.setLoginItemSettings({
    openAtLogin: enable,
    path: app3.getPath("exe")
  });
};
app3.whenReady().then(() => {
  loadSettings();
  loadAlerts();
  ipcMain.handle("usage:snapshot", () => usageTracker.getSnapshot());
  ipcMain.handle("usage:clear", () => {
    usageTracker.clearData();
    return usageTracker.getSnapshot();
  });
  ipcMain.handle("theme:set", (_event, theme) => {
    applyThemeToWindow(theme);
    return true;
  });
  ipcMain.handle("suggestions:list", () => generateSuggestions());
  ipcMain.handle("notifications:summary", () => notificationTracker.getSummary());
  ipcMain.handle("settings:get", () => settings);
  ipcMain.handle("settings:set", (_event, newSettings) => {
    if (typeof newSettings.minimizeToTray === "boolean") {
      settings.minimizeToTray = newSettings.minimizeToTray;
    }
    if (typeof newSettings.startWithWindows === "boolean") {
      settings.startWithWindows = newSettings.startWithWindows;
      setAutoLaunch(newSettings.startWithWindows);
    }
    if (Array.isArray(newSettings.timeLimits)) {
      settings.timeLimits = newSettings.timeLimits;
    }
    if (typeof newSettings.timeLimitNotificationsEnabled === "boolean") {
      settings.timeLimitNotificationsEnabled = newSettings.timeLimitNotificationsEnabled;
    }
    saveSettings();
    return settings;
  });
  ipcMain.handle("timelimits:get", () => settings.timeLimits);
  ipcMain.handle("timelimits:set", (_event, limits) => {
    settings.timeLimits = limits;
    saveSettings();
    return settings.timeLimits;
  });
  ipcMain.handle("timelimits:add", (_event, limit) => {
    settings.timeLimits = settings.timeLimits.filter((l) => l.appId !== limit.appId);
    settings.timeLimits.push(limit);
    saveSettings();
    return settings.timeLimits;
  });
  ipcMain.handle("timelimits:remove", (_event, appId) => {
    settings.timeLimits = settings.timeLimits.filter((l) => l.appId !== appId);
    saveSettings();
    return settings.timeLimits;
  });
  ipcMain.handle("timelimits:alerts", () => shownAlerts);
  createTray();
  createWindow();
  const timeLimitInterval = setInterval(checkTimeLimits, 3e4);
  setTimeout(checkTimeLimits, 5e3);
  app3.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    } else if (mainWindow) {
      mainWindow.show();
    }
  });
  app3.on("will-quit", () => {
    clearInterval(timeLimitInterval);
  });
});
app3.on("before-quit", () => {
  isQuitting = true;
});
app3.on("window-all-closed", () => {
  if (process.platform === "darwin") {
  } else if (!settings.minimizeToTray) {
    usageTracker.dispose();
    notificationTracker.dispose();
    app3.quit();
  }
});
app3.on("will-quit", () => {
  usageTracker.dispose();
  notificationTracker.dispose();
  if (tray) {
    tray.destroy();
    tray = null;
  }
});
