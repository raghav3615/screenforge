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

// electron/telemetry.ts
var import_node_child_process = require("node:child_process");
var import_node_util = require("node:util");
var execFileAsync = (0, import_node_util.promisify)(import_node_child_process.execFile);
var appCatalog = [
  { id: "code", name: "VS Code", category: "Productivity", color: "#35a7ff" },
  { id: "msedge", name: "Microsoft Edge", category: "Productivity", color: "#4f8bff" },
  { id: "chrome", name: "Google Chrome", category: "Productivity", color: "#f7b955" },
  { id: "discord", name: "Discord", category: "Social", color: "#8c7dff" },
  { id: "spotify", name: "Spotify", category: "Entertainment", color: "#2ed47a" },
  { id: "steam", name: "Steam", category: "Entertainment", color: "#ff8b6a" },
  { id: "teams", name: "Microsoft Teams", category: "Communication", color: "#5b7cfa" },
  { id: "outlook", name: "Outlook", category: "Communication", color: "#2f6fff" },
  { id: "explorer", name: "File Explorer", category: "Utilities", color: "#9aa0ff" }
];
var processMap = {
  Code: "code",
  msedge: "msedge",
  chrome: "chrome",
  Discord: "discord",
  Spotify: "spotify",
  steam: "steam",
  Teams: "teams",
  OUTLOOK: "outlook",
  explorer: "explorer"
};
var unknownApp = {
  id: "other",
  name: "Other apps",
  category: "Other",
  color: "#6b7280"
};
var getActiveApp = async () => {
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
`;
  try {
    const { stdout } = await execFileAsync("powershell", [
      "-NoProfile",
      "-ExecutionPolicy",
      "Bypass",
      "-Command",
      script
    ]);
    if (!stdout) return null;
    const parsed = JSON.parse(stdout);
    if (!parsed?.process) return null;
    return parsed;
  } catch {
    return null;
  }
};
var createUsageTracker = () => {
  const appLookup = /* @__PURE__ */ new Map();
  for (const app2 of appCatalog) {
    appLookup.set(app2.id, app2);
  }
  appLookup.set(unknownApp.id, unknownApp);
  const totals = /* @__PURE__ */ new Map();
  let interval = null;
  const tickMs = 5e3;
  const record = (appId, deltaSeconds) => {
    const today = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
    const key = `${today}:${appId}`;
    totals.set(key, (totals.get(key) ?? 0) + deltaSeconds);
  };
  const poll = async () => {
    const active = await getActiveApp();
    const mapped = active ? processMap[active.process] ?? "other" : "other";
    record(mapped, tickMs / 1e3);
  };
  interval = setInterval(poll, tickMs);
  poll();
  return {
    apps: Array.from(appLookup.values()),
    getSnapshot: () => {
      const entries = [];
      for (const [key, seconds] of totals.entries()) {
        const [date, appId] = key.split(":");
        entries.push({
          date,
          appId,
          minutes: Math.max(1, Math.round(seconds / 60)),
          notifications: 0
        });
      }
      return { apps: Array.from(appLookup.values()), usageEntries: entries };
    },
    dispose: () => {
      if (interval) {
        clearInterval(interval);
        interval = null;
      }
    }
  };
};

// electron/main.ts
var { app, BrowserWindow } = electron;
var { ipcMain } = electron;
var isDev = Boolean(process.env.VITE_DEV_SERVER_URL);
var usageTracker = createUsageTracker();
var createWindow = async () => {
  const mainWindow = new BrowserWindow({
    width: 1240,
    height: 820,
    minWidth: 980,
    minHeight: 640,
    backgroundColor: "#0b0d12",
    show: false,
    titleBarStyle: "hiddenInset",
    webPreferences: {
      preload: import_node_path.default.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  });
  mainWindow.once("ready-to-show", () => {
    mainWindow.show();
  });
  if (isDev && process.env.VITE_DEV_SERVER_URL) {
    await mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
    mainWindow.webContents.openDevTools({ mode: "detach" });
  } else {
    await mainWindow.loadFile(import_node_path.default.join(app.getAppPath(), "dist", "index.html"));
  }
};
app.whenReady().then(() => {
  ipcMain.handle("usage:snapshot", () => usageTracker.getSnapshot());
  ipcMain.handle("suggestions:list", () => [
    {
      id: "focus-1",
      title: "Schedule a focus block",
      detail: "Apps with frequent switches detected. Try a 30\u2011minute focus block."
    },
    {
      id: "break-1",
      title: "Take micro breaks",
      detail: "You have been active continuously for over an hour. Add a 5\u2011minute break."
    }
  ]);
  ipcMain.handle("notifications:summary", () => ({ total: 0, perApp: {} }));
  createWindow();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    usageTracker.dispose();
    app.quit();
  }
});
