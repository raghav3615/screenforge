# ScreenForge

ScreenForge is a Windows screen time dashboard built with Electron + React + TypeScript. It shows usage by app/category, daily/weekly/monthly averages, notification counts, and insights with modern theming.

## Features

- Multi-theme UI: light, dark, tokyo, skin
- Daily usage and category charts
- App usage table and notification summary
- Suggestions panel and focus insights
- Mock data wired through an Electron preload bridge (ready for real Windows telemetry)

## Getting started

Install dependencies:

```
npm install
```

Run the app in development mode (Vite + Electron):

```
npm run dev
```

Build renderer + Electron bundles:

```
npm run build
```

Run the packaged Electron main process (after build):

```
npm run electron:start
```

Build a Windows EXE installer:

```
npm run dist
```

## Windows data collection

The app captures the active foreground app every 5 seconds using Windows APIs and aggregates usage locally for the current session. Notification counts are pulled from the Windows Notifications Platform event log and summarized per app.

If notification counts remain at 0, ensure the Windows Notifications Platform/Operational log is enabled in Event Viewer.
