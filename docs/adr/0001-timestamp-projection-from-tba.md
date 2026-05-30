# ADR 0001: Timestamp projection from TBA timing data

## Status
Accepted

## Context

Users load a single recording that covers some portion of an FRC event. They need start and end timestamps for each match clip. Requiring manual timestamp entry for every match is tedious — a full event can have 80+ qualification matches.

TBA provides `actual_time` (when the match started) and `post_result_time` (when results were posted) as Unix timestamps for every played match. These are absolute wall-clock times, so the relative offsets between matches are known.

## Decision

The user identifies a single **anchor match** — the first match in their recording — and sets its start time manually in the video player. All other timestamps are projected using TBA deltas:

- Match block start: `anchorVideoSeconds + (match.actual_time - anchor.actual_time)`
- Results block start: `anchorVideoSeconds + (match.post_result_time - anchor.actual_time)`

Each clip has two blocks (match + results) which are merged into one if they overlap. Block durations are controlled by user settings (`match_length`, `results_length`, `start_offset`).

When a user manually adjusts a projected timestamp, the app stores the **delta** between the projected and adjusted values. If the anchor changes, overrides are reapplied on top of the new projection rather than discarded.

Matches are automatically excluded from export when their projected results block end exceeds the video duration — no explicit last-match selection is needed.

If `actual_time` or `post_result_time` is missing (match not yet played, data not yet posted), the match has no projected timestamps and requires manual entry before it can be exported.

## Alternatives considered

**Manual timestamps for all matches** — too much work for a full event day.

**Fixed interval between matches** — FRC match cadence is not consistent (lunch breaks, field issues, playoff scheduling). TBA's actual timestamps are far more accurate.

**User picks first and last match; app interpolates** — interpolation assumes even spacing, which is wrong. TBA `actual_time` is available and precise.

## Consequences

- Requires an internet connection to fetch TBA data before projection is possible.
- Projection quality degrades if TBA data is delayed (e.g. at an event with poor connectivity). Users can still fall back to manual entry.
- The delta-override model means manual adjustments are meaningful: they express "this match consistently runs N seconds earlier/later than TBA says," which survives anchor changes.
