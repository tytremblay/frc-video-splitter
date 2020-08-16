import React from 'react';
import { useSelector } from 'react-redux';
import { makeStyles } from '@material-ui/core/styles';
import { Typography } from '@material-ui/core';
import Box from '@material-ui/core/Box';
import WorkflowManager from '../features/workflow/WorkflowManager';
import { selectWorkflow } from '../features/workflow/workflowSlice';
import MatchesPanel from '../features/matches/MatchesPanel';
import SplitterPanel from '../features/splitter/SplitterPanel';

const useStyles = makeStyles({
  steps: {
    height: '100%',
    maxHeight: 'fill-available',
  },
});

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
  const { currentStep } = useSelector(selectWorkflow);
  const classes = useStyles();

  return (
    <>
      <div>
        <WorkflowManager />
      </div>
      <Box height="100%">{handleWorkflow(currentStep)}</Box>
    </>
  );
}
