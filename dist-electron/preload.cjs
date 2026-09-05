var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// electron/preload.ts
var preload_exports = {};
module.exports = __toCommonJS(preload_exports);
var import_electron = require("electron");
var api = {
  getUsageSnapshot: async () => {
    try {
      const snapshot = await import_electron.ipcRenderer.invoke("usage:snapshot");
      return { generatedAt: (/* @__PURE__ */ new Date()).toISOString(), ...snapshot };
    } catch {
      return {
        generatedAt: (/* @__PURE__ */ new Date()).toISOString(),
        apps: [],
        usageEntries: [],
        activeAppId: null,
        runningApps: []
      };
    }
  },
  getSuggestionFeed: async () => {
    try {
      return await import_electron.ipcRenderer.invoke("suggestions:list");
    } catch {
      return [];
    }
  },
  clearUsageData: async () => {
    try {
      return await import_electron.ipcRenderer.invoke("usage:clear");
    } catch {
      return {
        generatedAt: (/* @__PURE__ */ new Date()).toISOString(),
        apps: [],
        usageEntries: [],
        activeAppId: null,
        runningApps: []
      };
    }
  },
  getNotificationSummary: async () => {
    try {
      return await import_electron.ipcRenderer.invoke("notifications:summary");
    } catch {
      return {
        total: 0,
        perApp: {},
        status: "error"
      };
    }
  },
  setTheme: async (theme) => {
    try {
      return await import_electron.ipcRenderer.invoke("theme:set", theme);
    } catch {
      return false;
    }
  },
  // Settings
  getSettings: async () => {
    try {
      return await import_electron.ipcRenderer.invoke("settings:get");
    } catch {
      return {
        minimizeToTray: true,
        startWithWindows: false,
        timeLimits: [],
        timeLimitNotificationsEnabled: true,
        language: "zh-CN"
      };
    }
  },
  setSettings: async (settings) => {
    try {
      return await import_electron.ipcRenderer.invoke("settings:set", settings);
    } catch {
      return {
        minimizeToTray: true,
        startWithWindows: false,
        timeLimits: [],
        timeLimitNotificationsEnabled: true,
        language: "zh-CN"
      };
    }
  },
  // Time limits
  getTimeLimits: async () => {
    try {
      return await import_electron.ipcRenderer.invoke("timelimits:get");
    } catch {
      return [];
    }
  },
  setTimeLimits: async (limits) => {
    try {
      return await import_electron.ipcRenderer.invoke("timelimits:set", limits);
    } catch {
      return [];
    }
  },
  addTimeLimit: async (limit) => {
    try {
      return await import_electron.ipcRenderer.invoke("timelimits:add", limit);
    } catch {
      return [];
    }
  },
  removeTimeLimit: async (appId) => {
    try {
      return await import_electron.ipcRenderer.invoke("timelimits:remove", appId);
    } catch {
      return [];
    }
  },
  getTimeLimitAlerts: async () => {
    try {
      return await import_electron.ipcRenderer.invoke("timelimits:alerts");
    } catch {
      return [];
    }
  },
  // Event listeners
  onTimeLimitExceeded: (callback) => {
    const handler = (_event, data) => {
      callback(data);
    };
    import_electron.ipcRenderer.on("time-limit-exceeded", handler);
    return () => {
      import_electron.ipcRenderer.removeListener("time-limit-exceeded", handler);
    };
  }
};
import_electron.contextBridge.exposeInMainWorld("screenforge", api);
