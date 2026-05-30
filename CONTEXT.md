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

### Anchor Match
The first match in the recording, identified by the user. Its start timestamp is set manually. All other match timestamps are projected from this anchor using TBA `actual_time` deltas. Matches whose projected results block end time exceeds the video duration are excluded automatically — no explicit last-match selection is needed.

### Timestamp Override
When a user adjusts a projected timestamp, the app stores the delta between the projected value and the adjusted value. If the anchor is changed or re-projected, overrides are reapplied on top of the new projection.

### Timestamp
A position in seconds within the recording marking either the start (`fromSeconds`) or end (`toSeconds`) of a match clip. For the anchor match, start is set manually and end is projected. For all other matches, both are projected automatically from TBA timing data. Users can adjust any timestamp before exporting.

- **Start** projected from: `anchorStart + (match.actual_time - anchor.actual_time)`
- **End** projected from: `anchorStart + (match.post_result_time - anchor.actual_time)`

If `actual_time` or `post_result_time` is missing, the match has no projected timestamps and must be set manually before it can be exported.

### Clip
The output video file produced for a single match. Named `<matchName>.mp4` and written to the user-chosen output directory. A clip is composed of one or two **blocks** derived from user settings:

- **Match block**: `[actual_time - start_offset, actual_time - start_offset + match_length]`
- **Results block**: `[post_result_time - start_offset, post_result_time - start_offset + results_length]`
- If the results block start ≤ match block end, the two are merged into one continuous block.

### Settings
User-configurable values that control clip generation:

| Setting | Description |
|---|---|
| `start_offset` | Seconds before `actual_time` / `post_result_time` to begin each block |
| `match_length` | Duration in seconds of the match block |
| `results_length` | Duration in seconds of the results block |
| `filename_format` | `tba_key` (e.g. `2025mimid_qm1.mp4`) or `human_readable` (e.g. `2025 Greater Pittsburgh - QM1.mp4`) |

### Session Persistence
The full session state (event, matches with timestamps and overrides, video path, output directory, settings) is auto-saved to disk via `electron-store` so users can resume across restarts.
