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
var import_electron3 = require("electron");
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
    const { stdout } = await execFileAsync("powershell", [
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
  const persistedData = loadPersistedData();
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

// src/i18n/locales/en-US.ts
var enUS = {
  common: {
    today: "Today",
    yesterday: "Yesterday",
    none: "None",
    noData: "No data",
    notAvailable: "N/A",
    loading: "Loading...",
    live: "Live",
    focused: "Focused",
    tracking: "Tracking",
    unknown: "Unknown"
  },
  locales: {
    "zh-CN": "\u7B80\u4F53\u4E2D\u6587",
    "en-US": "English"
  },
  nav: {
    dashboard: "Dashboard",
    insights: "Insights",
    apps: "Apps",
    notifications: "Notifications",
    settings: "Settings"
  },
  sidebar: {
    focusScore: "Focus score"
  },
  themes: {
    dark: {
      name: "Dark",
      description: "Easy on the eyes, perfect for night"
    },
    light: {
      name: "Light",
      description: "Clean and bright for daytime"
    },
    tokyo: {
      name: "Tokyo",
      description: "Cyberpunk vibes with purple accents"
    },
    skin: {
      name: "Skin",
      description: "Warm and soft aesthetic"
    }
  },
  dashboard: {
    greeting: {
      morning: "Good morning",
      afternoon: "Good afternoon",
      evening: "Good evening"
    },
    subtitle: "Your screen time for today",
    cards: {
      screenTime: "Screen Time",
      totalToday: "Total today",
      dailyAverage: "Daily Avg",
      acrossDays: "Across {count} days",
      noHistory: "No history yet",
      topCategory: "Top Category",
      notifications: "Notifications",
      topNotificationApp: "Top: {name}"
    },
    charts: {
      dailyUsageTitle: "Daily usage",
      dailyUsageSubtitle: "Minutes per day across all apps",
      dailyUsageEmpty: "Start using apps to see your usage data",
      categoriesTitle: "Categories",
      categoriesSubtitle: "Time by category today",
      categoriesEmpty: "No category data yet",
      usageDataset: "Usage (minutes)",
      minutesDataset: "Minutes"
    },
    sections: {
      topAppsToday: "Top Apps Today",
      activeApps: "Active apps",
      activeAppsSubtitle: "Currently open windows",
      activeAppsEmpty: "No apps with visible windows detected",
      currentFocus: "Current focus",
      appsUsedToday: "Apps used today",
      daysRecorded: "Days recorded",
      noActiveApp: "No active app",
      otherApps: "Other apps"
    },
    trend: {
      collecting: "Collecting data",
      newData: "New data",
      up: "Trending up",
      down: "Trending down",
      stable: "Stable"
    }
  },
  insights: {
    title: "Insights",
    subtitle: "Deep dive into your screen time patterns",
    cards: {
      focusScore: "Focus Score",
      focusScoreSub: "Based on productive app usage",
      appsUsed: "Apps Used",
      topApp: "Top app",
      topAppSub: "Most used by minutes",
      totalTracked: "Total tracked",
      totalTrackedSub: "All time screen time"
    },
    charts: {
      weeklyTrendTitle: "Weekly trend",
      weeklyTrendSubtitle: "Screen time over the last 7 days",
      weeklyTrendEmpty: "Start using apps to see trends",
      categoryBreakdownTitle: "Category breakdown",
      categoryBreakdownSubtitle: "How you spend your screen time",
      categoryBreakdownEmpty: "No category data yet",
      minutesDataset: "Minutes"
    },
    quickStats: {
      title: "Quick stats",
      daysTracked: "Days tracked",
      appsUsed: "Apps used",
      dailyAverage: "Daily average",
      topCategory: "Top category",
      peakDay: "Peak day"
    }
  },
  apps: {
    title: "Apps",
    subtitle: "Screen time for {date}",
    dateView: "View:",
    stats: {
      totalTime: "Total Time",
      appsUsed: "Apps Used",
      topCategory: "Top Category"
    },
    openApps: {
      title: "Open apps",
      subtitle: "Apps with visible windows",
      empty: "No apps with visible windows detected yet."
    },
    backgroundApps: {
      title: "Background processes",
      subtitle: "Running without visible windows",
      empty: "No background processes detected.",
      processCount: "{count} process(es)"
    },
    timeLimits: {
      title: "Active Time Limits",
      subtitle: "{count} app(s) with limits",
      usage: "{used} / {limit} min",
      exceeded: "Exceeded",
      setLimit: "Set time limit",
      edit: "Edit",
      remove: "Remove",
      save: "Save",
      cancel: "Cancel",
      limit: "Limit:",
      minutesPlaceholder: "Minutes",
      perDayUnit: "min/day"
    },
    controls: {
      searchPlaceholder: "Search apps...",
      sortBy: "Sort by:",
      time: "Time",
      name: "Name",
      category: "Category"
    },
    empty: {
      search: "No apps match your search",
      date: "No apps tracked for {date}"
    },
    cards: {
      percentageOfTotal: "{count}% of total"
    }
  },
  notifications: {
    title: "Notifications",
    subtitle: "Track notification activity from your apps today",
    status: {
      disabledTitle: "Notification Logs Disabled",
      disabledMessage: "Windows notification logs are disabled. Enable them in Event Viewer or run as Administrator.",
      errorTitle: "Error Reading Logs",
      errorMessage: "Failed to read notification logs.",
      errorWithDetails: "Failed to read notification logs: {detail}"
    },
    stats: {
      totalToday: "Total Today",
      apps: "Apps",
      avgPerApp: "Avg per App",
      topSender: "Top Sender"
    },
    breakdown: {
      title: "Breakdown by App",
      subtitle: "Notifications received today per application",
      countBadge: "{count} apps",
      app: "Application",
      count: "Count",
      emptyTitle: "No notifications tracked yet",
      emptySubtitle: "Notifications from your apps will appear here as they come in.",
      emptyActionSubtitle: "Fix the issue above to start tracking notifications.",
      otherApps: "Other Apps"
    },
    tips: {
      title: "Reduce Distractions",
      subtitle: "Tips for managing notification overload",
      focusAssistTitle: "Enable Focus Assist",
      focusAssistDesc: "Use Windows Focus Assist to silence notifications during work hours. Access it from the Action Center or Settings.",
      appNotificationsTitle: "Configure App Notifications",
      appNotificationsDesc: "Go to Windows Settings > System > Notifications to customize which apps can send you notifications.",
      timeLimitsTitle: "Set Time Limits",
      timeLimitsDesc: "Use the Apps page to set daily time limits for distracting applications. You will receive a notification when limits are exceeded."
    }
  },
  settings: {
    title: "Settings",
    subtitle: "Customize your ScreenForge experience",
    loadingSubtitle: "Loading...",
    sections: {
      appearance: "Appearance",
      appearanceDesc: "Choose your preferred theme",
      language: "Language",
      languageDesc: "Choose your interface language",
      behavior: "Behavior",
      behaviorDesc: "Control how ScreenForge runs",
      timeLimits: "Time Limits",
      timeLimitsDesc: "Control app usage notifications",
      data: "Data",
      dataDesc: "Manage your tracked data",
      about: "About"
    },
    behavior: {
      startWithWindows: "Start with Windows",
      startWithWindowsDesc: "Launch ScreenForge when you log in",
      minimizeToTray: "Minimize to tray",
      minimizeToTrayDesc: "Keep running in background when closed"
    },
    timeLimits: {
      notifications: "Time limit notifications",
      notificationsDesc: "Get notified when you exceed app time limits",
      activeLimits: "Active limits",
      activeLimitsDesc: "You have {count} app(s) with time limits. Manage them on the Apps page."
    },
    data: {
      clearAll: "Clear all data",
      clearAllDesc: "Remove all tracked usage history",
      clearButton: "Clear data",
      clearConfirm: "Are you sure? This will delete all your usage data."
    },
    about: {
      version: "Version",
      platform: "Platform",
      builtWith: "Built with",
      windows: "Windows",
      techStack: "Electron + React"
    }
  },
  tables: {
    topApps: "Top apps",
    usageToday: "Usage today",
    app: "App",
    category: "Category",
    time: "Time",
    notifications: "Notifications",
    empty: "No app data yet for today",
    notificationToday: "Today",
    notificationEmpty: "No notifications yet"
  },
  datePicker: {
    previousMonth: "Previous month",
    nextMonth: "Next month",
    dataAvailable: "Data available",
    dataRange: "Data from {start} to {end}"
  },
  suggestions: {
    title: "Suggestions",
    subtitle: "Based on your recent activity",
    welcome: {
      title: "Welcome to ScreenForge!",
      detail: "Keep the app running to track your screen time automatically."
    },
    entertainment: {
      title: "High entertainment usage",
      detail: "Consider setting time limits for entertainment apps to boost productivity."
    },
    social: {
      title: "Social apps taking over",
      detail: "Try scheduling specific times for checking social media."
    },
    productive: {
      title: "Great focus!",
      detail: "You're spending most of your time on productive tasks. Keep it up!"
    },
    balance: {
      title: "Balanced usage",
      detail: "Your screen time is well distributed across different activities."
    },
    breaks: {
      title: "Remember to take breaks",
      detail: "Use the 20-20-20 rule: every 20 minutes, look at something 20 feet away for 20 seconds."
    }
  },
  native: {
    timeLimitReachedTitle: "Time Limit Reached",
    timeLimitReachedBody: "You've used {appName} for {usedMinutes} minutes today. Your limit is {limitMinutes} minutes.",
    trayTooltip: "ScreenForge - Screen Time Tracker",
    trayShow: "Show ScreenForge",
    trayQuit: "Quit"
  },
  categories: {
    Productivity: "Productivity",
    Education: "Education",
    Communication: "Communication",
    Utilities: "Utilities",
    Browsers: "Browsers",
    Entertainment: "Entertainment",
    Social: "Social",
    System: "System",
    Other: "Other",
    Unknown: "Unknown"
  }
};

// src/i18n/locales/zh-CN.ts
var zhCN = {
  common: {
    today: "\u4ECA\u5929",
    yesterday: "\u6628\u5929",
    none: "\u65E0",
    noData: "\u6682\u65E0\u6570\u636E",
    notAvailable: "\u6682\u65E0",
    loading: "\u52A0\u8F7D\u4E2D...",
    live: "\u5B9E\u65F6",
    focused: "\u5F53\u524D\u7126\u70B9",
    tracking: "\u8FFD\u8E2A\u4E2D",
    unknown: "\u672A\u77E5"
  },
  locales: {
    "zh-CN": "\u7B80\u4F53\u4E2D\u6587",
    "en-US": "English"
  },
  nav: {
    dashboard: "\u4EEA\u8868\u76D8",
    insights: "\u6D1E\u5BDF",
    apps: "\u5E94\u7528",
    notifications: "\u901A\u77E5",
    settings: "\u8BBE\u7F6E"
  },
  sidebar: {
    focusScore: "\u4E13\u6CE8\u5206"
  },
  themes: {
    dark: {
      name: "\u6DF1\u8272",
      description: "\u66F4\u62A4\u773C\uFF0C\u9002\u5408\u591C\u95F4\u4F7F\u7528"
    },
    light: {
      name: "\u6D45\u8272",
      description: "\u6E05\u723D\u660E\u4EAE\uFF0C\u9002\u5408\u767D\u5929\u4F7F\u7528"
    },
    tokyo: {
      name: "\u4E1C\u4EAC",
      description: "\u5E26\u6709\u9713\u8679\u611F\u7684\u672A\u6765\u98CE\u914D\u8272"
    },
    skin: {
      name: "\u6696\u80A4",
      description: "\u6E29\u6696\u67D4\u548C\u7684\u754C\u9762\u98CE\u683C"
    }
  },
  dashboard: {
    greeting: {
      morning: "\u65E9\u4E0A\u597D",
      afternoon: "\u4E0B\u5348\u597D",
      evening: "\u665A\u4E0A\u597D"
    },
    subtitle: "\u67E5\u770B\u4F60\u4ECA\u5929\u7684\u5C4F\u5E55\u4F7F\u7528\u60C5\u51B5",
    cards: {
      screenTime: "\u5C4F\u5E55\u65F6\u957F",
      totalToday: "\u4ECA\u65E5\u603B\u8BA1",
      dailyAverage: "\u65E5\u5747",
      acrossDays: "\u8FD1 {count} \u5929\u5E73\u5747",
      noHistory: "\u6682\u65E0\u5386\u53F2\u8BB0\u5F55",
      topCategory: "\u6700\u9AD8\u5206\u7C7B",
      notifications: "\u901A\u77E5\u6570",
      topNotificationApp: "\u6700\u9AD8\uFF1A{name}"
    },
    charts: {
      dailyUsageTitle: "\u6BCF\u65E5\u4F7F\u7528\u8D8B\u52BF",
      dailyUsageSubtitle: "\u6240\u6709\u5E94\u7528\u6BCF\u5929\u7684\u4F7F\u7528\u5206\u949F\u6570",
      dailyUsageEmpty: "\u5F00\u59CB\u4F7F\u7528\u5E94\u7528\u540E\uFF0C\u8FD9\u91CC\u4F1A\u663E\u793A\u4F60\u7684\u4F7F\u7528\u6570\u636E",
      categoriesTitle: "\u5206\u7C7B\u5206\u5E03",
      categoriesSubtitle: "\u4ECA\u5929\u5404\u5206\u7C7B\u7684\u4F7F\u7528\u65F6\u957F",
      categoriesEmpty: "\u6682\u65E0\u5206\u7C7B\u6570\u636E",
      usageDataset: "\u4F7F\u7528\u65F6\u957F\uFF08\u5206\u949F\uFF09",
      minutesDataset: "\u5206\u949F"
    },
    sections: {
      topAppsToday: "\u4ECA\u65E5\u5E38\u7528\u5E94\u7528",
      activeApps: "\u6D3B\u8DC3\u5E94\u7528",
      activeAppsSubtitle: "\u5F53\u524D\u5DF2\u6253\u5F00\u7684\u7A97\u53E3",
      activeAppsEmpty: "\u6682\u672A\u68C0\u6D4B\u5230\u53EF\u89C1\u7A97\u53E3\u5E94\u7528",
      currentFocus: "\u5F53\u524D\u4E13\u6CE8\u5E94\u7528",
      appsUsedToday: "\u4ECA\u65E5\u4F7F\u7528\u5E94\u7528\u6570",
      daysRecorded: "\u8BB0\u5F55\u5929\u6570",
      noActiveApp: "\u5F53\u524D\u6CA1\u6709\u6D3B\u8DC3\u5E94\u7528",
      otherApps: "\u5176\u4ED6\u5E94\u7528"
    },
    trend: {
      collecting: "\u6B63\u5728\u6536\u96C6\u6570\u636E",
      newData: "\u521A\u5F00\u59CB\u8BB0\u5F55",
      up: "\u5448\u4E0A\u5347\u8D8B\u52BF",
      down: "\u5448\u4E0B\u964D\u8D8B\u52BF",
      stable: "\u57FA\u672C\u7A33\u5B9A"
    }
  },
  insights: {
    title: "\u6D1E\u5BDF",
    subtitle: "\u66F4\u6DF1\u5165\u5730\u4E86\u89E3\u4F60\u7684\u5C4F\u5E55\u4F7F\u7528\u6A21\u5F0F",
    cards: {
      focusScore: "\u4E13\u6CE8\u5206",
      focusScoreSub: "\u57FA\u4E8E\u9AD8\u6548\u5E94\u7528\u4F7F\u7528\u60C5\u51B5\u8BA1\u7B97",
      appsUsed: "\u4F7F\u7528\u5E94\u7528\u6570",
      topApp: "\u6700\u5E38\u7528\u5E94\u7528",
      topAppSub: "\u6309\u5206\u949F\u6570\u7EDF\u8BA1",
      totalTracked: "\u7D2F\u8BA1\u8BB0\u5F55",
      totalTrackedSub: "\u5168\u90E8\u5386\u53F2\u5C4F\u5E55\u65F6\u957F"
    },
    charts: {
      weeklyTrendTitle: "\u8FD1\u4E00\u5468\u8D8B\u52BF",
      weeklyTrendSubtitle: "\u8FC7\u53BB 7 \u5929\u7684\u5C4F\u5E55\u4F7F\u7528\u65F6\u957F",
      weeklyTrendEmpty: "\u5F00\u59CB\u4F7F\u7528\u5E94\u7528\u540E\uFF0C\u8FD9\u91CC\u4F1A\u663E\u793A\u8D8B\u52BF",
      categoryBreakdownTitle: "\u5206\u7C7B\u5360\u6BD4",
      categoryBreakdownSubtitle: "\u4F60\u7684\u5C4F\u5E55\u65F6\u95F4\u4E3B\u8981\u82B1\u5728\u54EA\u91CC",
      categoryBreakdownEmpty: "\u6682\u65E0\u5206\u7C7B\u6570\u636E",
      minutesDataset: "\u5206\u949F"
    },
    quickStats: {
      title: "\u901F\u89C8\u7EDF\u8BA1",
      daysTracked: "\u8BB0\u5F55\u5929\u6570",
      appsUsed: "\u4F7F\u7528\u5E94\u7528\u6570",
      dailyAverage: "\u65E5\u5747\u65F6\u957F",
      topCategory: "\u6700\u9AD8\u5206\u7C7B",
      peakDay: "\u5CF0\u503C\u65E5\u671F"
    }
  },
  apps: {
    title: "\u5E94\u7528",
    subtitle: "{date} \u7684\u5C4F\u5E55\u4F7F\u7528\u60C5\u51B5",
    dateView: "\u67E5\u770B\uFF1A",
    stats: {
      totalTime: "\u603B\u65F6\u957F",
      appsUsed: "\u4F7F\u7528\u5E94\u7528\u6570",
      topCategory: "\u6700\u9AD8\u5206\u7C7B"
    },
    openApps: {
      title: "\u5DF2\u6253\u5F00\u5E94\u7528",
      subtitle: "\u6709\u53EF\u89C1\u7A97\u53E3\u7684\u5E94\u7528",
      empty: "\u6682\u672A\u68C0\u6D4B\u5230\u6709\u53EF\u89C1\u7A97\u53E3\u7684\u5E94\u7528\u3002"
    },
    backgroundApps: {
      title: "\u540E\u53F0\u8FDB\u7A0B",
      subtitle: "\u6B63\u5728\u8FD0\u884C\u4F46\u6CA1\u6709\u53EF\u89C1\u7A97\u53E3",
      empty: "\u672A\u68C0\u6D4B\u5230\u540E\u53F0\u8FDB\u7A0B\u3002",
      processCount: "{count} \u4E2A\u8FDB\u7A0B"
    },
    timeLimits: {
      title: "\u5DF2\u542F\u7528\u65F6\u957F\u9650\u5236",
      subtitle: "\u5171 {count} \u4E2A\u5E94\u7528\u8BBE\u7F6E\u4E86\u9650\u989D",
      usage: "{used} / {limit} \u5206\u949F",
      exceeded: "\u5DF2\u8D85\u9650",
      setLimit: "\u8BBE\u7F6E\u65F6\u957F\u9650\u5236",
      edit: "\u7F16\u8F91",
      remove: "\u79FB\u9664",
      save: "\u4FDD\u5B58",
      cancel: "\u53D6\u6D88",
      limit: "\u9650\u5236\uFF1A",
      minutesPlaceholder: "\u5206\u949F",
      perDayUnit: "\u5206\u949F/\u5929"
    },
    controls: {
      searchPlaceholder: "\u641C\u7D22\u5E94\u7528...",
      sortBy: "\u6392\u5E8F\u65B9\u5F0F\uFF1A",
      time: "\u65F6\u957F",
      name: "\u540D\u79F0",
      category: "\u5206\u7C7B"
    },
    empty: {
      search: "\u6CA1\u6709\u5339\u914D\u641C\u7D22\u6761\u4EF6\u7684\u5E94\u7528",
      date: "{date} \u6682\u65E0\u5E94\u7528\u4F7F\u7528\u8BB0\u5F55"
    },
    cards: {
      percentageOfTotal: "\u5360\u603B\u65F6\u957F {count}%"
    }
  },
  notifications: {
    title: "\u901A\u77E5",
    subtitle: "\u8DDF\u8E2A\u4ECA\u5929\u6765\u81EA\u5404\u5E94\u7528\u7684\u901A\u77E5\u6D3B\u52A8",
    status: {
      disabledTitle: "\u901A\u77E5\u65E5\u5FD7\u672A\u542F\u7528",
      disabledMessage: "Windows \u901A\u77E5\u65E5\u5FD7\u5F53\u524D\u5DF2\u5173\u95ED\uFF0C\u8BF7\u5728\u4E8B\u4EF6\u67E5\u770B\u5668\u4E2D\u542F\u7528\uFF0C\u6216\u5C1D\u8BD5\u4EE5\u7BA1\u7406\u5458\u8EAB\u4EFD\u8FD0\u884C\u3002",
      errorTitle: "\u8BFB\u53D6\u65E5\u5FD7\u5931\u8D25",
      errorMessage: "\u8BFB\u53D6\u901A\u77E5\u65E5\u5FD7\u5931\u8D25\u3002",
      errorWithDetails: "\u8BFB\u53D6\u901A\u77E5\u65E5\u5FD7\u5931\u8D25\uFF1A{detail}"
    },
    stats: {
      totalToday: "\u4ECA\u65E5\u603B\u6570",
      apps: "\u5E94\u7528\u6570",
      avgPerApp: "\u5355\u5E94\u7528\u5E73\u5747",
      topSender: "\u6700\u9AD8\u6765\u6E90"
    },
    breakdown: {
      title: "\u6309\u5E94\u7528\u62C6\u5206",
      subtitle: "\u4ECA\u5929\u6BCF\u4E2A\u5E94\u7528\u6536\u5230\u7684\u901A\u77E5\u6570",
      countBadge: "{count} \u4E2A\u5E94\u7528",
      app: "\u5E94\u7528",
      count: "\u6570\u91CF",
      emptyTitle: "\u8FD8\u6CA1\u6709\u8BB0\u5F55\u5230\u901A\u77E5",
      emptySubtitle: "\u6765\u81EA\u5E94\u7528\u7684\u901A\u77E5\u4F1A\u5728\u6536\u5230\u540E\u663E\u793A\u5728\u8FD9\u91CC\u3002",
      emptyActionSubtitle: "\u5148\u89E3\u51B3\u4E0A\u65B9\u95EE\u9898\uFF0C\u4E4B\u540E\u5373\u53EF\u5F00\u59CB\u8DDF\u8E2A\u901A\u77E5\u3002",
      otherApps: "\u5176\u4ED6\u5E94\u7528"
    },
    tips: {
      title: "\u51CF\u5C11\u5E72\u6270",
      subtitle: "\u7BA1\u7406\u901A\u77E5\u8FC7\u8F7D\u7684\u5C0F\u5EFA\u8BAE",
      focusAssistTitle: "\u5F00\u542F\u4E13\u6CE8\u52A9\u624B",
      focusAssistDesc: "\u4F7F\u7528 Windows \u4E13\u6CE8\u52A9\u624B\u5728\u5DE5\u4F5C\u65F6\u6BB5\u9759\u97F3\u901A\u77E5\uFF0C\u53EF\u5728\u64CD\u4F5C\u4E2D\u5FC3\u6216\u8BBE\u7F6E\u4E2D\u5F00\u542F\u3002",
      appNotificationsTitle: "\u914D\u7F6E\u5E94\u7528\u901A\u77E5",
      appNotificationsDesc: "\u524D\u5F80 Windows \u8BBE\u7F6E > \u7CFB\u7EDF > \u901A\u77E5\uFF0C\u81EA\u5B9A\u4E49\u54EA\u4E9B\u5E94\u7528\u53EF\u4EE5\u5411\u4F60\u53D1\u9001\u901A\u77E5\u3002",
      timeLimitsTitle: "\u8BBE\u7F6E\u65F6\u957F\u9650\u5236",
      timeLimitsDesc: "\u4F60\u53EF\u4EE5\u5728\u201C\u5E94\u7528\u201D\u9875\u9762\u4E3A\u5BB9\u6613\u5206\u5FC3\u7684\u5E94\u7528\u8BBE\u7F6E\u6BCF\u65E5\u9650\u5236\uFF0C\u8D85\u9650\u540E\u4F1A\u6536\u5230\u63D0\u9192\u3002"
    }
  },
  settings: {
    title: "\u8BBE\u7F6E",
    subtitle: "\u81EA\u5B9A\u4E49\u4F60\u7684 ScreenForge \u4F7F\u7528\u4F53\u9A8C",
    loadingSubtitle: "\u52A0\u8F7D\u4E2D...",
    sections: {
      appearance: "\u5916\u89C2",
      appearanceDesc: "\u9009\u62E9\u4F60\u559C\u6B22\u7684\u4E3B\u9898",
      language: "\u8BED\u8A00",
      languageDesc: "\u9009\u62E9\u754C\u9762\u663E\u793A\u8BED\u8A00",
      behavior: "\u884C\u4E3A",
      behaviorDesc: "\u63A7\u5236 ScreenForge \u7684\u8FD0\u884C\u65B9\u5F0F",
      timeLimits: "\u65F6\u957F\u9650\u5236",
      timeLimitsDesc: "\u63A7\u5236\u5E94\u7528\u4F7F\u7528\u63D0\u9192",
      data: "\u6570\u636E",
      dataDesc: "\u7BA1\u7406\u5DF2\u8BB0\u5F55\u7684\u6570\u636E",
      about: "\u5173\u4E8E"
    },
    behavior: {
      startWithWindows: "\u5F00\u673A\u542F\u52A8",
      startWithWindowsDesc: "\u767B\u5F55 Windows \u540E\u81EA\u52A8\u542F\u52A8 ScreenForge",
      minimizeToTray: "\u6700\u5C0F\u5316\u5230\u6258\u76D8",
      minimizeToTrayDesc: "\u5173\u95ED\u7A97\u53E3\u540E\u7EE7\u7EED\u5728\u540E\u53F0\u8FD0\u884C"
    },
    timeLimits: {
      notifications: "\u65F6\u957F\u8D85\u9650\u63D0\u9192",
      notificationsDesc: "\u5F53\u5E94\u7528\u4F7F\u7528\u8D85\u51FA\u9650\u5236\u65F6\u53D1\u9001\u63D0\u9192",
      activeLimits: "\u5F53\u524D\u9650\u5236",
      activeLimitsDesc: "\u4F60\u5DF2\u4E3A {count} \u4E2A\u5E94\u7528\u8BBE\u7F6E\u65F6\u957F\u9650\u5236\uFF0C\u53EF\u524D\u5F80\u201C\u5E94\u7528\u201D\u9875\u9762\u7BA1\u7406\u3002"
    },
    data: {
      clearAll: "\u6E05\u7A7A\u6240\u6709\u6570\u636E",
      clearAllDesc: "\u5220\u9664\u6240\u6709\u5DF2\u8BB0\u5F55\u7684\u4F7F\u7528\u5386\u53F2",
      clearButton: "\u6E05\u7A7A\u6570\u636E",
      clearConfirm: "\u786E\u5B9A\u5417\uFF1F\u8FD9\u5C06\u5220\u9664\u4F60\u6240\u6709\u7684\u4F7F\u7528\u6570\u636E\u3002"
    },
    about: {
      version: "\u7248\u672C",
      platform: "\u5E73\u53F0",
      builtWith: "\u6280\u672F\u6808",
      windows: "Windows",
      techStack: "Electron + React"
    }
  },
  tables: {
    topApps: "\u5E38\u7528\u5E94\u7528",
    usageToday: "\u4ECA\u65E5\u4F7F\u7528\u60C5\u51B5",
    app: "\u5E94\u7528",
    category: "\u5206\u7C7B",
    time: "\u65F6\u957F",
    notifications: "\u901A\u77E5",
    empty: "\u4ECA\u5929\u8FD8\u6CA1\u6709\u5E94\u7528\u6570\u636E",
    notificationToday: "\u4ECA\u5929",
    notificationEmpty: "\u8FD8\u6CA1\u6709\u901A\u77E5"
  },
  datePicker: {
    previousMonth: "\u4E0A\u4E2A\u6708",
    nextMonth: "\u4E0B\u4E2A\u6708",
    dataAvailable: "\u6709\u6570\u636E\u8BB0\u5F55",
    dataRange: "\u6570\u636E\u8303\u56F4\uFF1A{start} \u81F3 {end}"
  },
  suggestions: {
    title: "\u5EFA\u8BAE",
    subtitle: "\u57FA\u4E8E\u4F60\u6700\u8FD1\u7684\u6D3B\u52A8\u751F\u6210",
    welcome: {
      title: "\u6B22\u8FCE\u4F7F\u7528 ScreenForge\uFF01",
      detail: "\u4FDD\u6301\u5E94\u7528\u5728\u540E\u53F0\u8FD0\u884C\uFF0C\u5373\u53EF\u81EA\u52A8\u8BB0\u5F55\u4F60\u7684\u5C4F\u5E55\u65F6\u957F\u3002"
    },
    entertainment: {
      title: "\u5A31\u4E50\u5E94\u7528\u4F7F\u7528\u504F\u9AD8",
      detail: "\u53EF\u4EE5\u8003\u8651\u4E3A\u5A31\u4E50\u7C7B\u5E94\u7528\u8BBE\u7F6E\u65F6\u957F\u9650\u5236\uFF0C\u63D0\u5347\u4E13\u6CE8\u5EA6\u3002"
    },
    social: {
      title: "\u793E\u4EA4\u5E94\u7528\u5360\u6BD4\u504F\u9AD8",
      detail: "\u8BD5\u7740\u7ED9\u67E5\u770B\u793E\u4EA4\u5A92\u4F53\u5B89\u6392\u56FA\u5B9A\u65F6\u95F4\uFF0C\u51CF\u5C11\u9891\u7E41\u6253\u65AD\u3002"
    },
    productive: {
      title: "\u4E13\u6CE8\u72B6\u6001\u4E0D\u9519\uFF01",
      detail: "\u4F60\u5927\u90E8\u5206\u65F6\u95F4\u90FD\u82B1\u5728\u9AD8\u6548\u4EFB\u52A1\u4E0A\uFF0C\u7EE7\u7EED\u4FDD\u6301\u3002"
    },
    balance: {
      title: "\u4F7F\u7528\u5206\u5E03\u8F83\u5747\u8861",
      detail: "\u4F60\u7684\u5C4F\u5E55\u65F6\u95F4\u5728\u4E0D\u540C\u6D3B\u52A8\u4E4B\u95F4\u5206\u914D\u5F97\u6BD4\u8F83\u5E73\u8861\u3002"
    },
    breaks: {
      title: "\u8BB0\u5F97\u9002\u5F53\u4F11\u606F",
      detail: "\u8BD5\u8BD5 20-20-20 \u6CD5\u5219\uFF1A\u6BCF 20 \u5206\u949F\uFF0C\u770B\u5411 20 \u82F1\u5C3A\u5916\u7684\u7269\u4F53 20 \u79D2\u3002"
    }
  },
  native: {
    timeLimitReachedTitle: "\u5DF2\u8FBE\u5230\u65F6\u957F\u9650\u5236",
    timeLimitReachedBody: "\u4ECA\u5929\u4F60\u5DF2\u4F7F\u7528 {appName} {usedMinutes} \u5206\u949F\uFF0C\u8D85\u8FC7\u8BBE\u5B9A\u9650\u5236 {limitMinutes} \u5206\u949F\u3002",
    trayTooltip: "ScreenForge - \u5C4F\u5E55\u65F6\u95F4\u8FFD\u8E2A\u5668",
    trayShow: "\u663E\u793A ScreenForge",
    trayQuit: "\u9000\u51FA"
  },
  categories: {
    Productivity: "\u751F\u4EA7\u529B",
    Education: "\u6559\u80B2",
    Communication: "\u6C9F\u901A",
    Utilities: "\u5DE5\u5177",
    Browsers: "\u6D4F\u89C8\u5668",
    Entertainment: "\u5A31\u4E50",
    Social: "\u793E\u4EA4",
    System: "\u7CFB\u7EDF",
    Other: "\u5176\u4ED6",
    Unknown: "\u672A\u77E5"
  }
};

// src/i18n/types.ts
var supportedLocales = ["zh-CN", "en-US"];

// src/i18n/core.ts
var dictionaries = {
  "zh-CN": zhCN,
  "en-US": enUS
};
var defaultLocale = "zh-CN";
var normalizeLocale = (value) => {
  if (!value) return defaultLocale;
  if (supportedLocales.includes(value)) return value;
  if (value.toLowerCase().startsWith("zh")) return "zh-CN";
  if (value.toLowerCase().startsWith("en")) return "en-US";
  return defaultLocale;
};
var getNestedValue = (tree, path4) => {
  const value = path4.split(".").reduce((current, segment) => {
    if (!current || typeof current === "string") {
      return void 0;
    }
    return current[segment];
  }, tree);
  return typeof value === "string" ? value : void 0;
};
var interpolate = (template, params) => {
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (_match, key) => String(params[key] ?? ""));
};
var translate = (locale, key, params) => {
  const resolvedLocale = normalizeLocale(locale);
  const template = getNestedValue(dictionaries[resolvedLocale], key) ?? getNestedValue(dictionaries[defaultLocale], key) ?? key;
  return interpolate(template, params);
};

// electron/main.ts
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
  timeLimitNotificationsEnabled: true,
  language: defaultLocale
};
var shownAlerts = [];
var mt = (key, params) => translate(settings.language, key, params);
var getTodayDateString3 = () => {
  const now = /* @__PURE__ */ new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};
