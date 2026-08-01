<h1 align="center">FRC Video Splitter</h1>

<p align="center">
  Split a long FRC event recording into clean, per-match video clips — aligned automatically from The Blue Alliance match schedule.
</p>

<p align="center">
  <img src="docs/images/hero.png" alt="FRC Video Splitter main window" width="900">
</p>

---

## What it does

If you record an entire FRC competition as one continuous video, FRC Video Splitter turns it into individual match clips without re-encoding. Pull the match schedule from [The Blue Alliance](https://www.thebluealliance.com), drag your recording into alignment on a visual timeline, and export every match to its own `.mp4` in a single pass.

- **TBA-driven match list** — import an event and its matches straight from The Blue Alliance; each match keeps its real wall-clock timing.
- **Visual timeline alignment** — line the whole recording up to the schedule with a single drag. Every match's start and end is derived from that one offset.
- **Lossless, fast splitting** — clips are cut with ffmpeg stream-copy (no re-encode), so exports are quick and keep the source quality.
- **Configurable clips** — control padding, match length, results footage, and whether to collapse dead air between gameplay and results.
- **Batch export with live progress** — export every match at once with per-match status and progress, plus CPU-scaled concurrency.
- **Session persistence** — your event, matches, alignment, and settings are saved automatically so you can pick up where you left off.

## Screenshots

> **Note:** Screenshots below are placeholders. Drop real PNGs into `docs/images/` using the referenced filenames to populate them.

| Timeline alignment | Batch export |
| --- | --- |
| ![Aligning the recording to the match schedule](docs/images/timeline.png) | ![Exporting matches with live progress](docs/images/export.png) |

| Clip settings | Event import |
| --- | --- |
| ![Clip settings](docs/images/settings.png) | ![Editing event details](docs/images/event.png) |

## How it works

1. **Load a recording.** One continuous video file per session.
2. **Import an event.** Look up an FRC event on The Blue Alliance (or enter it manually). Its matches populate the list with real match times.
3. **Align the video.** Drag the video bar on the **Event Timeline** until the recording lines up with the match schedule. All match timestamps update reactively from that single offset.
4. **Tune your clips.** Set padding, match/results length, and dead-air handling in **Settings → Preferences**.
5. **Export.** Choose an output folder and split every in-range match to its own `.mp4`.

Clips are cut per match into temporary blocks and concatenated with the ffmpeg concat demuxer — all stream-copied, never re-encoded. See [`CONTEXT.md`](CONTEXT.md) for the full domain model (clips, blocks, dead air, timestamp projection).

## Getting started

### Install & run

```bash
pnpm install
pnpm dev          # start the app in development (hot reload)
```

### Build a distributable

```bash
pnpm build        # production build → out/
pnpm release      # package with electron-builder → dist/
```

Requires Node.js 22+ and pnpm.

### The Blue Alliance API key

Importing events and matches needs a free TBA Read API key ([get one here](https://www.thebluealliance.com/account)). Provide it either way:

- **In the app:** *Settings → Preferences → The Blue Alliance API key*, or
- **Via env var:** copy `.env.example` to `.env` and set `VITE_TBA_API_KEY`.

## Tech stack

Electron + [`electron-vite`](https://electron-vite.org), React 19, Tailwind 4, shadcn/ui, and Zustand. Video work is handled in the main process via the [`mediaforge`](https://www.npmjs.com/package/mediaforge) ffmpeg wrapper, with the binary from `@ffmpeg-installer/ffmpeg`. TBA data is fetched with TanStack Query.

Architecture notes for contributors live in [`CLAUDE.md`](CLAUDE.md).

## License

MIT © Ty Tremblay
