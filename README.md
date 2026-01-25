# ScreenForge

ScreenForge is an open-source Windows screen time dashboard built with Electron + React + TypeScript. It shows usage by app/category, daily/weekly/monthly averages, notification counts, and productivity insights with modern theming.

## Demo Video

[![Demo Video](https://img.youtube.com/vi/8N5Uhrui0fw/0.jpg)](https://youtu.be/8N5Uhrui0fw?si=kvSaAMpmhRk1pWbv)


## Features

- Multi-theme UI (light, dark, tokyo, skin)
- Daily usage and category charts
- App usage table and notification summary
- Suggestions panel and focus insights
- Electron preload bridge (mock data today; ready for real Windows telemetry)

## Tech stack

- Electron (main + preload)
- React + TypeScript (renderer)
- Vite (dev/build)
- Chart.js (visualizations)

## Requirements

- Windows 10/11 (data collection uses Windows APIs)
- Node.js (LTS recommended)

## Installation

```bash
npm install
```

## Development

Run the app in dev mode (Vite + Electron):

```bash
npm run dev
```

Lint:

```bash
npm run lint
```

## Build

Build the renderer + Electron bundles:

```bash
npm run build
```

Run the built Electron main process (after build):

```bash
npm run electron:start
```

## Packaging

Build a Windows installer (NSIS):

```bash
npm run dist
```

Build a portable Windows binary:

```bash
npm run dist:portable
```

## Windows data collection

The app captures the active foreground app every 5 seconds using Windows APIs and aggregates usage locally for the current session. Notification counts are pulled from the Windows Notifications Platform event log and summarized per app.

If notification counts remain at 0, ensure the Windows Notifications Platform/Operational log is enabled in Event Viewer.

## Contributing

Contributions are welcome. If you’d like to add features, fix bugs, or improve docs, please see [CONTRIBUTING.md](CONTRIBUTING.md).

## License

ScreenForge is licensed under the MIT License. See [LICENSE.md](LICENSE.md).
