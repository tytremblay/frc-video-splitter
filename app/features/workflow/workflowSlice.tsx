import { createSlice } from '@reduxjs/toolkit';
// eslint-disable-next-line import/no-cycle
import { AppThunk, RootState } from '../../store';

export type WorkflowState = {
  steps: string[];
  currentStep: number;
};

const initialState: WorkflowState = {
  steps: ['Matches', 'Split', 'Upload'],
  currentStep: 0,
};

const workflowSlice = createSlice({
  name: 'workflow',
  initialState,
  reducers: {
    nextStep: (state) => {
      if (state.currentStep < state.steps.length) {
        state.currentStep++;
      }
    },
    prevStep: (state) => {
      if (state.currentStep > 0) {
        state.currentStep--;
      }
    },
    reset: (state) => {
      state.currentStep = 0;
    },
  },
});

export const selectWorkflow = (state: RootState) => {
  return state.workflow;
};

export const { nextStep, prevStep, reset } = workflowSlice.actions;

export default workflowSlice.reducer;
