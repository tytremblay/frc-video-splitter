import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { makeStyles } from '@material-ui/core/styles';
import {
  Stepper,
  Step,
  StepLabel,
  Typography,
  Button,
} from '@material-ui/core';

import { selectWorkflow, nextStep, prevStep, reset } from './workflowSlice';

const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
  },
  instructions: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
  },
  wf_monitor: {
    display: 'flex',
    marginBottom: theme.spacing(1),
    height: 108,
  },
  wf_button: {
    height: '100%',
  },
}));

export default function WorkflowManager() {
  const dispatch = useDispatch();
  const { currentStep, steps } = useSelector(selectWorkflow);

  const classes = useStyles();

  const handleNext = () => {
    dispatch(nextStep());
  };

  const handleBack = () => {
    dispatch(prevStep());
  };

  const handleReset = () => {
    dispatch(reset());
  };

  return (
    <div className={classes.wf_monitor}>
      <div>
        <Button
          variant="contained"
          color="primary"
          onClick={handleBack}
          className={classes.wf_button}
        >
          BACK
        </Button>
      </div>
      <div className={classes.root}>
        <Stepper activeStep={currentStep} alternativeLabel>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </div>

      <div>
        <Button
          variant="contained"
          color="primary"
          onClick={handleNext}
          className={classes.wf_button}
        >
          NEXT
        </Button>
      </div>
    </div>
  );
}
