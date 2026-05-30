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

Global state lives in three Zustand stores (`src/renderer/src/state/`):
- `useEvent` — current FRC event metadata (name, dates, location, optional TBA event object)
- `useMatches` — list of `SplitterMatch` objects (id, name, description, source video path, optional from/to timestamps)
- `useVideo` — current video player state (file path, current playback position in seconds)

Stores are plain Zustand slices; mutations go through exported helper functions (`setEvent`, `updateMatch`, `setCurrentSeconds`, etc.) rather than direct `setState` calls in components.

### TBA integration

`src/renderer/src/tba/TBATypes.ts` contains TypeScript types mirroring The Blue Alliance API responses. `setMatchesFromTBA` and `setEventFromTBA` in the state files translate TBA data into local app types.

### UI components

shadcn/ui components are installed into `src/shared/components/ui/`. The shadcn config is in `components.json`. Add new components with `pnpm dlx shadcn@latest add <component>`.

### Build config

`electron.vite.config.ts` configures three Vite bundles (main, preload, renderer). `electron-builder.yml` controls packaging. The `@ffmpeg-installer/ffmpeg` binary is marked `asarUnpack` so it remains accessible at runtime outside the asar archive.
