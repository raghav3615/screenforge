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
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// electron/preload.ts
var preload_exports = {};
module.exports = __toCommonJS(preload_exports);
var electron = __toESM(require("electron"), 1);
var { contextBridge, ipcRenderer } = electron;
var api = {
  getUsageSnapshot: async () => {
    try {
      const snapshot = await ipcRenderer.invoke("usage:snapshot");
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
      return await ipcRenderer.invoke("suggestions:list");
    } catch {
      return [];
    }
  },
  clearUsageData: async () => {
    try {
      return await ipcRenderer.invoke("usage:clear");
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
      return await ipcRenderer.invoke("notifications:summary");
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
      return await ipcRenderer.invoke("theme:set", theme);
    } catch {
      return false;
    }
  },
  // Settings
  getSettings: async () => {
    try {
      return await ipcRenderer.invoke("settings:get");
    } catch {
      return {
        minimizeToTray: true,
        startWithWindows: false,
        timeLimits: [],
        timeLimitNotificationsEnabled: true
      };
    }
  },
  setSettings: async (settings) => {
    try {
      return await ipcRenderer.invoke("settings:set", settings);
    } catch {
      return {
        minimizeToTray: true,
        startWithWindows: false,
        timeLimits: [],
        timeLimitNotificationsEnabled: true
      };
    }
  },
  // Time limits
  getTimeLimits: async () => {
    try {
      return await ipcRenderer.invoke("timelimits:get");
    } catch {
      return [];
    }
  },
  setTimeLimits: async (limits) => {
    try {
      return await ipcRenderer.invoke("timelimits:set", limits);
    } catch {
      return [];
    }
  },
  addTimeLimit: async (limit) => {
    try {
      return await ipcRenderer.invoke("timelimits:add", limit);
    } catch {
      return [];
    }
  },
  removeTimeLimit: async (appId) => {
    try {
      return await ipcRenderer.invoke("timelimits:remove", appId);
    } catch {
      return [];
    }
  },
  getTimeLimitAlerts: async () => {
    try {
      return await ipcRenderer.invoke("timelimits:alerts");
    } catch {
      return [];
    }
  },
  // Event listeners
  onTimeLimitExceeded: (callback) => {
    const handler = (_event, data) => {
      callback(data);
    };
    ipcRenderer.on("time-limit-exceeded", handler);
    return () => {
      ipcRenderer.removeListener("time-limit-exceeded", handler);
    };
  }
};
contextBridge.exposeInMainWorld("screenforge", api);
