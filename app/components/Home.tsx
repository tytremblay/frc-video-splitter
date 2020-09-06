import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { ThemeProvider } from '@material-ui/core/styles';
import { Typography } from '@material-ui/core';
import Box from '@material-ui/core/Box';
import { ipcRenderer } from 'electron';
import WorkflowManager from '../features/workflow/WorkflowManager';
import { selectWorkflow, setTheme } from '../features/workflow/workflowSlice';
import MatchesPanel from '../features/matches/MatchesPanel';
import SplitterPanel from '../features/splitter/SplitterPanel';
import getTheme from '../utils/Theme';

function handleWorkflow(step: number) {
  switch (step) {
    case 0:
      return <MatchesPanel />;
    case 1:
      return <SplitterPanel />;
    default:
      return (
        <Typography variant="h1">
          We have not implemented this step yet.
        </Typography>
      );
  }
}

export default function Home(): JSX.Element {
  const dispatch = useDispatch();
  const { currentStep, theme } = useSelector(selectWorkflow);

  useEffect(() => {
    ipcRenderer.on('set-theme', (_, arg: string) => {
      dispatch(setTheme(arg[0]));
    });
  }, []);

  return (
    <ThemeProvider theme={getTheme(theme)}>
      <div>
        <WorkflowManager />
      </div>
      <Box height="100%">{handleWorkflow(currentStep)}</Box>
    </ThemeProvider>
  );
}
