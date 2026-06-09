# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev          # Start Electron app in development mode (hot reload)
pnpm build        # Build for production (outputs to out/)
pnpm release      # Package distributable with electron-builder (outputs to dist/)
```

There are no tests in this project.

## Architecture

This is an **Electron desktop app** built with `electron-vite`. It splits FRC (FIRST Robotics Competition) match recordings into individual match video files using ffmpeg.

### Process boundaries

The app has three Electron processes:

- **Main** (`src/main/`) — Node.js process. Handles file system access, ffmpeg execution, and native dialogs. All heavy work (video splitting) happens here.
- **Preload** (`src/preload/index.ts`) — Bridge that exposes a typed `IpcApi` to the renderer via `contextBridge.exposeInMainWorld('ipc', api)`.
- **Renderer** (`src/renderer/src/`) — React 19 + Tailwind 4 UI. Accesses native features only through `window.ipc`.

### IPC contract

`src/shared/ipc.ts` defines `IpcChannel` (enum of channel names) and `IpcApi` (the interface exposed to the renderer). `src/shared/types.ts` defines the shared data types (`SplitFixedDetails`, `SplitBlock`). Any new IPC channel must be added to both files and wired up in `src/main/ipc.ts` and `src/preload/index.ts`.

### Video splitting pipeline

`src/main/helpers/ffmpegCommands.ts` uses the `mediaforge` library. The flow for one match:
1. `splitVideoFile` — cuts each `SplitBlock` (start + duration) into a temp `.mp4` clip using stream-copy (no re-encode).
2. `concatVideoFiles` — concatenates clips into the final output via ffmpeg concat demuxer.
3. Progress is emitted over IPC at ~1 Hz via `SplitProgress` events.

ffmpeg binary comes from `@ffmpeg-installer/ffmpeg` and must be referenced from `app.asar.unpacked` at runtime.

### Renderer state

Global state lives in four Zustand stores (`src/renderer/src/state/`):
- `useEvent` — current FRC event metadata (name, dates, location, optional TBA event object)
- `useMatches` — list of `SplitterMatch` objects. Each match has optional `actualTime`/`postResultTime` (Unix timestamps from TBA) and `fromSeconds`/`toSeconds` (video-relative offsets used by ffmpeg, derived automatically via `setVideoTimelineOffset`).
- `useVideo` — video player state: path, duration, `currentSeconds`, and `videoTimelineOffsetSecs` (the offset that maps video time to TBA wall-clock time).
- `useSettings` — persisted settings (TBA API key, split timing defaults like padding, match length, break-collapsing thresholds). Uses `zustand/middleware` `persist` under the key `frc-video-splitter-settings`.

Stores are plain Zustand slices; mutations go through exported helper functions rather than direct `setState` calls in components.

### Video-timeline alignment

`videoTimelineOffsetSecs` is the key that links a loaded video file to TBA match times. Calling `setVideoTimelineOffset(secs)` stores the offset and immediately recomputes `fromSeconds`/`toSeconds` on every match in `useMatches` (`fromSeconds = actualTime - offset`). The user sets this by dragging the video bar on the timeline. When a video is first loaded, the offset auto-initializes to `timelineStart`.

### Custom hooks

- `useTBAMatchSync` (`src/renderer/src/state/useTBAMatchSync.ts`) — React Query hook mounted at the app root. Fetches `https://www.thebluealliance.com/api/v3/event/:key/matches` when a TBA event is selected and calls `setMatchesFromTBA` to populate `useMatches`. The TBA auth key comes from `useSettings.tbaApiKey` (or `VITE_TBA_API_KEY` env var).
- `useSplitOperation` (`src/renderer/src/state/useSplitOperation.ts`) — local React hook (not a Zustand store) that manages transient per-match split status (`statusMap`) and progress percentages (`progressMap`). Subscribes to `onSplitStart/Progress/End` IPC events and calls `window.ipc.splitMatches`.

### TBA integration

`src/renderer/src/tba/TBATypes.ts` contains TypeScript types mirroring The Blue Alliance API v3 responses. `setMatchesFromTBA` and `setEventFromTBA` in the state files translate TBA data into local app types. The app uses `@tanstack/react-query` v5 for TBA API calls; `QueryClientProvider` wraps the app in `App.tsx`.

### UI components

shadcn/ui components are installed into `src/renderer/src/components/ui/` (aliased as `@/components/ui`). The shadcn config is in `components.json`. Add new components with `pnpm dlx shadcn@latest add <component>`.

### Build config

`electron.vite.config.ts` configures three Vite bundles (main, preload, renderer). `electron-builder.yml` controls packaging. The `@ffmpeg-installer/ffmpeg` binary is marked `asarUnpack` so it remains accessible at runtime outside the asar archive.
