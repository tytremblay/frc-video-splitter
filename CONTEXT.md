---
name: frc-video-splitter
---

## Glossary

### Recording
A single continuous video file covering some portion of an FRC event. One recording is loaded per session. Users with multiple files must run the tool once per file.

### Event
An FRC competition (e.g. "Week 1 — Greater Pittsburgh"). Metadata (name, location, dates) can be imported from The Blue Alliance or entered manually. An event is used for context only — it does not constrain which matches can be created.

### Match
A single FRC game played on the field. Represented in the app as a `SplitterMatch` with a name, description, source video path, and optional start/end timestamps within the recording. Matches can be imported from TBA or created manually.

### Video Offset
The wall-clock time (Unix seconds) that corresponds to the start of the loaded recording. Set by the user dragging the video bar on the Event Timeline until it aligns with the known match schedule. All match timestamps are derived from this single value.

### Timestamp
A position in seconds within the recording marking either the start (`fromSeconds`) or end (`toSeconds`) of a match clip. Derived reactively from the Video Offset whenever it changes:

- **Start**: `match.actualTime - videoOffset`
- **End**: `match.postResultTime - videoOffset`

Matches without `actualTime` or `postResultTime` (Orphan Matches) have no timestamps and cannot be exported. Timestamps are cleared when a new recording is loaded.

### Clip
The output video file produced for a single match. Named `<matchName>.mp4` and written to the user-chosen output directory. A clip is composed of one or two **blocks** derived from user settings:

- **Match block**: `[fromSeconds - startPaddingSeconds, fromSeconds + matchLengthSeconds + endPaddingSeconds]`
- **Results block**: `[toSeconds - startPaddingSeconds, toSeconds + resultsLengthSeconds + endPaddingSeconds]`
- If the dead air gap between the two blocks is ≤ `deadAirThresholdSeconds` (or `clipDeadAir` is disabled), the blocks are merged into one continuous block.
- **Dead air gap**: `(toSeconds - startPaddingSeconds) - (fromSeconds + matchLengthSeconds + endPaddingSeconds)`

Blocks are computed in the renderer from `SplitterMatch` timestamps and user settings before being passed over IPC as a `SplitFixedDetails`. The main process receives fully-resolved blocks and executes ffmpeg without any settings knowledge.

### Match Split Status
The per-match state shown in the Splitting Section during export preparation and execution:

| Status | Meaning |
|---|---|
| `ready` | Match fully contained within the recording; can be split |
| `warning` | Match partially overlaps the recording (`fromSeconds < 0` or `toSeconds > durationSeconds`); will be clipped at the video edge |
| `splitting` | ffmpeg is actively processing this match |
| `split` | Match has been successfully exported to a clip |

`error` is reserved for future use. Status is local UI state — it is not persisted and resets when a new split run begins.

### Settings
User-configurable values that control clip generation:

| Setting | Default | Description |
|---|---|---|
| `startPaddingSeconds` | 3 | Seconds before `fromSeconds` / `toSeconds` to begin each block |
| `endPaddingSeconds` | 3 | Seconds after the match block end / results block end |
| `matchLengthSeconds` | 135 | Duration of match gameplay after kickoff (`fromSeconds`) |
| `resultsLengthSeconds` | 10 | Duration of results screen footage after `toSeconds` |
| `clipDeadAir` | false | Whether to cut the gap between match and results blocks |
| `deadAirThresholdSeconds` | 30 | Minimum gap duration that triggers a dead air cut |

### Event Timeline
A vertical, scrollable visualization of all matches in wall-clock time. Match blocks are proportional in height to their duration (`actual_time` → `post_result_time`). Gaps between matches represent real downtime and are rendered as empty space. Matches without TBA timing data ("orphan matches") appear as fixed-height blocks below the timed section, visually distinct. Scroll pans the timeline; Ctrl+scroll zooms (adjusts pixels-per-second). Clicking a match selects it and seeks the video to its `fromSeconds`. The timeline lives alongside the `MatchesTable` behind a tab toggle in the main content area.

### Orphan Match
A match with no `actualTime` or `postResultTime` — either created manually or imported from TBA with incomplete data. Cannot be positioned on the Event Timeline by wall-clock time; rendered as a fixed-height block in a separate section below timed matches.

### Session Persistence
The full session state (event, matches with timestamps, video path, output directory, settings) is auto-saved to disk via `electron-store` so users can resume across restarts.
