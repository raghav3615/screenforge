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

// src/data/mock.ts
var apps = [
  { id: "edge", name: "Microsoft Edge", category: "Productivity", color: "#4f8bff" },
  { id: "vscode", name: "VS Code", category: "Productivity", color: "#35a7ff" },
  { id: "discord", name: "Discord", category: "Social", color: "#8c7dff" },
  { id: "spotify", name: "Spotify", category: "Entertainment", color: "#2ed47a" },
  { id: "steam", name: "Steam", category: "Entertainment", color: "#ff8b6a" },
  { id: "teams", name: "Microsoft Teams", category: "Communication", color: "#5b7cfa" },
  { id: "notion", name: "Notion", category: "Education", color: "#1f1f1f" },
  { id: "outlook", name: "Outlook", category: "Communication", color: "#2f6fff" }
];
var days = [
  "2026-01-04",
  "2026-01-05",
  "2026-01-06",
  "2026-01-07",
  "2026-01-08",
  "2026-01-09",
  "2026-01-10",
  "2026-01-11",
  "2026-01-12",
  "2026-01-13",
  "2026-01-14",
  "2026-01-15",
  "2026-01-16",
  "2026-01-17"
];
var entry = (date, appId, minutes, notifications) => ({
  date,
  appId,
  minutes,
  notifications
});
var usageEntries = [
  entry(days[0], "edge", 92, 14),
  entry(days[0], "vscode", 180, 3),
  entry(days[0], "discord", 68, 22),
  entry(days[0], "spotify", 55, 2),
  entry(days[0], "steam", 28, 1),
  entry(days[0], "teams", 34, 8),
  entry(days[0], "notion", 40, 0),
  entry(days[0], "outlook", 20, 6),
  entry(days[1], "edge", 105, 12),
  entry(days[1], "vscode", 165, 4),
  entry(days[1], "discord", 74, 18),
  entry(days[1], "spotify", 48, 1),
  entry(days[1], "steam", 40, 1),
  entry(days[1], "teams", 50, 9),
  entry(days[1], "notion", 32, 0),
  entry(days[1], "outlook", 18, 4),
  entry(days[2], "edge", 85, 11),
  entry(days[2], "vscode", 190, 5),
  entry(days[2], "discord", 61, 19),
  entry(days[2], "spotify", 70, 2),
  entry(days[2], "steam", 22, 0),
  entry(days[2], "teams", 48, 7),
  entry(days[2], "notion", 28, 0),
  entry(days[2], "outlook", 24, 5),
  entry(days[3], "edge", 98, 9),
  entry(days[3], "vscode", 210, 3),
  entry(days[3], "discord", 55, 20),
  entry(days[3], "spotify", 44, 1),
  entry(days[3], "steam", 34, 1),
  entry(days[3], "teams", 42, 6),
  entry(days[3], "notion", 35, 0),
  entry(days[3], "outlook", 16, 4),
  entry(days[4], "edge", 110, 16),
  entry(days[4], "vscode", 175, 4),
  entry(days[4], "discord", 70, 26),
  entry(days[4], "spotify", 60, 2),
  entry(days[4], "steam", 45, 1),
  entry(days[4], "teams", 58, 12),
  entry(days[4], "notion", 42, 0),
  entry(days[4], "outlook", 21, 6),
  entry(days[5], "edge", 95, 10),
  entry(days[5], "vscode", 160, 3),
  entry(days[5], "discord", 88, 30),
  entry(days[5], "spotify", 62, 1),
  entry(days[5], "steam", 60, 2),
  entry(days[5], "teams", 35, 8),
  entry(days[5], "notion", 40, 0),
  entry(days[5], "outlook", 18, 5),
  entry(days[6], "edge", 70, 9),
  entry(days[6], "vscode", 140, 2),
  entry(days[6], "discord", 120, 34),
  entry(days[6], "spotify", 90, 2),
  entry(days[6], "steam", 85, 3),
  entry(days[6], "teams", 20, 5),
  entry(days[6], "notion", 25, 0),
  entry(days[6], "outlook", 12, 3),
  entry(days[7], "edge", 88, 10),
  entry(days[7], "vscode", 150, 4),
  entry(days[7], "discord", 76, 21),
  entry(days[7], "spotify", 55, 1),
  entry(days[7], "steam", 40, 1),
  entry(days[7], "teams", 36, 8),
  entry(days[7], "notion", 30, 0),
  entry(days[7], "outlook", 17, 4),
  entry(days[8], "edge", 112, 15),
  entry(days[8], "vscode", 195, 4),
  entry(days[8], "discord", 63, 18),
  entry(days[8], "spotify", 58, 1),
  entry(days[8], "steam", 36, 1),
  entry(days[8], "teams", 44, 9),
  entry(days[8], "notion", 33, 0),
  entry(days[8], "outlook", 23, 5),
  entry(days[9], "edge", 104, 13),
  entry(days[9], "vscode", 200, 3),
  entry(days[9], "discord", 58, 17),
  entry(days[9], "spotify", 52, 1),
  entry(days[9], "steam", 30, 1),
  entry(days[9], "teams", 46, 10),
  entry(days[9], "notion", 36, 0),
  entry(days[9], "outlook", 20, 5),
  entry(days[10], "edge", 97, 11),
  entry(days[10], "vscode", 170, 3),
  entry(days[10], "discord", 80, 24),
  entry(days[10], "spotify", 73, 2),
  entry(days[10], "steam", 55, 2),
  entry(days[10], "teams", 39, 7),
  entry(days[10], "notion", 27, 0),
  entry(days[10], "outlook", 16, 4),
  entry(days[11], "edge", 90, 10),
  entry(days[11], "vscode", 185, 4),
  entry(days[11], "discord", 72, 22),
  entry(days[11], "spotify", 66, 1),
  entry(days[11], "steam", 48, 2),
  entry(days[11], "teams", 41, 8),
  entry(days[11], "notion", 31, 0),
  entry(days[11], "outlook", 19, 4),
  entry(days[12], "edge", 103, 13),
  entry(days[12], "vscode", 210, 5),
  entry(days[12], "discord", 67, 19),
  entry(days[12], "spotify", 59, 1),
  entry(days[12], "steam", 42, 1),
  entry(days[12], "teams", 53, 10),
  entry(days[12], "notion", 38, 0),
  entry(days[12], "outlook", 22, 6),
  entry(days[13], "edge", 120, 17),
  entry(days[13], "vscode", 175, 4),
  entry(days[13], "discord", 92, 30),
  entry(days[13], "spotify", 74, 2),
  entry(days[13], "steam", 64, 2),
  entry(days[13], "teams", 60, 13),
  entry(days[13], "notion", 45, 0),
  entry(days[13], "outlook", 26, 7)
];
var suggestions = [
  {
    id: "focus-1",
    title: "Schedule a focus block",
    detail: "Social apps spiked late evening. Try a 30\u2011minute focus block after 8 PM."
  },
  {
    id: "break-1",
    title: "Take micro breaks",
    detail: "You averaged 3h 5m on productivity apps. Add a 5\u2011minute break every hour."
  },
  {
    id: "mute-1",
    title: "Mute noisy apps",
    detail: "Discord and Teams sent 62% of notifications. Consider quiet hours."
  }
];

// electron/preload.ts
var { contextBridge, ipcRenderer } = electron;
var api = {
  getUsageSnapshot: async () => {
    try {
      const snapshot = await ipcRenderer.invoke("usage:snapshot");
      return { generatedAt: (/* @__PURE__ */ new Date()).toISOString(), ...snapshot };
    } catch {
      return {
        generatedAt: (/* @__PURE__ */ new Date()).toISOString(),
        apps,
        usageEntries
      };
    }
  },
  getSuggestionFeed: async () => {
    try {
      return await ipcRenderer.invoke("suggestions:list");
    } catch {
      return suggestions;
    }
  },
  getNotificationSummary: async () => {
    try {
      return await ipcRenderer.invoke("notifications:summary");
    } catch {
      const counts = usageEntries.reduce((acc, entry2) => {
        acc[entry2.appId] = (acc[entry2.appId] ?? 0) + entry2.notifications;
        return acc;
      }, {});
      return {
        total: Object.values(counts).reduce((sum, value) => sum + value, 0),
        perApp: counts
      };
    }
  }
};
contextBridge.exposeInMainWorld("screenforge", api);
