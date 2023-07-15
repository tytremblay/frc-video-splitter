import React, { ChangeEvent } from 'react';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import { FastRewind, FastForward } from '@material-ui/icons';
import { ButtonGroup, Button } from '@material-ui/core';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      display: 'flex',
      justifyContent: 'space-around',
      flexWrap: 'wrap',
    },
  })
);

export interface ScrubControlsProps {
  handleScrub: (scrubSeconds: number) => void;
}

export default function ScrubControls(props: ScrubControlsProps): JSX.Element {
  const classes = useStyles();
  const { handleScrub } = props;

  const scrubOptions = [
    1,
    5,
    10,
    30,
    2 * 60 + 15,
    5 * 60,
  ];

  

  const forwardControls = scrubOptions.map((duration) => {
    return (
      <Button
        key={duration}
        endIcon={<FastForward />}
        onClick={() => handleScrub(duration)}
      >
        {duration}
      </Button>
    );
  });

  const rewindControls = scrubOptions.reverse().map((duration) => {
    duration = duration * -1;
    return (
      <Button
        key={duration}
        startIcon={<FastRewind />}
        onClick={() => handleScrub(duration)}
      >
        {duration}
      </Button>
    );
  });

  return (
    <div className={classes.root}>
      <ButtonGroup color="primary">{rewindControls}</ButtonGroup>
      <ButtonGroup color="primary">{forwardControls}</ButtonGroup>
    </div>
  );
}
