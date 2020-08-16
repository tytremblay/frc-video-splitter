import React, { ChangeEvent } from 'react';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import { FastRewind, FastForward } from '@material-ui/icons';
import { ButtonGroup, Button } from '@material-ui/core';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      display: 'flex',
      justifyContent: 'space-around',
    },
  })
);

export interface ScrubControlsProps {
  handleScrub: (scrubSeconds: number) => void;
}

export default function ScrubControls(props: ScrubControlsProps): JSX.Element {
  const classes = useStyles();
  const { handleScrub } = props;
  return (
    <div className={classes.root}>
      <ButtonGroup color="primary">
        <Button startIcon={<FastRewind />} onClick={() => handleScrub(-30)}>
          30
        </Button>
        <Button startIcon={<FastRewind />} onClick={() => handleScrub(-10)}>
          10
        </Button>
        <Button startIcon={<FastRewind />} onClick={() => handleScrub(-1)}>
          1
        </Button>
        <Button endIcon={<FastForward />} onClick={() => handleScrub(1)}>
          1
        </Button>
        <Button endIcon={<FastForward />} onClick={() => handleScrub(10)}>
          10
        </Button>
        <Button endIcon={<FastForward />} onClick={() => handleScrub(30)}>
          30
        </Button>
      </ButtonGroup>
    </div>
  );
}
