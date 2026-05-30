import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface SettingsState {
  tbaApiKey: string;
  collapseBreaks: boolean;
  collapseBreakThresholdMinutes: number;
  startPaddingSeconds: number;
  endPaddingSeconds: number;
  matchLengthSeconds: number;
  resultsLengthSeconds: number;
  clipDeadAir: boolean;
  deadAirThresholdSeconds: number;
}

export const useSettings = create<SettingsState>()(
  persist(
    () => ({
      tbaApiKey: '',
      collapseBreaks: true,
      collapseBreakThresholdMinutes: 60,
      startPaddingSeconds: 3,
      endPaddingSeconds: 3,
      matchLengthSeconds: 135,
      resultsLengthSeconds: 10,
      clipDeadAir: false,
      deadAirThresholdSeconds: 30,
    }),
    { name: 'frc-video-splitter-settings' }
  )
);

export function setSettings(settings: Partial<SettingsState>) {
  useSettings.setState(settings);
}
