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

// electron/notifications.ts
var import_node_child_process = require("node:child_process");
var import_node_util = require("node:util");
var execFileAsync = (0, import_node_util.promisify)(import_node_child_process.execFile);
var appIdMap = [
  { match: /microsoft\.microsoftedge|msedge/i, appId: "msedge" },
  { match: /chrome/i, appId: "chrome" },
  { match: /discord/i, appId: "discord" },
  { match: /spotify/i, appId: "spotify" },
  { match: /steam/i, appId: "steam" },
  { match: /teams/i, appId: "teams" },
  { match: /outlook/i, appId: "outlook" }
];
var mapAppId = (raw) => {
  if (!raw) return "other";
  const found = appIdMap.find((entry) => entry.match.test(raw));
  return found?.appId ?? "other";
};
var queryNotificationEvents = async (sinceIso) => {
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
`;
  const { stdout } = await execFileAsync("powershell", [
    "-NoProfile",
    "-ExecutionPolicy",
    "Bypass",
    "-Command",
    script
  ]);
  if (!stdout) return [];
  try {
    const parsed = JSON.parse(stdout);
    if (Array.isArray(parsed)) return parsed;
    return [parsed];
  } catch {
    return [];
  }
};
var createNotificationTracker = () => {
  let lastPoll = new Date(Date.now() - 6e4).toISOString();
  const counts = /* @__PURE__ */ new Map();
  const poll = async () => {
    const events = await queryNotificationEvents(lastPoll);
    lastPoll = (/* @__PURE__ */ new Date()).toISOString();
    for (const event of events) {
      const appKey = mapAppId(event.appId);
      counts.set(appKey, (counts.get(appKey) ?? 0) + 1);
    }
  };
  const getSummary = async () => {
    await poll();
    const perApp = {};
    for (const [appId, count] of counts.entries()) {
      perApp[appId] = count;
    }
    return {
      total: Object.values(perApp).reduce((sum, value) => sum + value, 0),
      perApp
    };
  };
  return { getSummary };
};

// electron/telemetry.ts
var import_node_child_process2 = require("node:child_process");
var import_node_util2 = require("node:util");
var import_electron = require("electron");
var fs = __toESM(require("node:fs"), 1);
var path = __toESM(require("node:path"), 1);
var execFileAsync2 = (0, import_node_util2.promisify)(import_node_child_process2.execFile);
var appCatalog = [
  { id: "code", name: "VS Code", category: "Productivity", color: "#35a7ff" },
  { id: "msedge", name: "Microsoft Edge", category: "Productivity", color: "#4f8bff" },
  { id: "chrome", name: "Google Chrome", category: "Productivity", color: "#f7b955" },
  { id: "firefox", name: "Firefox", category: "Productivity", color: "#ff6611" },
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
  { pattern: /^msedge$/i, appId: "msedge" },
  { pattern: /^chrome$/i, appId: "chrome" },
  { pattern: /^firefox$/i, appId: "firefox" },
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
var toDisplayName = (value) => value.replace(/[-_]+/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
var getDataPath = () => {
  const userDataPath = import_electron.app.getPath("userData");
  return path.join(userDataPath, "usage-data.json");
};
var loadPersistedData = () => {
  const dataPath = getDataPath();
  const map = /* @__PURE__ */ new Map();
  try {
    if (fs.existsSync(dataPath)) {
      const raw = fs.readFileSync(dataPath, "utf8");
      const data = JSON.parse(raw);
      for (const [key, value] of Object.entries(data)) {
        map.set(key, value);
      }
    }
  } catch {
  }
  return map;
};
var savePersistedData = (totals) => {
  const dataPath = getDataPath();
  const data = {};
  for (const [key, value] of totals.entries()) {
    data[key] = value;
  }
  try {
    const dir = path.dirname(dataPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
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
  for (const app3 of appCatalog) {
    appLookup.set(app3.id, app3);
  }
  appLookup.set(unknownApp.id, unknownApp);
  const totals = loadPersistedData();
  let interval = null;
  let saveInterval = null;
  const tickMs = 1e3;
  let lastAppId = null;
  let lastTimestamp = Date.now();
  let activeAppId = null;
  let runningApps = [];
  const record = (appId, deltaSeconds) => {
    if (!appId || deltaSeconds <= 0) return;
    const today = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
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
    savePersistedData(totals);
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
        (app3) => usedAppIds.has(app3.id)
      );
      return { apps, usageEntries: entries, activeAppId, runningApps };
    },
    clearData: () => {
      totals.clear();
      savePersistedData(totals);
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
      savePersistedData(totals);
    }
  };
};

// electron/main.ts
var { app: app2, BrowserWindow, Tray, Menu, nativeImage } = electron;
var { ipcMain } = electron;
var isDev = Boolean(process.env.VITE_DEV_SERVER_URL);
var usageTracker = createUsageTracker();
var notificationTracker = createNotificationTracker();
var mainWindow = null;
var tray = null;
var isQuitting = false;
var settings = {
  minimizeToTray: true,
  startWithWindows: false
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
  const iconSize = 16;
  const icon = nativeImage.createEmpty();
  const iconPath = isDev ? import_node_path.default.join(__dirname, "..", "public", "icon.png") : import_node_path.default.join(app2.getAppPath(), "dist", "icon.png");
  let trayIcon;
  try {
    trayIcon = nativeImage.createFromPath(iconPath);
    if (trayIcon.isEmpty()) {
      throw new Error("Icon not found");
    }
  } catch {
    const canvas = Buffer.alloc(16 * 16 * 4);
    for (let i = 0; i < 16 * 16; i++) {
      canvas[i * 4] = 79;
      canvas[i * 4 + 1] = 139;
      canvas[i * 4 + 2] = 255;
      canvas[i * 4 + 3] = 255;
    }
    trayIcon = nativeImage.createFromBuffer(canvas, { width: 16, height: 16 });
  }
  tray = new Tray(trayIcon.resize({ width: 16, height: 16 }));
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
        app2.quit();
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
var createWindow = async () => {
  mainWindow = new BrowserWindow({
    width: 1240,
    height: 820,
    minWidth: 980,
    minHeight: 640,
    backgroundColor: "#0b0d12",
    show: false,
    frame: true,
    autoHideMenuBar: true,
    webPreferences: {
      preload: import_node_path.default.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
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
    const indexPath = import_node_path.default.join(app2.getAppPath(), "dist", "index.html");
    await mainWindow.loadFile(indexPath);
  }
};
var setAutoLaunch = (enable) => {
  if (process.platform !== "win32") return;
  app2.setLoginItemSettings({
    openAtLogin: enable,
    path: app2.getPath("exe")
  });
};
app2.whenReady().then(() => {
  ipcMain.handle("usage:snapshot", () => usageTracker.getSnapshot());
  ipcMain.handle("usage:clear", () => {
    usageTracker.clearData();
    return usageTracker.getSnapshot();
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
    return settings;
  });
  createTray();
  createWindow();
  app2.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    } else if (mainWindow) {
      mainWindow.show();
    }
  });
});
app2.on("before-quit", () => {
  isQuitting = true;
});
app2.on("window-all-closed", () => {
  if (process.platform === "darwin") {
  } else if (!settings.minimizeToTray) {
    usageTracker.dispose();
    app2.quit();
  }
});
app2.on("will-quit", () => {
  usageTracker.dispose();
  if (tray) {
    tray.destroy();
    tray = null;
  }
});
