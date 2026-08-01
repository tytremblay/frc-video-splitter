import { driver } from 'driver.js'
import 'driver.js/dist/driver.css'
import { setMatches, useMatches, type SplitterMatch } from '../state/useMatches'
import { setEvent, useEvent } from '../state/useEvent'
import { useVideo } from '../state/useVideo'

// 5 qualification matches spanning ~47 min with 8-min breaks.
// offset=0 so fromSeconds === actualTime (no real video, just for display).
const TUTORIAL_MATCHES: SplitterMatch[] = [
  { id: 'tutorial-q1', name: 'Q1', description: '254, 1678, 3476 vs 148, 971, 4414',    sourceVideoPath: '__tutorial__', actualTime: 120,  postResultTime: 280,  fromSeconds: 120,  toSeconds: 280  },
  { id: 'tutorial-q2', name: 'Q2', description: '987, 2056, 118 vs 1114, 2767, 5940',   sourceVideoPath: '__tutorial__', actualTime: 760,  postResultTime: 920,  fromSeconds: 760,  toSeconds: 920  },
  { id: 'tutorial-q3', name: 'Q3', description: '3310, 4362, 5687 vs 6328, 7332, 8045', sourceVideoPath: '__tutorial__', actualTime: 1400, postResultTime: 1560, fromSeconds: 1400, toSeconds: 1560 },
  { id: 'tutorial-q4', name: 'Q4', description: '2374, 3683, 4159 vs 5190, 6421, 7890', sourceVideoPath: '__tutorial__', actualTime: 2040, postResultTime: 2200, fromSeconds: 2040, toSeconds: 2200 },
  { id: 'tutorial-q5', name: 'Q5', description: '1241, 2508, 3663 vs 4488, 5632, 6789', sourceVideoPath: '__tutorial__', actualTime: 2680, postResultTime: 2840, fromSeconds: 2680, toSeconds: 2840 },
]

const steps = [
  {
    popover: {
      title: 'Welcome to FRC Video Splitter',
      description: "This quick tour walks you through splitting a full-event recording into individual match clips.",
    },
  },
  {
    element: '[data-tutorial="video-player"]',
    popover: {
      title: 'Load your match recording',
      description: 'Click "Select video" to open the full-event video file you recorded at the competition.',
    },
  },
  {
    element: '[data-tutorial="event-menu"]',
    popover: {
      title: 'Link your FRC event',
      description: 'Open the Event menu and choose "Edit event…" to import match schedule and timing data from The Blue Alliance, or enter details manually.',
    },
  },
  {
    element: '[data-tutorial="event-timeline"]',
    popover: {
      title: 'Align video to match times',
      description: 'Seek the video to the very start of a known match, then right-click that match in the timeline and choose "Sync offset to this match." This pins the video clock to TBA time so every other match gets the right clip automatically. You can also drag the video bar manually if you prefer.',
    },
  },
  {
    element: '[data-tutorial="match-list"]',
    popover: {
      title: 'Review your matches',
      description: 'Each match shows its calculated start and end times. Expand a row to see team numbers and any warnings about matches that fall outside the video.',
    },
  },
  {
    element: '[data-tutorial="settings-menu"]',
    popover: {
      title: 'Configure split settings',
      description: 'Open Settings → Preferences to adjust start/end padding, match length, results length, and how many matches are split in parallel.',
    },
  },
  {
    element: '[data-tutorial="match-list"]',
    popover: {
      title: 'Split your matches',
      description: 'Choose an output folder at the top of the match list, then click "Split N matches" to export each match as a separate video file. That\'s it!',
    },
  },
]

export function useTutorial() {
  function startTutorial() {
    const prevMatches = useMatches.getState().matches
    const prevVideo = { ...useVideo.getState() }
    const prevEvent = { ...useEvent.getState() }

    setMatches(TUTORIAL_MATCHES)
    setEvent({ name: 'Tech Valley Regional 2025', location: 'Troy, NY', startDate: '2025-03-01', endDate: '2025-03-03' })
    // Inject atomically: path triggers the VideoBar, offset=0 matches pre-computed fromSeconds/toSeconds
    useVideo.setState({ path: '__tutorial__', durationSeconds: 3600, videoTimelineOffsetSecs: 0, currentSeconds: 60 })

    const driverObj = driver({
      showProgress: true,
      allowClose: true,
      steps,
      onDestroyed: () => {
        useMatches.setState({ matches: prevMatches })
        useEvent.setState(prevEvent)
        useVideo.setState(prevVideo)
      },
    })
    driverObj.drive()
  }

  return { startTutorial }
}