var getSettingsPath = () => {
  const userDataPath = import_electron3.app.getPath("userData");
  return import_node_path.default.join(userDataPath, "settings.json");
};
var getAlertsPath = () => {
  const userDataPath = import_electron3.app.getPath("userData");
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
        timeLimitNotificationsEnabled: loaded.timeLimitNotificationsEnabled ?? true,
        language: normalizeLocale(loaded.language)
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
        const notification = new import_electron3.Notification({
          title: mt("native.timeLimitReachedTitle"),
          body: mt("native.timeLimitReachedBody", {
            appName,
            usedMinutes,
            limitMinutes: limit.limitMinutes
          }),
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
      title: mt("suggestions.welcome.title"),
      detail: mt("suggestions.welcome.detail")
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
      title: mt("suggestions.entertainment.title"),
      detail: mt("suggestions.entertainment.detail")
    });
  }
  const socialMinutes = categoryMinutes.get("Social") ?? 0;
  if (socialMinutes > 0 && socialMinutes / totalMinutes > 0.2) {
    suggestions.push({
      id: "social",
      title: mt("suggestions.social.title"),
      detail: mt("suggestions.social.detail")
    });
  }
  const productiveMinutes = (categoryMinutes.get("Productivity") ?? 0) + (categoryMinutes.get("Education") ?? 0);
  if (productiveMinutes > 0 && productiveMinutes / totalMinutes > 0.5) {
    suggestions.push({
      id: "productive",
      title: mt("suggestions.productive.title"),
      detail: mt("suggestions.productive.detail")
    });
  }
  if (suggestions.length === 0) {
    suggestions.push({
      id: "balance",
      title: mt("suggestions.balance.title"),
      detail: mt("suggestions.balance.detail")
    });
  }
  suggestions.push({
    id: "breaks",
    title: mt("suggestions.breaks.title"),
    detail: mt("suggestions.breaks.detail")
  });
  return suggestions;
};
var buildTrayMenu = () => import_electron3.Menu.buildFromTemplate([
  {
    label: mt("native.trayShow"),
    click: () => {
      if (mainWindow) {
        mainWindow.show();
        mainWindow.focus();
      }
    }
  },
  { type: "separator" },
  {
    label: mt("native.trayQuit"),
    click: () => {
      isQuitting = true;
      import_electron3.app.quit();
    }
  }
]);
var updateTrayMenu = () => {
  if (!tray) return;
  tray.setToolTip(mt("native.trayTooltip"));
  tray.setContextMenu(buildTrayMenu());
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
  const trayIcon = import_electron3.nativeImage.createFromBuffer(canvas, { width: size, height: size });
  tray = new import_electron3.Tray(trayIcon);
  updateTrayMenu();
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
  return import_electron3.nativeImage.createFromBuffer(canvas, { width: size, height: size });
};
var createWindow = async () => {
  const appIcon = createAppIcon();
  mainWindow = new import_electron3.BrowserWindow({
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
    const indexPath = import_node_path.default.join(import_electron3.app.getAppPath(), "dist", "index.html");
    await mainWindow.loadFile(indexPath);
  }
};
var setAutoLaunch = (enable) => {
  if (process.platform !== "win32") return;
  import_electron3.app.setLoginItemSettings({
    openAtLogin: enable,
    path: import_electron3.app.getPath("exe")
  });
};
import_electron3.app.whenReady().then(() => {
  loadSettings();
  loadAlerts();
  import_electron3.ipcMain.handle("usage:snapshot", () => usageTracker.getSnapshot());
  import_electron3.ipcMain.handle("usage:clear", () => {
    usageTracker.clearData();
    return usageTracker.getSnapshot();
  });
  import_electron3.ipcMain.handle("theme:set", (_event, theme) => {
    applyThemeToWindow(theme);
    return true;
  });
  import_electron3.ipcMain.handle("suggestions:list", () => generateSuggestions());
  import_electron3.ipcMain.handle("notifications:summary", () => notificationTracker.getSummary());
  import_electron3.ipcMain.handle("settings:get", () => settings);
  import_electron3.ipcMain.handle("settings:set", (_event, newSettings) => {
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
    if (newSettings.language) {
      settings.language = normalizeLocale(newSettings.language);
      updateTrayMenu();
    }
    saveSettings();
    return settings;
  });
  import_electron3.ipcMain.handle("timelimits:get", () => settings.timeLimits);
  import_electron3.ipcMain.handle("timelimits:set", (_event, limits) => {
    settings.timeLimits = limits;
    saveSettings();
    return settings.timeLimits;
  });
  import_electron3.ipcMain.handle("timelimits:add", (_event, limit) => {
    settings.timeLimits = settings.timeLimits.filter((l) => l.appId !== limit.appId);
    settings.timeLimits.push(limit);
    saveSettings();
    return settings.timeLimits;
  });
  import_electron3.ipcMain.handle("timelimits:remove", (_event, appId) => {
    settings.timeLimits = settings.timeLimits.filter((l) => l.appId !== appId);
    saveSettings();
    return settings.timeLimits;
  });
  import_electron3.ipcMain.handle("timelimits:alerts", () => shownAlerts);
  createTray();
  createWindow();
  const timeLimitInterval = setInterval(checkTimeLimits, 3e4);
  setTimeout(checkTimeLimits, 5e3);
  import_electron3.app.on("activate", () => {
    if (import_electron3.BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    } else if (mainWindow) {
      mainWindow.show();
    }
  });
  import_electron3.app.on("will-quit", () => {
    clearInterval(timeLimitInterval);
  });
});
import_electron3.app.on("before-quit", () => {
  isQuitting = true;
});
import_electron3.app.on("window-all-closed", () => {
  if (process.platform === "darwin") {
  } else if (!settings.minimizeToTray) {
    usageTracker.dispose();
    notificationTracker.dispose();
    import_electron3.app.quit();
  }
});
import_electron3.app.on("will-quit", () => {
  usageTracker.dispose();
  notificationTracker.dispose();
  if (tray) {
    tray.destroy();
    tray = null;
  }
});
