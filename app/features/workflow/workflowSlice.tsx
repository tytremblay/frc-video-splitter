import { createSlice, PayloadAction } from '@reduxjs/toolkit';
// eslint-disable-next-line import/no-cycle
import { RootState } from '../../store';

export type WorkflowState = {
  steps: string[];
  currentStep: number;
  theme: string;
};

const initialState: WorkflowState = {
  steps: ['Matches', 'Split'],
  currentStep: 0,
  theme: 'light',
};

const workflowSlice = createSlice({
  name: 'workflow',
  initialState,
  reducers: {
    nextStep: (state) => {
      if (state.currentStep < state.steps.length) {
        state.currentStep += 1;
      }
    },
    prevStep: (state) => {
      if (state.currentStep > 0) {
        state.currentStep -= 1;
      }
    },
    reset: (state) => {
      state.currentStep = 0;
    },
    setTheme: (state, action: PayloadAction<string>) => {
      state.theme = action.payload;
    },
  },
});

export const selectWorkflow = (state: RootState) => {
  return state.workflow;
};

export const { nextStep, prevStep, reset, setTheme } = workflowSlice.actions;

export default workflowSlice.reducer;
